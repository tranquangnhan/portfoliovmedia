import React, { useState } from 'react';
import { PortfolioItem, ContactInfo } from '../types';
import { Trash2, Edit2, Plus, Save, X, LogIn, Image as ImageIcon, Video, Upload, Sparkles, Loader2, User } from 'lucide-react';
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
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'PROJECTS' | 'PROFILE'>('PROJECTS');
  
  // Project Editor State
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Project Form Data
  const [formData, setFormData] = useState<Partial<PortfolioItem>>({
    type: 'video',
    title: '',
    client: '',
    url: '',
    thumbnail: '',
    description: ''
  });

  // Profile Form Data
  const [profileFormData, setProfileFormData] = useState<ContactInfo>(contactInfo);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Mật khẩu không đúng');
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
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        Bạn là một chuyên gia biên tập nội dung cho portfolio phim ảnh cao cấp (Cinematic/Luxury).
        Dựa vào đường dẫn này: "${formData.url}" (hoặc giả định nội dung nếu không truy cập được link), hãy sáng tạo nội dung tiếng Việt cho 3 trường sau:
        
        1. title: Một tiêu đề ngắn gọn, sang trọng, mang tính nghệ thuật.
        2. client: Tên loại dự án hoặc khách hàng giả định.
        3. description: Một mô tả ngắn (khoảng 2 câu), dùng từ ngữ bay bổng, chuyên nghiệp.

        Trả về kết quả CỰC KỲ CHÍNH XÁC dưới dạng JSON không có markdown block:
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
      }
    } catch (err) {
      console.error("AI Error:", err);
      alert("Không thể tạo nội dung tự động lúc này.");
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
      newItems.unshift(formData as PortfolioItem); // Add to beginning
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
    alert('Thông tin hồ sơ đã được cập nhật thành công!');
  };

  if (!isAuthenticated) {
    return (
      <div className="absolute inset-0 z-50 bg-cream flex items-center justify-center animate-fade-in">
        <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gold-200 w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif text-gold-600 mb-2">Quản Trị Hệ Thống</h2>
            <p className="text-neutral-500 text-sm">Vui lòng xác minh danh tính</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu"
                className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition-all"
              />
              {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
            </div>
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
      {/* Header */}
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
               Thông Tin
             </button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
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
        
        {/* PROJECTS TAB */}
        {activeTab === 'PROJECTS' && (
          <div className="flex gap-8">
            {/* List Column */}
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
                    <button 
                      onClick={() => startEdit(item)}
                      className="p-2 text-gold-600 hover:bg-gold-50 rounded-lg"
                      title="Sửa"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      title="Xóa"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Project Editor Column (Sticky) */}
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
                            <><Sparkles size={14} className="text-gold-600" /> AI Gợi Ý (Tiếng Việt)</>
                          )}
                        </button>
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
                        <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Loại</label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="radio" 
                              name="type"
                              checked={formData.type === 'video'}
                              onChange={() => setFormData({...formData, type: 'video'})}
                              className="text-gold-500 focus:ring-gold-500"
                            />
                            <span className="text-sm">Video</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="radio" 
                              name="type"
                              checked={formData.type === 'image'}
                              onChange={() => setFormData({...formData, type: 'image'})}
                              className="text-gold-500 focus:ring-gold-500"
                            />
                            <span className="text-sm">Ảnh</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Thumbnail</label>
                        <input 
                          type="text" 
                          className="w-full p-2 rounded border border-neutral-200 focus:border-gold-500 outline-none text-sm font-mono text-xs mb-2"
                          value={formData.thumbnail}
                          onChange={e => setFormData({...formData, thumbnail: e.target.value})}
                          placeholder="https://..."
                        />
                        <div className="flex items-center gap-2">
                           <label className="cursor-pointer bg-neutral-100 hover:bg-gold-50 border border-neutral-200 hover:border-gold-300 text-neutral-600 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all w-full justify-center">
                              <Upload size={14} />
                              <span>Tải Ảnh Lên</span>
                              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                           </label>
                        </div>
                        {formData.thumbnail && (
                          <div className="mt-2 h-32 w-full bg-neutral-100 rounded overflow-hidden border border-neutral-200 relative group">
                            <img src={formData.thumbnail} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/300?text=Invalid+Image')}/>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Mô Tả</label>
                        <textarea 
                          className="w-full p-2 rounded border border-neutral-200 focus:border-gold-500 outline-none text-sm resize-none h-20"
                          value={formData.description}
                          onChange={e => setFormData({...formData, description: e.target.value})}
                        />
                      </div>

                      <div className="flex gap-2 pt-4">
                        <button type="submit" className="flex-1 bg-gold-500 hover:bg-gold-600 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                          <Save size={16} /> Lưu Lại
                        </button>
                        <button 
                          type="button" 
                          onClick={() => {
                            setEditingItem(null);
                            setIsAddingNew(false);
                          }}
                          className="px-4 border border-neutral-200 hover:bg-neutral-50 rounded-lg text-sm font-medium transition-colors"
                        >
                          Hủy
                        </button>
                      </div>

                    </form>
                 </div>
              </div>
            )}
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'PROFILE' && (
           <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl border border-neutral-200 shadow-sm">
             <div className="mb-6 border-b border-neutral-100 pb-4">
               <h3 className="text-xl font-serif text-neutral-800 flex items-center gap-2">
                 <User className="text-gold-500" />
                 Chỉnh Sửa Thông Tin
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
                    placeholder="Mô tả ngắn..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Email</label>
                    <input 
                      type="email" 
                      className="w-full p-3 rounded border border-neutral-200 focus:border-gold-500 outline-none text-sm"
                      value={profileFormData.email}
                      onChange={e => setProfileFormData({...profileFormData, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Số Điện Thoại</label>
                    <input 
                      type="text" 
                      className="w-full p-3 rounded border border-neutral-200 focus:border-gold-500 outline-none text-sm"
                      value={profileFormData.phone}
                      onChange={e => setProfileFormData({...profileFormData, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Instagram (@username)</label>
                    <input 
                      type="text" 
                      className="w-full p-3 rounded border border-neutral-200 focus:border-gold-500 outline-none text-sm"
                      value={profileFormData.instagram}
                      onChange={e => setProfileFormData({...profileFormData, instagram: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Link Facebook</label>
                    <input 
                      type="text" 
                      className="w-full p-3 rounded border border-neutral-200 focus:border-gold-500 outline-none text-sm"
                      value={profileFormData.facebook || ''}
                      onChange={e => setProfileFormData({...profileFormData, facebook: e.target.value})}
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Zalo (SĐT)</label>
                    <input 
                      type="text" 
                      className="w-full p-3 rounded border border-neutral-200 focus:border-gold-500 outline-none text-sm"
                      value={profileFormData.zalo || ''}
                      onChange={e => setProfileFormData({...profileFormData, zalo: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Địa Chỉ / Vị Trí</label>
                    <input 
                      type="text" 
                      className="w-full p-3 rounded border border-neutral-200 focus:border-gold-500 outline-none text-sm"
                      value={profileFormData.address}
                      onChange={e => setProfileFormData({...profileFormData, address: e.target.value})}
                    />
                  </div>
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