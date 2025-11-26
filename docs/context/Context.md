# AI Data Insights Platform - Build Context

**Last Updated:** 2025-01-15  
**Status:** MVP Complete → Adding Google Sheets Persistence

---

## 🎯 Project Overview

**AI Data Insights Platform** - A Next.js 14 web application that transforms Excel/CSV spreadsheets into professional data presentations with AI-powered analysis, interactive charts, and export capabilities.

**Core Value Proposition:** Upload a spreadsheet → Get instant AI analysis → View interactive charts → Export to PowerPoint/PDF

---

## 🏗️ Architecture Decisions

### Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **PowerPoint:** pptxgenjs
- **PDF:** @react-pdf/renderer
- **AI:** OpenAI API (GPT-4)
- **Storage:** Google Sheets (MVP) → Supabase (Future)
- **Deployment:** Vercel

### Why Google Sheets for Storage?
- ✅ **Free** - No database costs
- ✅ **Easy to view/edit** - Open the sheet, see all data
- ✅ **Simple debugging** - All data in one place
- ✅ **Fast setup** - Works immediately
- ✅ **MCP Ready** - Use existing Google Sheets MCP server

**Future Migration Path:** Can easily move to Supabase when needed (schema already designed)

---

## 📁 Current Application Structure

### User Flow
```
Landing Page (/)
  ↓
Upload Modal → File Parsing (client-side)
  ↓
/api/analyze → Full Analysis Pipeline
  ↓
Save to Google Sheets + sessionStorage (cache)
  ↓
Dashboard (/dashboard/[id]) → Display Results
  ↓
Export Options (PowerPoint/PDF)
```

### Key Pages
- **`/`** - Landing page with upload modal
- **`/dashboard/[id]`** - Main dashboard (PRIMARY destination after analysis)
- **`/results/[id]`** - Deprecated (redirects to dashboard for backward compatibility)
- **`/dashboard`** - "My Datasets" list page (TODO: Build with Google Sheets)

### API Endpoints

#### Core Analysis
- **`POST /api/analyze`** - Single consolidated endpoint
  - Input: `{ headers, rows, datasetName }`
  - Output: `{ columnStats, charts, healthScore, datasetType, rowCount, columnCount }`
  - Performs: Column profiling, classification, chart generation, health scoring
  - Performance: Handles up to 100K rows, samples large datasets

#### Storage (Google Sheets)
- **`POST /api/storage/save`** - Save analysis to Google Sheets
- **`GET /api/storage/load?id=...`** - Load analysis from Google Sheets
- **`GET /api/storage/list`** - List all user analyses

#### Export
- **`POST /api/reports/pptx`** - Generate PowerPoint (.pptx)
- **`POST /api/reports/export`** - Generate PDF

#### Chat
- **`POST /api/chat`** - Natural language queries about data

---

## 🗄️ Data Storage Strategy

### Current State (sessionStorage)
- **Location:** Browser `sessionStorage`
- **Key Format:** `analysis-${datasetId}`
- **Data Structure:**
```typescript
{
  datasetName: string;
  headers: string[];
  rows: Record<string, unknown>[];
  healthScore: HealthScoreResult | null;
  charts: ChartConfig[];
  insights: Insight[];
  datasetType: string | null;
  rowCount: number;
  columnCount: number;
  columnStats: EnhancedColumnStats[];
  analysisTime: string;
}
```

### Target State (Google Sheets)

#### Sheet Structure: "Analyses" Tab
| Column | Field | Type | Notes |
|--------|-------|------|-------|
| A | ID | string | `dataset-${timestamp}` |
| B | Dataset Name | string | Original filename |
| C | Health Score | number | 0-100 |
| D | Row Count | number | Total rows |
| E | Column Count | number | Total columns |
| F | Dataset Type | string | finance, sales, etc. |
| G | Created At | timestamp | ISO format |
| H | Charts JSON | JSON | Array of chart configs |
| I | Column Stats JSON | JSON | Array of column metadata |
| J | Full Data JSON | JSON | Complete analysis data |

#### Implementation Pattern
1. **Save:** After analysis completes → Write to Google Sheets via `/api/storage/save`
2. **Load:** Dashboard reads from Google Sheets (with sessionStorage cache fallback)
3. **List:** "My Datasets" page queries Google Sheets for all analyses
4. **Update:** When charts are added via chat → Update Google Sheets row

---

## 🧩 Component Architecture

