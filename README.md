# US Stock Screener

AI-powered US stock screening web application with real-time data, technical indicators, and intelligent recommendations.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Prisma](https://img.shields.io/badge/Prisma-5.22-2d3748)

## ✨ Features

### Stock Screener
- Filter by sector, market cap, P/E ratio
- Pagination with 20 stocks per page
- Sort by symbol, name, price, change, market cap, P/E
- Real-time price data from Finnhub

### Stock Detail Page
- Interactive price charts (1D, 1W, 1M, 3M, 6M, 1Y)
- Technical indicators: RSI(14), EMA(20,50,200), MACD
- Fundamental data: P/E, EPS, Revenue, Profit Margin, ROE
- Latest news fromFinnhub
- AI-powered stock recommendations

### AI Recommendations (Mistral)
- BUY / SELL / HOLD recommendations
- 0-100 confidence score
- Technical, Fundamental, Sentiment analysis
- 24-hour cache (cost optimization)
- Batch generation via CRON job

## 🛠️ Tech Stack

| Component | Technology |
|----------|-----------|
| Frontend | Next.js 16 (App Router) |
| Styling | TailwindCSS |
| UI Components | Shadcn/UI (Radix) |
| Charts | Recharts |
| Backend | Next.js API Routes |
| Database | PostgreSQL (Neon) |
| ORM | Prisma 5 |
| Market Data | Finnhub API |
| AI | Mistral AI |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon)
- Finnhub API key
- Mistral AI API key

### Installation

```bash
# Clone repository
git clone <repo-url>
cd us-stock-screener

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your API keys
```

### Environment Variables

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:pass@host.neon.tech/dbname?sslmode=require"

# Finnhub (https://finnhub.io)
FINNHUB_API_KEY="your_finnhub_api_key"
FINNHUB_WEBHOOK_SECRET="your_webhook_secret"

# Mistral AI (https://mistral.ai)
MISTRAL_API_KEY="your_mistral_api_key"
```

### Database Setup

```bash
# Create tables
npm run db:push

# Seed top 100 stocks
npm run db:seed
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📡 API Endpoints

| Endpoint | Method | Description |
|---------|--------|-----------|
| `/api/stocks` | GET | Stock screener with filters |
| `/api/stocks/[ticker]` | GET | Stock detail (price, fundamentals) |
| `/api/stocks/[ticker]/recommendation` | GET | AI recommendation (cached 24h) |
| `/api/news` | GET | Latest news |
| `/api/cron/recommendations` | POST | Batch AI generation |

### Query Parameters

#### `/api/stocks`
```
?page=1                    # Page number
?limit=20                 # Items per page
?search=AAPL              # Search symbol/name
?sector=Technology       # Filter by sector
?sortBy=marketCap        # Sort field
?sortOrder=desc         # asc | desc
```

## 🤖 AI Recommendation System

### How It Works

1. Check database for cached recommendation
2. If exists AND < 24h old → return cached
3. Else → fetch fresh data → generate AI → save to DB → return

### Cost Optimization

- AI generated only once per stock per day
- 24-hour cache in PostgreSQL
- CRON job pre-generates top 100 stocks daily

### AI Prompt Structure

```
Analyze the following stock:

Ticker: AAPL
Price Data: $185.50 (+2.30, +1.25%)
Technical Indicators:
- RSI: 65.42
- EMA20: 182.50
- EMA50: 178.20
- MACD: 2.35

Fundamental Data:
- P/E Ratio: 28.5
- EPS: $6.50
- Revenue Growth: 5.2%
- Market Cap: $2.8T

Latest News:
- Apple announces new AI features
- Strong Q4 earnings

Return JSON:
{
  "recommendation": "BUY | SELL | HOLD",
  "confidence": 0-100,
  "technical_analysis": "...",
  "fundamental_analysis": "...",
  "sentiment_analysis": "...",
  "summary": "..."
}
```

## 📊 Technical Indicators

Calculated locally from price data:

- **RSI (14)**: Relative Strength Index
- **EMA(20, 50, 200)**: Exponential Moving Averages
- **MACD**: Moving Average Convergence Divergence
- **SMA(20, 50, 200)**: Simple Moving Averages

## 🗄️ Database Schema

### Tables

| Table | Description |
|-------|-----------|
| `Stock` | 100 top US stocks |
| `StockPrice` | Historical OHLCV data |
| `Recommendation` | AI recommendations (24h cache) |
| `NewsArticle` | Cached news |
| `CacheEntry` | Generic cache (replaces Redis) |

### Indexes

```prisma
@@index([ticker, createdAt])    // Recommendation - fast cache lookup
@@index([symbol, date])    // StockPrice
@@index([sector])        // Stock
@@index([marketCap])    // Stock
```

## 📁 Project Structure

```
us-stock-screener/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── page.tsx       # Homepage
│   │   ├── layout.tsx     # Root layout
│   │   ├── stock/[ticker]/
│   │   │   └── page.tsx # Stock detail
│   │   └── api/
│   │       ├── stocks/   # Screener API
│   │       ├── stocks/[ticker]/
│   │       ├── stocks/[ticker]/recommendation/
│   │       ├── news/    # News API
│   │       └── cron/recommendations/
│   ├── components/
│   │   ├── stock-table.tsx
│   │   ├── price-chart.tsx
│   │   ├── technical-panel.tsx
│   │   ├── fundamental-panel.tsx
│   │   ├── ai-recommendation.tsx
│   │   ├── news-feed.tsx
│   │   └── ui/         # Shadcn/UI
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── finnhub.ts
│   │   ├── mistral.ts
│   │   ├── indicators.ts
│   │   ├── cache.ts
│   │   ├── constants.ts
│   │   └── utils.ts
│   └── types/
│       └── index.ts
├── scripts/
│   └── seed-stocks.ts
├── vercel.json
└── .env.example
```

## 🌍 Deployment (Vercel)

### 1. Connect to Vercel

```bash
npm i -g vercel
vercel link
```

### 2. Add Environment Variables

In Vercel Dashboard → Settings → Environment Variables:
- `DATABASE_URL`
- `FINNHUB_API_KEY`
- `MISTRAL_API_KEY`

### 3. Deploy

```bash
vercel deploy --prod
```

### 4. CRON Job Setup

Vercel automatically runs CRON based on `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/recommendations",
      "schedule": "0 21 * * 1-5"
    }
  ]
}
```

Runs daily at 9 PM EST (after market close) Mon-Fri to pre-generate AI recommendations.

## 📝 Scripts

| Script | Description |
|--------|-----------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run db:push` | Create/update tables |
| `npm run db:seed` | Seed 100 top stocks |
| `npm run lint` | Run ESLint |

## 🔑 API Keys

### Finnhub
- Free tier: 60 calls/minute
- Get key: https://finnhub.io/

### Mistral AI
- Free trial available
- Get key: https://console.mistral.ai/

### Neon PostgreSQL
- Free tier: 0.5GB storage
- Get started: https://neon.tech/

## 📄 License

MIT License - feel free to use for your projects.

## 🙏 Acknowledgments

- [Finnhub](https://finnhub.io/) - Stock market data
- [Mistral AI](https://mistral.ai/) - AI recommendations
- [Neon](https://neon.tech/) - Serverless PostgreSQL
- [Vercel](https://vercel.com/) - Deployment platform