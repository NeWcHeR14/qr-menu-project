'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // Next.js @/ takısı ile yolları daha güvenli bulur

export default function AdminDashboard() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Giriş Formu State'leri
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Yönetim Paneli State'leri
  const [activeTab, setActiveTab] = useState('dashboard');
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  
  // Ürün Ekleme State'leri
  const [productName, setProductName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isPopular, setIsPopular] = useState(false);

  // Mağaza Ekleme State'leri
  const [newRestName, setNewRestName] = useState('');
  const [newRestSlug, setNewRestSlug] = useState('');
  const [newRestTheme, setNewRestTheme] = useState('blue');

  // Yüklenme Durumları
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingStore, setSavingStore] = useState(false);

  // 1. ADIM: Kullanıcı Oturumunu Kontrol Et
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. ADIM: Oturum varsa Restoranları Yükle
  useEffect(() => {
    async function fetchRestaurants() {
      try {
        setLoading(true);
        const { data, error } = await supabase.from('restaurants').select('*');
        if (!error && data && data.length > 0) {
          setRestaurants(data);
          if (!selectedRestaurantId) {
            setSelectedRestaurantId(data[0].id);
          }
        }
      } catch (err) {
        console.error("Restoranlar yüklenirken hata:", err);
      } finally {
        setLoading(false);
      }
    }

    if (session) {
      fetchRestaurants();
    }
  }, [session, selectedRestaurantId]);

  // 3. ADIM: Seçili restorana ait kategori ve ürünleri çek
  useEffect(() => {
    if (!selectedRestaurantId || !session) return;

    async function fetchMenuDetails() {
      try {
        const { data: catData, error: catError } = await supabase
          .from('categories')
          .select('*')
          .eq('restaurant_id', selectedRestaurantId)
          .order('order_index', { ascending: true });

        if (!catError && catData) {
          setCategories(catData);
          if (catData.length > 0) {
            setCategoryId(catData[0].id);
          } else {
            setCategoryId('');
          }
        }

        if (catData && catData.length > 0) {
          const { data: prodData, error: prodError } = await supabase
            .from('products')
            .select('*')
            .in('category_id', catData.map(c => c.id));

          if (!prodError && prodData) {
            setProducts(prodData);
          }
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Menü detayları çekilemedi:", err);
      }
    }

    fetchMenuDetails();
  }, [selectedRestaurantId, session]);

  // Giriş Yapma Fonksiyonu
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoginError("Giriş başarısız! Bilgilerinizi kontrol edin.");
    }
    setLoggingIn(false);
  };

  // Çıkış Yapma Fonksiyonu
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Yeni Mağaza Ekleme Fonksiyonu
  const handleAddRestaurant = async (e) => {
    e.preventDefault();
    if (!newRestName || !newRestSlug) {
      alert("Lütfen tüm alanları doldurun!");
      return;
    }

    try {
      setSavingStore(true);
      const formattedSlug = newRestSlug.toLowerCase().trim().replace(/\s+/g, '-');

      const newStore = {
        name: newRestName,
        slug: formattedSlug,
        theme: newRestTheme,
        user_id: session?.user?.id || null 
      };

      const { data, error } = await supabase
        .from('restaurants')
        .insert([newStore])
        .select();

      if (error) {
        alert("Hata: " + error.message);
      } else {
        alert("Yeni Mağaza Başarıyla Oluşturuldu!");
        setNewRestName('');
        setNewRestSlug('');
        if (data) {
          setRestaurants(prev => [...prev, data[0]]);
          setSelectedRestaurantId(data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingStore(false);
    }
  };

  // Yeni Ürün Ekleme Fonksiyonu
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!productName || !categoryId || !price) {
      alert("Lütfen gerekli alanları doldurun!");
      return;
    }

    try {
      setSaving(true);
      const newProduct = {
        category_id: categoryId,
        name: productName,
        description: description,
        price: parseFloat(price),
        image_url: imageUrl || null,
        is_popular: isPopular,
        is_active: true
      };

      const { data, error } = await supabase
        .from('products')
        .insert([newProduct])
        .select();

      if (error) {
        alert("Ürün eklenirken hata oluştu: " + error.message);
      } else {
        alert("Ürün başarıyla menüye eklendi!");
        if (data) {
          setProducts(prev => [...prev, data[0]]);
        }
        setProductName('');
        setPrice('');
        setDescription('');
        setImageUrl('');
        setIsPopular(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Ürün Silme Fonksiyonu
  const handleDeleteProduct = async (id) => {
    if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        alert("Silinemedi: " + error.message);
      } else {
        setProducts(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center text-slate-400">
        Güvenlik Kontrolü Yapılıyor...
      </div>
    );
  }

  // OTURUM YOKSA: Giriş Ekranını Göster
  if (!session) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center px-4 font-sans">
        <div className="w-full max-w-md bg-[#0B0F19] border border-slate-800/80 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-bold text-white text-2xl mx-auto mb-3 shadow-lg shadow-blue-500/20">
              Q
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Yönetim Paneli Girişi</h2>
            <p className="text-xs text-slate-400 mt-1">Lütfen yönetici hesabı bilgilerinizle giriş yapın.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-2.5 px-4 rounded-xl text-center">
                {loginError}
              </div>
            )}

            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">E-posta Adresi</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@gelircebinde.com" 
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500 transition" 
                required
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">Şifre</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500 transition" 
                required
              />
            </div>

            <button 
              type="submit"
              disabled={loggingIn}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-3 rounded-xl transition shadow-lg shadow-blue-500/10 disabled:opacity-50"
            >
              {loggingIn ? 'Giriş Yapılıyor...' : 'Güvenli Giriş Yap'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // OTURUM VARSA: Admin Panelini Göster
  const selectedRest = restaurants.find(r => r.id === selectedRestaurantId);

  return (
    <div className="bg-[#030712] text-[#F3F4F6] min-h-screen flex flex-col md:flex-row font-sans">
      
      {/* SIDEBAR (Sol Menü) */}
      <aside className="w-full md:w-64 bg-[#0B0F19] border-r border-slate-800 p-6 flex flex-col justify-between">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-lg">
              Q
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              MENU<span className="text-blue-500">SaaS</span>
            </span>
          </div>

          {/* Navigasyon Linkleri */}
          <nav className="space-y-1.5">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'dashboard' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Genel Bakış
            </button>
            
            <button 
              onClick={() => setActiveTab('menu')} 
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'menu' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Menü Yönetimi
            </button>

            <button 
              onClick={() => setActiveTab('add-store')} 
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'add-store' 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/10' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              + Mağaza Ekle
            </button>

            <button 
              onClick={() => setActiveTab('themes')} 
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'themes' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Şema & QR Seçimi
            </button>
          </nav>
        </div>

        {/* Alt Bölüm: Mağaza Seçimi ve Çıkış */}
        <div className="mt-8 pt-6 border-t border-slate-800 space-y-4">
          <div>
            <label className="block text-[10px] text-slate-500 mb-2 font-bold uppercase tracking-wider">Aktif Mağaza</label>
            <select 
              value={selectedRestaurantId} 
              onChange={(e) => setSelectedRestaurantId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              {restaurants.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs py-2 rounded-lg font-bold transition"
          >
            Sistemden Çıkış Yap
          </button>
        </div>
      </aside>

      {/* ANA İÇERİK ALANI */}
      <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full space-y-6">

        {/* HEADER */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight font-sans">
              {activeTab === 'dashboard' && 'Genel Bakış'}
              {activeTab === 'menu' && 'Menü Yönetimi'}
              {activeTab === 'add-store' && 'Mağaza Ekle'}
              {activeTab === 'themes' && 'Şema & QR Seçimi'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {selectedRest ? `${selectedRest.name} Mağazası Yönetiliyor.` : 'Lütfen yeni bir mağaza ekleyin.'}
            </p>
          </div>
        </header>

        {/* 1. SEKME: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#0B0F19] border border-slate-800/80 p-5 rounded-2xl">
                <span className="text-xs font-semibold text-slate-400 block mb-2 uppercase">Toplam Ürün</span>
                <h3 className="text-2xl font-bold text-white">{products.length} Adet</h3>
                <p className="text-[10px] text-slate-500 mt-1">{categories.length} farklı kategoride aktif ürün.</p>
              </div>
              <div className="bg-[#0B0F19] border border-slate-800/80 p-5 rounded-2xl">
                <span className="text-xs font-semibold text-slate-400 block mb-2 uppercase">Aktif Şema</span>
                <h3 className="text-2xl font-bold text-white">{selectedRest?.theme === 'blue' ? 'Mavi Neon' : 'Turuncu Amber'}</h3>
                <p className="text-[10px] text-slate-500 mt-1">Şema ve QR sayfasından değiştirilebilir.</p>
              </div>
              <div className="bg-[#0B0F19] border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-center">
                <span className="text-xs font-semibold text-slate-400 block mb-2 uppercase">Yüklenme Durumu</span>
                <h3 className="text-xl font-bold text-emerald-400">{loading ? 'Güncelleniyor...' : 'Veriler Güvenli'}</h3>
              </div>
            </div>

            {/* Mevcut Ürünlerin Listesi */}
            <div className="bg-[#0B0F19] border border-slate-800/80 rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-slate-800">
                <h3 className="text-sm font-semibold text-white">Menüdeki Mevcut Ürünler</h3>
              </div>
              <div className="divide-y divide-slate-800/60 max-h-96 overflow-y-auto">
                {products.map((product) => (
                  <div key={product.id} className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">{product.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{product.price} TL</p>
                    </div>
                    <button 
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-[10px] bg-red-500/10 text-red-400 hover:bg-red-500/20 px-2.5 py-1.5 rounded-lg font-bold transition"
                    >
                      Sil
                    </button>
                  </div>
                ))}
                {products.length === 0 && (
                  <p className="text-center text-xs text-slate-500 py-10">Menünüzde henüz hiç ürün yok. Menü Yönetimi sekmesinden ekleyebilirsiniz.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. SEKME: MENU YÖNETİMİ */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            {categories.length === 0 ? (
              <div className="bg-[#0B0F19] border border-slate-800/80 p-8 rounded-2xl text-center">
                <p className="text-xs text-slate-400">Önce Supabase üzerinden bu restorana ait bir kategori oluşturmalısınız.</p>
              </div>
            ) : (
              <form onSubmit={handleAddProduct} className="bg-[#0B0F19] border border-slate-800/80 p-5 rounded-2xl space-y-4">
                <h3 className="text-sm font-semibold text-white">Yeni Ürün Ekle</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1.5 font-medium">Ürün Adı *</label>
                    <input 
                      type="text" 
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="Örn: Double Cheeseburger" 
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1.5 font-medium">Kategori *</label>
                    <select 
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1.5 font-medium">Fiyat (TL) *</label>
                    <input 
                      type="number" 
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Örn: 250" 
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1.5 font-medium">Ürün Görsel Linki (URL)</label>
                  <input 
                    type="text" 
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... (Boş kalabilir)" 
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500" 
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1.5 font-medium">Ürün Açıklaması</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ürün malzemelerini ve detaylarını yazın..." 
                    rows={2} 
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  ></textarea>
                </div>

                <div className="flex items-center gap-2 py-1">
                  <input 
                    type="checkbox" 
                    id="popular" 
                    checked={isPopular}
                    onChange={(e) => setIsPopular(e.target.checked)}
                    className="rounded border-slate-800 bg-slate-900 text-blue-600 focus:ring-0 w-4 h-4" 
                  />
                  <label htmlFor="popular" className="text-xs text-slate-400 cursor-pointer">Bu Ürünü "Popüler" Olarak Etiketle</label>
                </div>

                <div className="flex justify-end">
                  <button 
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition disabled:opacity-50"
                  >
                    {saving ? 'Ekleniyor...' : 'Ürünü Menüye Ekle'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* 3. SEKME: MAĞAZA EKLE */}
        {activeTab === 'add-store' && (
          <div className="space-y-6">
            <form onSubmit={handleAddRestaurant} className="bg-[#0B0F19] border border-slate-800/80 p-5 rounded-2xl space-y-4">
              <h3 className="text-sm font-semibold text-white">Yeni QR Mağaza Oluştur</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1.5 font-medium">Mağaza / Restoran Adı *</label>
                  <input 
                    type="text" 
                    value={newRestName}
                    onChange={(e) => {
                      setNewRestName(e.target.value);
                      setNewRestSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                    }}
                    placeholder="Örn: Antiochia Dürüm" 
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1.5 font-medium">Mağaza Linki (Slug / URL Adı) *</label>
                  <input 
                    type="text" 
                    value={newRestSlug}
                    onChange={(e) => setNewRestSlug(e.target.value)}
                    placeholder="Örn: antiochia-durum" 
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500" 
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Siteniz bu linkle açılacaktır: gelircebinde.com/{newRestSlug || 'link'}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1.5 font-medium">Mağaza Varsayılan Teması</label>
                <select 
                  value={newRestTheme}
                  onChange={(e) => setNewRestTheme(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="blue">Mavi Neon Tema</option>
                  <option value="amber">Turuncu Amber Tema</option>
                </select>
              </div>

              <div className="flex justify-end">
                <button 
                  type="submit"
                  disabled={savingStore}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition disabled:opacity-50"
                >
                  {savingStore ? 'Oluşturuluyor...' : 'Yeni Mağazayı Kaydet'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 4. SEKME: TEMA & QR SEÇİMİ */}
        {activeTab === 'themes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#0B0F19] border border-slate-800/80 p-5 rounded-2xl space-y-4">
              <h3 className="text-sm font-semibold text-white">Menü Şemanızı Seçin</h3>
              <div className="space-y-3">
                <div className="relative flex items-center justify-between p-4 bg-blue-500/5 border border-blue-500 rounded-xl">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Mavi Neon Tema</h4>
                    <span className="text-[9px] text-blue-400">Cyberpunk / Modern Premium</span>
                  </div>
                  <span className="text-[10px] text-blue-400 font-semibold bg-blue-500/10 px-2 py-0.5 rounded">Aktif</span>
                </div>
              </div>
            </div>

            <div className="bg-[#0B0F19] border border-slate-800/80 p-5 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
              <h3 className="text-sm font-semibold text-white">Dinamik QR Kod</h3>
              <div className="bg-white p-4 rounded-xl shadow-lg">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://gelircebinde.com/${selectedRest?.slug || 'antiochia'}`} 
                  alt="Masa QR Kod" 
                  className="w-32 h-32" 
                />
              </div>
              <p className="text-[10px] text-slate-500 font-sans">Müşterileri https://gelircebinde.com/{selectedRest?.slug || 'antiochia'} adresine yönlendirir.</p>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}