### Feature Components (`src/components/features/`)
- **`StatusBanner`** - Top banner with analysis status + export buttons
- **`AISummaryCard`** - Categorizes health score recommendations (Good/Attention/Opportunities)
- **`KeyMetricsStrip`** - Auto-detects numeric columns, shows sparklines
- **`ChartGrid`** - Displays auto-generated charts (up to 5)
- **`ChatInterface`** - Natural language chat with data (can generate charts)
- **`DatasetDetailsCard`** - File info, stats, health score
- **`ChartCompareCard`** - Placeholder for comparison feature
- **`Sparkline`** - Mini trend charts for metrics

### Dashboard Layout
```
┌─────────────────────────────────────────────────┐
│ Status Banner (Full Width)                     │
│ [Analysis Complete] [Download PPTX] [PDF]     │
├──────────────────────┬────────────────────────┤
│ Left Column (65%)    │ Right Column (35%)      │
│                      │                         │
│ • AI Summary Card    │ • Chat Interface        │
│ • Key Metrics Strip  │ • Dataset Details Card │
│ • Charts Grid        │                         │
│ • Chart Compare      │                         │
└──────────────────────┴─────────────────────────┘
```

**Mobile:** All sections stack in single column

---

## 🔄 Data Flow

### Upload → Analysis → Storage

1. **User uploads file** (`page.tsx`)
   - Client-side parsing (papaparse/xlsx)
   - File data in memory

2. **Analysis request** (`/api/analyze`)
   - Receives: `headers`, `rows`, `datasetName`
   - Performs: Column profiling, classification, chart generation, health scoring
   - Returns: Complete analysis results

3. **Storage** (NEW - Google Sheets)
   - Generate `datasetId`: `dataset-${Date.now()}`
   - Save to Google Sheets via `/api/storage/save`
   - Cache in sessionStorage for immediate access
   - Redirect to `/dashboard/${datasetId}`

4. **Dashboard load** (`dashboard/[id]/page.tsx`)
   - Try sessionStorage first (fast)
   - Fallback to Google Sheets if not cached
   - Display all analysis results

### Chart Creation via Chat

1. **User asks chat** → "Create a bar chart of revenue"
2. **Chat generates chart** → Returns `ChartConfig`
3. **Chart added to grid** → `handleNewChart()` callback
4. **Update storage** → Save new chart to Google Sheets
5. **Persist** → Chart appears in main grid + persists on refresh

---

## 🎨 Design Philosophy

### User Experience
- **Speed First:** Analysis completes in 3-8 seconds
- **No Friction:** Upload → See results immediately
- **Progressive Enhancement:** Works without auth, better with persistence
- **Mobile-First:** Responsive design, touch-friendly

### Code Philosophy
- **Single Source of Truth:** One `/api/analyze` endpoint
- **Graceful Degradation:** Non-critical errors don't break flow
- **Performance:** Sample large datasets, limit rows/columns
- **Type Safety:** Full TypeScript coverage

---

## 🚧 Current TODOs

### High Priority
- [ ] **Google Sheets Integration**
  - [ ] Create Google Sheets service (`src/lib/storage/google-sheets.ts`)
  - [ ] Create storage API endpoints (`/api/storage/*`)
  - [ ] Update upload flow to save to Google Sheets
  - [ ] Update dashboard to load from Google Sheets
  - [ ] Build "My Datasets" list page

### Medium Priority
- [ ] **Chart Compare Feature** - Implement comparison logic (UI exists)
- [ ] **Mobile Testing** - Verify responsive layout on real devices
- [ ] **Error Boundaries** - Better error handling UI
- [ ] **Loading Skeletons** - Improve perceived performance

### Future Enhancements
- [ ] **Supabase Migration** - Move from Google Sheets to Supabase
- [ ] **Real Auth** - Replace simulated auth with Supabase Auth
- [ ] **File Storage** - Store uploaded files (Supabase Storage or GDrive)
- [ ] **User Profiles** - Subscription tiers, usage tracking

---

## 🔧 Development Workflow

### Local Development
```bash
npm run dev          # Start Next.js dev server
npm run typecheck    # TypeScript validation
npm run lint         # ESLint
npm run format       # Prettier
```

