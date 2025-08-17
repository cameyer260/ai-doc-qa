📄 DocuQuery

AI-powered document Q&A app where users upload files and instantly query their contents using vector search.




🚀 Features

📂 Upload documents (PDF, TXT, etc.) through a simple UI.

🤖 Query with AI — ask natural language questions about your documents.

📊 Vector Search with Pinecone for fast, semantic retrieval.

⚡ Rate-limiting with Upstash Redis to prevent abuse.

🔒 Per-user document storage to keep data isolated.

🌐 Deployed on Vercel with serverless API routes.

🛠 Tech Stack

Framework: Next.js 15

AI/LLM: OpenAI API

Vector Database: Pinecone

Database / Ratelimiting: Upstash Redis

Deployment: Vercel

⚙️ Setup
1. Clone the repo
git clone https://github.com/cameyer260/ai-doc-qa.git
cd ai-doc-qa

2. Install dependencies
npm install

3. Configure environment variables

Create a .env.local file in the root with the following:

OPENAI_API_KEY=your_openai_key
PINECONE_API_KEY=your_pinecone_key
PINECONE_ENVIRONMENT=your_pinecone_env
PINECONE_INDEX=your_pinecone_index
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

4. Run the dev server
npm run dev


Now open http://localhost:3000.

📦 Deployment

This app is designed for Vercel.

Push your repo to GitHub.

Connect it on Vercel.

Add all environment variables under Project Settings → Environment Variables.

🔮 Roadmap

 Support for more file types (Word, Excel, Markdown).

 Authentication (user accounts).

 Multi-document querying.

 Better document previews and summaries.

🤝 Contributing

PRs and issues are welcome! Please open a discussion if you have an idea for a major feature.

📜 License

MIT License © 2025 Christopher Meyer

👉 Live Demo: docuquery.online
