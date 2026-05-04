# FinanceFlow AI 🚀

[![Next.js](https://img.shields.io/badge/Next.js-16.2.3-black?logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?logo=supabase)](https://supabase.com/)
[![Gemini](https://img.shields.io/badge/AI-Gemini_2.5_Flash-4285F4?logo=google-gemini)](https://deepmind.google/technologies/gemini/)
[![Tailwind CSS](https://img.shields.io/badge/CSS-Tailwind_4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

**FinanceFlow AI** is a professional-grade personal finance management system designed to transform raw transaction data into actionable intelligence. Built with a cutting-edge tech stack, it moves beyond simple tracking by leveraging Generative AI to provide contextual financial coaching.

---

## 💎 The Problem & Solution

Traditional finance trackers often fail because they require too much manual effort and offer too little value in return. Data entries are just numbers unless they are analyzed.

**FinanceFlow AI** addresses this by:
- **Reducing Cognitive Load**: Automating the analysis of spending habits.
- **Contextual Intelligence**: Using LLMs to explain *why* your balance is dropping.
- **Goal-Centric Design**: Shifting focus from "spending" to "saving" through dedicated goal tracking and budget enforcement.

---

## 🚀 Impactful Features

### 🤖 AI Financial Assistant (Gemini-Powered)
- **Contextual Awareness**: Unlike generic chatbots, the "Finance Assistant" is injected with your real-time financial insights (spending peaks, budget overruns, and saving streaks).
- **Proactive Analysis**: Identifies category "leaks" and suggests concrete steps to save.
- **Natural Language Querying**: Ask "Where did my money go this week?" or "Can I afford a new laptop?"

### 📊 Advanced Visual Analytics
- **Dynamic Dashboards**: Real-time visualization of Income vs. Expenses using Recharts.
- **Category Deep-Dives**: Heatmaps and distribution charts to identify high-impact spending areas.
- **Historical Comparison**: Month-over-month performance tracking to measure financial growth.

### 🎯 Goal & Budget Management
- **Savings Goals**: Track progress towards specific targets with deadline-aware progress bars.
- **Budget Guardrails**: Set category-specific limits. The system triggers "danger" insights when budgets are breached.
- **Automated Insights**: A dedicated engine that identifies "Small Wins" (e.g., Frugal Day streaks).

### 📄 Professional Reporting
- **Automated PDF Generation**: Generate comprehensive financial reports including visual bar charts of category spending and detailed transaction logs.
- **Audit-Ready**: Structured summaries of net balance, total inflow, and total outflow.

---

## 🛠 Technical Architecture

The system is built on a **Modular Feature-Based Architecture**, ensuring high maintainability and scalability.

- **Frontend**: Next.js 16 (App Router) with React 19, utilizing Server Components for performance and Client Components for interactivity.
- **Backend-as-a-Service**: Supabase handles Authentication, PostgreSQL database, and Row-Level Security (RLS).
- **AI Layer**: Integration with Google Gemini 2.5 Flash via Server Actions for secure, low-latency inferencing.
- **Middleware/Proxy**: A custom `proxy.ts` implementation for robust session management and cookie syncing between Next.js and Supabase.
- **Styling**: Tailwind CSS v4 for a modern, high-performance design system with glassmorphism effects.

---

## 🔒 Security Considerations

- **Row-Level Security (RLS)**: Database-level protection ensures users can strictly only access their own data.
- **Server-Side Authentication**: All protected routes are guarded via `proxy.ts` at the edge, preventing unauthorized access before the page even renders.
- **Environment Isolation**: Sensitive keys (Gemini API, Supabase Secrets) are never exposed to the client-side.

---

## ⚙️ Setup & Deployment

### Prerequisites
- Node.js 20+
- Supabase Project
- Google AI (Gemini) API Key

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GOOGLE_GEMINI_API_KEY=your_gemini_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

---

## 🚀 Future Roadmap
- **Receipt OCR**: Automatically scan and categorize transactions using AI Vision.
- **Bank API Integration**: Live sync with financial institutions (Plaid/Salt Edge).
- **Predictive Analytics**: AI-driven forecasting of end-of-month balances based on current velocity.
- **Multi-Currency Support**: Real-time exchange rate conversions for international users.
