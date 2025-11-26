# Lumina - AI-Powered Data Insights

Transform your spreadsheets into actionable insights with AI-powered analysis, automatic chart generation, and professional PowerPoint exports.

## 🚀 Features

- **Smart Upload** - Drag & drop Excel/CSV files with instant parsing
- **AI Analysis** - Automatic column profiling, data quality scoring, and dataset classification
- **Auto Charts** - Intelligent chart generation based on data patterns
- **AI Chat** - Ask questions about your data and generate custom charts
- **PowerPoint Export** - One-click download of professional presentations
- **Mobile Optimized** - Full-screen chat modal and responsive design

## 📋 Prerequisites

- Node.js 20.x or higher
- npm or yarn
- OpenAI API key (for AI features)
- Supabase account (optional, for data persistence)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-data-insights
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` with your actual values.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## ⚙️ Environment Variables

See `.env.example` for all required environment variables. Key variables:

- `OPENAI_API_KEY` - Required for AI chat and analysis
- `NEXT_PUBLIC_SUPABASE_URL` - Optional, for data persistence
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Optional, for data persistence
- `GOOGLE_SHEETS_ID` - Optional, for Google Sheets storage
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` - Optional, for Google Sheets
- `GOOGLE_PRIVATE_KEY` - Optional, for Google Sheets

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run typecheck` - Run TypeScript type checking

## 🏗️ Project Structure

```
ai-data-insights/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── api/          # API routes
│   │   ├── dashboard/     # Dashboard pages
│   │   └── page.tsx      # Landing page
│   ├── components/       # React components
│   │   ├── features/     # Feature components
│   │   ├── layouts/      # Layout components
│   │   └── ui/           # UI primitives
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility libraries
│   │   ├── ai/           # AI integration
│   │   ├── analyzers/    # Data analysis
│   │   ├── charts/       # Chart generation
│   │   └── parsers/      # File parsing
│   ├── stores/           # Zustand state management
│   ├── types/            # TypeScript types
│   └── utils/            # Utility functions
├── supabase/             # Supabase migrations
└── public/               # Static assets
```

## 🔧 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand + React Query
- **Charts:** Recharts
- **File Parsing:** xlsx, papaparse
- **AI:** OpenAI API
- **Export:** pptxgenjs

## 📊 Data Limits

- **Max Rows for Analysis:** 100,000
- **Max Columns:** 100
- **File Size Limit:** 20MB
- **Warning Threshold:** 50,000 rows (logs warning, continues)

## 🧪 Development

### Code Quality

- **TypeScript:** Strict mode enabled
- **ESLint:** Next.js + TypeScript rules
- **Prettier:** Automatic code formatting
- **Pre-commit:** Lint and format before commit (optional)

### Best Practices

- Use TypeScript for all new files
- Follow the existing folder structure
- Write self-documenting code
- Keep components small and focused
- Use custom hooks for reusable logic

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

The project is configured for Vercel with:
- Automatic deployments on push
- Environment variable management
- Edge runtime support

### Other Platforms

The app can be deployed to any platform supporting Next.js:
- Netlify
- AWS Amplify
- Railway
- Self-hosted (Docker)

## 📝 License

This project is private and proprietary.

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run `npm run lint` and `npm run typecheck`
4. Commit with clear messages
5. Push and create a pull request

## 📞 Support

For issues or questions, please open an issue in the repository.

---

Built with ❤️ using Next.js and AI

