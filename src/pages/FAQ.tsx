import React, { useState } from 'react';
import { Plus, Edit, Trash2, ArrowLeft, Sparkles, Save, CheckCircle2, Eye, X } from 'lucide-react';

type FaqLangData = { seoTitle: string; question: string; slug: string; alt: string; answer: string };
type FaqItem = {
  id: number;
  status: string;
  langData: Record<string, FaqLangData>;
};

const defaultFaqs: FaqItem[] = [
  { id: 1, status: '已发布', langData: { en: { seoTitle: 'Minimum Order Quantity FAQ', question: 'What is the minimum order quantity?', slug: 'minimum-order-quantity', alt: 'Minimum order quantity information', answer: 'We typically require a minimum order quantity of 100 rolls for standard materials.' } } },
  { id: 2, status: '已发布', langData: { en: { seoTitle: 'Free Samples FAQ', question: 'Do you provide free samples?', slug: 'free-samples', alt: 'Free samples information', answer: 'Yes, we provide free A4-size samples for most products. Shipping cost is borne by the buyer.' } } },
  { id: 3, status: '已发布', langData: { en: { seoTitle: 'Delivery Time FAQ', question: 'How long is the delivery time?', slug: 'delivery-time', alt: 'Delivery time information', answer: 'Standard orders typically take 15-20 working days after receiving the deposit.' } } },
];

const FAQ_STORAGE_KEY = 'jinyu_admin_faqs';

function loadFaqs(): FaqItem[] {
  try {
    const stored = localStorage.getItem(FAQ_STORAGE_KEY);
    if (stored) { const p = JSON.parse(stored); if (Array.isArray(p) && p.length > 0) return p; }
  } catch { /* ignore */ }
  return defaultFaqs;
}

let nextFaqId = 10;

