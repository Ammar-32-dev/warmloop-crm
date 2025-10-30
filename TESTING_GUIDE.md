# Testing the Data Import Feature

## Quick Test Guide

### Step 1: Start the Application
```bash
cd /workspace/warmloop-crm
pnpm dev
```

### Step 2: Navigate to Dashboard
1. Sign in to your account
2. You should see the new "Import Data" button in the dashboard header (gradient indigo-to-sky)

### Step 3: Import Sample Data
1. Click "Import Data" button
2. Select the test file: `test_data_sample.csv` (included in repo root)
3. You'll see a preview showing:
   - 10 rows detected
   - 8 columns with types (name: string, email: string, score: numeric, etc.)
4. Optionally enable "Save to Supabase" toggle
5. Click "Import & Generate Dashboard"

### Step 4: Verify Dashboard
You'll be redirected to `/datasets/{id}` where you should see:

**Insights Panel:**
- "Top score: 95 (high-value rows identified)"

**Charts:**
- Bar chart showing score distribution for all 10 leads
- Doughnut chart showing status distribution (qualified, contacted, new, won)

**Column Summary Table:**
| Column | Type | Non-Null | Unique | Range | Sample |
|--------|------|----------|--------|-------|--------|
| name | string | 10 | 10 | - | Alice Smith, Bob Johnson |
| score | numeric | 10 | 10 | 45.0 - 95.0 | - |
| status | string | 10 | 4 | - | qualified, contacted |

**Data Table:**
- Full table showing all 10 rows
- Pagination controls (50 rows per page)

### Step 5: Test Additional Features
- **Download CSV**: Click download button in header
- **View All Datasets**: Navigate to /datasets to see the imported dataset card
- **Delete Dataset**: Click trash icon to remove

## Expected Results

### Sarah Johnson Test Case (from previous requirements)
If you create a lead with:
- Source: referral
- Est. Value: $15,000
- Activities: 5

The score should calculate to **80** (referral=20 + value=25 + activities=25 + email=10)

Similarly, **Alice Smith** in the sample CSV has:
- Score: 90 (shown in the data)
- Should appear in "Top Leads" component on main dashboard
- Should trigger "High-Value Lead" alert in AI Insights

## Test Different File Types

### CSV Test ✓
Use the provided `test_data_sample.csv`

### JSON Test
Create a file `test_data.json`:
```json
[
  {"name": "Test User", "email": "test@example.com", "score": 85, "active": true},
  {"name": "Demo User", "email": "demo@example.com", "score": 72, "active": false}
]
```

### Excel Test
Create a simple .xlsx file with the same columns as the CSV

### SQL Test
Create a file `test_data.sql`:
```sql
INSERT INTO users (name, email, score) VALUES ('User 1', 'user1@example.com', 80);
INSERT INTO users (name, email, score) VALUES ('User 2', 'user2@example.com', 65);
```

## Troubleshooting

### Issue: Import button not visible
- **Solution**: Make sure you're signed in and on the /dashboard page

### Issue: "Supabase save failed"
- **Check**: Environment variables are set correctly
- **Note**: Data still saves to localStorage even if Supabase fails

### Issue: Charts not rendering
- **Solution**: Check browser console for errors
- **Verify**: Chart.js is properly registered in DatasetDetailPage

### Issue: Type detection incorrect
- **Note**: Uses 20-row sampling; may need manual adjustment for edge cases
- **Workaround**: Edit column types in code if needed

## Performance Notes

- **Small files (<1MB)**: Instant parsing
- **Medium files (1-10MB)**: 1-2 seconds
- **Large files (10-50MB)**: 5-10 seconds
- **Very large files (>50MB)**: May cause browser slowdown

## Success Criteria Checklist

- [ ] Import button visible on dashboard
- [ ] Modal opens and accepts file upload
- [ ] Preview shows correct row/column count
- [ ] Column types detected accurately
- [ ] Charts render on dataset page
- [ ] Insights panel shows relevant alerts
- [ ] Data table displays all rows
- [ ] Pagination works correctly
- [ ] Download CSV functions properly
- [ ] Dataset persists after page refresh
- [ ] Delete removes dataset from localStorage

If all checkboxes are ticked, the feature is working correctly! ✅
