# 🚀 Feature Planning — FinanceFlow Finance Tracker

## 📌 Kondisi Saat Ini (v2.0)

Berdasarkan pemahaman terhadap seluruh codebase, berikut fitur yang sudah ada:

| Fitur | Status |
|---|---|
| Login via Google OAuth | ✅ Ada |
| Multi-Account (Cash, Bank, E-Wallet) | ✅ Ada |
| CRUD Transaksi (income/expense) | ✅ Ada |
| Kategori Transaksi | ✅ Ada (16 kategori) |
| Deskripsi Transaksi | ✅ Baru ditambahkan |
| Filter & Pencarian Transaksi | ✅ Ada |
| Dashboard Ringkasan | ✅ Ada |
| Analitik (Pie Chart + Bar Chart) | ✅ Ada |
| Pengaturan Profil | ✅ Ada |

**Gap yang ada:** Aplikasi saat ini bersifat *reaktif* (mencatat yang sudah terjadi), belum *proaktif* (membantu user merencanakan & mengelola keuangan ke depan).

---

## 🗺️ Roadmap Pengembangan

### PHASE 1 — Budget & Goal System (v3.0)
> *Prioritas tinggi — langsung membantu pengguna mengontrol pengeluaran harian/bulanan*

---

#### 🎯 Fitur 1: Budget Per Kategori (Monthly Budget)

**Masalah yang diselesaikan:** User tidak tahu apakah pengeluaran mereka sudah melebihi batas atau belum.

**Cara kerja:**
- User bisa set budget bulanan untuk setiap kategori pengeluaran (misal: Makanan = Rp 1.500.000/bulan)
- Dashboard & halaman transaksi menampilkan progress bar "Sisa budget"
- Ada peringatan visual jika sudah mencapai 80% atau melebihi budget

**Halaman baru:** `/budgets`

**Database schema baru:**
```sql
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  category TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  month TEXT NOT NULL, -- YYYY-MM format
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Komponen baru:**
- `features/budgets/components/BudgetForm.tsx`
- `features/budgets/components/BudgetProgressCard.tsx`
- `features/budgets/queries.ts`
- `app/(dashboard)/budgets/page.tsx`

---

#### 🎯 Fitur 2: Financial Goals (Tabungan & Target)

**Masalah yang diselesaikan:** User tidak punya target keuangan yang terukur (misal: nabung buat beli HP, dana darurat).

**Cara kerja:**
- User membuat goal dengan nama, target nominal, dan deadline
- User bisa "alokasikan" tabungan ke goal tertentu
- Dashboard menampilkan progress tiap goal

**Database schema baru:**
```sql
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  target_amount NUMERIC(12, 2) NOT NULL,
  current_amount NUMERIC(12, 2) DEFAULT 0,
  deadline DATE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Komponen baru:**
- `features/goals/components/GoalCard.tsx`
- `features/goals/components/GoalForm.tsx`
- `app/(dashboard)/goals/page.tsx`

---

### PHASE 2 — Smart Reports & Insights (v3.1)
> *Meningkatkan halaman Analytics menjadi lebih informatif dan actionable*

---

#### 📊 Fitur 3: Laporan Mingguan & Harian

**Masalah yang diselesaikan:** Analitik saat ini hanya menampilkan data bulanan keseluruhan, tidak ada breakdown mingguan.

**Cara kerja:**
- Di halaman Analytics, tambahkan tab/toggle: **Harian | Mingguan | Bulanan | Tahunan**
- Grafik secara otomatis menyesuaikan rentang waktu yang dipilih
- Tampilkan ringkasan: "Minggu ini kamu menghabiskan Rp X, lebih boros X% dari minggu lalu"

**Perubahan di file yang ada:**
- `app/(dashboard)/analytics/page.tsx` — tambah filter period
- `lib/utils.ts` — tambah fungsi `groupByWeek()`, `groupByDay()`

---

#### 📊 Fitur 4: Spending Insights / Financial Health Score

