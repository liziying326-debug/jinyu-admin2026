import React, { useState, useEffect, useCallback } from 'react';
import {
  Save, Globe, Phone, Mail, MapPin, Building, CheckCircle2,
  Plus, Trash2, ImageIcon, Upload, Eye, EyeOff, Users, Award,
  Target, Eye as EyeIcon, ArrowUp, ArrowDown, ImageIcon as ImageIcon2,
  Sparkles, Loader2
} from 'lucide-react';

// ========== 类型定义 ==========

type LangCode = 'en' | 'zh' | 'vi' | 'ph';

interface MilestoneItem {
  year_en: string; year_zh: string; year_vi: string; year_ph: string;
  title_en: string; title_zh: string; title_vi: string; title_ph: string;
  desc_en: string; desc_zh: string; desc_vi: string; desc_ph: string;
}

interface FactoryImage {
  url: string;
  alt_en: string; alt_zh: string; alt_vi: string; alt_ph: string;
}

interface CapacityCard {
  title_en: string; title_zh: string; title_vi: string; title_ph: string;
  desc_en: string; desc_zh: string; desc_vi: string; desc_ph: string;
}

interface Certification {
  name: string; image: string; icon: string;
  desc_en: string; desc_zh: string; desc_vi: string; desc_ph: string;
  status_en: string; status_zh: string; status_vi: string; status_ph: string;
}

interface TeamMember {
  visible: boolean;
  name_en: string; name_zh: string; name_vi: string; name_ph: string;
  role_en: string; role_zh: string; role_vi: string; role_ph: string;
  desc_en: string; desc_zh: string; desc_vi: string; desc_ph: string;
  photo: string; color: string; initial: string; email: string;
}

interface AboutData {
  // 公司介绍
  intro_title_en: string; intro_title_zh: string; intro_title_vi: string; intro_title_ph: string;
  intro_desc_en: string; intro_desc_zh: string; intro_desc_vi: string; intro_desc_ph: string;
  business_desc_en: string; business_desc_zh: string; business_desc_vi: string; business_desc_ph: string;
  export_desc_en: string; export_desc_zh: string; export_desc_vi: string; export_desc_ph: string;
  company_image: string;

  // 使命愿景价值观
  mission_en: string; mission_zh: string; mission_vi: string; mission_ph: string;
  vision_en: string; vision_zh: string; vision_vi: string; vision_ph: string;
  values_en: string; values_zh: string; values_vi: string; values_ph: string;

  // Company at a Glance
  founded: string;
  location_en: string; location_zh: string; location_vi: string; location_ph: string;
  certification: string;
  product_lines: string;
  export_markets: string;
  contact_email: string;
  timeline_image: string;

  // 数组数据
  milestones: MilestoneItem[];
  factory_images: FactoryImage[];
  capacity_cards: CapacityCard[];
  certifications: Certification[];
  team_members: TeamMember[];
}

const LANGS: LangCode[] = ['en', 'zh', 'vi', 'ph'];
const LANG_LABELS: Record<LangCode, string> = { en: 'English (EN)', zh: '中文 (ZH)', vi: 'Tiếng Việt (VI)', ph: 'Filipino (PH)' };

