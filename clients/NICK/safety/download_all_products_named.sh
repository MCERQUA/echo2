#!/bin/bash

BASE_URL="https://sumaggo.com"
OUTPUT_DIR="/mnt/e/1-CLAUDE-CODE-PROJECTS/echo2/clients/NICK/safety/sumaggo-products"
USER_AGENT="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"

echo "🔥 Sumaggo Complete Product Image Downloader"
echo "=============================================="

mkdir -p "$OUTPUT_DIR"

# Function to clean filename
clean_filename() {
    echo "$1" | sed 's/[^a-zA-Z0-9-]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$//g'
}

# Function to extract product name from URL or page
get_product_name() {
    local url="$1"
    local page_content="$2"
    
    # Try to extract from URL first
    product_slug=$(echo "$url" | sed 's|.*/product/||' | sed 's|/$||')
    
    # Try to extract title from page content
    if [[ -n "$page_content" ]]; then
        title=$(echo "$page_content" | grep -oE '<title[^>]*>[^<]*</title>' | sed 's/<[^>]*>//g' | head -1)
        if [[ -n "$title" && "$title" != *"Sumaggo"* ]]; then
            product_name=$(echo "$title" | sed 's/ - Sumaggo//g' | sed 's/ – Sumaggo//g')
            if [[ -n "$product_name" ]]; then
                echo "$(clean_filename "$product_name")"
                return
            fi
        fi
    fi
    
    # Fallback to URL slug
    echo "$(clean_filename "$product_slug")"
}

# Function to download images from a product page
download_product_images() {
    local product_url="$1"
    echo ""
    echo "🔍 Processing: $product_url"
    
    # Get page content
    page_content=$(curl -L -A "$USER_AGENT" "$product_url" --silent --max-time 30)
    if [[ $? -ne 0 || -z "$page_content" ]]; then
        echo "  ❌ Failed to fetch page"
        return
    fi
    
    # Get product name
    product_name=$(get_product_name "$product_url" "$page_content")
    echo "  📦 Product: $product_name"
    
    # Extract all image URLs from the product page
    echo "$page_content" | grep -oE 'src="[^"]*\.(jpg|jpeg|png|gif|webp)"' | sed 's/src="//g' | sed 's/"//g' | while read -r img_url; do
        
        # Skip logos and icons
        if echo "$img_url" | grep -qE "(logo|icon|favicon|wp-content/themes)"; then
            continue
        fi
        
        # Fix relative URLs
        if [[ $img_url == //* ]]; then
            img_url="https:${img_url}"
        elif [[ $img_url == /* ]]; then
            img_url="${BASE_URL}${img_url}"
        fi
        
        # Get original filename and extension
        original_name=$(basename "$img_url")
        ext="${original_name##*.}"
        
        # Create descriptive filename
        # Try to extract product code from image name or URL
        product_code=$(echo "$img_url" | grep -oE '[0-9]{4,6}' | head -1)
        
        if [[ -n "$product_code" ]]; then
            filename="${product_name}-${product_code}.${ext}"
        else
            # Use image counter if no code found
            counter_file="/tmp/img_counter_${product_name}"
            if [[ -f "$counter_file" ]]; then
                counter=$(($(cat "$counter_file") + 1))
            else
                counter=1
            fi
            echo "$counter" > "$counter_file"
            filename="${product_name}-${counter}.${ext}"
        fi
        
        filepath="$OUTPUT_DIR/$filename"
        
        # Download if not exists
        if [[ ! -f "$filepath" ]]; then
            echo "    ⬇️  Downloading: $filename"
            if curl -L -A "$USER_AGENT" -o "$filepath" "$img_url" --silent --fail --max-time 30; then
                echo "    ✅ Saved: $filename"
                ((total_downloaded++))
            else
                echo "    ❌ Failed: $img_url"
                [[ -f "$filepath" ]] && rm "$filepath"
            fi
        else
            echo "    ⏭️  Exists: $filename"
        fi
        
        sleep 0.3
    done
}

# Main execution
total_downloaded=0

echo "🔍 Finding all product pages..."

# Get all product URLs
curl -L -A "$USER_AGENT" "$BASE_URL" --silent | grep -oE 'href="[^"]*product[^"]*"' | sed 's/href="//g' | sed 's/"//g' | sort | uniq > /tmp/all_urls.txt

# Filter for individual product pages (not categories)
grep "product/" /tmp/all_urls.txt | grep -v "product-category" > /tmp/product_pages.txt

product_count=$(wc -l < /tmp/product_pages.txt)
echo "📦 Found $product_count individual product pages"

# Download from each product page
while read -r product_url; do
    download_product_images "$product_url"
    sleep 1  # Be respectful between pages
done < /tmp/product_pages.txt

# Also check category pages for more products
echo ""
echo "🔍 Checking category pages for additional products..."

grep "product-category" /tmp/all_urls.txt | head -5 | while read -r category_url; do
    echo "📂 Processing category: $category_url"
    
    category_content=$(curl -L -A "$USER_AGENT" "$category_url" --silent --max-time 30)
    if [[ $? -eq 0 && -n "$category_content" ]]; then
        # Look for more product links in category pages
        echo "$category_content" | grep -oE 'href="[^"]*product/[^"]*"' | sed 's/href="//g' | sed 's/"//g' | sort | uniq >> /tmp/more_products.txt
    fi
    sleep 1
done

# Download from any additional products found
if [[ -f /tmp/more_products.txt ]]; then
    sort /tmp/more_products.txt | uniq | while read -r additional_url; do
        # Skip if we already processed this URL
        if ! grep -q "$additional_url" /tmp/product_pages.txt; then
            download_product_images "$additional_url"
            sleep 1
        fi
    done
fi

# Clean up temp files
rm -f /tmp/all_urls.txt /tmp/product_pages.txt /tmp/more_products.txt /tmp/img_counter_*

echo ""
echo "🎉 =============================================="
echo "✅ DOWNLOAD COMPLETE!"
echo "📊 Total images downloaded: $total_downloaded"
echo "📁 Images saved to: $OUTPUT_DIR"
echo "🏷️  All images named with product names and codes"
echo "=============================================="

# Show final results
if [[ $total_downloaded -gt 0 ]]; then
    echo ""
    echo "📋 Downloaded files:"
    ls -la "$OUTPUT_DIR" | head -20
    echo ""
    echo "📊 Final summary:"
    echo "   Files: $(ls "$OUTPUT_DIR" | wc -l)"
    echo "   Size: $(du -sh "$OUTPUT_DIR" | cut -f1)"
fi