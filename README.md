# Synapse: Global AI Research Monitor

Synapse is a real-time intelligence platform designed to aggregate, analyze, and visualize the global stream of Artificial Intelligence research. It serves as a central nervous system for monitoring AI advancements, providing deep semantic analysis and "future-proof" insights.

> **Note:** This application simulates a futuristic environment (set in late 2025) to demonstrate advanced monitoring capabilities.

## 🌟 Features

*   **Dashboard:** A high-level command center displaying real-time ingestion metrics, trending research vectors, and eco-efficiency scores.
*   **Global Research Feed:** An aggregated, real-time feed of research papers from major sources (ArXiv, Hugging Face, Semantic Scholar - simulated).
*   **Research Radar:** A visual interface for tracking emerging trends and their velocity.
*   **Synapse Memory (Knowledge Base):** A neural archive that allows users to chat with the knowledge base, generate source guides, and create audio overviews (podcasts) of research topics.
*   **Deep Analysis Engine:** Leverages Google Gemini 1.5 Pro to generate comprehensive, multi-faceted reports on complex research questions.
*   **Agent Command Center:** A dedicated interface for managing autonomous agents like 'Vanguard' (Policy) and 'Field Ops' (Marketplace Search).

## 🛠 Tech Stack

*   **Frontend:** React 19, TypeScript, Vite
*   **Styling:** Tailwind CSS
*   **AI Integration:** Google Gemini API (`@google/genai`), Google GenAI Python SDK
*   **State/Storage:** IndexedDB (`idb`), React Hooks
*   **Visualization:** Recharts
*   **Testing:** Vitest, Playwright

## 🚀 Getting Started

### Prerequisites

*   Node.js (v18 or higher)
*   A Google Gemini API Key (get one from [Google AI Studio](https://aistudio.google.com/))

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd project-synapse
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment:**
    Create a `.env.local` file in the root directory (you can copy `.env.template`):
    ```bash
    cp .env.template .env.local
    ```
    Open `.env.local` and add your API key:
    ```env
    GOOGLE_API_KEY=your_actual_api_key_here
    ```

### Running the Application

*   **Development Server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) (or the port shown in your terminal).

*   **Production Build & Preview:**
    ```bash
    npm run build
    npm run start
    ```

## 🧪 Scripts

*   `npm run dev`: Starts the Vite development server.
*   `npm run build`: Builds the application for production.
*   `npm run start`: Previews the production build (uses `vite preview`).
*   `npm test`: Runs unit tests using Vitest.
*   `npm run test:agent`: Runs the marketplace agent tests.
*   `python3 antigravity_check.py`: Checks the environment health and dependencies.

## 📂 Project Structure

*   `src/`: Main source code.
    *   `components/`: React UI components (Dashboard, PaperFeed, etc.).
    *   `services/`: Backend logic and AI service integrations (GeminiService).
    *   `utils/`: Helper functions (Impact Calculator, etc.).
*   `verification/`: Playwright scripts for end-to-end verification.
*   `.Jules/`: Agent documentation and learning journals.

## 🤝 Contributing

This project is part of a specialized research initiative. Please follow the standard pull request process for any contributions.

## 📄 License

Proprietary / Internal Use Only.
