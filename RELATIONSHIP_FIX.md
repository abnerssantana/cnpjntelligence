# Foreign Key Relationship Fix

## Problem
The application was throwing an error: "Could not find a relationship between 'establishments' and 'municipalities' in the schema cache"

This occurred because Supabase's PostgREST couldn't recognize the foreign key relationships between:
- `establishments.municipio` → `municipalities.codigo`
- `establishments.cnae_fiscal_principal` → `cnaes.codigo`

## Root Cause
While the foreign key constraints exist in the database schema, Supabase's PostgREST schema cache wasn't recognizing them, likely because:
1. The constraints were added after initial table creation
2. The schema cache needed refreshing
3. PostgREST couldn't automatically detect the relationships

## Solution
Instead of relying on Supabase's automatic relationship detection, we implemented manual data enrichment:

### Changes Made

1. **Modified `app/dashboard/actions.ts`:**
   - Removed foreign key relationship syntax: `municipalities!municipio(descricao)` and `cnaes!cnae_fiscal_principal(descricao)`
   - Added manual enrichment logic that:
     - Fetches establishments with company data
     - Extracts unique municipality and CNAE codes
     - Performs separate queries to get descriptions
     - Merges the data using lookup maps

2. **Modified `app/api/companies/export/route.ts`:**
   - Applied the same enrichment approach for export functionality

3. **Updated `getMunicipalities()` function:**
   - Changed from relationship-based query to manual join approach
   - First gets municipality codes for a state, then fetches descriptions

## Technical Details

### Before (Broken)
```typescript
.select(`
  *,
  companies!inner(...),
  municipalities!municipio(descricao),
  cnaes!cnae_fiscal_principal(descricao)
`)
```

### After (Working)
```typescript
// 1. Get establishments with companies
.select(`
  *,
  companies!inner(...)
`)

// 2. Extract unique codes
const municipioCodes = [...new Set(companies.map(c => c.municipio).filter(Boolean))]
const cnaeCodes = [...new Set(companies.map(c => c.cnae_fiscal_principal).filter(Boolean))]

// 3. Fetch descriptions separately
const municipalities = await supabase.from('municipalities').select('codigo, descricao').in('codigo', municipioCodes)
const cnaes = await supabase.from('cnaes').select('codigo, descricao').in('codigo', cnaeCodes)

// 4. Create lookup maps and enrich data
const municipalityMap = new Map(municipalities?.map(m => [m.codigo, m.descricao]) || [])
const cnaeMap = new Map(cnaes?.map(c => [c.codigo, c.descricao]) || [])

const enrichedCompanies = companies.map(company => ({
  ...company,
  municipalities: company.municipio ? { descricao: municipalityMap.get(company.municipio) } : null,
  cnaes: company.cnae_fiscal_principal ? { descricao: cnaeMap.get(company.cnae_fiscal_principal) } : null
}))
```

## Benefits
1. **Reliability:** No longer dependent on Supabase's schema cache
2. **Performance:** Efficient batch lookups instead of individual joins
3. **Maintainability:** Clear, explicit data fetching logic
4. **Compatibility:** Works regardless of foreign key constraint recognition

## Files Modified
- `app/dashboard/actions.ts`
- `app/api/companies/export/route.ts`

## Testing
The fix has been tested and confirmed working:
- Establishments query executes successfully
- Municipality and CNAE descriptions are properly fetched and merged
- Data structure remains compatible with existing frontend code

## Future Considerations
If Supabase's schema cache is refreshed and relationships are recognized, the code can be simplified back to the relationship syntax, but the current approach is more robust and reliable.