import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, Filter, ArrowLeft, Sparkles, Save, CheckCircle2, List, Eye, Upload } from 'lucide-react';

type Spec = { id: number; name: string; value: string };
type SpecsByLang = Record<string, Spec[]>;
type NamesByLang = Record<string, string>;
type DescriptionsByLang = Record<string, string>;
type FeaturesByLang = Record<string, string[]>;

type Product = {
  id: number;
  name: string;
  category: string;
  status: string;
  images: string[];        // 多张图片，Base64或URL
  namesByLang: NamesByLang;
  descriptionsByLang: DescriptionsByLang;
  specsByLang: SpecsByLang;
  featuresByLang: FeaturesByLang;
  _backendId?: string;     // 后端产品的真实 ID（字符串）
};

const defaultSpecs: Spec[] = [
  { id: 0, name: 'Item Name', value: 'SAV120/140' },
  { id: 1, name: 'Release paper', value: '120/140g±5g' },
  { id: 2, name: 'Film', value: '80/100micron±5micron' },
  { id: 3, name: 'Surface', value: 'Glossy/ Matte' },
  { id: 4, name: 'Glue', value: 'Semi removable, 22μm±2μm' },
  { id: 5, name: 'Size', value: '1.07/1.27/1.37/1.52*50m' },
  { id: 6, name: 'Ink type', value: 'Eco solvent/ solvent' },
  { id: 7, name: 'Package', value: 'Export carton' },
];

const makeDefaultSpecsByLang = (): SpecsByLang => ({
  en: defaultSpecs.map(s => ({ ...s })),
  zh: defaultSpecs.map(s => ({ ...s })),
  vi: defaultSpecs.map(s => ({ ...s })),
  ph: defaultSpecs.map(s => ({ ...s })),
});

const makeDefaultNamesByLang = (name = ''): NamesByLang => ({
  en: name,
  zh: '',
  vi: '',
  ph: '',
});

const makeDefaultDescriptionsByLang = (): DescriptionsByLang => ({
  en: '',
  zh: '',
  vi: '',
  ph: '',
});

const makeDefaultFeaturesByLang = (): FeaturesByLang => ({
  en: [''],
  zh: [''],
  vi: [''],
  ph: [''],
});

const initialProductsList: Product[] = [
  {
    id: 1,
    name: 'Self Adhesive Vinyl (车贴)',
    category: 'Advertising Media',
    status: '上架',
    images: ['https://picsum.photos/seed/vinyl/100/100'],
    namesByLang: { en: 'Self Adhesive Vinyl', zh: '车贴', vi: 'Decal dán xe', ph: 'Self Adhesive Vinyl' },
    descriptionsByLang: { en: 'High quality Self Adhesive Vinyl for advertising and display applications.', zh: '', vi: '', ph: '' },
    specsByLang: makeDefaultSpecsByLang(),
    featuresByLang: makeDefaultFeaturesByLang(),
  },
  {
    id: 2,
    name: 'PVC Flex Banner (灯箱布)',
    category: 'Advertising Media',
    status: '上架',
    images: ['https://picsum.photos/seed/banner/100/100'],
    namesByLang: { en: 'PVC Flex Banner', zh: '灯箱布', vi: 'Bạt Hiflex', ph: 'PVC Flex Banner' },
    descriptionsByLang: { en: 'Durable PVC flex banner for outdoor and indoor advertising displays.', zh: '', vi: '', ph: '' },
    specsByLang: makeDefaultSpecsByLang(),
    featuresByLang: makeDefaultFeaturesByLang(),
  },
  {
    id: 3,
    name: 'PVC Foam Board (PVC发泡板)',
    category: 'Advertising Panel',
    status: '上架',
    images: ['https://picsum.photos/seed/board/100/100'],
    namesByLang: { en: 'PVC Foam Board', zh: 'PVC发泡板', vi: 'Tấm Formex', ph: 'PVC Foam Board' },
    descriptionsByLang: { en: 'Lightweight PVC foam board for signage, display, and printing applications.', zh: '', vi: '', ph: '' },
    specsByLang: makeDefaultSpecsByLang(),
    featuresByLang: makeDefaultFeaturesByLang(),
  },
  {
    id: 4,
    name: 'Standard Roll Up (易拉宝)',
    category: 'Display Stand',
    status: '下架',
    images: ['https://picsum.photos/seed/rollup/100/100'],
    namesByLang: { en: 'Standard Roll Up', zh: '易拉宝', vi: 'Standee cuốn', ph: 'Roll Up Stand' },
    descriptionsByLang: { en: 'Portable roll up banner stand for trade shows, events, and retail displays.', zh: '', vi: '', ph: '' },
    specsByLang: makeDefaultSpecsByLang(),
    featuresByLang: makeDefaultFeaturesByLang(),
  },
  {
    id: 5,
    name: 'LED Power Supply (LED电源)',
    category: 'Accessory',
    status: '上架',
    images: ['https://picsum.photos/seed/led/100/100'],
    namesByLang: { en: 'LED Power Supply', zh: 'LED电源', vi: 'Nguồn LED', ph: 'LED Power Supply' },
    descriptionsByLang: { en: 'Reliable LED power supply for signage lighting and display applications.', zh: '', vi: '', ph: '' },
    specsByLang: makeDefaultSpecsByLang(),
    featuresByLang: makeDefaultFeaturesByLang(),
  },
];