### Environment Variables
```env
# Required
OPENAI_API_KEY=sk-...

# Google Sheets (for storage)
GOOGLE_SHEETS_ID=your_sheet_id_here

# Optional (for future Supabase)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### Testing Checklist
- [x] Upload flow works end-to-end
- [x] Dashboard displays all data correctly
- [x] PowerPoint download works
- [x] PDF download works
- [x] Chat interface generates charts
- [x] Charts persist in sessionStorage
- [ ] Google Sheets save/load works
- [ ] Mobile layout tested on real devices
- [ ] Error states tested (network failures, invalid files)
- [ ] Large file handling tested (50K+ rows)

---

## 📊 Performance Considerations

### Dataset Limits
- **Max Rows for Analysis:** 100,000
- **Max Columns:** 100
- **Warning Threshold:** 50,000 rows (logs warning, continues)
- **Sampling:** Large datasets are automatically sampled for analysis

### Optimization Strategies
- **Client-side parsing** - Reduces server load
- **Single API call** - `/api/analyze` consolidates all analysis
- **SessionStorage cache** - Fast dashboard loads
- **Lazy loading** - Charts load on demand
- **Data sampling** - Large datasets analyzed on sample

---

## 🔐 Security & Privacy

### Current State
- **No authentication** - Simulated auth modal
- **No user accounts** - Data stored per-session
- **No file storage** - Files processed in-memory only
- **Data retention** - Lost on browser close (sessionStorage)

### Future State (with Google Sheets)
- **No auth required** - Anyone can use (MVP)
- **Data visible in sheet** - All analyses in one sheet (simple)
- **Privacy:** Consider adding user IDs or separate sheets per user

### Production Considerations
- Add authentication before launch
- Implement rate limiting
- Add data encryption
- Implement user isolation (separate sheets or user ID column)

---

## 📚 Key Files Reference

### Core Application
- `src/app/page.tsx` - Landing page + upload flow
- `src/app/dashboard/[id]/page.tsx` - Main dashboard
- `src/app/api/analyze/route.ts` - Analysis endpoint

### Storage (Google Sheets)
- `src/lib/storage/google-sheets.ts` - Google Sheets service (TODO)
- `src/app/api/storage/save/route.ts` - Save endpoint (TODO)
- `src/app/api/storage/load/route.ts` - Load endpoint (TODO)
- `src/app/api/storage/list/route.ts` - List endpoint (TODO)

### Components
- `src/components/features/` - All feature components
- `src/components/layouts/dashboard-header.tsx` - Dashboard header

### Analysis Engine
- `src/lib/analyzers/column-profiler.ts` - Column analysis
- `src/lib/analyzers/health-score.ts` - Health scoring
- `src/lib/charts/recommender.ts` - Chart generation

### Export
- `src/lib/exports/powerpoint-generator.ts` - PowerPoint generation
- `src/app/api/reports/pptx/route.ts` - PPTX endpoint
- `src/app/api/reports/export/route.ts` - PDF endpoint

---

## 🎯 Success Metrics

### MVP Goals
- ✅ Upload and analyze spreadsheets
- ✅ Generate interactive charts
- ✅ Export to PowerPoint/PDF
- ✅ Chat interface for data queries
- 🔄 Persistent storage (Google Sheets - in progress)

### Launch Readiness
- [ ] Google Sheets integration complete
- [ ] "My Datasets" page functional
- [ ] Mobile responsive tested
- [ ] Error handling robust
- [ ] Performance optimized for large files

---

## 🔄 Migration Path (Future)

### From Google Sheets → Supabase
1. **Schema already designed** - `supabase/migrations/001_initial_schema.sql`
2. **RLS policies ready** - `supabase/migrations/002_rls_policies.sql`
3. **Migration strategy:**
   - Export all data from Google Sheets
   - Import to Supabase tables
   - Update API endpoints to use Supabase client
   - Add authentication layer

### Benefits of Migration
- Better performance (PostgreSQL vs Sheets API)
- Real authentication (Supabase Auth)
- Row-level security (RLS policies)
- Better scalability
- File storage (Supabase Storage)

---

## 📝 Notes for Developers

### Adding New Features
1. **Check this context file first** - Understand architecture decisions
2. **Follow existing patterns** - Use similar component structure
3. **Update this file** - Document new decisions/changes
4. **Test thoroughly** - Especially with large datasets

### Common Patterns
- **Data Storage:** Save to Google Sheets + cache in sessionStorage
- **Error Handling:** Graceful degradation, user-friendly messages
- **Performance:** Sample large datasets, limit API calls
- **Type Safety:** Use TypeScript types from `@/types`

### Debugging Tips
- **Check Google Sheet** - See all stored analyses
- **Check sessionStorage** - See cached data in browser
- **Check API responses** - Network tab in DevTools
- **Check console logs** - Error messages and warnings

---

## 🚀 Next Steps

1. **Implement Google Sheets storage** (Current priority)
2. **Build "My Datasets" page** (List all analyses)
3. **Add chart comparison logic** (UI exists, needs backend)
4. **Mobile testing** (Verify responsive design)
5. **Production deployment** (Vercel + domain setup)

---

**This document should be updated as the project evolves. Keep it current!**

