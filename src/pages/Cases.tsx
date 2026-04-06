import React, { useState } from 'react';
import { Plus, Edit, Trash2, ArrowLeft, Sparkles, Save, CheckCircle2, Eye, X, MapPin } from 'lucide-react';
import ImageUploader from '@/src/components/ImageUploader';

type CaseItem = {
  id: number;
  region: string;
  category: string;
  title: string;
  client: string;
  date: string;
  images: string[];
  desc: string;
  langData: Record<string, { title: string; seoTitle: string; h1Title: string; slug: string; alt: string; content: string }>;
};

const initialCases: CaseItem[] = [
  { id: 1, region: 'Vietnam', category: 'Outdoor Billboards', title: 'Ho Chi Minh City Highway Billboard', client: 'VietAd Agency', date: '2023-11-15', images: ['https://picsum.photos/seed/vietnam-billboard/150/100'], desc: 'Large-scale outdoor billboard in Ho Chi Minh City. Engineered with premium weather-resistant advertising materials.', langData: {} },
  { id: 2, region: 'Philippines', category: 'Store Signage', title: 'Manila Retail Storefront Signage', client: 'Manila Retail Group', date: '2023-09-20', images: ['https://picsum.photos/seed/ph-store/150/100'], desc: 'Durable store signage installed in Manila. Utilizing top-grade UV-resistant and waterproof materials.', langData: {} },
  { id: 3, region: 'Vietnam', category: 'Traffic Reflection', title: 'Hanoi Highway Reflective Signs', client: 'Vietnam Transport Dept', date: '2023-10-05', images: ['https://picsum.photos/seed/vietnam-traffic/150/100'], desc: 'High-visibility traffic reflective signs deployed across Hanoi highways.', langData: {} },
  { id: 4, region: 'Philippines', category: 'Car Wraps', title: 'Cebu Commercial Fleet Wraps', client: 'Cebu Logistics', date: '2023-12-10', images: ['https://picsum.photos/seed/ph-carwrap/150/100'], desc: 'Commercial vehicle wraps for a delivery fleet in Cebu.', langData: {} },
  { id: 5, region: 'Vietnam', category: 'Mall Lightboxes', title: 'Da Nang Shopping Mall Lightboxes', client: 'Da Nang Plaza', date: '2024-01-20', images: ['https://picsum.photos/seed/vietnam-lightbox/150/100'], desc: 'Vibrant indoor and semi-outdoor mall lightboxes in Da Nang.', langData: {} },
];

const STORAGE_KEY = 'jinyu_material_cases';

function loadCases(): CaseItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) { const p = JSON.parse(stored); if (Array.isArray(p) && p.length > 0) return p; }
  } catch { /* ignore */ }
  return initialCases;
}

const emptyLangData = () => ({
  en: { title: '', seoTitle: '', h1Title: '', slug: '', alt: '', content: '' },
  zh: { title: '', seoTitle: '', h1Title: '', slug: '', alt: '', content: '' },
  vi: { title: '', seoTitle: '', h1Title: '', slug: '', alt: '', content: '' },
  ph: { title: '', seoTitle: '', h1Title: '', slug: '', alt: '', content: '' },
});

