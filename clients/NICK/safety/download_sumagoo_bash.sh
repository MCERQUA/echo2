#!/bin/bash

# Sumagoo Image Downloader - Bash Version
# Downloads images from Sumagoo website to Nick's safety folder

BASE_URL="https://sumagoo.com"
OUTPUT_DIR="/mnt/e/1-CLAUDE-CODE-PROJECTS/echo2/clients/NICK/safety/sumagoo-products"
USER_AGENT="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"

echo "Sumagoo Image Downloader (Bash)"
echo "================================"

# Create output directory
mkdir -p "$OUTPUT_DIR"
echo "Created directory: $OUTPUT_DIR"

# Function to download image
download_image() {
    local url="$1"
    local filename="$2"
    local filepath="$OUTPUT_DIR/$filename"
    
    # Skip if file already exists
    if [ -f "$filepath" ]; then
        echo "  Skipped (exists): $filename"
        return 1
    fi
    
    echo "Downloading: $url"
    
    # Download with curl
    if curl -L -A "$USER_AGENT" -o "$filepath" "$url" --silent --fail --max-time 30; then
        echo "  Saved: $filename"
        return 0
    else
        echo "  Failed to download: $url"
        [ -f "$filepath" ] && rm "$filepath"  # Remove failed download
        return 1
    fi
}

# Download homepage and extract image URLs
echo -e "\nFetching homepage..."
HOMEPAGE_CONTENT=$(curl -L -A "$USER_AGENT" "$BASE_URL" --silent --max-time 30)

if [ $? -eq 0 ] && [ -n "$HOMEPAGE_CONTENT" ]; then
    echo "Homepage fetched successfully"
    
    # Extract image URLs using grep and sed
    IMAGE_URLS=$(echo "$HOMEPAGE_CONTENT" | grep -oE 'src="[^"]*\.(jpg|jpeg|png|gif|webp)"' | sed 's/src="//g' | sed 's/"//g')
    
    counter=1
    download_count=0
    
    echo -e "\nDownloading homepage images..."
    
    for img_url in $IMAGE_URLS; do
        # Skip logos and icons
        if echo "$img_url" | grep -qE "(logo|icon|favicon)"; then
            continue
        fi
        
        # Convert relative URLs to absolute
        if [[ $img_url == /* ]]; then
            img_url="${BASE_URL}${img_url}"
        elif [[ $img_url == //* ]]; then
            img_url="https:${img_url}"
        fi
        
        # Get file extension
        ext="${img_url##*.}"
        filename="homepage_${counter}.${ext}"
        
        if download_image "$img_url" "$filename"; then
            ((download_count++))
        fi
        
        ((counter++))
        sleep 0.5  # Be respectful to the server
    done
    
else
    echo "Failed to fetch homepage"
fi

# Try some common product image patterns
echo -e "\nTrying common product image URLs..."

# Common paths and names
paths=("/wp-content/uploads/2024/" "/wp-content/uploads/2023/" "/images/" "/assets/" "/media/")
names=("safety-equipment" "protective-gear" "safety-vest" "hard-hat" "safety-glasses" "work-boots" "gloves" "helmet" "respirator" "harness")
extensions=("jpg" "jpeg" "png" "webp")

pattern_download_count=0

for path in "${paths[@]}"; do
    for name in "${names[@]}"; do
        for ext in "${extensions[@]}"; do
            test_url="${BASE_URL}${path}${name}.${ext}"
            filename="${name}.${ext}"
            
            # Test if URL exists (HEAD request)
            if curl -I -L -A "$USER_AGENT" "$test_url" --silent --fail --max-time 10 > /dev/null 2>&1; then
                if download_image "$test_url" "$filename"; then
                    ((pattern_download_count++))
                fi
            fi
            
            sleep 0.1
        done
    done
done

total_downloaded=$((download_count + pattern_download_count))

echo -e "\n================================"
echo "Download complete!"
echo "Total images downloaded: $total_downloaded"
echo "Images saved to: $OUTPUT_DIR"

# List downloaded files
if [ $total_downloaded -gt 0 ]; then
    echo -e "\nDownloaded files:"
    ls -la "$OUTPUT_DIR"
fi