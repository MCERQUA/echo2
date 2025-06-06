# Troubleshooting Guide - Echo Communication Terminal

## Latest Fixes Applied (June 6, 2025 - 9:32 PM)

### What Was Fixed:
1. **JavaScript Element Selectors**: Fixed mismatch between JavaScript looking for `.status-dot` while HTML had `.status-indicator`
2. **CSS Styles**: Added missing message styles and fixed styling issues
3. **Session Management**: Enhanced error handling for session initialization

### Steps to Verify the Fix:

#### 1. Wait for Deployment
The changes will trigger an automatic deployment. Check deployment status:
- Go to Cloudflare Dashboard → Pages → echo2 → Deployments
- Wait for the latest deployment to show "Success" (usually 2-3 minutes)

#### 2. Clear Everything
```bash
# In Chrome DevTools Console:
localStorage.clear()
sessionStorage.clear()
```

Or manually:
- Chrome: Settings → Privacy → Clear browsing data → Cached images and files
- Firefox: Settings → Privacy → Clear Data → Cached Web Content

#### 3. Hard Refresh
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

#### 4. Check Developer Console
Open DevTools (F12) and check:
- **Console Tab**: Should show no red errors
- **Network Tab**: All requests should return 200 OK
- Should see: "Created new session: [id]" in console

#### 5. Test the Chat
Try typing "test" and sending - you should get a response!

### If Still Not Working:

#### Check API Health
Visit: https://echo2.pages.dev/api/health
- Should return JSON with "status": "healthy"
- If this works but chat doesn't, it's a frontend issue

#### Check Environment Variables
In Cloudflare Dashboard → echo2 → Settings → Environment variables:
- `OPENAI_API_KEY` must be set
- `GITHUB_TOKEN` must be set

#### Browser Console Errors
If you see errors like:
- "Cannot read property 'querySelector' of null" - Fixed in latest update
- "Failed to fetch" - Check network/CORS issues
- "API key not configured" - Add environment variables

#### Force Purge Cache
1. Cloudflare Dashboard → echo2 → Settings → Caching
2. Click "Purge Everything"
3. Wait 1 minute and try again

### Debug Mode
Add `?debug=true` to URL:
```
https://echo2.pages.dev/?debug=true
```
This will show additional console logging.

### Quick Test URLs
1. API Health: https://echo2.pages.dev/api/health
2. With cache bypass: https://echo2.pages.dev/?v=2.0.2
3. Incognito mode test (no cache/cookies)

### If All Else Fails
1. Try a different browser
2. Check if deployment actually completed in Cloudflare
3. Look at deployment logs for errors
4. Verify environment variables are saved (not just added but saved)

The deployment should complete within 5 minutes of these commits!