**Masalah yang diselesaikan:** User tidak tahu apakah kondisi keuangan mereka sehat atau tidak.

**Cara kerja:**
- Hitung "Finance Score" berdasarkan rumus sederhana:
  - Savings Rate (tabungan / pemasukan) → idealnya > 20%
  - Budget adherence (apakah melebihi budget?)
  - Konsistensi mencatat
- Tampilkan score berwarna (hijau/kuning/merah) di dashboard

**Perubahan:**
- Komponen baru: `components/FinancialHealthCard.tsx`
- Ditambahkan ke `app/(dashboard)/dashboard/page.tsx`

---

#### 📊 Fitur 5: Export Laporan (PDF / CSV)

**Masalah yang diselesaikan:** User tidak bisa menyimpan atau berbagi data keuangan mereka.

**Cara kerja:**
- Di halaman Transaksi, tambahkan tombol "Export"
- User bisa pilih rentang tanggal
- Ekspor sebagai CSV (mudah dibuka di Excel) atau PDF

**Library yang diperlukan:** `react-csv` atau `jsPDF`

---

### PHASE 3 — Recurring Transactions & Reminders (v3.2)
> *Otomatisasi pencatatan untuk transaksi rutin*

---

#### 🔄 Fitur 6: Transaksi Berulang (Recurring Transactions)

**Masalah yang diselesaikan:** User harus mencatat transaksi rutin (gaji, tagihan listrik, cicilan) setiap bulan secara manual.

**Cara kerja:**
- Saat membuat transaksi, ada opsi "Jadikan berulang" (harian/mingguan/bulanan)
- Sistem otomatis membuat transaksi di tanggal yang ditentukan

**Database schema baru:**
```sql
CREATE TABLE recurring_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  account_id UUID REFERENCES accounts(id),
  amount NUMERIC(12, 2) NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  frequency TEXT NOT NULL, -- 'daily' | 'weekly' | 'monthly'
  next_run_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true
);
```

---

#### 🔔 Fitur 7: Notifikasi & Pengingat

**Masalah yang diselesaikan:** User sering lupa mencatat transaksi atau mendekati batas budget.

**Cara kerja:**
- In-app notification center (bell icon di header)
- Alert saat budget mendekati 80% / melebihi batas
- Pengingat transaksi berulang yang akan jatuh tempo

**Komponen baru:**
- `components/NotificationCenter.tsx`
- `features/notifications/` feature directory

---

## 📋 Prioritas Implementasi yang Direkomendasikan

```
[SEKARANG]          Budget Per Kategori        → Dampak tinggi, relatif mudah
[BULAN INI]         Laporan Mingguan/Harian    → Upgrade analitik yang ada
[BULAN DEPAN]       Financial Goals            → Motivasi user jangka panjang
[KUARTAL INI]       Spending Insights Score    → Fitur premium/differentiator
[KUARTAL DEPAN]     Export CSV/PDF             → Kegunaan praktis
[JANGKA PANJANG]    Recurring Transactions     → Butuh cron job / Supabase Edge Functions
[JANGKA PANJANG]    Notifikasi                 → Butuh Web Push / email integration
```

---

## 💡 Fitur Bonus (Ide Tambahan)

| Fitur | Deskripsi | Kompleksitas |
|---|---|---|
| **Dark/Light Mode Toggle** | Tambah toggle di settings | Rendah |
| **Multi-currency** | Mendukung USD, SGD, dll | Sedang |
| **Split Bill** | Catat hutang/piutang ke teman | Tinggi |
| **Import dari CSV** | Upload data dari bank statement | Sedang |
| **Verifikasi Email** | Tambah opsi login email+password | Rendah |

---

> [!TIP]
> **Rekomendasi utama:** Mulai dari **Budget Per Kategori (Fitur 1)** karena ini adalah fitur yang paling langsung terasa manfaatnya bagi pengguna — setiap hari mereka bisa tahu sisa budget mereka berapa. Infrastruktur yang dibutuhkan (database Supabase, form, komponen) sudah ada dan tinggal dikembangkan.
