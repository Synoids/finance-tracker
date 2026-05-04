# AI System Documentation: FinanceFlow Assistant 🤖

This document outlines the technical implementation, data flow, and agentic behaviors of the AI systems within FinanceFlow.

---

## 🧩 AI Architecture Overview

FinanceFlow utilizes a **Retrieval-Augmented Generation (RAG)** lite architecture. Instead of generic LLM interactions, the system bridges the gap between raw financial data (PostgreSQL) and natural language understanding (Gemini LLM).

### Core Components
1.  **Engine**: Google Gemini 2.5 Flash.
2.  **Context Provider**: `getFinancialInsights` service (analyzes trends, anomalies, and goals).
3.  **Interface**: `AIChatWidget` (React client) connected via `sendChatMessage` (Next.js Server Action).

---

## 📡 Data Flow & Processing

The system follows a strict linear flow to ensure data privacy and contextual accuracy:

1.  **Trigger**: User sends a query via the Chat Widget.
2.  **Context Retrieval**: The system executes `getFinancialInsights()`, which queries Supabase for:
    *   Transactions (Current month vs. Previous month same-day comparison).
    *   Category-wise spending distribution.
    *   Active Budgets and current consumption.
    *   Daily spending behavior (Frugal Day streaks).
3.  **Prompt Construction**: Raw data is distilled into high-level "Insights" (e.g., *"Spent 10% more in 'Dining' compared to last month"*) and injected into a structured system prompt.
4.  **Inference**: Gemini processes the prompt + context + user query.
5.  **Streaming/Response**: The response is returned via a Server Action, ensuring the Gemini API Key remains secure on the server.

---

## 🧠 Agentic Behaviors

While the system is primarily a chat interface, it exhibits several "agent-like" behaviors derived from its implementation logic:

### 1. Contextual Self-Awareness
The system prompt instructs the AI to be aware of its own data limitations. For example, if a user has a "100% decrease in spending," the AI is programmed to recognize this might be a new account rather than a miraculous saving feat, adjusting its persona from "congratulatory" to "encouraging."

### 2. Persona-Driven Coaching
The assistant maintains a consistent persona: **"Finance Assistant"**—an intelligent, friendly, and professional financial coach. It is instructed to steer conversations back to finance if the user deviates, acting as a focused utility agent.

### 3. Proactive Anomaly Detection
Through the insight engine, the system "proposes" issues to the LLM context that the user might not have noticed yet, such as budget leaks in specific categories or deviations from past spending velocity.

---

## 🛠 Prompt Engineering Strategy

The system prompt utilizes several advanced techniques:
- **Role Prompting**: Defining the "Finance Assistant" persona.
- **Few-Shot Grounding**: Providing real-time financial facts as the "source of truth."
- **Output Constraints**: Enforcing Markdown formatting for readability and strictly Indonesian language responses.
- **Safety Rails**: Explicit instructions to avoid non-financial topics and to handle empty data states gracefully.

---

## ⚠️ Limitations & Future Improvements

### Current Limitations
- **Stateless Chat**: The current implementation does not persist chat history across sessions (no long-term memory).
- **Unidirectional**: The agent can analyze data but cannot currently perform actions (e.g., "Add a transaction for 50k for lunch").
- **Limited Context Window**: Only the top 4 most relevant insights are passed to the LLM to optimize latency and token usage.

### Realistic Improvements
- **Tool-Calling (Agentic Actions)**: Implementing Gemini Function Calling to allow the agent to create transactions, set budgets, or generate PDF reports directly from chat.
- **Vector Embeddings**: Indexing personal financial tips or past transaction descriptions for more granular semantic search.
- **Multimodal Support**: Allowing users to upload photos of receipts for the agent to parse and categorize.
