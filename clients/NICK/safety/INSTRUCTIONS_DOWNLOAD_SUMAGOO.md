# Sumagoo Product Image Download Instructions

This guide will help you download all product images from the Sumagoo website into Nick's safety folder.

## 📁 Output Location
All images will be downloaded to:
```
/mnt/e/1-CLAUDE-CODE-PROJECTS/echo2/clients/NICK/safety/sumagoo-products/
```

## 🚀 Quick Start Options

### Option 1: Python Script (Recommended - Most Comprehensive)

**Prerequisites:**
```bash
# Install required Python packages
pip install requests beautifulsoup4
```

**Run the script:**
```bash
cd /mnt/e/1-CLAUDE-CODE-PROJECTS/echo2/clients/NICK/safety
python3 download_sumagoo_images.py
```

**What it does:**
- Scrapes the entire Sumagoo website structure
- Finds product pages automatically
- Downloads all product images with proper naming
- Handles duplicates and errors gracefully
- Most thorough option

### Option 2: PowerShell Script (Pattern-based)

**Run the script:**
```powershell
cd /mnt/e/1-CLAUDE-CODE-PROJECTS/echo2/clients/NICK/safety
./download_sumagoo_images.ps1
```

**What it does:**
- Scrapes homepage for images
- Tries common URL patterns for products
- Good middle-ground option
- No additional software needed

### Option 3: Quick PowerShell (Homepage Only)

**Run the script:**
```powershell
cd /mnt/e/1-CLAUDE-CODE-PROJECTS/echo2/clients/NICK/safety
./download_homepage_images.ps1
```

**What it does:**
- Quick download of homepage images
- Tests common product image URLs
- Fastest option for testing

## 🔧 Troubleshooting

### If Python script fails:
1. **Install missing packages:**
   ```bash
   pip install --upgrade requests beautifulsoup4 lxml
   ```

2. **Check internet connection:**
   ```bash
   curl -I https://sumagoo.com
   ```

3. **Run with verbose output:**
   ```bash
   python3 download_sumagoo_images.py --verbose
   ```

### If PowerShell scripts fail:
1. **Enable script execution:**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

2. **Check PowerShell version:**
   ```powershell
   $PSVersionTable.PSVersion
   ```

3. **Run with error details:**
   ```powershell
   ./download_sumagoo_images.ps1 -ErrorAction Continue
   ```

## 📊 Expected Results

After running the scripts, you should see:
- A new folder: `sumagoo-products/`
- Image files with descriptive names
- Progress messages during download
- Summary of total images downloaded

## 🔄 Re-running Scripts

The scripts are designed to:
- Skip files that already exist
- Resume interrupted downloads
- Not re-download duplicates

You can safely run them multiple times.

## 📋 Manual Alternatives

If the automated scripts don't work, you can:

1. **Use wget (Linux/Mac):**
   ```bash
   wget -r -l2 -A.jpg,.jpeg,.png,.gif,.webp https://sumagoo.com
   ```

2. **Use browser extensions:**
   - Image Downloader extensions
   - Bulk image downloaders

3. **Manual browsing:**
   - Visit https://sumagoo.com
   - Right-click and save images manually

## 🎯 Customization

To modify the scripts for different requirements:

1. **Change output directory:**
   - Edit the `OUTPUT_DIR` variable in Python script
   - Edit the `$OutputDir` variable in PowerShell scripts

2. **Filter specific image types:**
   - Modify the file extension filters
   - Add/remove keywords for product filtering

3. **Adjust download delays:**
   - Change `DELAY_BETWEEN_REQUESTS` in Python
   - Modify `Start-Sleep` values in PowerShell

## 📞 Support

If you encounter issues:
1. Check the error messages carefully
2. Ensure you have internet connectivity
3. Verify the Sumagoo website is accessible
4. Try the simpler PowerShell script first
5. Check file permissions on the output directory

## 🔐 Important Notes

- Be respectful to the website (scripts include delays)
- Check Sumagoo's terms of service for image usage
- Images are for Nick's safety project only
- Scripts will create necessary directories automatically