import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 数据文件路径
const DATA_DIR = join(__dirname, 'data');

// 确保数据目录存在
try { mkdirSync(DATA_DIR, { recursive: true }); } catch {}

const app = express();
const PORT = process.env.PORT || 3002;

// 中间件
app.use(cors());
app.use(express.json());

// ⚠️ 静态文件托管必须放在 API 路由之前，确保访问 / 时返回 index.html
app.use(express.static(join(__dirname, 'dist')));

// 图片上传目录
const UPLOADS_DIR = join(__dirname, 'about-uploads');
try { mkdirSync(UPLOADS_DIR, { recursive: true }); } catch {}

app.use('/about-uploads', express.static(UPLOADS_DIR));

// Multer 配置
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = file.originalname.split('.').pop();
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// 辅助函数：读取数据文件
const readDataFile = (filename, defaultValue = []) => {
  const filepath = join(DATA_DIR, filename);
  try {
    if (existsSync(filepath)) {
      return JSON.parse(readFileSync(filepath, 'utf-8'));
    }
  } catch (e) {
    console.error(`Error reading ${filename}:`, e);
  }
  return defaultValue;
};

// 辅助函数：写入数据文件
const writeDataFile = (filename, data) => {
  const filepath = join(DATA_DIR, filename);
  try {
    writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error(`Error writing ${filename}:`, e);
    return false;
  }
};

// ============ API 路由 ============

// 获取所有产品
app.get('/api/products', (req, res) => {
  const products = readDataFile('products.json', []);
  const lang = req.query.lang || 'en';
  res.json(products);
});

