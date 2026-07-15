'use client';

import React from 'react';

export default function HomePage() {
  return (
    <div className="bg-[#030712] text-[#F3F4F6] min-h-screen font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Üst Menü (Navbar) */}
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-b border-slate-900">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-lg">
            Q
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            GELİR<span className="text-blue-500">CEBİNDE</span>
          </span>
        </div>
        <a 
          href="/admin" 
          className="bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 px-4 py-2 rounded-xl text-xs font-semibold transition"
        >
          Yönetim Paneli
        </a>
      </header>

      {/* Hero Alanı (Ana Tanıtım) */}
      <main className="max-w-4xl mx-auto px-6 py-20 text-center space-y-8">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-1.5 rounded-full text-xs font-medium">
          🚀 Geleceğin Restoran Deneyimi Şimdi Cebinizde!
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
          Temassız, Hızlı ve Şık <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-400">
            Dinamik QR Menü
          </span> Sistemi
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Müşterileriniz masadaki QR kodu okutarak anında güncel menünüze, fiyatlarınıza ve popüler ürünlerinize erişsin. Kağıt menü maliyetlerine son verin, restoranınızı cebinizden yönetin.
        </p>

        {/* Butonlar */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <a 
            href="/antiochia" 
            target="_blank"
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-8 py-3.5 rounded-xl transition shadow-lg shadow-blue-500/20 text-center"
          >
            Canlı Demoyu İncele (Antiochia)
          </a>
          <a 
            href="/admin" 
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 font-semibold text-sm px-8 py-3.5 rounded-xl transition text-center"
          >
            Kendi Menünü Yönet
          </a>
        </div>

        {/* Özellikler Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 text-left">
          
          <div className="bg-[#0B0F19] border border-slate-950 p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 font-bold text-lg">
              📱
            </div>
            <h3 className="text-sm font-bold text-white">Saniyeler İçinde QR</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Her dükkan için özel üretilen dinamik QR kod sayesinde müşterileriniz menüye anında ulaşır.
            </p>
          </div>

          <div className="bg-[#0B0F19] border border-slate-950 p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 font-bold text-lg">
              ⚡
            </div>
            <h3 className="text-sm font-bold text-white">Kolay Yönetim</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Şifreli yönetim panelinden anında yeni ürün ekleyin, fiyatları güncelleyin ve tükenen ürünleri gizleyin.
            </p>
          </div>

          <div className="bg-[#0B0F19] border border-slate-950 p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 font-bold text-lg">
              🎨
            </div>
            <h3 className="text-sm font-bold text-white">Premium Tasarımlar</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Mavi Neon veya Turuncu Amber temalarımızla dükkanınızın havasına en uygun menü şemasını seçin.
            </p>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 mt-20">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Gelir Cebinde QR Menü Portalı. Tüm hakları saklıdır.</p>
          <div className="flex gap-4">
            <a href="/admin" className="hover:text-slate-300 transition">Yönetici Girişi</a>
          </div>
        </div>
      </footer>

    </div>
  );
}