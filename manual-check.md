# WarmLoop CRM - Manual Testing Guide

This guide provides step-by-step instructions to test the new analytical features: Lead Scoring, AI Insights, and Top Leads with live charts.

## Test Setup

1. Ensure you're logged into the WarmLoop CRM application
2. Navigate to the Leads page to create test data

## Test Case 1: Lead Scoring Function

### Step 1: Create High-Score Lead
Create a lead with this exact payload to test automatic scoring:

```json
{
  "name": "Sarah Johnson",
  "email": "sarah@bigco.com",
  "company": "BigCo",
  "source": "referral",
  "estimated_value": 10000,
  "activities_last_30d": 8,
  "status": "qualified"
}
```

**Expected Result:**
- Score should be automatically calculated to 80+ (specifically: referral=20, engagement=25, value=25, email=10 = 80)
- Score should be displayed in the leads table with progress bar

### Step 2: Create Medium-Score Lead
```json
{
  "name": "Mike Chen",
  "email": "mike@startup.io",
  "company": "Tech Startup",
  "source": "web",
  "estimated_value": 3000,
  "activities_last_30d": 3,
  "status": "contacted"
}
```

**Expected Result:**
- Score should be approximately: web=10, engagement=15, value=15, email=10 = 50

### Step 3: Verify Database Score
1. Check that scores are saved to Supabase database
2. Confirm scores persist after page refresh

## Test Case 2: AI Insights Panel

### Step 1: Trigger High-Value Alert
1. Create the Sarah Johnson lead (from Test Case 1)
2. Navigate to Dashboard page
3. Check AI Insights panel in the right column

**Expected Result:**
- Should show "High-Value Lead: Sarah Johnson (score: 80)" alert
- Alert should have "Review" button that links to leads page

### Step 2: Test At-Risk Pipeline Alert
1. Create 6+ leads in the same status with low scores
2. Example: create leads with source="other", estimated_value=0, activities_last_30d=0

**Expected Result:**
- Should show "At-Risk Pipeline" alert
- Message should indicate number of leads and average score

### Step 3: Test Stale Lead Alert
1. Create a lead with status != "won" 
2. Simulate old last_activity date (manually edit in database if needed)
3. Or wait 14+ days after creation

**Expected Result:**
- Should show "Stale Lead" alert
- Message should indicate days since last activity

## Test Case 3: Top Leads Component

### Step 1: Verify Top Leads Display
1. Navigate to Dashboard page
2. Check TopLeads component in left column

**Expected Result:**
- Should display top 5 leads ordered by score (descending)
- Should show score badges, progress bars, and lead details
- Should be clickable to view lead details

### Step 2: Test Real-time Updates
1. Create a new high-scoring lead
2. Monitor TopLeads component

**Expected Result:**
- Should update within 10 seconds (or instantly if realtime works)
- New lead should appear in correct ranking position

## Test Case 4: Live Chart Updates

### Step 1: Navigate to Analytics Page
1. Go to Analytics page from sidebar navigation

**Expected Result:**
- Charts should load with current lead data
- Should show lead pipeline (doughnut chart) and top scored leads (bar chart)

### Step 2: Create New Lead and Monitor Charts
1. Create a new lead while on Analytics page
2. Watch the charts for updates

**Expected Result:**
- Charts should update automatically within 10 seconds
- Pipeline distribution should reflect new lead status
- Top leads chart should include new high-scoring lead

### Step 3: Verify Chart Accuracy
1. Create leads with different statuses and scores
2. Verify chart data matches lead table data

**Expected Result:**
- Doughnut chart percentages should match actual distribution
- Bar chart should show correct top scores
- All data should be synchronized

## Test Case 5: Real-time Features

### Step 1: Test Realtime Subscriptions
1. Open Dashboard in one browser tab
2. Open Leads page in another browser tab
3. Create/edit leads in Leads page

**Expected Result:**
- Dashboard should update automatically (AI Insights, TopLeads)
- Analytics page should update charts in real-time
- Updates should occur within 10 seconds

### Step 2: Verify Polling Fallback
1. Disable realtime (if possible) or wait for connection issues
2. Continue creating leads

**Expected Result:**
- UI should still update every 10 seconds via polling fallback
- No data should be lost due to realtime disconnection

## Success Criteria Checklist

- [ ] Creating Sarah Johnson lead results in score ≥ 80 saved to Supabase
- [ ] AI Insights shows "High-Value Lead: Sarah Johnson (score XX)" alert
- [ ] TopLeads component displays leads ordered by score with proper formatting
- [ ] Charts update within 10 seconds after lead creation
- [ ] Real-time updates work (or polling fallback functions)
- [ ] All components load without errors
- [ ] Form validation works for new fields
- [ ] Database persists scores correctly
- [ ] Navigation between pages maintains data consistency

## Troubleshooting

### Common Issues:

1. **Scores not calculating:**
   - Check browser console for errors
   - Verify all required form fields are filled
   - Ensure email format is valid

2. **AI Insights not showing:**
   - Confirm leads meet threshold criteria (score ≥ 85 for high-value)
   - Check that real-time subscriptions are working

3. **Charts not updating:**
   - Verify Chart.js is loading correctly
   - Check for JavaScript errors in browser console
   - Ensure real-time subscriptions are active

4. **Real-time not working:**
   - Check Supabase connection status
   - Verify RLS policies allow realtime updates
   - Fallback polling should activate after 30 seconds

## Browser Compatibility

Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)  
- [ ] Safari (latest)
- [ ] Edge (latest)

All features should work identically across modern browsers.