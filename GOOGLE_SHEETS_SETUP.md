# Google Sheets Integration Setup Guide

## Quick Start (Demo Mode)

The dashboard is now working with demo data! You can:

1. **View the dashboard**: Visit `/dashboard` 
2. **See the sync button**: It should now be visible as you're set as an admin
3. **Test with demo data**: Charts and tables show sample product data

## Google Sheets API Setup

To connect your actual Google Sheets data, follow these steps:

### Option 1: Service Account (Recommended)

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Create a new project or select existing one

2. **Enable Google Sheets API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

3. **Create Service Account**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Fill in service account details
   - Click "Create"

4. **Download JSON Key**
   - Click on the created service account
   - Go to "Keys" tab
   - Click "Add Key" > "Create new key" > "JSON"
   - Download the JSON file

5. **Configure Environment**
   ```bash
   # Option A: File path
   GOOGLE_SERVICE_ACCOUNT_KEY_PATH="./path/to/service-account-key.json"
   
   # Option B: Base64 encoded (for deployment)
   GOOGLE_SERVICE_ACCOUNT_KEY_BASE64="<base64-encoded-json-content>"
   ```

6. **Share Your Google Sheet**
   - Open your Google Sheet
   - Click "Share"
   - Add the service account email (found in the JSON file)
   - Give "Viewer" permissions

### Option 2: OAuth2 (More Complex)

For OAuth2, you'll need to implement token management. The current setup supports it but requires additional token handling.

## Environment Configuration

Update your `.env` file:

```env
# Your Google Sheet URL: https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
GOOGLE_SHEET_ID="your-sheet-id-here"
GOOGLE_SHEET_NAME="your-sheet-name"  # Optional, defaults to "Sheet1"

# Service Account (choose one method)
GOOGLE_SERVICE_ACCOUNT_KEY_PATH="./google-service-account-key.json"
# OR
GOOGLE_SERVICE_ACCOUNT_KEY_BASE64="your-base64-encoded-json"
```

## Testing the Connection

1. **Test API endpoint**:
   ```bash
   curl http://localhost:3000/api/test-sheets
   ```

2. **Manual sync**:
   - Visit `/dashboard`
   - Click the "Sync Now" button
   - Check the sync status

## Sheet Data Format

Your Google Sheet should have these columns:
- `product_id`
- `date_sold` 
- `product_name`
- `category`
- `actual_price`
- `rating`
- `about_product`
- `user_id` (comma-separated for multiple reviewers)
- `user_name` (comma-separated for multiple reviewers)
- `review_id` (comma-separated for multiple reviews)
- `review_title` (comma-separated for multiple reviews)
- `review_content` (comma-separated for multiple reviews)
- `product_link`

## Troubleshooting

### Common Issues:

1. **"Authentication failed"**
   - Verify service account JSON is correct
   - Check that the sheet is shared with the service account email

2. **"No data found"**
   - Verify the sheet name matches `GOOGLE_SHEET_NAME`
   - Check that the sheet has data in the expected format

3. **"Sync button not visible"**
   - Make sure you're logged in
   - Verify you're set as an admin: `npm run make-admin your-email@domain.com`

### Debug Steps:

1. Check configuration:
   ```bash
   curl http://localhost:3000/api/test-sheets
   ```

2. Check admin status:
   ```bash
   npm run make-admin leonardogrig404@gmail.com
   ```

3. Re-seed demo data:
   ```bash
   npm run db:seed-demo
   ```

## Current Status

✅ Dashboard with demo data working  
✅ Admin user configured  
✅ Sync button visible  
⏳ Google Sheets API connection (needs service account setup)  
✅ Auto-sync cron job configured (20-minute intervals)  

Once you set up the service account, the sync will connect to your actual Google Sheets data!