// ========== 默认数据（从前端 about.html 提取） ==========
const defaultAboutData = (): AboutData => ({
  intro_title_en: 'Who We Are', intro_title_zh: '关于我们', intro_title_vi: '', intro_title_ph: '',
  intro_desc_en: 'Foshan Jin Yu Advertising Material Co., Ltd is a professional manufacturer of advertising materials established in 2009. We are located in the U+Zhigu Industrial Park, LiShui Town, Nanhai District, Foshan City, Guangdong Province – one of China\'s most concentrated hubs for advertising material production.',
  intro_desc_zh: '佛山市金昱广告材料有限公司成立于2009年，是一家专业从事广告材料生产的制造商。我们位于广东省佛山市南海区里水镇U+智谷产业园——中国广告材料生产最集中的中心之一。',
  intro_desc_vi: '', intro_desc_ph: '',
  business_desc_en: 'Our business integrates design, research and development, production and sales of advertising materials including self adhesive vinyl, PVC flex banner, PVC foam board, acrylic sheet, aluminum composite panel, PP hollow sheet, reflective sheeting, display stands and sign-making accessories.',
  business_desc_zh: '我们的业务集广告材料的设计、研发、生产和销售于一体，产品包括自粘乙烯基、PVC灯箱布、PVC泡沫板、亚克力板、铝复合板、PP中空板、反光膜、展示架和标牌制作配件。',
  business_desc_vi: '', business_desc_ph: '',
  export_desc_en: 'We export to Southeast Asia, Europe, the Americas, the Middle East and other global markets. Our products are known for durability, customizability, and competitive factory-direct pricing.',
  export_desc_zh: '我们出口到东南亚、欧洲、美洲、中东和其他全球市场。我们的产品以耐用性、可定制性和具有竞争力的出厂价格而闻名。',
  export_desc_vi: '', export_desc_ph: '',
  company_image: '',

  mission_en: 'To provide advertising professionals and sign-making businesses worldwide with reliable, high-quality materials that enable outstanding creative work at competitive factory-direct prices.',
  mission_zh: '为全球广告专业人士和标牌制作企业提供可靠、高质量的材料，使其以具有竞争力的出厂价格实现出色的创意作品。',
  mission_vi: '', mission_ph: '',
  vision_en: 'To become a globally recognized name in advertising material manufacturing – known for product innovation, quality consistency, and strong long-term customer partnerships.',
  vision_zh: '成为全球广告材料制造领域的知名品牌——以产品创新、质量稳定性和强大的长期客户合作关系而闻名。',
  vision_vi: '', vision_ph: '',
  values_en: 'Quality first. Honest dealing. Continuous improvement. Customer-centric development. Every product batch must meet the standard we set for ourselves – not just what\'s acceptable.',
  values_zh: '质量第一。诚实守信。持续改进。以客户为中心。每批产品都必须达到我们为自己设定的标准——而不仅仅是可接受的标准。',
  values_vi: '', values_ph: '',

  founded: '2009',
  location_en: 'Foshan, Guangdong, China',
  location_zh: '中国广东佛山',
  location_vi: '', location_ph: '',
  certification: 'ISO 9001:2015',
  product_lines: '12',
  export_markets: '50',
  contact_email: 'vivian@materials-ad.com',
  timeline_image: '',

  milestones: [
    { year_en: '2009 · Year 1', year_zh: '2009年 · 创始年', year_vi: '', year_ph: '',
      title_en: 'Company Established', title_zh: '公司成立', title_vi: '', title_ph: '',
      desc_en: 'Foshan Jin Yu Advertising Material Co., Ltd officially founded in Nanhai District, Foshan. Initial product range focused on PVC foam board and self adhesive vinyl for domestic market supply.',
      desc_zh: '佛山市金昱广告材料有限公司在佛山南海区正式成立。初期产品范围专注于PVC泡沫板和自粘乙烯基，供应国内市场。',
      desc_vi: '', desc_ph: '' },
    { year_en: 'October 2022', year_zh: '2022年10月', year_vi: '', year_ph: '',
      title_en: 'First International Clients – Canton Fair', title_zh: '首批国际客户——广交会', title_vi: '', title_ph: '',
      desc_en: 'Participated in the Canton Fair for the first time. Successfully established partnerships with overseas buyers from Southeast Asia, the Middle East, and Europe.',
      desc_zh: '首次参加广交会。成功与来自东南亚、中东和欧洲的海外买家建立合作关系。',
      desc_vi: '', desc_ph: '' },
    { year_en: 'March 2023', year_zh: '2023年3月', year_vi: '', year_ph: '',
      title_en: 'R&D Team Established', title_zh: '研发团队成立', title_vi: '', title_ph: '',
      desc_en: 'Dedicated research and development team formed to drive product innovation, custom formulation development, and technical support capabilities for international clients.',
      desc_zh: '组建专业研发团队，推动产品创新、定制配方开发以及为国际客户提供技术支持能力。',
      desc_vi: '', desc_ph: '' },
    { year_en: 'July 2023', year_zh: '2023年7月', year_vi: '', year_ph: '',
      title_en: 'Production Capacity Expanded', title_zh: '产能扩展', title_vi: '', title_ph: '',
      desc_en: 'Significant investment in new production lines and advanced equipment. Manufacturing capacity increased substantially to meet growing international order volumes.',
      desc_zh: '大量投资新生产线和先进设备。产能大幅提升，以满足不断增长的国际订单量。',
      desc_vi: '', desc_ph: '' },
    { year_en: '2024', year_zh: '2024年', year_vi: '', year_ph: '',
      title_en: 'ISO 9001 Certification Achieved', title_zh: '获得ISO 9001认证', title_vi: '', title_ph: '',
      desc_en: 'Successfully completed ISO 9001:2015 quality management system certification. Full quality documentation and continuous improvement systems formalized.',
      desc_zh: '成功完成ISO 9001:2015质量管理体系认证。全面质量文档和持续改进体系正式建立。',
      desc_vi: '', desc_ph: '' },
  ],
  factory_images: [
    { url: '', alt_en: 'Factory Exterior', alt_zh: '工厂外观', alt_vi: '', alt_ph: '' },
    { url: '', alt_en: 'Production Line', alt_zh: '生产线', alt_vi: '', alt_ph: '' },
    { url: '', alt_en: 'Equipment', alt_zh: '设备', alt_vi: '', alt_ph: '' },
    { url: '', alt_en: 'Quality Control', alt_zh: '质量控制', alt_vi: '', alt_ph: '' },
  ],
  capacity_cards: [
    { title_en: 'Production Equipment', title_zh: '生产设备', title_vi: '', title_ph: '',
      desc_en: 'Advanced extrusion lines, calendering equipment, coating machines, and slitting systems expanded in 2023',
      desc_zh: '2023年扩展的先进挤出线、压延设备、涂布机和分切系统', desc_vi: '', desc_ph: '' },
    { title_en: 'R&D Laboratory', title_zh: '研发实验室', title_vi: '', title_ph: '',
      desc_en: 'In-house testing lab and R&D team for custom formulation, product development, and quality verification',
      desc_zh: '内部检测实验室和研发团队，用于定制配方、产品开发和质量验证', desc_vi: '', desc_ph: '' },
    { title_en: 'Export Warehouse', title_zh: '出口仓库', title_vi: '', title_ph: '',
      desc_en: 'Dedicated export packaging zone with moisture-proof and shock-resistant packing for international shipping',
      desc_zh: '专用出口包装区，提供防潮防震包装，适合国际运输', desc_vi: '', desc_ph: '' },
    { title_en: 'Quality Control Process', title_zh: '质量控制流程', title_vi: '', title_ph: '',
      desc_en: 'Raw material inspection → in-process checks → final testing → packaging verification → pre-shipment inspection',
      desc_zh: '原材料检验 → 过程检验 → 成品测试 → 包装验证 → 发货前检验', desc_vi: '', desc_ph: '' },
    { title_en: 'Export Logistics', title_zh: '出口物流', title_vi: '', title_ph: '',
      desc_en: 'FOB Guangzhou / Foshan. LCL and FCL available. Major freight forwarder partnerships.',
      desc_zh: 'FOB 广州/佛山。支持拼箱和整箱。与主要货运代理合作。', desc_vi: '', desc_ph: '' },
    { title_en: 'OEM / Custom Orders', title_zh: 'OEM / 定制订单', title_vi: '', title_ph: '',
      desc_en: 'Private label packaging, custom specifications, color matching, and dedicated production runs.',
      desc_zh: '自有品牌包装、定制规格、配色和专属生产线。', desc_vi: '', desc_ph: '' },
  ],
  certifications: [],
  team_members: [
    { visible: true,
      name_en: 'Vivian', name_zh: 'Vivian', name_vi: '', name_ph: '',
      role_en: 'Export Sales Manager', role_zh: '出口销售经理', role_vi: '', role_ph: '',
      desc_en: 'International B2B sales, client relations and export documentation. Direct contact for all international enquiries.',
      desc_zh: '国际B2B销售、客户关系和出口单证。所有国际询价的直接联系人。',
      desc_vi: '', desc_ph: '',
      photo: '', color: '#2563eb', initial: 'V', email: 'vivian@materials-ad.com' },
    { visible: true,
      name_en: 'R&D Department', name_zh: '研发部', name_vi: '', name_ph: '',
      role_en: 'Technical Development Team', role_zh: '技术开发团队', role_vi: '', role_ph: '',
      desc_en: 'Product innovation, custom formulation, quality control, and technical documentation for international compliance.',
      desc_zh: '产品创新、定制配方、质量控制和国际合规技术文档。',
      desc_vi: '', desc_ph: '',
      photo: '', color: '#E8751A', initial: 'R', email: '' },
    { visible: true,
      name_en: 'Production Team', name_zh: '生产团队', name_vi: '', name_ph: '',
      role_en: 'Manufacturing & QC', role_zh: '制造与质量控制', role_vi: '', title_ph: '',
      desc_en: 'Experienced production workforce operating our expanded manufacturing facility with ISO 9001 quality procedures.',
      desc_zh: '经验丰富的生产人员，按照ISO 9001质量流程运营我们的扩建制造设施。',
      desc_vi: '', desc_ph: '',
      photo: '', color: '#3a7ab8', initial: 'P', email: '' },
  ],
});