const PRODUCTS_STORAGE_KEY = 'jinyu_material_products';

function loadProducts(): Product[] {
  try {
    const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  return initialProductsList;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>(loadProducts);
  const [view, setView] = useState<'list' | 'edit' | 'details'>('list');
  const [activeLang, setActiveLang] = useState('en');
  const [showAIToast, setShowAIToast] = useState(false);
  const [deleteModal, setDeleteModal] = useState<Product | null>(null);
  const [selectedItem, setSelectedItem] = useState<Product | null>(null);

  // ----------- 编辑表单 state（从产品数据初始化）-----------
  const [specsByLang, setSpecsByLang] = useState<SpecsByLang>(makeDefaultSpecsByLang());
  const [featuresByLang, setFeaturesByLang] = useState<FeaturesByLang>(makeDefaultFeaturesByLang());
  const [namesByLang, setNamesByLang] = useState<NamesByLang>(makeDefaultNamesByLang());
  const [descriptionsByLang, setDescriptionsByLang] = useState<DescriptionsByLang>(makeDefaultDescriptionsByLang());
  const [productImages, setProductImages] = useState<string[]>([]);
  const [editCategory, setEditCategory] = useState('Advertising Media');
  const [editCategoryId, setEditCategoryId] = useState('advertising-media');
  const [editStatus, setEditStatus] = useState('上架');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('所有分类');
  const [categoryList, setCategoryList] = useState<{id: string; name_en: string}[]>([]);

  const [toastMsg, setToastMsg] = useState('');
  const [deleteImageIndex, setDeleteImageIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // 从 API 加载产品（同时加载分类，保证分类名称正确显示）
  React.useEffect(() => {
    async function fetchProducts() {
      try {
        // 并行加载分类和产品
        const [catRes, prodRes] = await Promise.all([
          fetch('/api/categories', { cache: 'no-store' }),
          fetch('/api/products'),
        ]);
        let cats: {id: string; name_en: string}[] = [];
        if (catRes.ok) {
          const catData = await catRes.json();
          cats = Array.isArray(catData) ? catData : (catData.data || []);
          setCategoryList(cats);
        }
        if (prodRes.ok) {
          const apiProducts = await prodRes.json();
          // 转换为前端格式，用已加载的分类列表查找分类名
          const converted: Product[] = apiProducts.map((p: any, index: number) => ({
            id: index + 1,
            name: p.name_en || p.name_zh || 'Product',
            category: getCategoryName(p.category_id, cats),
            status: p.status === 'active' ? '上架' : '下架',
            images: p.images || [],
            _backendId: p.id || '',
            namesByLang: {
              en: p.name_en || '',
              zh: p.name_zh || '',
              vi: p.name_vi || '',
              ph: p.name_tl || '',
            },
            descriptionsByLang: {
              en: p.description_en || '',
              zh: p.description_zh || '',
              vi: p.description_vi || '',
              ph: p.description_tl || '',
            },
            specsByLang: {
              en: (p.specs || []).map((s: any, i: number) => ({ id: i, name: s.k_en || '', value: s.v_en || '' })),
              zh: (p.specs || []).map((s: any, i: number) => ({ id: i, name: s.k_zh || s.k_en || '', value: s.v_zh || s.v_en || '' })),
              vi: (p.specs || []).map((s: any, i: number) => ({ id: i, name: s.k_vi || s.k_en || '', value: s.v_vi || s.v_en || '' })),
              ph: (p.specs || []).map((s: any, i: number) => ({ id: i, name: s.k_tl || s.k_en || '', value: s.v_tl || s.v_en || '' })),
            },
            featuresByLang: {
              en: Array.isArray(p.features_en) ? p.features_en : (p.features_en ? p.features_en.split('; ').filter(f => f) : ['']),
              zh: Array.isArray(p.features_zh) ? p.features_zh : (p.features_zh ? p.features_zh.split('; ').filter(f => f) : ['']),
              vi: Array.isArray(p.features_vi) ? p.features_vi : (p.features_vi ? p.features_vi.split('; ').filter(f => f) : ['']),
              ph: Array.isArray(p.features_tl) ? p.features_tl : (p.features_tl ? p.features_tl.split('; ').filter(f => f) : ['']),
            },
          }));
          setProducts(converted);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // 持久化 products 到 localStorage（仅当数据量小时保存，防止 quota exceeded）
  React.useEffect(() => {
    try {
      const data = JSON.stringify(products);
      if (data.length < 4 * 1024 * 1024) { // 限制 4MB 以内才写入
        localStorage.setItem(PRODUCTS_STORAGE_KEY, data);
      }
    } catch (e) {
      // localStorage 已满，忽略写入错误，不影响正常功能
      console.warn('localStorage quota exceeded, skipping product cache save');
    }
  }, [products]);

  // 强制刷新分类列表（无缓存），每次打开新增/编辑表单时调用
  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories', { cache: 'no-store' });
      if (res.ok) {
        const cats = await res.json();
        const list = Array.isArray(cats) ? cats : (cats.data || []);
        setCategoryList(list);
        return list;
      }
    } catch (e) {
      console.error('Failed to fetch categories:', e);
    }
    return [];
  };

  // 根据 category_id 从 categoryList 查找分类名，找不到就直接返回 id 本身（兼容新旧格式）
  const getCategoryName = (categoryId: string, cats?: {id: string; name_en: string}[]) => {
    const list = cats || categoryList;
    const found = list.find(c => String(c.id) === String(categoryId));
    return found ? found.name_en : categoryId || 'Other';
  };

  // Prevent browser from opening dropped files
  React.useEffect(() => {
    const handleDragOver = (e: DragEvent) => e.preventDefault();
    const handleDrop = (e: DragEvent) => e.preventDefault();
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);
    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

  // 打开编辑/详情时，从产品数据恢复所有字段
  const openEdit = async (product: Product | null, mode: 'edit' | 'details') => {
    setSelectedItem(product);
    // 强制刷新分类列表（无缓存）
    const cats = await fetchCategories();
    if (product) {
      setNamesByLang({ ...product.namesByLang });
      setDescriptionsByLang({ ...product.descriptionsByLang });
      setSpecsByLang({
        en: product.specsByLang.en.map(s => ({ ...s })),
        zh: product.specsByLang.zh.map(s => ({ ...s })),
        vi: product.specsByLang.vi.map(s => ({ ...s })),
        ph: product.specsByLang.ph.map(s => ({ ...s })),
      });
      setFeaturesByLang({
        en: [...(product.featuresByLang?.en || [''])],
        zh: [...(product.featuresByLang?.zh || [''])],
        vi: [...(product.featuresByLang?.vi || [''])],
        ph: [...(product.featuresByLang?.ph || [''])],
      });
      setProductImages([...product.images]);
      setEditCategory(product.category);
      // 找到对应分类的 id
      const matchedCat = cats.find((c: any) => c.name_en === product.category || c.id === product.category);
      setEditCategoryId(matchedCat ? matchedCat.id : (product._backendId ? '' : 'advertising-media'));
      setEditStatus(product.status);
    } else {
      // 新建产品
      setNamesByLang(makeDefaultNamesByLang());
      setDescriptionsByLang(makeDefaultDescriptionsByLang());
      setSpecsByLang(makeDefaultSpecsByLang());
      setFeaturesByLang(makeDefaultFeaturesByLang());
      setProductImages([]);
      // 默认选第一个分类
      const firstCat = cats[0] || { id: 'advertising-media', name_en: 'Advertising Media' };
      setEditCategory(firstCat.name_en);
      setEditCategoryId(firstCat.id);
      setEditStatus('上架');
    }
    setActiveLang('en');
    setView(mode);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleAIGenerate = () => {
    setShowAIToast(true);
    const currentName = namesByLang['en'] || 'Self Adhesive Vinyl';

    setNamesByLang(prev => ({
      ...prev,
      zh: currentName.includes('Vinyl') ? '车贴' : currentName.includes('Banner') ? '灯箱布' : currentName.includes('Board') ? 'PVC发泡板' : currentName.includes('Roll Up') ? '易拉宝' : 'LED电源',
      vi: currentName.includes('Vinyl') ? 'Decal dán xe' : currentName.includes('Banner') ? 'Bạt Hiflex' : currentName.includes('Board') ? 'Tấm Formex' : currentName.includes('Roll Up') ? 'Standee cuốn' : 'Nguồn LED',
      ph: currentName.includes('Vinyl') ? 'Self Adhesive Vinyl' : currentName.includes('Banner') ? 'Tarpaulin Banner' : currentName.includes('Board') ? 'PVC Foam Board' : currentName.includes('Roll Up') ? 'Roll Up Stand' : 'LED Power Supply',
    }));

    setSpecsByLang(prev => {
      const enSpecs = prev['en'];
      return {
        ...prev,
        zh: enSpecs.map(spec => ({
          ...spec,
          name: spec.name === 'Item Name' ? '产品名称' : spec.name === 'Release paper' ? '离型纸' : spec.name === 'Film' ? '膜厚' : spec.name === 'Surface' ? '表面' : spec.name === 'Glue' ? '胶水' : spec.name === 'Size' ? '尺寸' : spec.name === 'Ink type' ? '墨水类型' : spec.name === 'Package' ? '包装' : spec.name,
          value: spec.value.includes('Glossy/ Matte') ? '光面/哑面' : spec.value.includes('Semi removable') ? '半可移胶, 22μm±2μm' : spec.value.includes('Eco solvent') ? '弱溶剂/溶剂' : spec.value.includes('Export carton') ? '出口纸箱' : spec.value,
        })),
        vi: enSpecs.map(spec => ({
          ...spec,
          name: spec.name === 'Item Name' ? 'Tên sản phẩm' : spec.name === 'Release paper' ? 'Giấy đế' : spec.name === 'Film' ? 'Độ dày màng' : spec.name === 'Surface' ? 'Bề mặt' : spec.name === 'Glue' ? 'Keo' : spec.name === 'Size' ? 'Kích thước' : spec.name === 'Ink type' ? 'Loại mực' : spec.name === 'Package' ? 'Đóng gói' : spec.name,
          value: spec.value.includes('Glossy/ Matte') ? 'Bóng/ Mờ' : spec.value.includes('Semi removable') ? 'Keo bán tháo rời, 22μm±2μm' : spec.value.includes('Eco solvent') ? 'Mực Eco solvent/ solvent' : spec.value.includes('Export carton') ? 'Thùng carton xuất khẩu' : spec.value,
        })),
        ph: enSpecs.map(spec => ({
          ...spec,
          name: spec.name === 'Item Name' ? 'Pangalan ng Item' : spec.name === 'Release paper' ? 'Release paper' : spec.name === 'Film' ? 'Pelikula' : spec.name === 'Surface' ? 'Ibabaw' : spec.name === 'Glue' ? 'Pandikit' : spec.name === 'Size' ? 'Sukat' : spec.name === 'Ink type' ? 'Uri ng tinta' : spec.name === 'Package' ? 'Package' : spec.name,
          value: spec.value.includes('Glossy/ Matte') ? 'Makintab/ Matte' : spec.value.includes('Semi removable') ? 'Semi removable, 22μm±2μm' : spec.value.includes('Eco solvent') ? 'Eco solvent/ solvent' : spec.value.includes('Export carton') ? 'Export carton' : spec.value,
        })),
      };
    });

    setFeaturesByLang(prev => ({
      ...prev,
      zh: ['高粘度、耐候性强', '适合户外广告使用', '持久耐用不易褪色'],
      vi: ['Độ bám dính cao, chịu thời tiết tốt', 'Phù hợp quảng cáo ngoài trời', 'Bền bỉ, không phai màu'],
      ph: ['High tack, weather resistant', 'Suitable for outdoor advertising', 'Durable and long-lasting'],
    }));

    setTimeout(() => setShowAIToast(false), 4000);
  };

  const handleSave = async () => {
    // 验证：英文名必须填写
    if (!namesByLang.en || !namesByLang.en.trim()) {
      showToast('请填写英文产品名称');
      return;
    }
    // 验证：图片必须上传
    if (!productImages || productImages.length === 0) {
      showToast('请上传产品图片');
      return;
    }

    setIsSaving(true);
    
    try {
      // 只保存英文内容及用户已填写的其他语言内容，不调用任何翻译API
      const backendProduct = {
        name_en: namesByLang.en || '',
        name_zh: namesByLang.zh || '',
        name_vi: namesByLang.vi || '',
        name_tl: namesByLang.ph || '',
        description_en: descriptionsByLang.en || '',
        description_zh: descriptionsByLang.zh || '',
        description_vi: descriptionsByLang.vi || '',
        description_tl: descriptionsByLang.ph || '',
        category_id: editCategoryId || 'advertising-media',
        status: editStatus === '上架' ? 'active' : 'inactive',
        images: productImages,
        specs: specsByLang.en.map((s, i) => ({
          k_en: s.name || '', v_en: s.value || '',
          k_zh: specsByLang.zh[i]?.name || '', v_zh: specsByLang.zh[i]?.value || '',
          k_vi: specsByLang.vi[i]?.name || '', v_vi: specsByLang.vi[i]?.value || '',
          k_tl: specsByLang.ph[i]?.name || '', v_tl: specsByLang.ph[i]?.value || '',
        })),
        features_en: featuresByLang.en.filter(f => f),
        features_zh: featuresByLang.zh.filter(f => f),
        features_vi: featuresByLang.vi.filter(f => f),
        features_tl: featuresByLang.ph.filter(f => f),
      };

      console.log('[handleSave] backendProduct:', JSON.stringify(backendProduct).substring(0, 200));
      
      let newId = 0;
      
      if (selectedItem && selectedItem._backendId) {
        // 更新已有产品
        console.log('[handleSave] Updating product, id:', selectedItem._backendId);
        const res = await fetch(`/api/products/${selectedItem._backendId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(backendProduct),
        });
        console.log('[handleSave] PUT response:', res.status);
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Save failed: ${res.status} - ${errText}`);
        }
        const updatedProduct = await res.json();
        console.log('[handleSave] updatedProduct:', updatedProduct);
      } else {
        // 新建产品
        console.log('[handleSave] Creating new product');
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(backendProduct),
        });
        console.log('[handleSave] POST response:', res.status);
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Save failed: ${res.status} - ${errText}`);
        }
        const savedProduct = await res.json();
        console.log('[handleSave] savedProduct:', savedProduct);
        newId = savedProduct.id;
      }

      // 保存成功 - 立即显示成功消息，1秒后隐藏loading
      showToast('产品保存成功！');
      setView('list');
      setTimeout(() => {
        setIsSaving(false);
      }, 1000);
      
      // 后台静默刷新列表（不阻塞UI）
      fetch('/api/products').then(async (res) => {
        if (res.ok) {
          const apiProducts = await res.json();
          const converted: Product[] = apiProducts.map((p: any, index: number) => ({
            id: index + 1,
            name: p.name_en || p.name_zh || 'Product',
            category: getCategoryName(p.category_id),
            status: p.status === 'active' ? '上架' : '下架',
            images: p.images || [],
            _backendId: p.id,
            namesByLang: {
              en: p.name_en || '',
              zh: p.name_zh || '',
              vi: p.name_vi || '',
              ph: p.name_tl || '',
            },
            descriptionsByLang: {
              en: p.description_en || '',
              zh: p.description_zh || '',
              vi: p.description_vi || '',
              ph: p.description_tl || '',
            },
            specsByLang: {
              en: (p.specs || []).map((s: any, i: number) => ({ id: i, name: s.k_en || '', value: s.v_en || '' })),
              zh: (p.specs || []).map((s: any, i: number) => ({ id: i, name: s.k_zh || s.k_en || '', value: s.v_zh || s.v_en || '' })),
              vi: (p.specs || []).map((s: any, i: number) => ({ id: i, name: s.k_vi || s.k_en || '', value: s.v_vi || s.v_en || '' })),
              ph: (p.specs || []).map((s: any, i: number) => ({ id: i, name: s.k_tl || s.k_en || '', value: s.v_tl || s.v_en || '' })),
            },
            featuresByLang: {
              en: Array.isArray(p.features_en) ? p.features_en : (p.features_en ? p.features_en.split('; ').filter(f => f) : ['']),
              zh: Array.isArray(p.features_zh) ? p.features_zh : (p.features_zh ? p.features_zh.split('; ').filter(f => f) : ['']),
              vi: Array.isArray(p.features_vi) ? p.features_vi : (p.features_vi ? p.features_vi.split('; ').filter(f => f) : ['']),
              ph: Array.isArray(p.features_tl) ? p.features_tl : (p.features_tl ? p.features_tl.split('; ').filter(f => f) : ['']),
            },
          }));
          setProducts(converted);
          localStorage.setItem('jinyu_products', JSON.stringify(converted));
        }
      }).catch(() => {});
    } catch (err: any) {
      setIsSaving(false);
      console.error('[handleSave] Error:', err);
      const errMsg = err?.message || err?.toString() || '未知错误';
      showToast('保存失败: ' + errMsg);
    }
  };

  const handleDelete = async () => {
    if (deleteModal && deleteModal._backendId) {
      try {
        const res = await fetch(`/api/products/${deleteModal._backendId}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error('Delete failed');
        
        // 刷新列表
        const res2 = await fetch('/api/products');
        if (res2.ok) {
          const apiProducts = await res2.json();
          const converted: Product[] = apiProducts.map((p: any, index: number) => ({
            id: index + 1,
            name: p.name_en || p.name_zh || 'Product',
            category: getCategoryName(p.category_id),
            status: p.status === 'active' ? '上架' : '下架',
            images: p.images && p.images.length > 0 ? p.images : ['https://picsum.photos/seed/' + p.id + '/100/100'],
            _backendId: p.id,
            namesByLang: {
              en: p.name_en || '',
              zh: p.name_zh || '',
              vi: p.name_vi || '',
              ph: p.name_tl || '',
            },
          }));
          setProducts(converted);
        }
      } catch (e) {
        showToast('删除失败');
        return;
      }
    } else {
      setProducts(prev => prev.filter(p => p.id !== deleteModal.id));
    }
    setDeleteModal(null);
    showToast('产品已删除');
  };

  const handleNameChange = (newValue: string) => {
    setNamesByLang(prev => ({ ...prev, [activeLang]: newValue }));
  };

  const handleDescriptionChange = (newValue: string) => {
    setDescriptionsByLang(prev => ({ ...prev, [activeLang]: newValue }));
  };

  const handleSpecChange = (index: number, field: 'name' | 'value', newValue: string) => {
    setSpecsByLang(prev => {
      const updated = prev[activeLang].map((s, i) => i === index ? { ...s, [field]: newValue } : s);
      return { ...prev, [activeLang]: updated };
    });
  };

  const addSpec = () => {
    setSpecsByLang(prev => ({
      ...prev,
      [activeLang]: [...prev[activeLang], { id: Date.now(), name: '', value: '' }],
    }));
  };

  const removeSpec = (index: number) => {
    setSpecsByLang(prev => ({
      ...prev,
      [activeLang]: prev[activeLang].filter((_, i) => i !== index),
    }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    setFeaturesByLang(prev => ({
      ...prev,
      [activeLang]: prev[activeLang].map((f, i) => i === index ? value : f),
    }));
  };

  const addFeature = () => {
    setFeaturesByLang(prev => ({
      ...prev,
      [activeLang]: [...prev[activeLang], ''],
    }));
  };

  const removeFeature = (index: number) => {
    setFeaturesByLang(prev => ({
      ...prev,
      [activeLang]: prev[activeLang].filter((_, i) => i !== index),
    }));
  };

  if (view === 'edit' || view === 'details') {
    const isReadOnly = view === 'details';
    return (
      <div className="space-y-6 animate-in fade-in duration-500 relative max-w-7xl mx-auto">
        {toastMsg && (
          <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center z-50 animate-in slide-in-from-top-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mr-2" />
            <span>{toastMsg}</span>
          </div>
        )}
        {showAIToast && (
          <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center z-50 animate-in slide-in-from-top-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mr-2" />
            <span>AI草稿已生成！请检查确认后再保存。</span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <button onClick={() => setView('list')} className="mr-4 p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{isReadOnly ? '产品详情' : (selectedItem ? '编辑产品' : '发布新产品')}</h1>
              <p className="text-sm text-gray-500 mt-1">{isReadOnly ? '查看产品信息和多语言规格。' : '配置产品信息和多语言规格。'}</p>
            </div>
          </div>
          {!isReadOnly && (
            <button 
              type="button"
              onClick={(e) => {
                console.log('Save button clicked!');
                handleSave();
              }} 
              disabled={isSaving}
              className={`bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm cursor-pointer ${isSaving ? 'opacity-70 cursor-wait' : ''}`}
              style={{ pointerEvents: 'auto', position: 'relative', zIndex: 9999 }}
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  保存中...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  保存产品
                </>
              )}
            </button>
          )}
        </div>

        {/* Basic Info Module */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center">
            <List className="w-5 h-5 mr-2 text-blue-600" />
            基本信息
          </h2>

          {/* 分类 + 状态 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">分类</label>
              <select
                disabled={isReadOnly}
                value={editCategoryId}
                onChange={(e) => {
                  const cat = categoryList.find(c => c.id === e.target.value);
                  setEditCategoryId(e.target.value);
                  setEditCategory(cat ? cat.name_en : e.target.value);
                }}
                className={`w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none transition-all ${isReadOnly ? 'text-gray-500 cursor-not-allowed' : 'focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500'}`}
              >
                {categoryList.length > 0 ? categoryList.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name_en}</option>
                )) : (
                  <>
                    <option value="advertising-media">Advertising Media</option>
                    <option value="advertising-panel">Advertising Panel</option>
                    <option value="display-stand">Display Stand</option>
                    <option value="accessory-tools">Accessory Tools</option>
                  </>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">状态</label>
              <select
                disabled={isReadOnly}
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className={`w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none transition-all ${isReadOnly ? 'text-gray-500 cursor-not-allowed' : 'focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500'}`}
              >
                <option value="上架">上架</option>
                <option value="下架">下架</option>
              </select>
            </div>
          </div>

          {/* 图片上传 */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              产品图片 <span className="text-red-500">*</span>
              <span className="text-gray-500 font-normal ml-2">最多6张图片，第一张为主图</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mt-2">
              {productImages.map((img, index) => (
                <div key={index} className="relative aspect-square rounded-xl border border-gray-200 overflow-hidden group">
                  <img src={img} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded shadow-sm z-10">主图</div>
                  )}
                  {!isReadOnly && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                      {index !== 0 && (
                        <button
                          onClick={() => {
                            const newImgs = [...productImages];
                            const [removed] = newImgs.splice(index, 1);
                            newImgs.unshift(removed);
                            setProductImages(newImgs);
                          }}
                          className="text-xs bg-white text-gray-900 px-2 py-1 rounded hover:bg-gray-100"
                        >
                          设为主图
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteImageIndex(index)}
                        className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      >
                        删除
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {productImages.length < 6 && !isReadOnly && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer.files?.[0];
                    if (file && file.type.startsWith('image/')) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const base64 = ev.target?.result as string;
                        setProductImages(prev => [...prev, base64]);
                        showToast('图片已上传');
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="aspect-square flex flex-col items-center justify-center border-2 border-gray-300 border-dashed rounded-xl transition-colors bg-gray-50 hover:border-blue-500 cursor-pointer hover:bg-blue-50/50 group"
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const base64 = ev.target?.result as string;
                          setProductImages(prev => [...prev, base64]);
                          showToast('图片已上传');
                        };
                        reader.readAsDataURL(file);
                      }
                      e.target.value = '';
                    }}
                  />
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200 group-hover:border-blue-200 group-hover:bg-blue-50 transition-colors mb-2">
                    <Upload className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <span className="text-xs font-medium text-gray-500 group-hover:text-blue-600">上传</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Multi-language Specs Module */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row border-b border-gray-100 bg-gray-50/50 sm:items-center justify-between pr-4">
            <div className="flex overflow-x-auto hide-scrollbar">
              {[
                { id: 'en', label: 'English (EN)' },
                { id: 'zh', label: '中文 (ZH)' },
                { id: 'vi', label: 'Tiếng Việt (VI)' },
                { id: 'ph', label: 'Filipino (PH)' },
              ].map(l => (
                <button
                  key={l.id}
                  onClick={() => setActiveLang(l.id)}
                  className={`px-6 py-3.5 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeLang === l.id ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100/50'}`}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <div className="p-3 sm:p-0">
              {!isReadOnly && (
                <button onClick={handleAIGenerate} className="flex items-center text-sm font-medium text-purple-700 hover:text-purple-800 bg-purple-100 hover:bg-purple-200 px-4 py-2 rounded-lg transition-colors w-full sm:w-auto justify-center">
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  AI生成草稿
                </button>
              )}
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-blue-50 border border-blue-100 text-blue-800 text-sm px-4 py-3 rounded-lg">
              <div className="font-medium">
                当前正在编辑 <span className="font-bold uppercase bg-blue-200 px-1.5 py-0.5 rounded text-blue-900 mx-1">{activeLang}</span> 语言版本。
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">产品名称 <span className="text-red-500">*</span></label>
              <input
                type="text"
                disabled={isReadOnly}
                value={namesByLang[activeLang] ?? ''}
                onChange={(e) => handleNameChange(e.target.value)}
                className={`w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none transition-all ${isReadOnly ? 'text-gray-500 cursor-not-allowed' : 'focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500'}`}
                placeholder="请输入产品名称..."
              />
            </div>

            {/* 产品介绍 */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">产品介绍</label>
              <textarea
                disabled={isReadOnly}
                value={descriptionsByLang[activeLang] ?? ''}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                rows={4}
                className={`w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none transition-all resize-y ${isReadOnly ? 'text-gray-500 cursor-not-allowed' : 'focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500'}`}
                placeholder="Enter product description... e.g. High quality Transparent Self Adhesive Vinyl for advertising and display applications."
              />
              <p className="text-xs text-gray-400 mt-1">This description will appear on the product detail page.</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-md font-bold text-gray-900">规格</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm table-fixed">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
                    <tr>
                      <th className="px-4 py-3 font-semibold w-1/3 border-r border-gray-200">属性</th>
                      <th className="px-4 py-3 font-semibold w-7/12 border-r border-gray-200">值</th>
                      <th className="px-4 py-3 font-semibold w-1/12 text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {specsByLang[activeLang].map((spec, index) => (
                      <tr key={spec.id} className="bg-white hover:bg-gray-50/50 transition-colors">
                        <td className="px-0 py-0 border-r border-gray-200">
                          <input
                            type="text"
                            disabled={isReadOnly}
                            value={spec.name}
                            onChange={(e) => handleSpecChange(index, 'name', e.target.value)}
                            className={`w-full bg-transparent px-4 py-3 outline-none transition-colors ${isReadOnly ? 'text-gray-500 cursor-not-allowed' : 'focus:bg-blue-50/50'}`}
                            placeholder="例如：Release paper"
                          />
                        </td>
                        <td className="px-0 py-0 border-r border-gray-200">
                          <input
                            type="text"
                            disabled={isReadOnly}
                            value={spec.value}
                            onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                            className={`w-full bg-transparent px-4 py-3 outline-none transition-colors ${isReadOnly ? 'text-gray-500 cursor-not-allowed' : 'focus:bg-blue-50/50'}`}
                            placeholder="例如：120/140g±5g"
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                          {!isReadOnly && (
                            <button
                              onClick={() => removeSpec(index)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="删除此行"
                            >
                              <Trash2 className="w-4 h-4 mx-auto" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!isReadOnly && (
                <button
                  onClick={addSpec}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors border border-dashed border-blue-300 w-full justify-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  添加规格行
                </button>
              )}
            </div>

            {/* 产品特点 */}
            <div className="space-y-4">
              <h3 className="text-md font-bold text-gray-900">产品特点</h3>
              <div className="space-y-3">
                {featuresByLang[activeLang]?.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      className={`flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none transition-all ${isReadOnly ? 'text-gray-500 cursor-not-allowed' : 'focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500'}`}
                      placeholder={`特点 ${index + 1}...`}
                    />
                    {!isReadOnly && featuresByLang[activeLang].length > 1 && (
                      <button
                        onClick={() => removeFeature(index)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {!isReadOnly && (
                <button
                  onClick={addFeature}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors border border-dashed border-blue-300 w-full justify-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  添加特点
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Delete Image Modal */}
        {deleteImageIndex !== null && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">确认删除图片？</h3>
                <p className="text-sm text-gray-500">确定要删除这张图片吗？</p>
              </div>
              <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-center gap-3">
                <button onClick={() => setDeleteImageIndex(null)} className="flex-1 px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors">
                  取消
                </button>
                <button
                  onClick={() => {
                    const newImgs = [...productImages];
                    newImgs.splice(deleteImageIndex, 1);
                    setProductImages(newImgs);
                    setDeleteImageIndex(null);
                    showToast('图片已删除');
                  }}
                  className="flex-1 px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {toastMsg && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center z-50 animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 mr-2" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">产品管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理网站展示的所有产品信息及规格参数。</p>
        </div>
        <button onClick={() => openEdit(null, 'edit')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          发布新产品
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索产品名称..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full pl-10 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none appearance-none cursor-pointer"
              >
                <option value="所有分类">所有分类</option>
                {categoryList.length > 0 ? categoryList.map(cat => (
                  <option key={cat.id} value={cat.name_en}>{cat.name_en}</option>
                )) : (
                  <>
                    <option>Advertising Media</option>
                    <option>Advertising Panel</option>
                    <option>Display Stand</option>
                    <option>Accessory Tools</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="px-6 py-4 font-semibold">产品信息</th>
                <th className="px-6 py-4 font-semibold">所属分类</th>
                <th className="px-6 py-4 font-semibold">状态</th>
                <th className="px-6 py-4 font-semibold">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products
                .filter(p =>
                  (searchQuery === '' || p.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
                  (filterCategory === '所有分类' || p.category === filterCategory)
                )
                .map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {product.images && product.images[0] ? (
                        <img src={product.images[0]} alt={product.name} className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-bold text-gray-900">{product.namesByLang?.en || product.name}</div>

                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${product.status === '上架' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${product.status === '上架' ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button onClick={() => openEdit(product, 'details')} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="查看详情">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => openEdit(product, 'edit')} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="编辑">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteModal(product)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="删除">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.filter(p =>
            (searchQuery === '' || p.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
            (filterCategory === '所有分类' || p.category === filterCategory)
          ).length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">未找到匹配的产品</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">确认删除产品？</h3>
              <p className="text-sm text-gray-500">
                此操作无法撤销。
              </p>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-center gap-3">
              <button onClick={() => setDeleteModal(null)} className="flex-1 px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors">
                取消
              </button>
              <button onClick={handleDelete} className="flex-1 px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm">
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
