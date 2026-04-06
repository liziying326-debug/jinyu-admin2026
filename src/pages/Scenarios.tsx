import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, ArrowLeft, Sparkles, Save, CheckCircle2 } from 'lucide-react';
import ImageUploader from '@/src/components/ImageUploader';

type Scenario = {
  id: number;
  name: string;
  desc: string;
  images: string[];
  langData: Record<string, { name: string; desc: string }>;
};

const initialScenarios: Scenario[] = [
  {
    id: 1,
    name: 'Outdoor Advertising',
    desc: 'Ideal for large-scale outdoor billboards in Manila and Ho Chi Minh City. Engineered for tropical climates, offering excellent UV resistance against high temperatures and sun exposure. Ensures 3-5 years of outdoor durability, waterproof and moisture-proof during the rainy season. Perfect for advertising engineers and foreign trade OEM seeking reliable outdoor advertising materials.',
    images: ['https://picsum.photos/seed/outdoor/150/100'],
    langData: {
      en: { name: 'Outdoor Advertising', desc: 'Ideal for large-scale outdoor billboards in Manila and Ho Chi Minh City. Engineered for tropical climates, offering excellent UV resistance against high temperatures and sun exposure. Ensures 3-5 years of outdoor durability, waterproof and moisture-proof during the rainy season. Perfect for advertising engineers and foreign trade OEM seeking reliable outdoor advertising materials.' },
      zh: { name: '户外广告', desc: '' },
      vi: { name: '', desc: '' },
      ph: { name: '', desc: '' },
    }
  },
  {
    id: 2,
    name: 'Store Signage',
    desc: 'Suitable for local store front inkjet printing and indoor lightboxes in shopping malls. Provides vibrant color reproduction and long-lasting performance. Includes frosted glass decals for store windows, offering privacy and branding. A top choice for retail material wholesalers in Vietnam and the Philippines.',
    images: ['https://picsum.photos/seed/store/150/100'],
    langData: {
      en: { name: 'Store Signage', desc: 'Suitable for local store front inkjet printing and indoor lightboxes in shopping malls. Provides vibrant color reproduction and long-lasting performance. Includes frosted glass decals for store windows, offering privacy and branding. A top choice for retail material wholesalers in Vietnam and the Philippines.' },
      zh: { name: '门店招牌', desc: '' },
      vi: { name: '', desc: '' },
      ph: { name: '', desc: '' },
    }
  },
  {
    id: 3,
    name: 'Traffic Safety',
    desc: 'High-visibility materials for road reflective signs in Vietnam and the Philippines. Essential for construction site safety warnings and traffic management. Weather-resistant and highly reflective, meeting local safety standards for advertising engineering projects.',
    images: ['https://picsum.photos/seed/traffic/150/100'],
    langData: {
      en: { name: 'Traffic Safety', desc: 'High-visibility materials for road reflective signs in Vietnam and the Philippines. Essential for construction site safety warnings and traffic management. Weather-resistant and highly reflective, meeting local safety standards for advertising engineering projects.' },
      zh: { name: '交通安防', desc: '' },
      vi: { name: '', desc: '' },
      ph: { name: '', desc: '' },
    }
  },
  {
    id: 4,
    name: 'Vehicle Advertising',
    desc: 'Premium vehicle wraps for local buses and delivery trucks. Features excellent conformability for curved surfaces and strong adhesion. Withstands tropical heat and heavy rain, maintaining brand image on the move. Ideal for commercial fleet branding and foreign trade OEM.',
    images: ['https://picsum.photos/seed/vehicle/150/100'],
    langData: {
      en: { name: 'Vehicle Advertising', desc: 'Premium vehicle wraps for local buses and delivery trucks. Features excellent conformability for curved surfaces and strong adhesion. Withstands tropical heat and heavy rain, maintaining brand image on the move. Ideal for commercial fleet branding and foreign trade OEM.' },
      zh: { name: '车身商业广告', desc: '' },
      vi: { name: '', desc: '' },
      ph: { name: '', desc: '' },
    }
  },
];

const STORAGE_KEY = 'jinyu_material_scenarios';

function loadScenarios(): Scenario[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) { const p = JSON.parse(stored); if (Array.isArray(p) && p.length > 0) return p; }
  } catch { /* ignore */ }
  return initialScenarios;
}

const emptyLangData = () => ({
  en: { name: '', desc: '' }, zh: { name: '', desc: '' }, vi: { name: '', desc: '' }, ph: { name: '', desc: '' },
});

