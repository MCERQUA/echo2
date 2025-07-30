#!/usr/bin/env python3
"""
Sumagoo Product Image Downloader
Downloads all product images from Sumagoo website to Nick's safety folder
"""

import requests
from bs4 import BeautifulSoup
import os
import time
from urllib.parse import urljoin, urlparse
import re

# Configuration
BASE_URL = "https://sumagoo.com"
OUTPUT_DIR = "/mnt/e/1-CLAUDE-CODE-PROJECTS/echo2/clients/NICK/safety/sumagoo-products"
DELAY_BETWEEN_REQUESTS = 1  # seconds

def create_output_directory():
    """Create the output directory if it doesn't exist"""
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        print(f"Created directory: {OUTPUT_DIR}")

def get_safe_filename(url, prefix=""):
    """Convert URL to safe filename"""
    parsed = urlparse(url)
    filename = os.path.basename(parsed.path)
    if not filename or '.' not in filename:
        filename = f"image_{hash(url) % 10000}.jpg"
    
    # Clean filename
    filename = re.sub(r'[^\w\-_\.]', '_', filename)
    if prefix:
        filename = f"{prefix}_{filename}"
    
    return filename

def download_image(img_url, filename):
    """Download a single image"""
    try:
        print(f"Downloading: {img_url}")
        response = requests.get(img_url, stream=True, timeout=30)
        response.raise_for_status()
        
        filepath = os.path.join(OUTPUT_DIR, filename)
        
        # Skip if file already exists
        if os.path.exists(filepath):
            print(f"  Skipped (already exists): {filename}")
            return True
            
        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        print(f"  Saved: {filename}")
        return True
        
    except Exception as e:
        print(f"  Error downloading {img_url}: {str(e)}")
        return False

def scrape_page_images(url, page_name=""):
    """Scrape images from a single page"""
    try:
        print(f"\nScraping page: {url}")
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find all images
        images = soup.find_all('img')
        downloaded_count = 0
        
        for img in images:
            # Get image URL
            img_url = img.get('src') or img.get('data-src') or img.get('data-lazy-src')
            
            if not img_url:
                continue
                
            # Convert relative URLs to absolute
            if img_url.startswith('//'):
                img_url = 'https:' + img_url
            elif img_url.startswith('/'):
                img_url = urljoin(BASE_URL, img_url)
            elif not img_url.startswith('http'):
                img_url = urljoin(url, img_url)
            
            # Skip very small images (likely icons/logos)
            if any(x in img_url.lower() for x in ['logo', 'icon', 'favicon']):
                continue
                
            # Generate filename
            filename = get_safe_filename(img_url, page_name)
            
            # Download image
            if download_image(img_url, filename):
                downloaded_count += 1
                
            # Be respectful to the server
            time.sleep(DELAY_BETWEEN_REQUESTS)
        
        print(f"Downloaded {downloaded_count} images from {url}")
        return downloaded_count
        
    except Exception as e:
        print(f"Error scraping {url}: {str(e)}")
        return 0

def find_product_pages():
    """Try to find product pages on the website"""
    product_urls = []
    
    try:
        # Start with homepage
        response = requests.get(BASE_URL, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Look for common product page patterns
        links = soup.find_all('a', href=True)
        
        for link in links:
            href = link['href']
            
            # Convert relative URLs
            if href.startswith('/'):
                href = urljoin(BASE_URL, href)
            elif not href.startswith('http'):
                continue
                
            # Look for product-related URLs
            if any(keyword in href.lower() for keyword in [
                'product', 'safety', 'equipment', 'gear', 'shop', 
                'catalog', 'item', 'buy'
            ]):
                if href not in product_urls:
                    product_urls.append(href)
        
        print(f"Found {len(product_urls)} potential product pages")
        
    except Exception as e:
        print(f"Error finding product pages: {str(e)}")
    
    return product_urls

def main():
    """Main function"""
    print("Sumagoo Image Downloader")
    print("=" * 50)
    
    create_output_directory()
    
    total_downloaded = 0
    
    # Download images from homepage
    total_downloaded += scrape_page_images(BASE_URL, "homepage")
    
    # Try to find and scrape product pages
    product_pages = find_product_pages()
    
    for i, page_url in enumerate(product_pages[:10]):  # Limit to first 10 pages
        page_name = f"page_{i+1}"
        total_downloaded += scrape_page_images(page_url, page_name)
        
        # Longer delay between pages
        time.sleep(2)
    
    print(f"\n" + "=" * 50)
    print(f"Download complete!")
    print(f"Total images downloaded: {total_downloaded}")
    print(f"Images saved to: {OUTPUT_DIR}")

if __name__ == "__main__":
    main()