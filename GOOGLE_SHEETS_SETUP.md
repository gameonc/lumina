# Google Sheets Storage Setup Guide

This guide walks you through setting up Google Sheets as a storage backend for the AI Data Insights platform.

## Quick Start

### 1. Environment Variables

Add these three variables to your `.env.local` file:

```bash
GOOGLE_SHEETS_ID=your-spreadsheet-id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nPrivate\nKey\n-----END PRIVATE KEY-----\n"
```

### 2. Google Cloud Setup

1. **Create/Select Project**: https://console.cloud.google.com/
2. **Enable Google Sheets API**: APIs & Services > Enable APIs
3. **Create Service Account**: IAM & Admin > Service Accounts > Create
4. **Download Key**: Click on service account > Keys > Add Key > JSON

### 3. Create & Share Spreadsheet

1. **Create**: https://sheets.google.com/ > New Spreadsheet
2. **Copy ID**: From URL: `https://docs.google.com/spreadsheets/d/{ID}/edit`
3. **Share**: Click Share > Add service account email > Editor permissions

## Files Created

```
src/lib/storage/
├── google-sheets.ts           # Main storage implementation
├── google-sheets.example.ts   # Usage examples
└── README.md                  # Detailed documentation
```

## Quick Test

```typescript
import { getGoogleSheetsStorage } from '@/lib/storage/google-sheets';

const storage = getGoogleSheetsStorage();

if (storage.isConfigured()) {
  const count = await storage.getCount();
  console.log('Records:', count);
}
```

## Features Implemented

- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ TypeScript type safety with AnalysisRecord interface
- ✅ Automatic sheet initialization with headers
- ✅ JSON serialization for complex fields
- ✅ Singleton pattern for easy reuse
- ✅ Environment-based configuration
- ✅ Comprehensive error handling
- ✅ Batch operations support

## Data Structure

The service stores analysis records with these fields:

- **ID**: Unique identifier
- **Dataset Name**: Name of the analyzed dataset
- **Health Score**: Quality score (0-100)
- **Row Count**: Number of data rows
- **Column Count**: Number of columns
- **Dataset Type**: Classification type
- **Created At**: ISO timestamp
- **Charts**: Visualization configurations (JSON)
- **Column Stats**: Statistical analysis (JSON)
- **Full Data**: Complete dataset info (JSON)

## Next Steps

1. Add environment variables to `.env.local`
2. Test connection with provided examples
3. Integrate into your API routes
4. Monitor usage via Google Cloud Console

For detailed documentation, see: `src/lib/storage/README.md`