export default function Scenarios() {
  const [scenarios, setScenarios] = useState<Scenario[]>(loadScenarios);
  const [view, setView] = useState<'list' | 'edit' | 'details'>('list');
  const [selectedItem, setSelectedItem] = useState<Scenario | null>(null);
  const [deleteModal, setDeleteModal] = useState<Scenario | null>(null);
  const [activeLang, setActiveLang] = useState('en');
  const [showAIToast, setShowAIToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const [scenarioDataByLang, setScenarioDataByLang] = useState<Record<string, { name: string, desc: string }>>({
    en: { name: '', desc: '' },
    zh: { name: '', desc: '' },
    vi: { name: '', desc: '' },
    ph: { name: '', desc: '' },
  });

  const [editImages, setEditImages] = useState<string[]>([]);

  // 持久化
  React.useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios)); }, [scenarios]);

  React.useEffect(() => {
    if (selectedItem) {
      setScenarioDataByLang(selectedItem.langData || emptyLangData());
      setEditImages(selectedItem.images || []);
    } else {
      setScenarioDataByLang(emptyLangData());
      setEditImages([]);
    }
  }, [selectedItem]);

  // 监听语言切换
  React.useEffect(() => {
    const handler = () => { setActiveLang('en'); };
    window.addEventListener('lang-change', handler);
    return () => window.removeEventListener('lang-change', handler);
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleAIGenerate = () => {
    setShowAIToast(true);

    const currentName = scenarioDataByLang['en']?.name || 'Outdoor Advertising';
    const generatedData = { ...scenarioDataByLang };

    if (currentName.toLowerCase().includes('outdoor')) {
      generatedData['zh'] = {
        name: '户外广告',
        desc: '专为马尼拉和胡志明市的大型户外广告牌设计。针对热带气候研发，提供卓越的抗紫外线能力，无惧高温暴晒。确保3-5年的户外耐候性，在雨季也能保持优异的防水防潮性能。是寻求可靠户外广告材料的广告工程商和外贸OEM的完美选择。'
      };
      generatedData['vi'] = {
        name: 'Quảng cáo Ngoài trời',
        desc: 'Lý tưởng cho các biển quảng cáo ngoài trời quy mô lớn tại TP.HCM và Manila. Được thiết kế đặc biệt cho khí hậu nhiệt đới, cung cấp khả năng chống tia UV tuyệt vời trước nhiệt độ cao và phơi nắng. Đảm bảo độ bền ngoài trời từ 3-5 năm, chống nước và chống ẩm trong mùa mưa. Sự lựa chọn hoàn hảo cho các kỹ sư quảng cáo và OEM ngoại thương tìm kiếm vật liệu quảng cáo ngoài trời đáng tin cậy.'
      };
      generatedData['ph'] = {
        name: 'Outdoor Advertising',
        desc: 'Tamang-tama para sa malalaking outdoor billboard sa Maynila at Ho Chi Minh City. Dinisenyo para sa mga tropikal na klima, nag-aalok ng mahusay na proteksyon sa UV laban sa mataas na temperatura at pagkabilad sa araw. Tinitiyak ang 3-5 taong tibay sa labas, hindi pinapasok ng tubig at kahalumigmigan sa panahon ng tag-ulan. Perpekto para sa mga inhinyero ng advertising at foreign trade OEM na naghahanap ng maaasahang materyales sa outdoor advertising.'
      };
    } else if (currentName.toLowerCase().includes('store') || currentName.toLowerCase().includes('signage')) {
      generatedData['zh'] = {
        name: '门店招牌',
        desc: '适用于本地店面喷绘和商场室内灯箱。提供鲜艳的色彩还原和持久的性能。包括用于店面橱窗的磨砂玻璃贴，提供隐私和品牌展示。是越南和菲律宾零售材料批发商的首选。'
      };
      generatedData['vi'] = {
        name: 'Biển hiệu Cửa hàng',
        desc: 'Phù hợp cho in phun mặt tiền cửa hàng địa phương và hộp đèn trong nhà tại các trung tâm thương mại. Cung cấp khả năng tái tạo màu sắc sống động và hiệu suất lâu dài. Bao gồm decal kính mờ cho cửa sổ cửa hàng, mang lại sự riêng tư và xây dựng thương hiệu. Lựa chọn hàng đầu cho các nhà bán buôn vật liệu bán lẻ tại Việt Nam và Philippines.'
      };
      generatedData['ph'] = {
        name: 'Signage ng Tindahan',
        desc: 'Angkop para sa lokal na store front inkjet printing at indoor lightboxes sa mga shopping mall. Nagbibigay ng matingkad na pagpaparami ng kulay at pangmatagalang pagganap. Kasama ang mga frosted glass decal para sa mga bintana ng tindahan, nag-aalok ng privacy at pagba-brand. Isang nangungunang pagpipilian para sa mga mamamakyaw ng retail material sa Vietnam at Pilipinas.'
      };
    } else if (currentName.toLowerCase().includes('traffic') || currentName.toLowerCase().includes('safety')) {
      generatedData['zh'] = {
        name: '交通安防',
        desc: '用于越南和菲律宾道路反光标牌的高可见度材料。建筑工地安全警告和交通管理的必备品。耐候且高反光，符合当地广告工程项目的安全标准。'
      };
      generatedData['vi'] = {
        name: 'An toàn Giao thông',
        desc: 'Vật liệu có khả năng hiển thị cao cho các biển báo phản quang trên đường phố tại Việt Nam và Philippines. Cần thiết cho cảnh báo an toàn tại công trường và quản lý giao thông. Chịu thời tiết và phản quang cao, đáp ứng các tiêu chuẩn an toàn địa phương cho các dự án kỹ thuật quảng cáo.'
      };
      generatedData['ph'] = {
        name: 'Kaligtasan sa Trapiko',
        desc: 'Mga materyales na may mataas na visibility para sa mga road reflective sign sa Vietnam at Pilipinas. Mahalaga para sa mga babala sa kaligtasan sa construction site at pamamahala ng trapiko. Matibay sa panahon at lubos na nagre-reflect, nakakatugon sa mga lokal na pamantayan sa kaligtasan para sa mga proyekto sa advertising engineering.'
      };
    } else {
      generatedData['zh'] = {
        name: '车身商业广告',
        desc: '用于当地公交车和送货卡车的高级车身贴。具有出色的曲面贴合性和强附着力。经受得住热带高温和暴雨，在移动中保持品牌形象。是商业车队品牌推广和外贸OEM的理想选择。'
      };
      generatedData['vi'] = {
        name: 'Quảng cáo trên Xe',
        desc: 'Decal dán xe cao cấp cho xe buýt và xe tải giao hàng địa phương. Có khả năng co giãn tuyệt vời cho các bề mặt cong và độ bám dính mạnh. Chịu được nhiệt độ nhiệt đới và mưa lớn, duy trì hình ảnh thương hiệu khi di chuyển. Lý tưởng cho việc xây dựng thương hiệu đội xe thương mại và OEM ngoại thương.'
      };
      generatedData['ph'] = {
        name: 'Advertising sa Sasakyan',
        desc: 'Premium na vehicle wraps para sa mga lokal na bus at delivery truck. Nagtatampok ng mahusay na conformability para sa mga kurbadong ibabaw at malakas na pagkakadikit. Nakakatiis sa tropikal na init at malakas na ulan, pinapanatili ang imahe ng brand habang gumagalaw. Tamang-tama para sa commercial fleet branding at foreign trade OEM.'
      };
    }

    setScenarioDataByLang(generatedData);
    setTimeout(() => setShowAIToast(false), 4000);
  };

  const handleSave = () => {
    const enName = scenarioDataByLang['en']?.name || selectedItem?.name || '';
    const enDesc = scenarioDataByLang['en']?.desc || selectedItem?.desc || '';
    const imgs = editImages.length > 0 ? editImages : (selectedItem?.images || []);

    if (selectedItem && selectedItem.id !== 0) {
      const updated = { ...selectedItem, name: enName, desc: enDesc, images: imgs, langData: { ...scenarioDataByLang } };
      setScenarios(prev => prev.map(s => s.id === updated.id ? updated : s));
      setSelectedItem(updated);
      showToast('场景保存成功');
    } else {
      const newId = Math.max(0, ...scenarios.map(s => s.id)) + 1;
      const newItem: Scenario = { id: newId, name: enName, desc: enDesc, images: imgs, langData: { ...scenarioDataByLang } };
      setScenarios(prev => [newItem, ...prev]);
      setSelectedItem(newItem);
      showToast('场景发布成功');
    }
  };

  const handleDelete = () => {
    if (!deleteModal) return;
    setScenarios(prev => prev.filter(s => s.id !== deleteModal.id));
    setDeleteModal(null);
    showToast('场景删除成功');
  };

  // 编辑/详情视图（与案例管理一致：整页视图切换，非弹框）
  if (view === 'edit' || view === 'details') {
    const isReadOnly = view === 'details';
    const currentItem = selectedItem;

    return (
      <div className="space-y-6 animate-in fade-in duration-500 relative">
        {toastMsg && (
          <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center z-[60] animate-in slide-in-from-top-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mr-2" />
            <span>{toastMsg}</span>
          </div>
        )}
        {showAIToast && (
          <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center z-[60] animate-in slide-in-from-top-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mr-2" />
            <span>AI 草稿已生成！请审核并编辑各语言内容后再保存。</span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <button onClick={() => { setView('list'); setSelectedItem(null); }} className="mr-4 p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{isReadOnly ? '场景详情' : '编辑场景'}</h1>
              <p className="text-sm text-gray-500 mt-1">{isReadOnly ? '查看应用场景内容与多语言配置。' : '编辑应用场景的多语言详细信息。'}</p>
            </div>
          </div>
          {!isReadOnly && (
            <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm">
              <Save className="w-4 h-4 mr-2" />
              保存场景
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
                  AI 生成中/越/菲草稿
                </button>
              )}
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-blue-50 border border-blue-100 text-blue-800 text-sm px-4 py-3 rounded-lg flex items-start">
              <div className="font-medium">
                {isReadOnly ? '当前正在查看' : '当前正在编辑'} <span className="font-bold uppercase bg-blue-200 px-1.5 py-0.5 rounded text-blue-900 mx-1">{activeLang}</span> 语言版本。
                <br className="sm:hidden" />
                <span className="text-blue-700 mt-1 sm:mt-0 block sm:inline">场景名称和描述为独立字段，请分别填写。</span>
              </div>
            </div>

            {isReadOnly && currentItem?.images && currentItem.images.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">场景图片</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {currentItem.images.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                      <img src={img} alt={`${currentItem.name} ${i + 1}`} className="w-full h-full object-cover" />
                      {i === 0 && (
                        <div className="absolute top-1.5 left-1.5 bg-blue-600 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md shadow-sm">主图</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!isReadOnly && (
              <ImageUploader
                images={editImages}
                onChange={setEditImages}
                max={6}
                label="场景图片"
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">场景名称 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={scenarioDataByLang[activeLang]?.name || ''}
                  onChange={(e) => setScenarioDataByLang(prev => ({ ...prev, [activeLang]: { ...prev[activeLang], name: e.target.value } }))}
                  className={`w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none transition-all ${isReadOnly ? 'text-gray-500 cursor-not-allowed' : 'focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500'}`}
                  placeholder="输入场景名称..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">描述 <span className="text-red-500">*</span></label>
              <div className={`border border-gray-200 rounded-lg overflow-hidden transition-all ${isReadOnly ? 'opacity-70' : 'focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-500'}`}>
                <textarea
                  value={scenarioDataByLang[activeLang]?.desc || ''}
                  onChange={(e) => setScenarioDataByLang(prev => ({ ...prev, [activeLang]: { ...prev[activeLang], desc: e.target.value } }))}
                  disabled={isReadOnly}
                  rows={10}
                  className={`w-full bg-white px-4 py-3 text-sm outline-none resize-y ${isReadOnly ? 'text-gray-500 cursor-not-allowed' : ''}`}
                  placeholder="输入详细描述..."
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
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center z-[60] animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 mr-2" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">应用场景管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理产品适用的各类应用场景分类。</p>
        </div>
        <button onClick={() => { setSelectedItem(null); setView('edit'); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          添加场景
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="px-6 py-4 font-semibold w-24">图片</th>
                <th className="px-6 py-4 font-semibold">场景名称</th>
                <th className="px-6 py-4 font-semibold">描述</th>
                <th className="px-6 py-4 font-semibold w-24">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {scenarios.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <img src={item.images?.[0] || ''} alt={item.name} className="w-16 h-12 object-cover rounded-lg border border-gray-200" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gray-900">{item.name}</div>
                  </td>
                  <td className="pl-[18px] pr-6 py-4 text-sm text-gray-500">
                    {item.desc}
                  </td>
                  <td className="pl-[18px] pr-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button onClick={() => { setSelectedItem(item); setView('details'); }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="查看详情">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => { setSelectedItem(item); setView('edit'); }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="编辑场景">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteModal(item)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="删除场景">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {scenarios.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500 text-sm">
                    暂无应用场景
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
              <h3 className="text-lg font-bold text-gray-900 mb-2">确认删除场景？</h3>
              <p className="text-sm text-gray-500">
                确定要删除 <span className="font-semibold text-gray-900">"{deleteModal.name}"</span> 吗？此操作不可撤销。
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
