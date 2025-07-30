# Quick Sumagoo Homepage Image Downloader
# Downloads known images from Sumagoo homepage to Nick's safety folder

# Configuration
$BaseUrl = "https://sumagoo.com"
$OutputDir = "/mnt/e/1-CLAUDE-CODE-PROJECTS/echo2/clients/NICK/safety/sumagoo-products"
$UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"

# Create output directory
if (!(Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force
    Write-Host "Created directory: $OutputDir" -ForegroundColor Green
}

# Function to download image
function Download-Image {
    param(
        [string]$Url,
        [string]$Filename
    )
    
    try {
        $FilePath = Join-Path $OutputDir $Filename
        
        if (Test-Path $FilePath) {
            Write-Host "  Skipped (exists): $Filename" -ForegroundColor Yellow
            return $false
        }
        
        Write-Host "Downloading: $Url" -ForegroundColor Cyan
        
        $WebClient = New-Object System.Net.WebClient
        $WebClient.Headers.Add("User-Agent", $UserAgent)
        $WebClient.DownloadFile($Url, $FilePath)
        $WebClient.Dispose()
        
        Write-Host "  Saved: $Filename" -ForegroundColor Green
        return $true
        
    } catch {
        Write-Host "  Failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

Write-Host "Sumagoo Homepage Image Downloader" -ForegroundColor Magenta
Write-Host "=" * 40 -ForegroundColor Magenta

$DownloadCount = 0

# Common image extensions and paths to try
$CommonPaths = @(
    "/wp-content/uploads/2024/",
    "/wp-content/uploads/2023/",
    "/images/",
    "/assets/",
    "/media/"
)

$CommonNames = @(
    "safety-equipment",
    "protective-gear",
    "safety-vest",
    "hard-hat",
    "safety-glasses",
    "work-boots",
    "gloves",
    "helmet",
    "respirator",
    "harness"
)

$Extensions = @(".jpg", ".jpeg", ".png", ".webp")

# Try homepage first
try {
    Write-Host "`nChecking homepage for images..." -ForegroundColor Yellow
    
    $WebRequest = Invoke-WebRequest -Uri $BaseUrl -UserAgent $UserAgent -TimeoutSec 30
    $Content = $WebRequest.Content
    
    # Simple regex to find image sources
    $ImageMatches = [regex]::Matches($Content, 'src="([^"]+\.(?:jpg|jpeg|png|gif|webp))"', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    
    $UniqueImages = @()
    foreach ($Match in $ImageMatches) {
        $ImageUrl = $Match.Groups[1].Value
        
        if ($ImageUrl.StartsWith('/')) {
            $ImageUrl = $BaseUrl + $ImageUrl
        } elseif ($ImageUrl.StartsWith('//')) {
            $ImageUrl = "https:" + $ImageUrl
        }
        
        if ($ImageUrl -notin $UniqueImages -and $ImageUrl -notmatch '(logo|icon|favicon)') {
            $UniqueImages += $ImageUrl
        }
    }
    
    Write-Host "Found $($UniqueImages.Count) unique images on homepage" -ForegroundColor Green
    
    $Counter = 1
    foreach ($ImageUrl in $UniqueImages) {
        $Extension = [System.IO.Path]::GetExtension($ImageUrl)
        $Filename = "homepage_$Counter$Extension"
        
        if (Download-Image -Url $ImageUrl -Filename $Filename) {
            $DownloadCount++
        }
        
        $Counter++
        Start-Sleep -Milliseconds 500
    }
    
} catch {
    Write-Host "Error accessing homepage: $($_.Exception.Message)" -ForegroundColor Red
}

# Try common product image combinations
Write-Host "`nTrying common safety product image URLs..." -ForegroundColor Yellow

foreach ($Path in $CommonPaths) {
    foreach ($Name in $CommonNames) {
        foreach ($Ext in $Extensions) {
            $TestUrl = "$BaseUrl$Path$Name$Ext"
            
            try {
                # Test if URL exists
                $Response = Invoke-WebRequest -Uri $TestUrl -Method Head -UserAgent $UserAgent -TimeoutSec 5 -ErrorAction Stop
                
                if ($Response.StatusCode -eq 200) {
                    $Filename = "$Name$Ext"
                    if (Download-Image -Url $TestUrl -Filename $Filename) {
                        $DownloadCount++
                    }
                }
                
            } catch {
                # Silently continue
            }
            
            Start-Sleep -Milliseconds 100
        }
    }
}

Write-Host "`n$('=' * 40)" -ForegroundColor Magenta
Write-Host "Quick download complete!" -ForegroundColor Green
Write-Host "Images downloaded: $DownloadCount" -ForegroundColor Green
Write-Host "Images saved to: $OutputDir" -ForegroundColor Green
Write-Host "`nFor more comprehensive downloading, use the Python script." -ForegroundColor Cyan