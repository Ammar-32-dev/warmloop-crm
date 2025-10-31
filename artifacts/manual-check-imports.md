# Manual Import Testing Guide - WarmLoop CRM

## Test Environment
- Deployment URL: TBD (after build)
- Test Date: 2025-10-31
- Tester: Development Team

---

## Test Case 1: Dashboard Import (Non-Destructive Mode)

### Objective
Verify that data can be imported for visualization without saving to database by default

### Prerequisites
- User logged in
- Test CSV file prepared with sample data

### Test Data (sample_data.csv)
```csv
name,email,company,score,value
John Doe,john@example.com,Acme Inc,85,5000
Jane Smith,jane@example.com,Tech Corp,92,8000
Bob Johnson,bob@example.com,Start Co,78,3000
```

### Steps
1. Navigate to Dashboard page
2. Click "Import Data" button in header
3. Select `sample_data.csv` file
4. Verify:
   - File parses successfully
   - Preview shows first 10 rows
   - Column types detected correctly (name:string, email:string, company:string, score:numeric, value:numeric)
5. Observe "Save to Supabase" toggle is OFF by default
6. Click "Import & Generate Dashboard"
7. Wait for redirect to /datasets/:id

### Expected Results
- ✓ File parses without errors
- ✓ Preview displays correctly with proper types
- ✓ Toggle is OFF by default
- ✓ Import succeeds with success message
- ✓ Redirects to dataset detail page
- ✓ Auto-dashboard shows:
  - Data table with all rows
  - Bar chart for numeric columns
  - Doughnut chart for categorical columns
  - Column statistics
- ✓ Data saved to localStorage only (not in Supabase leads table)
- ✓ Can export as CSV

### Success Criteria
- [ ] All verification points pass
- [ ] No errors in console
- [ ] Data visualization renders correctly
- [ ] localStorage contains dataset

---

## Test Case 2: Dashboard Import (With Supabase Toggle ON)

### Objective
Verify that data can optionally be saved to Supabase when toggle is enabled

### Prerequisites
- User logged in
- Test CSV file with lead-like data

### Test Data (leads_data.csv)
```csv
name,email,company,status,source,estimated_value
Alice Cooper,alice@company.com,Big Corp,new,referral,10000
Charlie Brown,charlie@startup.io,SmallCo,contacted,web,2500
```

### Steps
1. Navigate to Dashboard page
2. Click "Import Data" button
3. Select `leads_data.csv` file
4. Verify preview shows correctly
5. **Toggle "Save to Supabase" ON**
6. Click "Import & Generate Dashboard"
7. Navigate to Leads page
8. Verify imported leads appear in leads table

### Expected Results
- ✓ File parses successfully
- ✓ Toggle switches to ON
- ✓ Import process completes
- ✓ Data saved to both localStorage AND Supabase
- ✓ Leads appear in Leads page (may need refresh)
- ✓ Dashboard metrics update to reflect new leads

### Success Criteria
- [ ] Data visible in both localStorage and Supabase
- [ ] Leads page shows new entries
- [ ] Dashboard stats update correctly

---

## Test Case 3: Leads Import (Direct to Database)

### Objective
Verify column mapping, validation, and direct import to leads table

### Prerequisites
- User logged in
- Test CSV with various column names

### Test Data (import_leads.csv)
```csv
full_name,email_address,organization,lead_status,lead_source,deal_value,touchpoints
Emily White,emily@techcorp.io,Tech Solutions,new,referral,15000,3
Michael Green,michael@startup.co,StartUp LLC,qualified,web,5000,7
Sarah Black,sarah@enterprise.com,Enterprise Co,contacted,ad,20000,5
```

### Steps
1. Navigate to Leads page
2. Click "Import Leads" button
3. Select `import_leads.csv` file
4. Wait for auto-mapping to complete
5. Verify column mappings:
   - full_name → name
   - email_address → email
   - organization → company
   - lead_status → status
   - lead_source → source
   - deal_value → estimated_value
   - touchpoints → activities_last_30d
6. Adjust any incorrect mappings manually
7. Click "Validate Data"
8. Review validation report (should show all valid)
9. Click "Import X Leads"
10. Wait for import to complete
11. Check leads list updates
12. Verify scores computed automatically

### Expected Results
- ✓ Auto-mapping suggests correct fields
- ✓ All rows validate successfully
- ✓ Import completes with success message
- ✓ Leads appear in leads table within 10 seconds
- ✓ Scores calculated correctly (based on source, value, activities)
- ✓ "Undo Last Import" button appears

### Success Criteria
- [ ] Column mapping heuristics work correctly
- [ ] Validation report accurate
- [ ] All valid rows inserted
- [ ] Scores computed properly
- [ ] Real-time update works (or refresh within 10s)

