# FinanceFlow AI 🚀

[![Next.js](https://img.shields.io/badge/Next.js-16.2.3-black?logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?logo=supabase)](https://supabase.com/)
[![Gemini](https://img.shields.io/badge/AI-Gemini_2.5_Flash-4285F4?logo=google-gemini)](https://deepmind.google/technologies/gemini/)
[![Tailwind CSS](https://img.shields.io/badge/CSS-Tailwind_4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

**FinanceFlow AI** adalah sistem manajemen keuangan pribadi kelas profesional yang dirancang untuk mengubah data transaksi mentah menjadi kecerdasan finansial yang dapat ditindaklanjuti. Dibangun dengan teknologi mutakhir, aplikasi ini melampaui pelacakan konvensional dengan memanfaatkan *Generative AI* untuk memberikan pelatihan keuangan yang kontekstual.

---

## 💎 Masalah & Solusi

Pelacak keuangan tradisional seringkali gagal karena membutuhkan terlalu banyak upaya manual dan memberikan nilai balik yang sedikit. Entri data hanyalah sekumpulan angka kecuali jika dianalisis dengan mendalam.

**FinanceFlow AI** menjawab tantangan ini dengan:
- **Mengurangi Beban Kognitif**: Otomatisasi analisis kebiasaan belanja.
- **Kecerdasan Kontekstual**: Menggunakan LLM untuk menjelaskan *mengapa* saldo Anda menurun.
- **Desain Berpusat pada Tujuan**: Mengalihkan fokus dari sekadar "pengeluaran" ke "tabungan" melalui pelacakan target dan penegakan anggaran.

---

## 🚀 Fitur Unggulan

### 🤖 Asisten Keuangan AI (Bertenaga Gemini)
- **Kesadaran Kontekstual**: Tidak seperti chatbot generik, "Asisten Keuangan" disuntikkan dengan wawasan finansial real-time Anda (puncak pengeluaran, anggaran yang terlampaui, dan tren menabung).
- **Analisis Proaktif**: Mengidentifikasi "kebocoran" kategori dan menyarankan langkah konkret untuk berhemat.
- **Kueri Bahasa Alami**: Tanya "Kemana perginya uang saya minggu ini?" atau "Apakah saya mampu membeli laptop baru?"

### 📊 Analitik Visual Tingkat Lanjut
- **Dashboard Dinamis**: Visualisasi real-time Pendapatan vs Pengeluaran menggunakan Recharts.
- **Pendalaman Kategori**: *Heatmaps* dan bagan distribusi untuk mengidentifikasi area pengeluaran berdampak tinggi.
- **Perbandingan Historis**: Pelacakan kinerja bulan-ke-bulan untuk mengukur pertumbuhan finansial.

### 🎯 Manajemen Target & Anggaran
- **Target Tabungan**: Pantau progres menuju target spesifik dengan bar progres yang peka terhadap tenggat waktu.
- **Pembatas Anggaran**: Tetapkan batas khusus kategori. Sistem akan memicu wawasan "bahaya" saat anggaran terlampaui.
- **Wawasan Otomatis**: Mesin khusus yang mengidentifikasi "Kemenangan Kecil" (misalnya: beruntun hari hemat).

### 📄 Pelaporan Profesional
- **Generasi PDF Otomatis**: Buat laporan keuangan komprehensif termasuk bagan visual pengeluaran kategori dan log transaksi terperinci.
- **Siap Audit**: Ringkasan terstruktur dari saldo bersih, total pemasukan, dan total pengeluaran.

---

## 🛠 Arsitektur Teknis

Sistem ini dibangun dengan **Arsitektur Berbasis Fitur Modular**, memastikan pemeliharaan dan skalabilitas yang tinggi.

- **Frontend**: Next.js 16 (App Router) dengan React 19, memanfaatkan *Server Components* untuk performa dan *Client Components* untuk interaktivitas.
- **Backend-as-a-Service**: Supabase menangani Autentikasi, database PostgreSQL, dan *Row-Level Security* (RLS).
- **Layer AI**: Integrasi dengan Google Gemini 2.5 Flash melalui *Server Actions* untuk inferensi yang aman dan rendah latensi.
- **Middleware/Proxy**: Implementasi `proxy.ts` kustom untuk manajemen sesi yang kuat dan sinkronisasi cookie antara Next.js dan Supabase.
- **Styling**: Tailwind CSS v4 untuk sistem desain modern berkinerja tinggi dengan efek *glassmorphism*.

---

## 🔒 Pertimbangan Keamanan

- **Row-Level Security (RLS)**: Perlindungan tingkat database memastikan pengguna benar-benar hanya dapat mengakses data mereka sendiri.
- **Autentikasi Sisi Server**: Semua rute yang dilindungi dijaga melalui `proxy.ts` di edge, mencegah akses tidak sah bahkan sebelum halaman dirender.
- **Isolasi Lingkungan**: Kunci sensitif (Gemini API, Supabase Secrets) tidak pernah diekspos ke sisi klien.

---

## ⚙️ Persiapan & Instalasi

### Prasyarat
- Node.js 20+
- Proyek Supabase
- Google AI (Gemini) API Key

### Instalasi
1. Clone repositori ini.
2. Instal dependensi:
   ```bash
   npm install
   ```
3. Konfigurasi variabel lingkungan di `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=url_supabase_anda
   NEXT_PUBLIC_SUPABASE_ANON_KEY=anon_key_supabase_anda
   GOOGLE_GEMINI_API_KEY=kunci_gemini_anda
   ```
4. Jalankan server pengembangan:
   ```bash
   npm run dev
   ```

---

## 🚀 Rencana Masa Depan
- **OCR Struk**: Pindai dan kategorikan transaksi secara otomatis menggunakan AI Vision.
- **Integrasi API Bank**: Sinkronisasi langsung dengan institusi keuangan.
- **Analisis Prediktif**: Prakiraan saldo akhir bulan berbasis AI berdasarkan kecepatan belanja saat ini.
- **Dukungan Multi-Mata Uang**: Konversi nilai tukar real-time untuk pengguna internasional.
