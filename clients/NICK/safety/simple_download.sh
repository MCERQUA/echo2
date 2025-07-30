#!/bin/bash

BASE_URL="https://sumagoo.com"
OUTPUT_DIR="/mnt/e/1-CLAUDE-CODE-PROJECTS/echo2/clients/NICK/safety/sumagoo-products"
USER_AGENT="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"

echo "Sumagoo Image Downloader"
echo "========================"

mkdir -p "$OUTPUT_DIR"
echo "Created directory: $OUTPUT_DIR"

echo "Fetching homepage..."
curl -L -A "$USER_AGENT" "$BASE_URL" --silent --max-time 30 > /tmp/sumagoo_homepage.html

if [ $? -eq 0 ]; then
    echo "Homepage fetched successfully"
    
    echo "Extracting image URLs..."
    grep -oE 'src="[^"]*\.(jpg|jpeg|png|gif|webp)"' /tmp/sumagoo_homepage.html | sed 's/src="//g' | sed 's/"//g' > /tmp/image_urls.txt
    
    counter=1
    download_count=0
    
    while read -r img_url; do
        if echo "$img_url" | grep -qE "(logo|icon|favicon)"; then
            continue
        fi
        
        if [[ $img_url == /* ]]; then
            img_url="${BASE_URL}${img_url}"
        elif [[ $img_url == //* ]]; then
            img_url="https:${img_url}"
        fi
        
        ext="${img_url##*.}"
        filename="homepage_${counter}.${ext}"
        filepath="$OUTPUT_DIR/$filename"
        
        if [ ! -f "$filepath" ]; then
            echo "Downloading: $img_url"
            if curl -L -A "$USER_AGENT" -o "$filepath" "$img_url" --silent --fail --max-time 30; then
                echo "  Saved: $filename"
                ((download_count++))
            else
                echo "  Failed: $img_url"
                [ -f "$filepath" ] && rm "$filepath"
            fi
        else
            echo "  Skipped (exists): $filename"
        fi
        
        ((counter++))
        sleep 0.5
    done < /tmp/image_urls.txt
    
    echo "========================"
    echo "Download complete!"
    echo "Total images downloaded: $download_count"
    echo "Images saved to: $OUTPUT_DIR"
    
    if [ $download_count -gt 0 ]; then
        echo ""
        echo "Downloaded files:"
        ls -la "$OUTPUT_DIR"
    fi
    
    rm -f /tmp/sumagoo_homepage.html /tmp/image_urls.txt
else
    echo "Failed to fetch homepage"
fi