---

## Test Case 4: Leads Import Validation (Invalid Data)

### Objective
Verify validation catches invalid data and provides clear error messages

### Prerequisites
- User logged in

### Test Data (invalid_leads.csv)
```csv
name,email,company
,alice@valid.com,Company A
Bob Invalid,invalid-email,
Charlie NoContact,,
David Valid,david@company.com,Valid Corp
```

### Steps
1. Navigate to Leads page
2. Click "Import Leads" button
3. Select `invalid_leads.csv` file
4. Map columns (name→name, email→email, company→company)
5. Click "Validate Data"
6. Review validation report

### Expected Results
Validation should show:
- Row 1: INVALID - "Name is required"
- Row 2: INVALID - "Invalid email format"
- Row 3: INVALID - "Either email or company is required"
- Row 4: VALID - All checks pass

Validation Report:
- ✓ Valid Rows: 1
- ✓ Invalid Rows: 3
- ✓ Error details listed for first 5 invalid rows
- ✓ Import button shows "Import 1 Leads" (only valid rows)
- ✓ Clicking import only inserts the valid row

### Success Criteria
- [ ] All validation rules enforced
- [ ] Clear error messages displayed
- [ ] Only valid rows imported
- [ ] Invalid row count accurate

---

## Test Case 5: Undo Last Import

### Objective
Verify undo functionality removes imported leads from database

### Prerequisites
- At least one successful import completed (from Test Case 3)
- "Undo Last Import" button visible

### Steps
1. Note current leads count in leads list
2. Click "Undo Last Import" button
3. Confirm the action (if confirmation dialog appears)
4. Wait for completion message
5. Verify leads list updates
6. Check that imported leads are removed

### Expected Results
- ✓ Confirmation dialog appears (optional, for safety)
- ✓ Undo process completes with success message
- ✓ Leads count decreases by number of imported leads
- ✓ Previously imported leads no longer visible in list
- ✓ Dashboard stats update to reflect removal
- ✓ "Undo Last Import" button disappears after undo

### Success Criteria
- [ ] All imported leads removed successfully
- [ ] No orphaned data left in database
- [ ] UI updates correctly

---

## Test Case 6: Large File Import (Performance)

### Objective
Verify batch import handles large datasets efficiently

### Prerequisites
- User logged in
- CSV file with 1000+ rows

### Test Data
Generate programmatically or use existing large dataset

### Steps
1. Navigate to Leads page
2. Click "Import Leads" button
3. Select large CSV file (1000+ rows)
4. Observe parsing progress
5. Map columns and validate
6. Click import
7. Observe batch progress indicators
8. Wait for completion

### Expected Results
- ✓ File parses within reasonable time (<10s for 1000 rows)
- ✓ Progress indicators show batch progress
- ✓ Import completes without timeout
- ✓ All valid rows inserted
- ✓ Memory usage remains stable
- ✓ UI remains responsive

### Success Criteria
- [ ] Handles 1000+ rows without errors
- [ ] Progress feedback clear
- [ ] No performance degradation
- [ ] All rows inserted correctly

---

## Summary Checklist

### Overall Functionality
- [ ] Test Case 1: Dashboard Import (Non-Destructive) - PASS
- [ ] Test Case 2: Dashboard Import (Supabase Toggle) - PASS
- [ ] Test Case 3: Leads Import (Direct to DB) - PASS
- [ ] Test Case 4: Validation (Invalid Data) - PASS
- [ ] Test Case 5: Undo Last Import - PASS
- [ ] Test Case 6: Large File Import - PASS

### UI/UX
- [ ] All modals responsive and accessible
- [ ] Progress indicators clear and accurate
- [ ] Error messages helpful and specific
- [ ] Success messages displayed appropriately
- [ ] No layout breaks on mobile/tablet

### Data Integrity
- [ ] No data loss during import
- [ ] Scores computed correctly
- [ ] User isolation respected (RLS policies)
- [ ] Duplicate handling (if applicable)

### Performance
- [ ] Import operations complete in reasonable time
- [ ] No memory leaks
- [ ] UI remains responsive during import

---

## Issues Found
(Document any issues discovered during testing)

| Issue # | Severity | Description | Steps to Reproduce | Status |
|---------|----------|-------------|-------------------|--------|
| | | | | |

---

## Notes
- All tests should be performed on the production deployment
- Use a test account with clean data for accurate results
- Document any unexpected behavior
- Check browser console for errors

---

## Sign-off
- Tester: __________________
- Date: __________________
- Result: PASS / FAIL / PARTIAL
