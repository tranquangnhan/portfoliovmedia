import React, { useState, useEffect } from 'react';
import type { PortfolioItem, ContactInfo } from '../types';
import { Trash2, Edit2, Plus, Save, X, LogIn, Image as ImageIcon, Video, Upload, Sparkles, Loader2, User, Download, Search, CheckCircle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface AdminPanelProps {
  items: PortfolioItem[];
  contactInfo: ContactInfo;
  onUpdateItems: (items: PortfolioItem[]) => void;
  onUpdateContactInfo: (info: ContactInfo) => void;
  onExit: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ items, contactInfo, onUpdateItems, onUpdateContactInfo, onExit }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'PROJECTS' | 'PROFILE'>('PROJECTS');
  
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [formData, setFormData] = useState<Partial<PortfolioItem>>({
    type: 'video',
    title: '',
    client: '',
    url: '',
    thumbnail: '',
    description: ''
  });

  const [suggestedThumbnails, setSuggestedThumbnails] = useState<string[]>([]);
  const [profileFormData, setProfileFormData] = useState<ContactInfo>(contactInfo);

  // Helper to extract YouTube ID
  const getYouTubeId = (url: string) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  // Watch URL changes to suggest thumbnails
  useEffect(() => {
    const videoId = getYouTubeId(formData.url || '');
    if (videoId) {
      // YouTube generates specific filenames for different frames:
      // maxresdefault.jpg: The high-res custom cover
      // 1.jpg, 2.jpg, 3.jpg: Auto-generated frames from different timestamps (start, middle, end)
      // This ensures the images are actually DIFFERENT visual content.
      setSuggestedThumbnails([
        `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, // Ảnh bìa chính (HD)
        `https://img.youtube.com/vi/${videoId}/1.jpg`,            // Frame 1 (đầu video)
        `https://img.youtube.com/vi/${videoId}/2.jpg`,            // Frame 2 (giữa video)
        `https://img.youtube.com/vi/${videoId}/3.jpg`             // Frame 3 (cuối video)
      ]);
    } else {
      setSuggestedThumbnails([]);
    }
  }, [formData.url]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'vmedia' && password === 'Quangnhan@1606') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Tên đăng nhập hoặc mật khẩu không đúng');
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mục này không?')) {
      const newItems = items.filter(item => item.id !== id);
      onUpdateItems(newItems);
    }
  };

  const startEdit = (item: PortfolioItem) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsAddingNew(false);
  };

  const startAddNew = () => {
    setIsAddingNew(true);
    setEditingItem(null);
    setFormData({
      id: Date.now().toString(),
      type: 'video',
      title: '',
      client: '',
      url: '',
      thumbnail: '',
      description: ''
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Cảnh báo: Ảnh lớn có thể làm chậm website. Vui lòng dùng ảnh dưới 2MB.");
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, thumbnail: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAIGenerate = async () => {
    if (!formData.url) {
      alert("Vui lòng nhập đường dẫn (URL) video hoặc ảnh trước để AI phân tích.");
      return;
    }
    setIsGenerating(true);

    let contextTitle = formData.title; // Use current title if user typed one

    // Try to fetch real title from YouTube via NoEmbed (CORS friendly)
    if (!contextTitle && formData.url.includes('youtu')) {
      try {
        const oembedRes = await fetch(`https://noembed.com/embed?url=${formData.url}`);
        const oembedData = await oembedRes.json();
        if (oembedData && oembedData.title) {
          contextTitle = oembedData.title;
          // Optimistically set the title immediately
          setFormData(prev => ({ ...prev, title: oembedData.title }));
        }
      } catch (e) {
        console.warn("Could not fetch YouTube metadata automatically", e);
      }
    }

    if (!contextTitle) {
      contextTitle = "Một video clip giới thiệu doanh nghiệp hoặc MV ca nhạc";
      alert("Không thể lấy tiêu đề gốc từ YouTube. AI sẽ tạo nội dung chung chung. Bạn nên nhập Tiêu đề trước để AI viết chính xác hơn.");
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        Tôi có một video với tiêu đề gốc là: "${contextTitle}".
        
        Bạn là Creative Director cho V MEDIA (Production House chuyên nghiệp). 
        Hãy viết lại thông tin cho dự án này để đưa vào Portfolio.

        Yêu cầu output JSON:
        1. **title**: Viết lại tiêu đề cho sang trọng, ngắn gọn, đậm chất điện ảnh (Cinematic). Giữ nguyên ý nghĩa gốc.
        2. **client**: Dựa vào tiêu đề, đoán xem khách hàng là ai hoặc thể loại gì (VD: TVC Doanh Nghiệp, Phóng Sự Cưới, Fashion Film, MV Ca Nhạc).
        3. **description**: Viết đoạn mô tả ngắn (2-3 câu) theo phong cách **giới thiệu dịch vụ**.
           - Đừng chỉ kể lại nội dung video.
           - Hãy nói về cách V MEDIA đã sản xuất nó: Nhấn mạnh vào **kỹ thuật quay, ánh sáng, màu sắc (color grading) và cảm xúc**.
           - Ví dụ: "Dự án TVC được thực hiện với các góc máy dynamic..." hoặc "Những thước phim giàu cảm xúc ghi lại khoảnh khắc..."
           - Ngôn ngữ: Tiếng Việt cao cấp.

        Trả về JSON duy nhất:
        { "title": "...", "client": "...", "description": "..." }
      `;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      const text = response.text;
      if (text) {
        const result = JSON.parse(text);
        setFormData(prev => ({
          ...prev,
          title: result.title || prev.title,
          client: result.client || prev.client,
          description: result.description || prev.description
        }));
        
        // Auto-select the Main High Res thumbnail if not set
        if (!formData.thumbnail && suggestedThumbnails.length > 0) {
            setFormData(prev => ({...prev, thumbnail: suggestedThumbnails[0]}));
        }
      }
    } catch (err) {
      console.error("AI Error:", err);
      alert("Lỗi khi gọi AI. Vui lòng thử lại sau.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.url || !formData.thumbnail) {
      alert('Vui lòng điền Tiêu đề, URL và Thumbnail.');
      return;
    }
    let newItems = [...items];
    if (isAddingNew) {
      newItems.unshift(formData as PortfolioItem); 
    } else if (editingItem) {
      newItems = newItems.map(item => 
        item.id === editingItem.id ? { ...item, ...formData } as PortfolioItem : item
      );
    }
    onUpdateItems(newItems);
    setEditingItem(null);
    setIsAddingNew(false);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateContactInfo(profileFormData);
    alert('Thông tin hồ sơ và SEO đã được cập nhật thành công!');
  };

  const downloadDatabase = () => {
    const data = {
      portfolioItems: items,
      contactInfo: contactInfo
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'db.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isAuthenticated) {
    return (
      <div className="absolute inset-0 z-50 bg-cream flex items-center justify-center animate-fade-in">
        <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gold-200 w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif text-gold-600 mb-2">Quản Trị Hệ Thống</h2>
            <p className="text-neutral-500 text-sm">Vui lòng xác minh danh tính</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Tên đăng nhập"
                className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition-all"
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu"
                className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition-all"
              />
            </div>
            {error && <p className="text-red-500 text-xs text-center">{error}</p>}
            <button type="submit" className="w-full py-3 bg-gold-500 hover:bg-gold-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
              <LogIn size={18} /> Đăng Nhập
            </button>
            <button type="button" onClick={onExit} className="w-full py-2 text-neutral-400 hover:text-neutral-600 text-sm">
              Quay về Trang Chủ
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 bg-neutral-50 overflow-y-auto no-scrollbar pb-20 animate-fade-in">
      <div className="bg-white border-b border-neutral-200 px-6 py-4 sticky top-0 z-10 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-6">
          <h2 className="text-2xl font-serif text-gold-600">Quản Lý Portfolio</h2>
          <div className="flex gap-1 bg-neutral-100 p-1 rounded-lg">
             <button 
               onClick={() => setActiveTab('PROJECTS')}
               className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'PROJECTS' ? 'bg-white text-gold-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'}`}
             >
               Dự Án
             </button>
             <button 
               onClick={() => setActiveTab('PROFILE')}
               className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'PROFILE' ? 'bg-white text-gold-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'}`}
             >
               Thông Tin & SEO
             </button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={downloadDatabase}
            className="flex items-center gap-2 text-gold-600 hover:bg-gold-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            title="Tải về file JSON"
          >
            <Download size={18} /> Backup
          </button>
          {activeTab === 'PROJECTS' && (
            <button 
              onClick={startAddNew}
              className="bg-gold-500 hover:bg-gold-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
            >
              <Plus size={18} /> Thêm Dự Án Mới
            </button>
          )}
          <button 
            onClick={onExit}
            className="text-neutral-500 hover:text-neutral-800 p-2 rounded-full hover:bg-neutral-100"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {activeTab === 'PROJECTS' && (
          <div className="flex gap-8">
            <div className="flex-1 space-y-4">
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className={`bg-white p-4 rounded-xl border transition-all flex gap-4 items-center group
                    ${(editingItem?.id === item.id) ? 'border-gold-500 shadow-md ring-1 ring-gold-500' : 'border-neutral-200 hover:border-gold-300'}
                  `}
                >
                  <div className="w-24 h-16 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                    <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                    <div className="absolute bottom-1 right-1 bg-black/50 p-1 rounded-full text-white">
                        {item.type === 'video' ? <Video size={10} /> : <ImageIcon size={10} />}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-neutral-800 truncate">{item.title}</h3>
                    <p className="text-xs text-neutral-500 truncate">{item.client || 'Cá nhân'}</p>
                    <p className="text-[10px] text-neutral-400 truncate mt-1">{item.url}</p>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(item)} className="p-2 text-gold-600 hover:bg-gold-50 rounded-lg" title="Sửa">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Xóa">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {(editingItem || isAddingNew) && (
              <div className="w-96 shrink-0">
                 <div className="bg-white p-6 rounded-xl border border-gold-200 shadow-lg sticky top-24">
                    <h3 className="text-lg font-serif text-neutral-800 mb-6 flex items-center gap-2">
                      {isAddingNew ? <Plus size={20} className="text-gold-500" /> : <Edit2 size={20} className="text-gold-500" />}
                      {isAddingNew ? 'Dự Án Mới' : 'Sửa Dự Án'}
                    </h3>
                    
                    <form onSubmit={handleSaveProject} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">
                          {formData.type === 'video' ? 'Link Video (YouTube/Facebook)' : 'Link Ảnh'}
                        </label>
                        <input 
                          type="text" 
                          className="w-full p-2 rounded border border-neutral-200 focus:border-gold-500 outline-none text-sm font-mono text-xs"
                          value={formData.url}
                          onChange={e => setFormData({...formData, url: e.target.value})}
                          placeholder="https://..."
                        />
                        <button
                          type="button"
                          onClick={handleAIGenerate}
                          disabled={isGenerating || !formData.url}
                          className="mt-2 w-full py-2 bg-gradient-to-r from-gold-100 to-white border border-gold-300 hover:from-gold-200 text-gold-700 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isGenerating ? (
                            <><Loader2 size={14} className="animate-spin" /> Đang phân tích...</>
                          ) : (
                            <><Sparkles size={14} className="text-gold-600" /> AI Tạo Nội Dung (Tiếng Việt)</>
                          )}
                        </button>
                        <p className="text-[10px] text-neutral-400 mt-1 italic">*Tự động lấy tiêu đề gốc và viết mô tả dịch vụ.</p>
                      </div>

                      {/* Thumbnail Selection */}
                      <div>
                        <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Chọn Thumbnail Tự Động</label>
                        
                        {/* Auto-suggested thumbnails from YouTube */}
                        {suggestedThumbnails.length > 0 ? (
                          <div className="grid grid-cols-2 gap-2 mb-3">
                             {suggestedThumbnails.map((thumb, idx) => (
                               <div 
                                 key={idx} 
                                 onClick={() => setFormData({...formData, thumbnail: thumb})}
                                 className={`relative aspect-video rounded cursor-pointer overflow-hidden border-2 transition-all group/thumb ${formData.thumbnail === thumb ? 'border-gold-500 ring-1 ring-gold-500' : 'border-neutral-200 hover:border-gold-200'}`}
                               >
                                  <img src={thumb} className="w-full h-full object-cover" alt="Suggest" />
                                  
                                  {/* Label for thumbnail type */}
                                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] text-center py-0.5 opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                                     {idx === 0 ? 'Ảnh Bìa Chính' : `Frame ${idx}`}
                                  </div>

                                  {formData.thumbnail === thumb && (
                                    <div className="absolute inset-0 bg-gold-500/20 flex items-center justify-center">
                                      <CheckCircle size={20} className="text-white fill-gold-500 shadow-sm" />
                                    </div>
                                  )}
                               </div>
                             ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-neutral-400 italic mb-2">Nhập link YouTube để hiện gợi ý ảnh.</p>
                        )}

                        <div className="relative">
                            <input 
                              type="text" 
                              className="w-full p-2 rounded border border-neutral-200 focus:border-gold-500 outline-none text-sm font-mono text-xs pr-24"
                              value={formData.thumbnail}
                              onChange={e => setFormData({...formData, thumbnail: e.target.value})}
                              placeholder="Hoặc nhập URL ảnh khác..."
                            />
                            <label className="absolute right-1 top-1 bottom-1 bg-neutral-100 hover:bg-gold-50 text-neutral-600 px-3 rounded flex items-center gap-1 cursor-pointer transition-colors border border-neutral-200">
                               <Upload size={12} /> <span className="text-[10px] font-bold">Upload</span>
                               <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Tiêu Đề</label>
                        <input 
                          type="text" 
                          className="w-full p-2 rounded border border-neutral-200 focus:border-gold-500 outline-none text-sm"
                          value={formData.title}
                          onChange={e => setFormData({...formData, title: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Khách Hàng / Thể Loại</label>
                        <input 
                          type="text" 
                          className="w-full p-2 rounded border border-neutral-200 focus:border-gold-500 outline-none text-sm"
                          value={formData.client}
                          onChange={e => setFormData({...formData, client: e.target.value})}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Mô Tả & Giới Thiệu Dịch Vụ</label>
                        <textarea 
                          className="w-full p-2 rounded border border-neutral-200 focus:border-gold-500 outline-none text-sm resize-none h-24 leading-relaxed"
                          value={formData.description}
                          onChange={e => setFormData({...formData, description: e.target.value})}
                          placeholder="Mô tả dự án và giới thiệu năng lực sản xuất..."
                        />
                      </div>
                      <div className="flex gap-2 pt-4">
                        <button type="submit" className="flex-1 bg-gold-500 hover:bg-gold-600 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                          <Save size={16} /> Lưu Lại
                        </button>
                        <button type="button" onClick={() => { setEditingItem(null); setIsAddingNew(false); }} className="px-4 border border-neutral-200 hover:bg-neutral-50 rounded-lg text-sm font-medium transition-colors">Hủy</button>
                      </div>
                    </form>
                 </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'PROFILE' && (
           <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl border border-neutral-200 shadow-sm">
             <div className="mb-6 border-b border-neutral-100 pb-4">
               <h3 className="text-xl font-serif text-neutral-800 flex items-center gap-2">
                 <User className="text-gold-500" /> Chỉnh Sửa Thông Tin
               </h3>
               <p className="text-sm text-neutral-500 mt-1">Cập nhật chi tiết liên hệ và giới thiệu bản thân.</p>
             </div>

             <form onSubmit={handleSaveProfile} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Giới Thiệu / Bio</label>
                  <textarea 
                    className="w-full p-3 rounded border border-neutral-200 focus:border-gold-500 outline-none text-sm resize-none h-24"
                    value={profileFormData.bio}
                    onChange={e => setProfileFormData({...profileFormData, bio: e.target.value})}
                  />
                </div>
                
                {/* SEO Section */}
                <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 space-y-4">
                   <h4 className="font-bold text-gold-600 flex items-center gap-2"><Search size={16} /> Cấu Hình SEO</h4>
                   <div>
                     <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Tiêu Đề Trang (Title Tag)</label>
                     <input type="text" className="w-full p-2 rounded border border-neutral-200 focus:border-gold-500 text-sm" value={profileFormData.seoTitle || ''} onChange={e => setProfileFormData({...profileFormData, seoTitle: e.target.value})} />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Mô Tả (Meta Description)</label>
                     <textarea className="w-full p-2 rounded border border-neutral-200 focus:border-gold-500 text-sm h-16 resize-none" value={profileFormData.seoDescription || ''} onChange={e => setProfileFormData({...profileFormData, seoDescription: e.target.value})} />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Từ Khóa (Meta Keywords)</label>
                     <input type="text" className="w-full p-2 rounded border border-neutral-200 focus:border-gold-500 text-sm" value={profileFormData.seoKeywords || ''} onChange={e => setProfileFormData({...profileFormData, seoKeywords: e.target.value})} placeholder="video, cinematic, viral..." />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div><label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Email</label><input type="email" className="w-full p-3 rounded border border-neutral-200 focus:border-gold-500 text-sm" value={profileFormData.email} onChange={e => setProfileFormData({...profileFormData, email: e.target.value})} /></div>
                   <div><label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Số Điện Thoại</label><input type="text" className="w-full p-3 rounded border border-neutral-200 focus:border-gold-500 text-sm" value={profileFormData.phone} onChange={e => setProfileFormData({...profileFormData, phone: e.target.value})} /></div>
                   <div><label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Instagram</label><input type="text" className="w-full p-3 rounded border border-neutral-200 focus:border-gold-500 text-sm" value={profileFormData.instagram} onChange={e => setProfileFormData({...profileFormData, instagram: e.target.value})} /></div>
                   <div><label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Facebook</label><input type="text" className="w-full p-3 rounded border border-neutral-200 focus:border-gold-500 text-sm" value={profileFormData.facebook || ''} onChange={e => setProfileFormData({...profileFormData, facebook: e.target.value})} /></div>
                   <div><label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Zalo</label><input type="text" className="w-full p-3 rounded border border-neutral-200 focus:border-gold-500 text-sm" value={profileFormData.zalo || ''} onChange={e => setProfileFormData({...profileFormData, zalo: e.target.value})} /></div>
                   <div><label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Địa Chỉ</label><input type="text" className="w-full p-3 rounded border border-neutral-200 focus:border-gold-500 text-sm" value={profileFormData.address} onChange={e => setProfileFormData({...profileFormData, address: e.target.value})} /></div>
                </div>

                <div className="pt-4">
                  <button type="submit" className="w-full bg-gold-500 hover:bg-gold-600 text-white py-3 rounded-lg text-base font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-gold-500/20">
                    <Save size={18} /> Lưu Thay Đổi
                  </button>
                </div>
             </form>
           </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;