// 获取单个产品
app.get('/api/products/:id', (req, res) => {
  const products = readDataFile('products.json', []);
  const productId = req.params.id;
  const product = products.find(p => String(p.id) === String(productId));
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// 创建产品
app.post('/api/products', (req, res) => {
  const products = readDataFile('products.json', []);
  const newProduct = {
    ...req.body,
    id: Date.now()
  };
  products.push(newProduct);
  writeDataFile('products.json', products);
  res.json(newProduct);
});

// 更新产品
app.put('/api/products/:id', (req, res) => {
  const products = readDataFile('products.json', []);
  const productId = String(req.params.id);
  const index = products.findIndex(p => String(p.id) === productId);
  if (index !== -1) {
    products[index] = { ...products[index], ...req.body };
    writeDataFile('products.json', products);
    res.json(products[index]);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// 删除产品
app.delete('/api/products/:id', (req, res) => {
  let products = readDataFile('products.json', []);
  const productId = String(req.params.id);
  products = products.filter(p => String(p.id) !== productId);
  writeDataFile('products.json', products);
  res.json({ success: true });
});

// ============ AI 翻译代理接口 ============

app.post('/api/translate', async (req, res) => {
  try {
    const { texts, targetLang } = req.body;
    if (!texts || !targetLang || !Array.isArray(texts)) {
      return res.status(400).json({ error: 'Missing texts or targetLang' });
    }
    // langMap: 后台字段后缀 → MyMemory 语言代码
    const langMap = { zh: 'zh-CN', vi: 'vi', ph: 'tl' };
    const myMemoryLang = langMap[targetLang];
    if (!myMemoryLang) return res.status(400).json({ error: 'Unsupported target language: ' + targetLang });

    const results = [];

    // 逐条翻译（MyMemory 免费版有频率限制，避免并发过高）
    for (let i = 0; i < texts.length; i++) {
      const text = texts[i];
      if (!text || !text.trim()) {
        results.push('');
        continue;
      }
      try {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${myMemoryLang}`;
        const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
        if (!response.ok) { results.push(text); continue; }
        const data = await response.json();
        const translated = data?.responseData?.translatedText;
        // MyMemory 有时会返回全大写的原文作为提示，检测并跳过
        if (translated && translated !== text && translated.toUpperCase() !== text.toUpperCase()) {
          results.push(translated);
        } else if (translated && data.responseStatus === 200) {
          results.push(translated);
        } else {
          results.push(text);
        }
      } catch {
        results.push(text);
      }
      // 每条之间间隔 300ms 避免频率限制
      if (i < texts.length - 1) await new Promise(r => setTimeout(r, 300));
    }
    res.json({ success: true, translations: results });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Translation failed' });
  }
});

// ============ 翻译接口 ============

// 获取翻译数据
app.get('/api/i18n/:lang', (req, res) => {
  const lang = req.params.lang;
  const translations = readDataFile('translations.json', {});
  res.json(translations[lang] || {});
});

// 保存翻译数据
app.post('/api/i18n', (req, res) => {
  const translations = readDataFile('translations.json', {});
  const { lang, data } = req.body;
  translations[lang] = data;
  writeDataFile('translations.json', translations);
  res.json({ success: true });
});

// ============ 设置接口 ============

// 获取设置
app.get('/api/settings', (req, res) => {
  const settings = readDataFile('settings.json', {
    site_name: 'Jinyu Material',
    seo_title: 'Jinyu Advertising Material',
    seo_description: 'Professional advertising material manufacturer'
  });
  res.json(settings);
});

// 保存设置
app.post('/api/settings', (req, res) => {
  const settings = req.body;
  writeDataFile('settings.json', settings);
  res.json({ success: true });
});

// ============ 联系表单接口 ============

// 提交联系表单
app.post('/api/contact', (req, res) => {
  const contacts = readDataFile('contacts.json', []);
  const newContact = {
    ...req.body,
    id: Date.now(),
    createdAt: new Date().toISOString()
  };
  contacts.push(newContact);
  writeDataFile('contacts.json', contacts);
  console.log('New contact:', newContact);
  res.json({ success: true, message: 'Thank you for your message!' });
});

// 获取所有联系人
app.get('/api/contacts', (req, res) => {
  const contacts = readDataFile('contacts.json', []);
  res.json(contacts);
});

// ============ 新闻接口 ============

app.get('/api/news', (req, res) => {
  const news = readDataFile('news.json', []);
  res.json(news);
});

app.post('/api/news', (req, res) => {
  const news = readDataFile('news.json', []);
  const newItem = {
    ...req.body,
    id: Date.now()
  };
  news.push(newItem);
  writeDataFile('news.json', news);
  res.json(newItem);
});

app.put('/api/news/:id', (req, res) => {
  const news = readDataFile('news.json', []);
  const index = news.findIndex(n => n.id === parseInt(req.params.id));
  if (index !== -1) {
    news[index] = { ...news[index], ...req.body };
    writeDataFile('news.json', news);
    res.json(news[index]);
  } else {
    res.status(404).json({ error: 'News not found' });
  }
});

app.delete('/api/news/:id', (req, res) => {
  let news = readDataFile('news.json', []);
  news = news.filter(n => n.id !== parseInt(req.params.id));
  writeDataFile('news.json', news);
  res.json({ success: true });
});

// ============ 案例研究接口 ============

app.get('/api/cases', (req, res) => {
  const cases = readDataFile('cases.json', []);
  res.json(cases);
});

app.post('/api/cases', (req, res) => {
  const cases = readDataFile('cases.json', []);
  const newItem = {
    ...req.body,
    id: Date.now()
  };
  cases.push(newItem);
  writeDataFile('cases.json', cases);
  res.json(newItem);
});

app.put('/api/cases/:id', (req, res) => {
  const cases = readDataFile('cases.json', []);
  const index = cases.findIndex(c => c.id === parseInt(req.params.id));
  if (index !== -1) {
    cases[index] = { ...cases[index], ...req.body };
    writeDataFile('cases.json', cases);
    res.json(cases[index]);
  } else {
    res.status(404).json({ error: 'Case not found' });
  }
});

app.delete('/api/cases/:id', (req, res) => {
  let cases = readDataFile('cases.json', []);
  cases = cases.filter(c => c.id !== parseInt(req.params.id));
  writeDataFile('cases.json', cases);
  res.json({ success: true });
});

// ============ 分类接口 ============

app.get('/api/categories', (req, res) => {
  const categories = readDataFile('categories.json', []);
  res.json(categories);
});

app.post('/api/categories', (req, res) => {
  const categories = readDataFile('categories.json', []);
  const newItem = {
    ...req.body,
    id: Date.now()
  };
  categories.push(newItem);
  writeDataFile('categories.json', categories);
  res.json(newItem);
});

app.put('/api/categories/:id', (req, res) => {
  const categories = readDataFile('categories.json', []);
  const index = categories.findIndex(c => c.id === parseInt(req.params.id));
  if (index !== -1) {
    categories[index] = { ...categories[index], ...req.body };
    writeDataFile('categories.json', categories);
    res.json(categories[index]);
  } else {
    res.status(404).json({ error: 'Category not found' });
  }
});

app.delete('/api/categories/:id', (req, res) => {
  let categories = readDataFile('categories.json', []);
  categories = categories.filter(c => c.id !== parseInt(req.params.id));
  writeDataFile('categories.json', categories);
  res.json({ success: true });
});

// ============ 应用场景接口 ============

app.get('/api/scenarios', (req, res) => {
  const scenarios = readDataFile('scenarios.json', []);
  res.json(scenarios);
});

app.post('/api/scenarios', (req, res) => {
  const scenarios = readDataFile('scenarios.json', []);
  const newItem = {
    ...req.body,
    id: Date.now()
  };
  scenarios.push(newItem);
  writeDataFile('scenarios.json', scenarios);
  res.json(newItem);
});

app.put('/api/scenarios/:id', (req, res) => {
  const scenarios = readDataFile('scenarios.json', []);
  const index = scenarios.findIndex(s => s.id === parseInt(req.params.id));
  if (index !== -1) {
    scenarios[index] = { ...scenarios[index], ...req.body };
    writeDataFile('scenarios.json', scenarios);
    res.json(scenarios[index]);
  } else {
    res.status(404).json({ error: 'Scenario not found' });
  }
});

app.delete('/api/scenarios/:id', (req, res) => {
  let scenarios = readDataFile('scenarios.json', []);
  scenarios = scenarios.filter(s => s.id !== parseInt(req.params.id));
  writeDataFile('scenarios.json', scenarios);
  res.json({ success: true });
});

// ============ 公司信息接口 ============

app.get('/api/company', (req, res) => {
  const company = readDataFile('company.json', {
    name: 'Jinyu Advertising Material Co., Ltd.',
    description: '',
    established: 2009,
    address: '',
    phone: '',
    email: '',
    website: ''
  });
  res.json(company);
});

app.post('/api/company', (req, res) => {
  const company = req.body;
  writeDataFile('company.json', company);
  res.json({ success: true });
});

// ============ About Us 接口（前台 about.html 使用） ============

app.get('/api/about', (_req, res) => {
  const about = readDataFile('about.json', {});
  res.json({ success: true, data: about });
});

app.put('/api/about', (req, res) => {
  const about = req.body;
  writeDataFile('about.json', about);
  res.json({ success: true, message: 'About data saved' });
});

// About 图片上传
app.post('/api/about/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ success: true, url: `/about-uploads/${req.file.filename}` });
});

// About 图片列表
app.get('/api/about/images', (_req, res) => {
  try {
    const files = readdirSync(UPLOADS_DIR);
    const images = files.filter(f => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f))
      .map(f => ({ name: f, url: `/about-uploads/${f}` }));
    res.json(images);
  } catch { res.json([]); }
});

// 删除 About 图片
app.delete('/api/about/images/:name', (req, res) => {
  const filePath = join(UPLOADS_DIR, req.params.name);
  try { unlinkSync(filePath); res.json({ success: true }); }
  catch { res.status(404).json({ error: 'File not found' }); }
});

// ============ 账号接口 ============

app.get('/api/auth', (req, res) => {
  const accounts = readDataFile('accounts.json', [
    {
      id: 1,
      username: 'admin',
      password: btoa('admin123'), // base64 encoded
      role: 'admin',
      createdAt: new Date().toISOString()
    }
  ]);
  // 返回不包含密码的账号列表
  const safeAccounts = accounts.map(({ password, ...rest }) => rest);
  res.json(safeAccounts);
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const accounts = readDataFile('accounts.json', []);
  
  // 如果没有账号，创建一个默认的
  if (accounts.length === 0) {
    const defaultAccount = {
      id: 1,
      username: 'admin',
      password: btoa('admin123'),
      role: 'admin',
      createdAt: new Date().toISOString()
    };
    writeDataFile('accounts.json', [defaultAccount]);
    
    if (username === 'admin' && password === 'admin123') {
      return res.json({ success: true, user: { id: 1, username: 'admin', role: 'admin' } });
    }
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
  
  const account = accounts.find(a => a.username === username && a.password === btoa(password));
  if (account) {
    const { password: _, ...safeUser } = account;
    res.json({ success: true, user: safeUser });
  } else {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { username, password, role = 'editor' } = req.body;
  const accounts = readDataFile('accounts.json', []);
  
  if (accounts.find(a => a.username === username)) {
    return res.status(400).json({ success: false, error: 'Username already exists' });
  }
  
  const newAccount = {
    id: Date.now(),
    username,
    password: btoa(password),
    role,
    createdAt: new Date().toISOString()
  };
  accounts.push(newAccount);
  writeDataFile('accounts.json', accounts);
  
  const { password: _, ...safeUser } = newAccount;
  res.json({ success: true, user: safeUser });
});

app.put('/api/auth/accounts/:id', (req, res) => {
  const accounts = readDataFile('accounts.json', []);
  const index = accounts.findIndex(a => a.id === parseInt(req.params.id));
  if (index !== -1) {
    if (req.body.password) {
      accounts[index].password = btoa(req.body.password);
    }
    if (req.body.role) {
      accounts[index].role = req.body.role;
    }
    writeDataFile('accounts.json', accounts);
    const { password: _, ...safeUser } = accounts[index];
    res.json({ success: true, user: safeUser });
  } else {
    res.status(404).json({ error: 'Account not found' });
  }
});

app.delete('/api/auth/accounts/:id', (req, res) => {
  let accounts = readDataFile('accounts.json', []);
  accounts = accounts.filter(a => a.id !== parseInt(req.params.id));
  writeDataFile('accounts.json', accounts);
  res.json({ success: true });
});

// SPA fallback - 所有未匹配的路由返回 index.html
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