export default function Cases() {
  const [cases, setCases] = useState<CaseItem[]>(loadCases);
  const [view, setView] = useState<'list' | 'edit' | 'details'>('list');
  const [activeLang, setActiveLang] = useState('en');
  const [showAIToast, setShowAIToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [deleteModal, setDeleteModal] = useState<CaseItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<CaseItem | null>(null);
  const [regionFilter, setRegionFilter] = useState<'All' | 'Vietnam' | 'Philippines'>('All');
  const [editRegion, setEditRegion] = useState<string>('Vietnam');
  const [editCategory, setEditCategory] = useState<string>('Outdoor Billboards (户外围挡)');
  const [editTitle, setEditTitle] = useState('');
  const [editClient, setEditClient] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editDesc, setEditDesc] = useState('');
  // 已移除旧的 editImage（单图 URL）字段，统一使用 editImages（多图数组）

  // 持久化
  React.useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(cases)); }, [cases]);

  const [caseDataByLang, setCaseDataByLang] = useState<Record<string, { title: string; seoTitle: string; h1Title: string; slug: string; alt: string; content: string }>>(emptyLangData());

  // Initialize data when editing an item
  React.useEffect(() => {
    if (selectedItem) {
      setEditRegion(selectedItem.region || 'Vietnam');
      setEditCategory(selectedItem.category || 'Outdoor Billboards (户外围挡)');
      setEditTitle(selectedItem.title);
      setEditClient(selectedItem.client);
      setEditDate(selectedItem.date);
      setEditImages(selectedItem.images || []);
      setEditDesc(selectedItem.desc);
      const ld = selectedItem.langData || {};
      setCaseDataByLang({
        en: ld.en || { title: selectedItem.title, seoTitle: selectedItem.title, h1Title: selectedItem.title, slug: selectedItem.title.toLowerCase().replace(/\s+/g, '-'), alt: selectedItem.title, content: selectedItem.desc },
        zh: ld.zh || { title: '', seoTitle: '', h1Title: '', slug: '', alt: '', content: '' },
        vi: ld.vi || { title: '', seoTitle: '', h1Title: '', slug: '', alt: '', content: '' },
        ph: ld.ph || { title: '', seoTitle: '', h1Title: '', slug: '', alt: '', content: '' },
      });
    } else {
      setEditRegion('Vietnam');
      setEditCategory('Outdoor Billboards (户外围挡)');
      setEditTitle('');
      setEditClient('');
      setEditDate('');
      setEditImages([]);
      setEditDesc('');
      setCaseDataByLang(emptyLangData());
    }
  }, [selectedItem]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const toSlug = (text: string): string => {
    return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
  };

  const handleAIGenerate = async () => {
    setShowAIToast(true);
    const langData = caseDataByLang;

    // 判断源语言：优先用英文，其次用中文（基于 title/seoTitle/h1Title/content 四个字段）
    const enSrc = langData.en;
    const zhSrc = langData.zh;
    const hasEn = (enSrc?.title?.trim() || enSrc?.seoTitle?.trim() || enSrc?.h1Title?.trim() || enSrc?.content?.trim());
    const hasZh = (zhSrc?.title?.trim() || zhSrc?.seoTitle?.trim() || zhSrc?.h1Title?.trim() || zhSrc?.content?.trim());

    if (!hasEn && !hasZh) {
      showToast('请先填写英文或中文的 SEO 标题 / H1 标题 / 内容，再使用 AI 翻译');
      setShowAIToast(false);
      return;
    }

    const translate = async (text: string, from: string, to: string): Promise<string> => {
      if (!text.trim()) return '';
      try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
        const res = await fetch(url);
        const data = await res.json();
        return Array.isArray(data) ? data[0].map((t: string[]) => t[0]).join('') : text;
      } catch {
        return text;
      }
    };

    // 收集所有需要翻译的文本（标题、SEO标题、H1标题、Alt、内容）
    const getTransFields = (src: typeof enSrc) => ({
      title: src?.title?.trim() || '',
      seoTitle: src?.seoTitle?.trim() || '',
      h1Title: src?.h1Title?.trim() || '',
      alt: src?.alt?.trim() || '',
      content: src?.content?.trim() || '',
    });

    // 初始化所有语言槽
    const generated: Record<string, typeof enSrc> = { ...langData };
    ['en', 'zh', 'vi', 'ph'].forEach(l => {
      if (!generated[l]) generated[l] = { title: '', seoTitle: '', h1Title: '', slug: '', alt: '', content: '' };
    });

    if (hasEn) {
      // 源为英文 → 译 zh / vi / ph（保留 en 不变）
      const src = getTransFields(enSrc);
      const baseSlug = toSlug(src.h1Title || src.seoTitle || src.title);

      const [title_zh, seoTitle_zh, h1Title_zh, alt_zh, content_zh] = await Promise.all([
        translate(src.title, 'en', 'zh'),
        translate(src.seoTitle || src.h1Title, 'en', 'zh'),
        translate(src.h1Title, 'en', 'zh'),
        translate(src.alt, 'en', 'zh'),
        translate(src.content, 'en', 'zh'),
      ]);
      const [title_vi, seoTitle_vi, h1Title_vi, alt_vi, content_vi] = await Promise.all([
        translate(src.title, 'en', 'vi'),
        translate(src.seoTitle || src.h1Title, 'en', 'vi'),
        translate(src.h1Title, 'en', 'vi'),
        translate(src.alt, 'en', 'vi'),
        translate(src.content, 'en', 'vi'),
      ]);
      const [title_ph, seoTitle_ph, h1Title_ph, alt_ph, content_ph] = await Promise.all([
        translate(src.title, 'en', 'fil'),
        translate(src.seoTitle || src.h1Title, 'en', 'fil'),
        translate(src.h1Title, 'en', 'fil'),
        translate(src.alt, 'en', 'fil'),
        translate(src.content, 'en', 'fil'),
      ]);

      generated.zh = {
        ...generated.zh,
        title: generated.zh.title || title_zh,
        seoTitle: generated.zh.seoTitle || seoTitle_zh,
        h1Title: generated.zh.h1Title || h1Title_zh,
        slug: generated.zh.slug || (baseSlug + '-zh'),
        alt: generated.zh.alt || alt_zh,
        content: generated.zh.content || content_zh,
      };
      generated.vi = {
        ...generated.vi,
        title: generated.vi.title || title_vi,
        seoTitle: generated.vi.seoTitle || seoTitle_vi,
        h1Title: generated.vi.h1Title || h1Title_vi,
        slug: generated.vi.slug || (baseSlug + '-vi'),
        alt: generated.vi.alt || alt_vi,
        content: generated.vi.content || content_vi,
      };
      generated.ph = {
        ...generated.ph,
        title: generated.ph.title || title_ph,
        seoTitle: generated.ph.seoTitle || seoTitle_ph,
        h1Title: generated.ph.h1Title || h1Title_ph,
        slug: generated.ph.slug || (baseSlug + '-fil'),
        alt: generated.ph.alt || alt_ph,
        content: generated.ph.content || content_ph,
      };
    } else {
      // 源为中文 → 译 en / vi / ph（保留 zh 不变）
      const src = getTransFields(zhSrc);
      const baseSlug = toSlug(src.h1Title || src.seoTitle || src.title);

      const [title_en, seoTitle_en, h1Title_en, alt_en, content_en] = await Promise.all([
        translate(src.title, 'zh', 'en'),
        translate(src.seoTitle || src.h1Title, 'zh', 'en'),
        translate(src.h1Title, 'zh', 'en'),
        translate(src.alt, 'zh', 'en'),
        translate(src.content, 'zh', 'en'),
      ]);
      const [title_vi, seoTitle_vi, h1Title_vi, alt_vi, content_vi] = await Promise.all([
        translate(src.title, 'zh', 'vi'),
        translate(src.seoTitle || src.h1Title, 'zh', 'vi'),
        translate(src.h1Title, 'zh', 'vi'),
        translate(src.alt, 'zh', 'vi'),
        translate(src.content, 'zh', 'vi'),
      ]);
      const [title_ph, seoTitle_ph, h1Title_ph, alt_ph, content_ph] = await Promise.all([
        translate(src.title, 'zh', 'fil'),
        translate(src.seoTitle || src.h1Title, 'zh', 'fil'),
        translate(src.h1Title, 'zh', 'fil'),
        translate(src.alt, 'zh', 'fil'),
        translate(src.content, 'zh', 'fil'),
      ]);

      generated.en = {
        ...generated.en,
        title: generated.en.title || title_en,
        seoTitle: generated.en.seoTitle || seoTitle_en,
        h1Title: generated.en.h1Title || h1Title_en,
        slug: generated.en.slug || baseSlug,
        alt: generated.en.alt || alt_en,
        content: generated.en.content || content_en,
      };
      generated.vi = {
        ...generated.vi,
        title: generated.vi.title || title_vi,
        seoTitle: generated.vi.seoTitle || seoTitle_vi,
        h1Title: generated.vi.h1Title || h1Title_vi,
        slug: generated.vi.slug || (baseSlug + '-vi'),
        alt: generated.vi.alt || alt_vi,
        content: generated.vi.content || content_vi,
      };
      generated.ph = {
        ...generated.ph,
        title: generated.ph.title || title_ph,
        seoTitle: generated.ph.seoTitle || seoTitle_ph,
        h1Title: generated.ph.h1Title || h1Title_ph,
        slug: generated.ph.slug || (baseSlug + '-fil'),
        alt: generated.ph.alt || alt_ph,
        content: generated.ph.content || content_ph,
      };
    }

    setCaseDataByLang(generated);
    setShowAIToast(false);
  };

  const handleSave = () => {
    // 保存前：把当前语言的 title 同步到各语言槽的 title 字段（确保 title 多语言化）
    const titleToSave = caseDataByLang[activeLang]?.title || editTitle;
    const syncedData = { ...caseDataByLang };
    (['en', 'zh', 'vi', 'ph'] as const).forEach(l => {
      if (!syncedData[l]) syncedData[l] = { title: '', seoTitle: '', h1Title: '', slug: '', alt: '', content: '' };
      // 只有空时才填入，避免覆盖已有多语言内容
      if (!syncedData[l].title && l !== activeLang) syncedData[l].title = titleToSave;
    });

    if (selectedItem) {
      // 更新已有案例：留在当前页
      setCases(prev => prev.map(c => c.id === selectedItem.id ? {
        ...c,
        region: editRegion,
        category: editCategory,
        title: syncedData.en.title || syncedData.zh.title || titleToSave,
        client: editClient,
        date: editDate,
        images: editImages,
        desc: editDesc,
        langData: syncedData,
      } : c));
      showToast('案例保存成功');
    } else {
      // 新增案例：跳转回列表
      const newCase: CaseItem = {
        id: Date.now(),
        region: editRegion,
        category: editCategory,
        title: titleToSave,
        client: editClient,
        date: editDate,
        images: editImages,
        desc: editDesc,
        langData: syncedData,
      };
      setCases(prev => [newCase, ...prev]);
      showToast('案例发布成功');
      setView('list');
      setSelectedItem(null);
    }
  };

  const handleDelete = () => {
    if (!deleteModal) return;
    setCases(prev => prev.filter(c => c.id !== deleteModal.id));
    setDeleteModal(null);
    showToast('案例删除成功');
  };

  const filteredCases = regionFilter === 'All'
    ? cases
    : cases.filter(c => c.region === regionFilter);

  if (view === 'edit' || view === 'details') {
    const isReadOnly = view === 'details';
    return (
      <div className="space-y-6 animate-in fade-in duration-500 relative">
        {toastMsg && (
          <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center z-50 animate-in slide-in-from-top-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mr-2" />
            <span>{toastMsg}</span>
          </div>
        )}
        {showAIToast && (
          <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center z-50 animate-in slide-in-from-top-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mr-2" />
            <span>AI 草稿已生成！请审核并编辑各语言的 SEO 标题、H1、Slug 和 Alt 后再保存。</span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <button onClick={() => setView('list')} className="mr-4 p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{isReadOnly ? '案例详情' : '编辑案例'}</h1>
              <p className="text-sm text-gray-500 mt-1">{isReadOnly ? '查看案例内容与多语言 SEO 配置。' : '编辑案例的多语言详细信息。'}</p>
            </div>
          </div>
          {!isReadOnly && (
            <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm">
              <Save className="w-4 h-4 mr-2" />
              保存案例
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row border-b border-gray-100 bg-gray-50/50 sm:items-center justify-between pr-4">
            <div className="flex overflow-x-auto hide-scrollbar">
              {[
                { id: 'en', label: 'English (EN)' },
                { id: 'zh', label: '中文 (ZH)' },
                { id: 'vi', label: 'Tiếng Việt (VI)' },
                { id: 'ph', label: 'Filipino (PH)' }
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
                  AI 翻译草稿
                </button>
              )}
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-blue-50 border border-blue-100 text-blue-800 text-sm px-4 py-3 rounded-lg flex items-start">
              <div className="font-medium">
                {isReadOnly ? '当前正在查看' : '当前正在编辑'} <span className="font-bold uppercase bg-blue-200 px-1.5 py-0.5 rounded text-blue-900 mx-1">{activeLang}</span> 语言版本。
                <br className="sm:hidden" />
                <span className="text-blue-700 mt-1 sm:mt-0 block sm:inline">严格分离：SEO 标题、H1 标题和内容是独立字段。</span>
              </div>
            </div>

            {/* 案例图片：详情模式展示，编辑模式在表单中 */}
            {isReadOnly && selectedItem && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">案例图片</label>
                {selectedItem.images && selectedItem.images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    {selectedItem.images.map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <img src={img} alt={`案例图片 ${i + 1}`} className="w-full h-full object-cover" />
                        {i === 0 && (
                          <div className="absolute top-1.5 left-1.5 bg-blue-600 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md shadow-sm">主图</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200 py-6 text-center">暂无图片</div>
                )}
              </div>
            )}

            {/* Basic info fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">SEO 标题 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={caseDataByLang[activeLang]?.seoTitle || ''}
                  onChange={(e) => setCaseDataByLang(prev => ({ ...prev, [activeLang]: { ...prev[activeLang], seoTitle: e.target.value } }))}
                  className={`w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none transition-all ${isReadOnly ? 'text-gray-500 cursor-not-allowed' : 'focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500'}`}
                  placeholder="SEO title for search engines..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">H1 标题 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={caseDataByLang[activeLang]?.h1Title || ''}
                  onChange={(e) => setCaseDataByLang(prev => ({ ...prev, [activeLang]: { ...prev[activeLang], h1Title: e.target.value } }))}
                  className={`w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none transition-all ${isReadOnly ? 'text-gray-500 cursor-not-allowed' : 'focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500'}`}
                  placeholder="Page main heading..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Slug <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={caseDataByLang[activeLang]?.slug || ''}
                  onChange={(e) => setCaseDataByLang(prev => ({ ...prev, [activeLang]: { ...prev[activeLang], slug: e.target.value } }))}
                  className={`w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none transition-all ${isReadOnly ? 'text-gray-500 cursor-not-allowed' : 'focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500'}`}
                  placeholder="e.g. vietnam-outdoor-billboard"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">图片 Alt <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={caseDataByLang[activeLang]?.alt || ''}
                  onChange={(e) => setCaseDataByLang(prev => ({ ...prev, [activeLang]: { ...prev[activeLang], alt: e.target.value } }))}
                  className={`w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none transition-all ${isReadOnly ? 'text-gray-500 cursor-not-allowed' : 'focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500'}`}
                  placeholder="Image alt text description..."
                />
              </div>
              {!isReadOnly && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">地区 <span className="text-red-500">*</span></label>
                    <select
                      value={editRegion}
                      onChange={(e) => setEditRegion(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none transition-all focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                    >
                      <option value="Vietnam">Vietnam</option>
                      <option value="Philippines">Philippines</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">分类 <span className="text-red-500">*</span></label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none transition-all focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                    >
                      <option value="Outdoor Billboards (户外围挡)">Outdoor Billboards</option>
                      <option value="Store Signage (门店招牌)">Store Signage</option>
                      <option value="Traffic Reflection (交通反光)">Traffic Reflection</option>
                      <option value="Car Wraps (车身广告)">Car Wraps</option>
                      <option value="Mall Lightboxes (商场灯箱)">Mall Lightboxes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">客户</label>
                    <input
                      type="text"
                      value={editClient}
                      onChange={(e) => setEditClient(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none transition-all focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                      placeholder="Client name..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">日期</label>
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none transition-all focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <ImageUploader
                      images={editImages}
                      onChange={setEditImages}
                      max={6}
                      label="案例图片"
                      showPrimary={true}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">标题 <span className="text-xs text-gray-400 font-normal ml-1">({activeLang.toUpperCase()})</span></label>
                    <input
                      type="text"
                      value={caseDataByLang[activeLang]?.title || ''}
                      onChange={(e) => setCaseDataByLang(prev => ({ ...prev, [activeLang]: { ...prev[activeLang], title: e.target.value } }))}
                      disabled={isReadOnly}
                      className={`w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none transition-all ${isReadOnly ? 'text-gray-500 cursor-not-allowed' : 'focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500'}`}
                      placeholder="案例标题..."
                    />
                  </div>
                </>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">内容 <span className="text-red-500">*</span></label>
              <div className={`border border-gray-200 rounded-lg overflow-hidden transition-all ${isReadOnly ? 'opacity-70' : 'focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-500'}`}>
                <textarea
                  value={caseDataByLang[activeLang]?.content || ''}
                  onChange={(e) => setCaseDataByLang(prev => ({ ...prev, [activeLang]: { ...prev[activeLang], content: e.target.value } }))}
                  disabled={isReadOnly}
                  rows={10}
                  className={`w-full bg-white px-4 py-3 text-sm outline-none resize-y ${isReadOnly ? 'text-gray-500 cursor-not-allowed' : ''}`}
                  placeholder="Enter detailed content here..."
                ></textarea>
              </div>
            </div>
          </div>
        </div>
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
          <h1 className="text-2xl font-bold text-gray-900">案例管理</h1>
          <p className="text-sm text-gray-500 mt-1">按地区管理广告工程案例，展示防水耐用的解决方案。</p>
        </div>
        <button onClick={() => { setSelectedItem(null); setView('edit'); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          发布新案例
        </button>
      </div>

      {/* Region Filter */}
      <div className="flex space-x-2">
        {(['All', 'Vietnam', 'Philippines'] as const).map((region) => (
          <button
            key={region}
            onClick={() => setRegionFilter(region)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              regionFilter === region
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {region === 'All' ? '全部地区' : region}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden max-w-7xl mx-auto">
        <div>
          <table className="w-full text-left border-collapse table-fixed">
            <colgroup>
              <col style={{width: '88px'}} />
              <col />
              <col style={{width: '120px'}} />
              <col style={{width: '180px'}} />
              <col style={{width: '110px'}} />
            </colgroup>
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="px-4 py-4 font-semibold">图片</th>
                <th className="px-4 py-4 font-semibold">标题</th>
                <th className="px-2 py-4 font-semibold">地区</th>
                <th className="px-2 py-4 font-semibold">分类</th>
                <th className="pl-0 pr-4 py-4 font-semibold">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCases.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-4 py-4">
                    {item.images?.[0] ? (
                      <img src={item.images[0]} alt={item.title} className="w-16 h-12 object-cover rounded-lg border border-gray-200" />
                    ) : (
                      <div className="w-16 h-12 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-gray-300 text-xs">无图</div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm font-bold text-gray-900 truncate">{item.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5 truncate">{item.client}</div>
                  </td>
                  <td className="px-2 py-4">
                    <div className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                      <MapPin className="w-3 h-3 mr-1 shrink-0" />
                      <span className="truncate">{item.region}</span>
                    </div>
                  </td>
                  <td className="px-2 py-4 text-xs text-gray-500">
                    <span className="line-clamp-2">{item.category.replace(/\s*（[^）]*）|\s*\([^)]*\)/g, '')}</span>
                  </td>
                  <td className="pl-0 pr-4 py-4">
                    <div className="flex items-center space-x-1">
                      <button onClick={() => { setSelectedItem(item); setView('details'); }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="查看">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => { setSelectedItem(item); setView('edit'); }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="编辑">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteModal(item)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="删除">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCases.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 text-sm">
                    该地区暂无案例
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
              <h3 className="text-lg font-bold text-gray-900 mb-2">确认删除案例？</h3>
              <p className="text-sm text-gray-500">
                确定要删除 <span className="font-semibold text-gray-900">"{deleteModal.title}"</span> 吗？此操作不可撤销。
              </p>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-center gap-3">
              <button onClick={() => setDeleteModal(null)} className="flex-1 px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors">
                取消
              </button>
              <button onClick={handleDelete} className="flex-1 px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm">
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