export default function FAQ() {
  const [faqs, setFaqs] = useState<FaqItem[]>(loadFaqs);
  const [view, setView] = useState<'list' | 'edit' | 'details'>('list');
  const [activeLang, setActiveLang] = useState('en');
  const [showAIToast, setShowAIToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [deleteModal, setDeleteModal] = useState<FaqItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<FaqItem | null>(null);

  const [faqDataByLang, setFaqDataByLang] = useState<Record<string, FaqLangData>>({
    en: { seoTitle: '', question: '', slug: '', alt: '', answer: '' },
    zh: { seoTitle: '', question: '', slug: '', alt: '', answer: '' },
    vi: { seoTitle: '', question: '', slug: '', alt: '', answer: '' },
    ph: { seoTitle: '', question: '', slug: '', alt: '', answer: '' },
  });

  // Persist to localStorage
  React.useEffect(() => { localStorage.setItem(FAQ_STORAGE_KEY, JSON.stringify(faqs)); }, [faqs]);

  React.useEffect(() => {
    if (selectedItem) {
      const allLangs: Record<string, FaqLangData> = {
        en: { seoTitle: '', question: '', slug: '', alt: '', answer: '' },
        zh: { seoTitle: '', question: '', slug: '', alt: '', answer: '' },
        vi: { seoTitle: '', question: '', slug: '', alt: '', answer: '' },
        ph: { seoTitle: '', question: '', slug: '', alt: '', answer: '' },
      };
      if (selectedItem.langData) {
        (['en','zh','vi','ph'] as const).forEach(l => {
          if (selectedItem.langData[l]) allLangs[l] = { ...selectedItem.langData[l] };
        });
      }
      // Fallback: if no en data, generate from status
      if (!allLangs.en.question && selectedItem.langData?.en?.question) {
        allLangs.en.question = selectedItem.langData.en.question;
        allLangs.en.seoTitle = selectedItem.langData.en.seoTitle || selectedItem.langData.en.question;
      }
      setFaqDataByLang(allLangs);
    } else {
      setFaqDataByLang({
        en: { seoTitle: '', question: '', slug: '', alt: '', answer: '' },
        zh: { seoTitle: '', question: '', slug: '', alt: '', answer: '' },
        vi: { seoTitle: '', question: '', slug: '', alt: '', answer: '' },
        ph: { seoTitle: '', question: '', slug: '', alt: '', answer: '' },
      });
    }
  }, [selectedItem]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleAIGenerate = () => {
    setShowAIToast(true);
    
    const currentQuestion = faqDataByLang['en']?.question || 'What is the minimum order quantity?';
    const generatedData = { ...faqDataByLang };
    
    if (currentQuestion.includes('minimum order')) {
      generatedData['zh'] = { 
        seoTitle: '最小起订量是多少？ | 常见问题',
        question: '最小起订量是多少？', 
        slug: 'minimum-order-quantity',
        alt: '最小起订量说明',
        answer: '对于标准材料，我们通常要求最小起订量为100卷。对于定制订单，起订量可能会有所不同，请联系我们的销售团队获取详细信息。' 
      };
      generatedData['vi'] = { 
        seoTitle: 'Số lượng đặt hàng tối thiểu là bao nhiêu? | Câu hỏi thường gặp',
        question: 'Số lượng đặt hàng tối thiểu là bao nhiêu?', 
        slug: 'so-luong-dat-hang-toi-thieu',
        alt: 'Giải thích số lượng đặt hàng tối thiểu',
        answer: 'Chúng tôi thường yêu cầu số lượng đặt hàng tối thiểu là 100 cuộn đối với các vật liệu tiêu chuẩn. Đối với các đơn hàng tùy chỉnh, số lượng tối thiểu có thể khác nhau, vui lòng liên hệ với đội ngũ bán hàng của chúng tôi để biết thêm chi tiết.' 
      };
      generatedData['ph'] = { 
        seoTitle: 'Ano ang minimum order quantity? | Mga FAQ',
        question: 'Ano ang minimum order quantity?', 
        slug: 'minimum-order-quantity-ph',
        alt: 'Paliwanag sa minimum order quantity',
        answer: 'Karaniwan kaming nangangailangan ng minimum order quantity na 100 rolls para sa mga karaniwang materyales. Para sa mga custom na order, maaaring mag-iba ang minimum na dami, mangyaring makipag-ugnayan sa aming sales team para sa mga detalye.' 
      };
    } else if (currentQuestion.includes('free samples')) {
      generatedData['zh'] = { 
        seoTitle: '你们提供免费样品吗？ | 常见问题',
        question: '你们提供免费样品吗？', 
        slug: 'free-samples',
        alt: '免费样品提供',
        answer: '是的，我们为大多数产品提供免费的A4尺寸样品。运费由买家承担。如果您需要更大的样品进行测试，请与我们联系。' 
      };
      generatedData['vi'] = { 
        seoTitle: 'Bạn có cung cấp mẫu miễn phí không? | Câu hỏi thường gặp',
        question: 'Bạn có cung cấp mẫu miễn phí không?', 
        slug: 'mau-mien-phi',
        alt: 'Cung cấp mẫu miễn phí',
        answer: 'Có, chúng tôi cung cấp mẫu kích thước A4 miễn phí cho hầu hết các sản phẩm. Phí vận chuyển do người mua chịu. Nếu bạn cần mẫu lớn hơn để thử nghiệm, vui lòng liên hệ với chúng tôi.' 
      };
      generatedData['ph'] = { 
        seoTitle: 'Nagbibigay ba kayo ng mga libreng sample? | Mga FAQ',
        question: 'Nagbibigay ba kayo ng mga libreng sample?', 
        slug: 'libreng-sample',
        alt: 'Pagbibigay ng libreng sample',
        answer: 'Oo, nagbibigay kami ng mga libreng sample na kasing-laki ng A4 para sa karamihan ng mga produkto. Ang gastos sa pagpapadala ay sasagutin ng mamimili. Kung kailangan mo ng mas malaking sample para sa pagsubok, mangyaring makipag-ugnayan sa amin.' 
      };
    } else {
      generatedData['zh'] = { 
        seoTitle: '交货时间是多长？ | 常见问题',
        question: '交货时间是多长？', 
        slug: 'delivery-time',
        alt: '交货时间说明',
        answer: '收到定金后，标准订单通常需要15-20个工作日。大批量或定制订单可能需要更长的时间。我们将根据您的具体订单提供准确的交货时间表。' 
      };
      generatedData['vi'] = { 
        seoTitle: 'Thời gian giao hàng là bao lâu? | Câu hỏi thường gặp',
        question: 'Thời gian giao hàng là bao lâu?', 
        slug: 'thoi-gian-giao-hang',
        alt: 'Giải thích thời gian giao hàng',
        answer: 'Các đơn hàng tiêu chuẩn thường mất 15-20 ngày làm việc sau khi nhận được tiền cọc. Các đơn hàng số lượng lớn hoặc tùy chỉnh có thể mất nhiều thời gian hơn. Chúng tôi sẽ cung cấp lịch trình giao hàng chính xác dựa trên đơn hàng cụ thể của bạn.' 
      };
      generatedData['ph'] = { 
        seoTitle: 'Gaano katagal ang oras ng paghahatid? | Mga FAQ',
        question: 'Gaano katagal ang oras ng paghahatid?', 
        slug: 'oras-ng-paghahatid',
        alt: 'Paliwanag sa oras ng paghahatid',
        answer: 'Ang mga karaniwang order ay karaniwang tumatagal ng 15-20 araw ng trabaho pagkatapos matanggap ang deposito. Ang mga malalaking volume o custom na order ay maaaring tumagal ng mas mahabang oras. Magbibigay kami ng tumpak na iskedyul ng paghahatid batay sa iyong partikular na order.' 
      };
    }
    
    setFaqDataByLang(generatedData);
    setTimeout(() => setShowAIToast(false), 4000);
  };

  const handleSave = () => {
    if (selectedItem) {
      // Update existing
      setFaqs(prev => prev.map(f => {
        if (f.id === selectedItem.id) {
          return { ...f, langData: { ...f.langData, ...faqDataByLang } };
        }
        return f;
      }));
      showToast('FAQ 保存成功');
    } else {
      // Create new
      const newId = nextFaqId++;
      const newItem: FaqItem = {
        id: newId,
        status: '已发布',
        langData: { ...faqDataByLang },
      };
      setFaqs(prev => [...prev, newItem]);
      setSelectedItem(newItem);
      showToast('FAQ 创建成功');
    }
  };

  const handleDelete = () => {
    if (deleteModal) {
      setFaqs(prev => prev.filter(f => f.id !== deleteModal.id));
      setDeleteModal(null);
      showToast('FAQ 删除成功');
    }
  };

  const getDisplayQuestion = (faq: FaqItem) => {
    return faq.langData?.en?.question || faq.langData?.zh?.question || '(无标题)';
  };

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
            <span>AI草稿已生成！请务必手动检查并修改各语言的 SEO标题、H1、Slug 及 Alt，确认无误后再保存。</span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <button onClick={() => setView('list')} className="mr-4 p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{isReadOnly ? 'FAQ 详情' : '编辑 FAQ'}</h1>
              <p className="text-sm text-gray-500 mt-1">{isReadOnly ? '查看常见问题内容及多语言SEO配置。' : '配置常见问题多语言详情内容。'}</p>
            </div>
          </div>
          {!isReadOnly && (
            <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm">
              <Save className="w-4 h-4 mr-2" />
              保存 FAQ
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
                  AI一键生成中/越/菲草稿
                </button>
              )}
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="bg-blue-50 border border-blue-100 text-blue-800 text-sm px-4 py-3 rounded-lg flex items-start">
              <div className="font-medium">
                当前正在编辑 <span className="font-bold uppercase bg-blue-200 px-1.5 py-0.5 rounded text-blue-900 mx-1">{activeLang}</span> 语言版本。
                <br className="sm:hidden" />
                <span className="text-blue-700 mt-1 sm:mt-0 block sm:inline">严格拆分规则：SEO标题、H1大标题、正文详情不共用、不自动截取、不互相填充。</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">SEO标题 (SEO Title) <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  disabled={isReadOnly} 
                  value={faqDataByLang[activeLang]?.seoTitle || ''}
                  onChange={(e) => setFaqDataByLang(prev => ({ ...prev, [activeLang]: { ...prev[activeLang], seoTitle: e.target.value } }))}
                  className={`w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none transition-all ${isReadOnly ? 'text-gray-500 cursor-not-allowed' : 'focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500'}`} 
                  placeholder="用于搜索引擎优化的标题..." 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">H1大标题 / 问题 (H1 Question) <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  disabled={isReadOnly} 
                  value={faqDataByLang[activeLang]?.question || ''}
                  onChange={(e) => setFaqDataByLang(prev => ({ ...prev, [activeLang]: { ...prev[activeLang], question: e.target.value } }))}
                  className={`w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none transition-all ${isReadOnly ? 'text-gray-500 cursor-not-allowed' : 'focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500'}`} 
                  placeholder="常见问题主标题..." 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">独立网址别名 (Slug) <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  disabled={isReadOnly} 
                  value={faqDataByLang[activeLang]?.slug || ''}
                  onChange={(e) => setFaqDataByLang(prev => ({ ...prev, [activeLang]: { ...prev[activeLang], slug: e.target.value } }))}
                  className={`w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none transition-all ${isReadOnly ? 'text-gray-500 cursor-not-allowed' : 'focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500'}`} 
                  placeholder="例如: minimum-order-quantity" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">独立图片Alt文案 (Image Alt) <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  disabled={isReadOnly} 
                  value={faqDataByLang[activeLang]?.alt || ''}
                  onChange={(e) => setFaqDataByLang(prev => ({ ...prev, [activeLang]: { ...prev[activeLang], alt: e.target.value } }))}
                  className={`w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none transition-all ${isReadOnly ? 'text-gray-500 cursor-not-allowed' : 'focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500'}`} 
                  placeholder="描述图片的替代文本..." 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">正文详情 / 答案 (Answer Content) <span className="text-red-500">*</span></label>
              <div className={`border border-gray-200 rounded-lg overflow-hidden transition-all ${isReadOnly ? 'opacity-70' : 'focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-500'}`}>
                <textarea 
                  disabled={isReadOnly} 
                  value={faqDataByLang[activeLang]?.answer || ''}
                  onChange={(e) => setFaqDataByLang(prev => ({ ...prev, [activeLang]: { ...prev[activeLang], answer: e.target.value } }))}
                  rows={10} 
                  className={`w-full bg-white px-4 py-3 text-sm outline-none resize-y ${isReadOnly ? 'text-gray-500 cursor-not-allowed' : ''}`} 
                  placeholder="在此输入独立的答案详情内容（支持富文本）..."
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">FAQ 管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理网站的常见问题与解答。</p>
        </div>
        <button onClick={() => { setSelectedItem(null); setView('edit'); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          添加 FAQ
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
              <th className="px-6 py-4 font-semibold">常见问题 (EN)</th>
              <th className="px-6 py-4 font-semibold">状态</th>
              <th className="px-6 py-4 font-semibold">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {faqs.map((faq) => (
              <tr key={faq.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-gray-900">{getDisplayQuestion(faq)}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                    faq.status === '已发布' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {faq.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button onClick={() => { setSelectedItem(faq); setView('details'); }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="查看详情">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => { setSelectedItem(faq); setView('edit'); }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="编辑">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteModal(faq)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="删除">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {faqs.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-gray-400 text-sm">暂无 FAQ 数据</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>



      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">确认删除 FAQ？</h3>
              <p className="text-sm text-gray-500">
                您确定要删除问题 <span className="font-semibold text-gray-900">"{getDisplayQuestion(deleteModal)}"</span> 吗？此操作无法撤销。
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
