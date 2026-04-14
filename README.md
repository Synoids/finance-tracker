````markdown
# Finance Tracker

Finance Tracker adalah aplikasi web sederhana untuk membantu pengguna mencatat dan memantau kondisi keuangan pribadi. Aplikasi ini memungkinkan pengguna mencatat pemasukan dan pengeluaran sehingga dapat melihat ringkasan keuangan dengan lebih mudah.

Project ini dibuat sebagai latihan pengembangan aplikasi web menggunakan **Next.js** dan **Supabase**, serta sebagai bagian dari portfolio pengembangan web.

---

## Features

- Login menggunakan **Google Account (OAuth)**
- Menambahkan data **pemasukan**
- Menambahkan data **pengeluaran**
- Melihat daftar transaksi
- Menghapus transaksi
- Dashboard ringkasan keuangan
- Autentikasi pengguna menggunakan **Supabase Auth**
- Penyimpanan data menggunakan **Supabase Database**

---

## Tech Stack

Project ini dibangun menggunakan teknologi berikut:

- **Next.js** – React framework untuk membangun aplikasi web modern
- **Supabase** – Backend as a Service untuk authentication dan database
- **Google OAuth** – Sistem login menggunakan akun Google
- **Tailwind CSS** – Styling dan desain antarmuka
- **Vercel** – Platform deployment untuk aplikasi web

---

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/username/finance-tracker.git
````

Masuk ke folder project:

```bash
cd finance-tracker
```

---

### 2. Install Dependencies

```bash
npm install
```

atau

```bash
yarn install
```

---

### 3. Setup Environment Variables

Buat file `.env.local` di root project, lalu isi dengan konfigurasi Supabase berikut:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Nilai tersebut bisa ditemukan di:

Supabase Dashboard → **Project Settings → API**

---

### 4. Run the Project

```bash
npm run dev
```

Aplikasi akan berjalan di:

```
http://localhost:3000
```

---

## Project Structure

```
finance-tracker
│
├── app
│   ├── login
│   ├── dashboard
│   └── api
│
├── components
│
├── lib
│   └── supabaseClient.js
│
├── styles
│
└── README.md
```

---

## Authentication

Aplikasi ini menggunakan **Supabase Authentication** dengan metode login:

* **Google OAuth**

Saat pengguna login menggunakan Google, Supabase akan otomatis membuat akun pengguna dan menyimpan data user yang diperlukan.

---

## Deployment

Project ini dapat dengan mudah di-deploy menggunakan **Vercel**.

Langkah umum deployment:

1. Push project ke GitHub
2. Import repository ke Vercel
3. Tambahkan environment variables Supabase
4. Deploy aplikasi

---

## Purpose

Project ini dibuat untuk:

* Melatih penggunaan **Next.js**
* Memahami **authentication menggunakan Supabase**
* Mengimplementasikan **OAuth login**
* Membuat aplikasi web sederhana untuk manajemen keuangan

---

## Author

**Eriel Budiman**
Information Systems Student
UIN Raden Fatah Palembang

```
```
