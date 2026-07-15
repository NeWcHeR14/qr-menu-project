'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../lib/supabase'; // Supabase istemcimiz (src'siz yapıya uygun görece yol)

export default function RestaurantMenu() {
  const params = useParams();
  const slug = params.slug; // URL'den restoran adını alıyoruz (örn: localhost:3000/antiochia)

  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');

  // 1. ADIM: Sayfa açıldığında veritabanından restoran ve menü bilgilerini çekiyoruz
  useEffect(() => {
    async function fetchMenuData() {
      try {
        setLoading(true);

        // Restoran bilgisini çek
        const { data: resData, error: resError } = await supabase
          .from('restaurants')
          .select('*')
          .eq('slug', slug)
          .single();

        if (resError || !resData) {
          console.error("Restoran bulunamadı!");
          setLoading(false);
          return;
        }
        setRestaurant(resData);

        // Kategorileri çek
        const { data: catData, error: catError } = await supabase
          .from('categories')
          .select('*')
          .eq('restaurant_id', resData.id)
          .order('order_index', { ascending: true });

        if (!catError && catData.length > 0) {
          setCategories(catData);
          setActiveCategory(catData[0].id); // İlk kategoriyi aktif yap
        }

        // Ürünleri çek
        const { data: prodData, error: prodError } = await supabase
          .from('products')
          .select('*')
          .in('category_id', catData.map(c => c.id))
          .eq('is_active', true);

        if (!prodError) {
          setProducts(prodData);
        }

      } catch (err) {
        console.error("Veri çekilirken hata oluştu:", err);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchMenuData();
    }
  }, [slug]);

  // 2. ADIM: Premium ve göz alıcı parlak renk şemaları
  const themes = {
    blue: {
      bg: 'bg-gradient-to-b from-[#060b19] via-[#030712] to-[#010208]',
      card: 'bg-[#0a122c]/40 border-blue-500/20 backdrop-blur-md shadow-[0_0_15px_rgba(59,130,246,0.05)] hover:shadow-[0_0_25px_rgba(59,130,246,0.15)] hover:border-blue-500/40',
      text: 'text-slate-100',
      accent: 'text-blue-400',
      btnActive: 'bg-blue-600 text-white border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.4)]',
      btnInactive: 'bg-[#0a122c]/60 text-slate-400 border-slate-800/80 hover:text-white',
      price: 'text-blue-400 font-extrabold drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]'
    },
    amber: {
      bg: 'bg-gradient-to-b from-[#130b03] via-[#080401] to-[#000000]',
      card: 'bg-[#1c120c]/40 border-amber-500/20 backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.05)] hover:shadow-[0_0_25px_rgba(245,158,11,0.15)] hover:border-amber-500/40',
      text: 'text-amber-50/90',
      accent: 'text-amber-400',
      btnActive: 'bg-amber-500 text-stone-950 border-amber-300 font-bold shadow-[0_0_15px_rgba(245,158,11,0.4)]',
      btnInactive: 'bg-[#1c120c]/60 text-stone-400 border-amber-950/40 hover:text-stone-200',
      price: 'text-amber-400 font-extrabold drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]'
    }
  };

  // Yükleniyor ekranı
  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        <span className="text-xs font-semibold tracking-wider uppercase">Menü yükleniyor...</span>
      </div>
    );
  }

  // Restoran bulunamadı hatası
  if (!restaurant) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center text-red-400 text-sm p-6 text-center">
        Restoran bulunamadı! URL'yi kontrol edin veya veritabanından restoran ekleyin.
      </div>
    );
  }

  // Seçilen temayı al (Varsayılan olarak 'blue' neon tema)
  const currentTheme = themes[restaurant.theme] || themes.blue;

  return (
    <div className={`min-h-screen ${currentTheme.bg} ${currentTheme.text} pb-24 font-sans antialiased`}>
      
      {/* Üst Görsel Alanı */}
      <div className="relative h-56 md:h-72 bg-slate-950 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent z-10" />
        <img 
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80" 
          className="w-full h-full object-cover opacity-40 scale-105"
          alt={restaurant.name}
        />
        <div className="absolute bottom-8 left-6 right-6 z-20 max-w-2xl mx-auto">
          <span className="text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            QR Menü
          </span>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mt-3 drop-shadow-md">
            {restaurant.name}
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">Dijital menümüze hoş geldiniz. Afiyet olsun!</p>
        </div>
      </div>

      {/* YATAY KATEGORİ SEÇİCİ (Sticky) */}
      <div className="sticky top-0 z-30 bg-[#030712]/70 backdrop-blur-md py-4 border-b border-slate-900/60 shadow-lg shadow-black/10">
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar max-w-2xl mx-auto px-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                activeCategory === category.id 
                  ? currentTheme.btnActive 
                  : currentTheme.btnInactive
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* ÜRÜNLER LİSTESİ */}
      <main className="max-w-2xl mx-auto px-6 py-10 space-y-5">
        {products
          .filter(p => p.category_id === activeCategory)
          .map((product) => (
            <div 
              key={product.id}
              className={`flex items-center justify-between p-4 rounded-2xl border ${currentTheme.card} transition-all duration-300 hover:scale-[1.01]`}
            >
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-sm font-extrabold tracking-wide">{product.name}</h3>
                  {product.is_popular && (
                    <span className="text-[9px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-md font-black uppercase tracking-wider">
                      Popüler
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed line-clamp-2">{product.description}</p>
                <span className={`text-sm block mt-3 ${currentTheme.price}`}>{product.price} TL</span>
              </div>
              
              {/* Sadece geçerli bir URL varsa görseli göster, yoksa kırık ikon oluşturma */}
              {product.image_url && product.image_url.startsWith('http') && (
                <img 
                  src={product.image_url} 
                  className="w-20 h-20 rounded-xl object-cover border border-slate-800 shadow-md" 
                  alt={product.name}
                />
              )}
            </div>
          ))}

        {products.filter(p => p.category_id === activeCategory).length === 0 && (
          <div className="text-center py-16 border border-dashed border-slate-800/80 rounded-2xl">
            <p className="text-xs text-slate-500 font-semibold tracking-wide uppercase">Bu kategoride ürün bulunmuyor.</p>
          </div>
        )}
      </main>

    </div>
  );
}