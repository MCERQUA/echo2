# Sumagoo Product Image Downloader - PowerShell Version
# Downloads images from Sumagoo website to Nick's safety folder

# Configuration
$BaseUrl = "https://sumagoo.com"
$OutputDir = "/mnt/e/1-CLAUDE-CODE-PROJECTS/echo2/clients/NICK/safety/sumagoo-products"
$UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"

# Create output directory
if (!(Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force
    Write-Host "Created directory: $OutputDir" -ForegroundColor Green
}

# Function to download a single image
function Download-Image {
    param(
        [string]$Url,
        [string]$Filename
    )
    
    try {
        $FilePath = Join-Path $OutputDir $Filename
        
        # Skip if file already exists
        if (Test-Path $FilePath) {
            Write-Host "  Skipped (already exists): $Filename" -ForegroundColor Yellow
            return $true
        }
        
        Write-Host "Downloading: $Url" -ForegroundColor Cyan
        
        # Download with PowerShell
        $WebClient = New-Object System.Net.WebClient
        $WebClient.Headers.Add("User-Agent", $UserAgent)
        $WebClient.DownloadFile($Url, $FilePath)
        $WebClient.Dispose()
        
        Write-Host "  Saved: $Filename" -ForegroundColor Green
        return $true
        
    } catch {
        Write-Host "  Error downloading $Url : $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Function to get safe filename
function Get-SafeFilename {
    param(
        [string]$Url,
        [string]$Prefix = ""
    )
    
    $Uri = [System.Uri]$Url
    $Filename = [System.IO.Path]::GetFileName($Uri.LocalPath)
    
    if ([string]::IsNullOrEmpty($Filename) -or !$Filename.Contains('.')) {
        $Hash = $Url.GetHashCode()
        $Filename = "image_$([Math]::Abs($Hash) % 10000).jpg"
    }
    
    # Clean filename
    $Filename = $Filename -replace '[^\w\-_\.]', '_'
    
    if ($Prefix) {
        $Filename = "${Prefix}_$Filename"
    }
    
    return $Filename
}

# Try common product image URL patterns
$ImagePatterns = @(
    "/wp-content/uploads/",
    "/images/products/",
    "/assets/images/",
    "/media/catalog/product/",
    "/uploads/products/",
    "/static/images/"
)

Write-Host "Sumagoo Image Downloader (PowerShell)" -ForegroundColor Magenta
Write-Host "=" * 50 -ForegroundColor Magenta

$TotalDownloaded = 0

# Try to scrape homepage for images
try {
    Write-Host "`nFetching homepage..." -ForegroundColor Yellow
    
    $WebRequest = Invoke-WebRequest -Uri $BaseUrl -UserAgent $UserAgent -TimeoutSec 30
    $Content = $WebRequest.Content
    
    # Extract image URLs using regex
    $ImageRegex = 'src\s*=\s*["\']([^"\']+\.(jpg|jpeg|png|gif|webp))["\']'
    $Matches = [regex]::Matches($Content, $ImageRegex, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    
    foreach ($Match in $Matches) {
        $ImageUrl = $Match.Groups[1].Value
        
        # Convert relative URLs to absolute
        if ($ImageUrl.StartsWith('//')) {
            $ImageUrl = "https:$ImageUrl"
        } elseif ($ImageUrl.StartsWith('/')) {
            $ImageUrl = "$BaseUrl$ImageUrl"
        } elseif (!$ImageUrl.StartsWith('http')) {
            $ImageUrl = "$BaseUrl/$ImageUrl"
        }
        
        # Skip logos and icons
        if ($ImageUrl -match '(logo|icon|favicon)') {
            continue
        }
        
        $Filename = Get-SafeFilename -Url $ImageUrl -Prefix "homepage"
        
        if (Download-Image -Url $ImageUrl -Filename $Filename) {
            $TotalDownloaded++
        }
        
        Start-Sleep -Milliseconds 500
    }
    
} catch {
    Write-Host "Error fetching homepage: $($_.Exception.Message)" -ForegroundColor Red
}

# Try common product image URLs
Write-Host "`nTrying common product image patterns..." -ForegroundColor Yellow

$ProductNumbers = 1..50
foreach ($ProductNumber in $ProductNumbers) {
    foreach ($Pattern in $ImagePatterns) {
        $TestUrls = @(
            "$BaseUrl$Pattern/product-$ProductNumber.jpg",
            "$BaseUrl$Pattern/product_$ProductNumber.jpg",
            "$BaseUrl$Pattern/$ProductNumber.jpg",
            "$BaseUrl$Pattern/safety-$ProductNumber.jpg",
            "$BaseUrl$Pattern/equipment-$ProductNumber.jpg"
        )
        
        foreach ($TestUrl in $TestUrls) {
            try {
                $Response = Invoke-WebRequest -Uri $TestUrl -Method Head -UserAgent $UserAgent -TimeoutSec 10 -ErrorAction Stop
                
                if ($Response.StatusCode -eq 200) {
                    $Filename = Get-SafeFilename -Url $TestUrl -Prefix "product"
                    
                    if (Download-Image -Url $TestUrl -Filename $Filename) {
                        $TotalDownloaded++
                    }
                }
                
            } catch {
                # Silently continue if URL doesn't exist
            }
            
            Start-Sleep -Milliseconds 200
        }
    }
}

Write-Host "`n$('=' * 50)" -ForegroundColor Magenta
Write-Host "Download complete!" -ForegroundColor Green
Write-Host "Total images downloaded: $TotalDownloaded" -ForegroundColor Green
Write-Host "Images saved to: $OutputDir" -ForegroundColor Green