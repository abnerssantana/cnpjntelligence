# CNPJ Analytics - Implementation Guide

## Overview

This document describes the implementation of the CNPJ Analytics dashboard with Supabase integration, following Next.js 14 best practices with server components, caching, and Vercel deployment optimization.

## Architecture

### Database (Supabase)

The application uses Supabase PostgreSQL with the following main tables:
- `companies` - Basic company information
- `establishments` - Detailed establishment data
- `partners` - Company partners/shareholders
- `municipalities` - Brazilian municipalities
- `cnaes` - Economic activity codes
- `users` - Application users

### Key Features Implemented

1. **Server Components with Caching**
   - Dashboard page is a server component
   - Data fetching uses `unstable_cache` for performance
   - Global stats cached for 1 hour
   - Filtered data cached for 5 minutes

2. **Progressive Data Loading**
   - Suspense boundaries for better UX
   - Loading skeletons for all components
   - Error boundaries for graceful error handling

3. **Optimized Data Fetching**
   - Server actions for data operations
   - Efficient queries with proper joins
   - Pagination to limit data transfer

4. **Client-Side Interactions**
   - `DashboardContent` component handles filters and navigation
   - URL state management for shareable filters
   - Real-time filter updates without full page reload

## File Structure

```
app/
├── dashboard/
│   ├── page.tsx          # Server component main page
│   ├── actions.ts        # Server actions for data fetching
│   ├── loading.tsx       # Loading UI
│   └── error.tsx         # Error boundary
├── api/
│   └── companies/
│       └── export/
│           └── route.ts  # Excel export endpoint
components/
├── dashboard-content.tsx  # Client component wrapper
├── company-filters.tsx    # Filter controls
├── company-table.tsx      # Data table with pagination
├── kpi-cards.tsx         # KPI metrics display
├── cnae-analysis.tsx     # CNAE analysis tab
├── geographic-analysis.tsx # Geographic analysis tab
├── temporal-analysis.tsx  # Temporal analysis tab
├── partners-analysis.tsx  # Partners analysis tab
└── capital-analysis.tsx   # Capital analysis tab
lib/
└── supabaseServer.ts     # Supabase client for server
```

## Performance Optimizations

1. **Caching Strategy**
   - Global statistics: 1 hour cache
   - Filtered data: 5 minutes cache
   - Reference data (states, CNAEs): 24 hours cache

2. **Data Loading**
   - Limit queries to 50 records by default
   - Pagination for large datasets
   - Selective field loading with proper joins

3. **Client Optimizations**
   - Debounced search inputs
   - Optimistic UI updates
   - Progressive enhancement

## Security

1. **Authentication**
   - Middleware protection for dashboard routes
   - Redirect to login for unauthenticated users
   - Session management with Supabase Auth

2. **Data Access**
   - Server-side data fetching only
   - Service role key for server operations
   - Row-level security in Supabase

## Deployment (Vercel)

1. **Environment Variables**
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   ```

2. **Build Optimizations**
   - Static generation where possible
   - Dynamic imports for heavy components
   - Image optimization with Next.js Image

## Usage

1. **Filters**
   - State/Municipality cascade
   - Company size filtering
   - CNAE activity filtering
   - Cadastral situation filtering
   - CNPJ/Name search

2. **Analysis Tabs**
   - Overview: KPIs and summary
   - Companies: Detailed table with export
   - CNAE Analysis: Activity distribution
   - Geographic: Regional insights
   - Temporal: Time-based trends
   - Partners: Ownership analysis
   - Capital: Financial analysis

3. **Export**
   - Excel export with applied filters
   - Limited to 10,000 records
   - Formatted data with proper labels

## Future Enhancements

1. **Performance**
   - Implement Redis caching
   - Add database indexes
   - Optimize complex queries

2. **Features**
   - Real-time updates with Supabase subscriptions
   - Advanced visualizations with charts
   - Saved searches and alerts
   - Bulk operations

3. **Analytics**
   - User behavior tracking
   - Performance monitoring
   - Error tracking with Sentry

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

## Testing

```bash
# Run tests
npm test

# Run e2e tests
npm run test:e2e
```

## Maintenance

1. **Database**
   - Regular backups via Supabase
   - Monitor query performance
   - Update indexes as needed

2. **Application**
   - Monitor error logs
   - Track performance metrics
   - Update dependencies regularly