// ========== 组件 ==========

// 多语言文本输入
function LangField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
      <textarea
        rows={2}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
      />
    </div>
  );
}

// 单行多语言输入
function LangInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
      />
    </div>
  );
}

// 图片上传组件
function ImageUpload({ label, value, onChange }: { label: string; value: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('image', file);
      const res = await fetch('/api/about/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (data.success) onChange(data.url);
    } catch (err) { console.error('Upload failed:', err); }
    setUploading(false);
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
      <div className="flex items-center gap-3">
        {value ? (
          <img src={value} alt="" className="w-24 h-16 object-cover rounded-lg border border-gray-200" />
        ) : (
          <div className="w-24 h-16 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-gray-400" />
          </div>
        )}
        <div className="flex-1">
          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors">
            <Upload className="w-3.5 h-3.5" />
            {uploading ? '上传中...' : '上传图片'}
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
          </label>
          {value && (
            <button onClick={() => onChange('')} className="ml-2 text-red-400 hover:text-red-600 text-xs">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Company() {
  const [data, setData] = useState<AboutData>(defaultAboutData);
  const [activeLang, setActiveLang] = useState<LangCode>('en');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [activeTab, setActiveTab] = useState('intro');
  const [aiTranslating, setAiTranslating] = useState(false);
  const [aiProgress, setAiProgress] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // 加载数据
  useEffect(() => {
    fetch('/api/about')
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data && Object.keys(json.data).length > 0) {
          // 合并默认值（防止缺失字段）
          const def = defaultAboutData();
          setData({ ...def, ...json.data });
        }
      })
      .catch(err => console.warn('Load about data failed:', err))
      .finally(() => setLoading(false));
  }, []);

  // 保存数据
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) showToast('公司介绍保存成功！');
      else showToast('保存失败：' + (json.message || '未知错误'));
    } catch { showToast('网络错误，保存失败'); }
    setSaving(false);
  };

  // AI 生成翻译草稿
  const handleAiTranslate = async () => {
    setAiTranslating(true);
    try {
      // 1. 收集所有英文文本字段
      const enTexts: { field: string; index?: number; text: string }[] = [];

      // 顶层文本字段
      const topFields = [
        'intro_title', 'intro_desc', 'business_desc', 'export_desc',
        'mission', 'vision', 'values', 'location',
      ];
      topFields.forEach(f => {
        const val = data[`${f}_en` as keyof AboutData] as string;
        if (val && val.trim()) enTexts.push({ field: f, text: val.trim() });
      });

      // 里程碑
      data.milestones.forEach((m, idx) => {
        ['year', 'title', 'desc'].forEach(sub => {
          const val = m[`${sub}_en` as keyof MilestoneItem] as string;
          if (val && val.trim()) enTexts.push({ field: `${sub}`, index: idx, text: val.trim() });
        });
      });

      // 产能卡片
      data.capacity_cards.forEach((c, idx) => {
        ['title', 'desc'].forEach(sub => {
          const val = c[`${sub}_en` as keyof CapacityCard] as string;
          if (val && val.trim()) enTexts.push({ field: sub, index: idx, text: val.trim() });
        });
      });

      // 工厂图片 alt
      data.factory_images.forEach((img, idx) => {
        const val = img.alt_en;
        if (val && val.trim()) enTexts.push({ field: 'alt', index: idx, text: val.trim() });
      });

      // 团队成员
      data.team_members.forEach((m, idx) => {
        ['name', 'role', 'desc'].forEach(sub => {
          const val = m[`${sub}_en` as keyof TeamMember] as string;
          if (val && val.trim()) enTexts.push({ field: sub, index: idx, text: val.trim() });
        });
      });

      if (enTexts.length === 0) {
        showToast('没有英文内容可翻译，请先填写英文');
        setAiTranslating(false);
        return;
      }

      const plainTexts = enTexts.map(e => e.text);

      // 2. 逐语言翻译
      const targetLangs: { code: LangCode; label: string }[] = [
        { code: 'zh', label: '中文' },
        { code: 'vi', label: '越南语' },
        { code: 'ph', label: '菲律宾语' },
      ];

      for (const lang of targetLangs) {
        setAiProgress(`正在翻译 ${lang.label}...`);
        try {
          const res = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ texts: plainTexts, targetLang: lang.code }),
          });
          const json = await res.json();
          if (!json.success || !json.translations) {
            showToast(`${lang.label} 翻译失败`);
            continue;
          }

          // 3. 将翻译结果回填到 data
          const newData = { ...data };
          json.translations.forEach((translated: string, i: number) => {
            const item = enTexts[i];
            if (!translated) return;

            if (!item.index && item.index !== 0) {
              // 顶层字段
              (newData as any)[`${item.field}_${lang.code}`] = translated;
            } else if (item.field === 'year' || item.field === 'title' || item.field === 'desc') {
              // 里程碑
              const arr = [...(newData.milestones as any[])];
              arr[item.index] = { ...arr[item.index], [`${item.field}_${lang.code}`]: translated };
              newData.milestones = arr;
            } else if (item.field === 'alt') {
              // 工厂图片
              const arr = [...(newData.factory_images as any[])];
              arr[item.index] = { ...arr[item.index], [`alt_${lang.code}`]: translated };
              newData.factory_images = arr;
            } else if (item.field === 'title' || item.field === 'desc') {
              // 产能卡片
              const arr = [...(newData.capacity_cards as any[])];
              arr[item.index] = { ...arr[item.index], [`${item.field}_${lang.code}`]: translated };
              newData.capacity_cards = arr;
            } else if (item.field === 'name' || item.field === 'role' || item.field === 'desc') {
              // 团队成员
              const arr = [...(newData.team_members as any[])];
              arr[item.index] = { ...arr[item.index], [`${item.field}_${lang.code}`]: translated };
              newData.team_members = arr;
            }
          });
          setData(newData);
        } catch (err) {
          console.error(`Translation failed for ${lang.label}:`, err);
          showToast(`${lang.label} 翻译出错`);
        }
      }

      showToast('AI 草稿生成完成！请检查各语言版本');
    } catch (err) {
      console.error('AI translate error:', err);
      showToast('翻译过程出错');
    }
    setAiTranslating(false);
    setAiProgress('');
  };

  // 更新字段辅助
  const setField = useCallback((field: keyof AboutData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  }, []);

  const langSuffix = (lang: LangCode) => `_${lang === 'ph' ? 'ph' : lang}`;

  // Tab 配置
  const tabs = [
    { id: 'intro', label: '公司介绍', icon: Building },
    { id: 'mission', label: '使命愿景', icon: Target },
    { id: 'milestones', label: '发展里程碑', icon: Award },
    { id: 'factory', label: '工厂展示', icon: ImageIcon2 },
    { id: 'capacity', label: '产能卡片', icon: Target },
    { id: 'team', label: '团队成员', icon: Users },
    { id: 'glance', label: '概览/侧边栏', icon: EyeIcon },
  ];

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full" /></div>;

  return (
    <div className="space-y-6 max-w-6xl animate-in fade-in duration-500 relative">
      {toastMsg && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center z-50 animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 mr-2" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 页头 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">公司介绍管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理前台 About Us 页面的所有内容模块</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleAiTranslate}
            disabled={aiTranslating || saving}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center transition-all shadow-sm"
          >
            {aiTranslating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            {aiTranslating ? (aiProgress || 'AI 翻译中...') : 'AI 生成中/越/菲草稿'}
          </button>
          <button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm">
            <Save className="w-4 h-4 mr-2" />
            {saving ? '保存中...' : '保存所有修改'}
          </button>
        </div>
      </div>

      {/* 语言切换 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100 bg-gray-50/50">
          <div className="flex overflow-x-auto hide-scrollbar">
            {LANGS.map(l => (
              <button
                key={l}
                onClick={() => setActiveLang(l)}
                className={`px-6 py-3.5 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeLang === l ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100/50'}`}
              >
                {LANG_LABELS[l]}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4">
          <div className="bg-blue-50 border border-blue-100 text-blue-800 text-sm px-4 py-3 rounded-lg">
            <div className="font-medium">
              当前正在编辑 <span className="font-bold uppercase bg-blue-200 px-1.5 py-0.5 rounded text-blue-900 mx-1">{activeLang}</span> 语言版本。
              <span className="text-blue-600 ml-2">提示：英文内容会同步显示给所有语言用户，建议先完善英文内容。</span>
            </div>
          </div>
        </div>
      </div>

      {/* 模块 Tab */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === tab.id ? 'border-blue-600 text-blue-700 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* 公司介绍 Tab */}
          {activeTab === 'intro' && (
            <div className="space-y-5">
              <LangInput label="标题 (Intro Title)" value={data[`intro_title${langSuffix(activeLang)}` as keyof AboutData] as string} onChange={v => setField(`intro_title${langSuffix(activeLang)}` as keyof AboutData, v)} />
              <LangField label="公司介绍 (Intro Description)" value={data[`intro_desc${langSuffix(activeLang)}` as keyof AboutData] as string} onChange={v => setField(`intro_desc${langSuffix(activeLang)}` as keyof AboutData, v)} />
              <LangField label="业务描述 (Business Description)" value={data[`business_desc${langSuffix(activeLang)}` as keyof AboutData] as string} onChange={v => setField(`business_desc${langSuffix(activeLang)}` as keyof AboutData, v)} />
              <LangField label="出口描述 (Export Description)" value={data[`export_desc${langSuffix(activeLang)}` as keyof AboutData] as string} onChange={v => setField(`export_desc${langSuffix(activeLang)}` as keyof AboutData, v)} />
              <ImageUpload label="公司主图 (Company Image)" value={data.company_image} onChange={v => setField('company_image', v)} />
            </div>
          )}

          {/* 使命愿景 Tab */}
          {activeTab === 'mission' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-5">
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                  <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">🎯 使命 (Mission)</h3>
                  <LangField label="" value={data[`mission${langSuffix(activeLang)}` as keyof AboutData] as string} onChange={v => setField(`mission${langSuffix(activeLang)}` as keyof AboutData, v)} />
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">🔭 愿景 (Vision)</h3>
                  <LangField label="" value={data[`vision${langSuffix(activeLang)}` as keyof AboutData] as string} onChange={v => setField(`vision${langSuffix(activeLang)}` as keyof AboutData, v)} />
                </div>
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                  <h3 className="font-bold text-purple-800 mb-3 flex items-center gap-2">💎 价值观 (Values)</h3>
                  <LangField label="" value={data[`values${langSuffix(activeLang)}` as keyof AboutData] as string} onChange={v => setField(`values${langSuffix(activeLang)}` as keyof AboutData, v)} />
                </div>
              </div>
            </div>
          )}

          {/* 发展里程碑 Tab */}
          {activeTab === 'milestones' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">按时间倒序排列显示在前台时间线中</p>
                <button
                  onClick={() => {
                    const newItem: MilestoneItem = {
                      year_en: '', year_zh: '', year_vi: '', year_ph: '',
                      title_en: '', title_zh: '', title_vi: '', title_ph: '',
                      desc_en: '', desc_zh: '', desc_vi: '', desc_ph: '',
                    };
                    setField('milestones', [...data.milestones, newItem]);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> 添加里程碑
                </button>
              </div>
              {data.milestones.map((m, idx) => (
                <div key={idx} className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-700">里程碑 #{idx + 1}</span>
                    <div className="flex gap-1">
                      {idx > 0 && <button onClick={() => {
                        const arr = [...data.milestones];
                        [arr[idx-1], arr[idx]] = [arr[idx], arr[idx-1]];
                        setField('milestones', arr);
                      }} className="p-1.5 text-gray-400 hover:text-blue-600"><ArrowUp className="w-4 h-4" /></button>}
                      {idx < data.milestones.length - 1 && <button onClick={() => {
                        const arr = [...data.milestones];
                        [arr[idx], arr[idx+1]] = [arr[idx+1], arr[idx]];
                        setField('milestones', arr);
                      }} className="p-1.5 text-gray-400 hover:text-blue-600"><ArrowDown className="w-4 h-4" /></button>}
                      <button onClick={() => {
                        const arr = data.milestones.filter((_, i) => i !== idx);
                        setField('milestones', arr);
                      }} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <LangInput label="年份/日期" value={m[`year${langSuffix(activeLang)}` as keyof MilestoneItem] as string}
                    onChange={v => { const arr = [...data.milestones]; arr[idx] = { ...arr[idx], [`year${langSuffix(activeLang)}`]: v }; setField('milestones', arr); }} />
                  <LangInput label="标题" value={m[`title${langSuffix(activeLang)}` as keyof MilestoneItem] as string}
                    onChange={v => { const arr = [...data.milestones]; arr[idx] = { ...arr[idx], [`title${langSuffix(activeLang)}`]: v }; setField('milestones', arr); }} />
                  <LangField label="描述" value={m[`desc${langSuffix(activeLang)}` as keyof MilestoneItem] as string}
                    onChange={v => { const arr = [...data.milestones]; arr[idx] = { ...arr[idx], [`desc${langSuffix(activeLang)}`]: v }; setField('milestones', arr); }} />
                </div>
              ))}
              {data.milestones.length === 0 && <p className="text-center text-gray-400 py-8">暂无里程碑，点击上方按钮添加</p>}
            </div>
          )}

          {/* 工厂展示 Tab */}
          {activeTab === 'factory' && (
            <div className="space-y-4">
              <ImageUpload label="发展历程配图 (Timeline Image)" value={data.timeline_image} onChange={v => setField('timeline_image', v)} />
              <hr className="my-4" />
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">工厂图片（前台展示 2x2 网格，最多 4 张）</p>
                {data.factory_images.length < 4 && (
                  <button
                    onClick={() => {
                      const newItem: FactoryImage = { url: '', alt_en: '', alt_zh: '', alt_vi: '', alt_ph: '' };
                      setField('factory_images', [...data.factory_images, newItem]);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> 添加图片
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.factory_images.map((img, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-700">图片 #{idx + 1}</span>
                      <button onClick={() => {
                        const arr = data.factory_images.filter((_, i) => i !== idx);
                        setField('factory_images', arr);
                      }} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <ImageUpload label="" value={img.url}
                      onChange={v => { const arr = [...data.factory_images]; arr[idx] = { ...arr[idx], url: v }; setField('factory_images', arr); }} />
                    <LangInput label="Alt 文字" value={img[`alt${langSuffix(activeLang)}` as keyof FactoryImage] as string}
                      onChange={v => { const arr = [...data.factory_images]; arr[idx] = { ...arr[idx], [`alt${langSuffix(activeLang)}`]: v }; setField('factory_images', arr); }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 产能卡片 Tab */}
          {activeTab === 'capacity' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">前台展示 2 行 3 列网格，共 6 张卡片</p>
                <button
                  onClick={() => {
                    const newItem: CapacityCard = {
                      title_en: '', title_zh: '', title_vi: '', title_ph: '',
                      desc_en: '', desc_zh: '', desc_vi: '', desc_ph: '',
                    };
                    setField('capacity_cards', [...data.capacity_cards, newItem]);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> 添加卡片
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.capacity_cards.map((card, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-700">卡片 #{idx + 1}</span>
                      <div className="flex gap-1">
                        {idx > 0 && <button onClick={() => {
                          const arr = [...data.capacity_cards];
                          [arr[idx-1], arr[idx]] = [arr[idx], arr[idx-1]];
                          setField('capacity_cards', arr);
                        }} className="p-1.5 text-gray-400 hover:text-blue-600"><ArrowUp className="w-4 h-4" /></button>}
                        {idx < data.capacity_cards.length - 1 && <button onClick={() => {
                          const arr = [...data.capacity_cards];
                          [arr[idx], arr[idx+1]] = [arr[idx+1], arr[idx]];
                          setField('capacity_cards', arr);
                        }} className="p-1.5 text-gray-400 hover:text-blue-600"><ArrowDown className="w-4 h-4" /></button>}
                        <button onClick={() => {
                          const arr = data.capacity_cards.filter((_, i) => i !== idx);
                          setField('capacity_cards', arr);
                        }} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <LangInput label="标题" value={card[`title${langSuffix(activeLang)}` as keyof CapacityCard] as string}
                      onChange={v => { const arr = [...data.capacity_cards]; arr[idx] = { ...arr[idx], [`title${langSuffix(activeLang)}`]: v }; setField('capacity_cards', arr); }} />
                    <LangField label="描述" value={card[`desc${langSuffix(activeLang)}` as keyof CapacityCard] as string}
                      onChange={v => { const arr = [...data.capacity_cards]; arr[idx] = { ...arr[idx], [`desc${langSuffix(activeLang)}`]: v }; setField('capacity_cards', arr); }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 团队成员 Tab */}
          {activeTab === 'team' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">前台展示团队成员卡片，可拖拽排序</p>
                <button
                  onClick={() => {
                    const newItem: TeamMember = {
                      visible: true,
                      name_en: '', name_zh: '', name_vi: '', name_ph: '',
                      role_en: '', role_zh: '', role_vi: '', role_ph: '',
                      desc_en: '', desc_zh: '', desc_vi: '', desc_ph: '',
                      photo: '', color: '#2563eb', initial: '?', email: '',
                    };
                    setField('team_members', [...data.team_members, newItem]);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> 添加成员
                </button>
              </div>
              {data.team_members.map((m, idx) => (
                <div key={idx} className={`bg-gray-50 rounded-xl p-5 border space-y-3 ${m.visible ? 'border-gray-100' : 'border-red-200 bg-red-50/30'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-700">成员 #{idx + 1}</span>
                      <button
                        onClick={() => { const arr = [...data.team_members]; arr[idx] = { ...arr[idx], visible: !arr[idx].visible }; setField('team_members', arr); }}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${m.visible ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}
                      >
                        {m.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {m.visible ? '显示' : '隐藏'}
                      </button>
                    </div>
                    <div className="flex gap-1">
                      {idx > 0 && <button onClick={() => {
                        const arr = [...data.team_members];
                        [arr[idx-1], arr[idx]] = [arr[idx], arr[idx-1]];
                        setField('team_members', arr);
                      }} className="p-1.5 text-gray-400 hover:text-blue-600"><ArrowUp className="w-4 h-4" /></button>}
                      {idx < data.team_members.length - 1 && <button onClick={() => {
                        const arr = [...data.team_members];
                        [arr[idx], arr[idx+1]] = [arr[idx+1], arr[idx]];
                        setField('team_members', arr);
                      }} className="p-1.5 text-gray-400 hover:text-blue-600"><ArrowDown className="w-4 h-4" /></button>}
                      <button onClick={() => {
                        const arr = data.team_members.filter((_, i) => i !== idx);
                        setField('team_members', arr);
                      }} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <LangInput label="姓名" value={m[`name${langSuffix(activeLang)}` as keyof TeamMember] as string}
                      onChange={v => { const arr = [...data.team_members]; arr[idx] = { ...arr[idx], [`name${langSuffix(activeLang)}`]: v }; setField('team_members', arr); }} />
                    <LangInput label="职位" value={m[`role${langSuffix(activeLang)}` as keyof TeamMember] as string}
                      onChange={v => { const arr = [...data.team_members]; arr[idx] = { ...arr[idx], [`role${langSuffix(activeLang)}`]: v }; setField('team_members', arr); }} />
                  </div>
                  <LangField label="描述" value={m[`desc${langSuffix(activeLang)}` as keyof TeamMember] as string}
                    onChange={v => { const arr = [...data.team_members]; arr[idx] = { ...arr[idx], [`desc${langSuffix(activeLang)}`]: v }; setField('team_members', arr); }} />
                  <ImageUpload label="头像照片" value={m.photo}
                    onChange={v => { const arr = [...data.team_members]; arr[idx] = { ...arr[idx], photo: v }; setField('team_members', arr); }} />
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">邮箱</label>
                      <input type="email" value={m.email} onChange={e => { const arr = [...data.team_members]; arr[idx] = { ...arr[idx], email: e.target.value }; setField('team_members', arr); }}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">背景色</label>
                      <input type="color" value={m.color} onChange={e => { const arr = [...data.team_members]; arr[idx] = { ...arr[idx], color: e.target.value }; setField('team_members', arr); }}
                        className="w-full h-9 rounded-lg border border-gray-200 cursor-pointer" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">首字母 (无头像时)</label>
                      <input type="text" maxLength={2} value={m.initial} onChange={e => { const arr = [...data.team_members]; arr[idx] = { ...arr[idx], initial: e.target.value }; setField('team_members', arr); }}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500" />
                    </div>
                  </div>
                </div>
              ))}
              {data.team_members.length === 0 && <p className="text-center text-gray-400 py-8">暂无团队成员，点击上方按钮添加</p>}
            </div>
          )}

          {/* 概览/侧边栏 Tab */}
          {activeTab === 'glance' && (
            <div className="space-y-5">
              <p className="text-sm text-gray-500 mb-4">这些数据显示在前台 "Company at a Glance" 侧边栏（无需多语言）</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">成立年份</label>
                  <input type="text" value={data.founded} onChange={e => setField('founded', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">认证名称</label>
                  <input type="text" value={data.certification} onChange={e => setField('certification', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">产品线数量</label>
                  <input type="text" value={data.product_lines} onChange={e => setField('product_lines', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">出口市场数量（国家数）</label>
                  <input type="text" value={data.export_markets} onChange={e => setField('export_markets', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">联系邮箱</label>
                  <input type="email" value={data.contact_email} onChange={e => setField('contact_email', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500" />
                </div>
              </div>
              <LangInput label="地区 (Location)" value={data[`location${langSuffix(activeLang)}` as keyof AboutData] as string} onChange={v => setField(`location${langSuffix(activeLang)}` as keyof AboutData, v)} />
              <ImageUpload label="发展历程配图 (Timeline Image)" value={data.timeline_image} onChange={v => setField('timeline_image', v)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
