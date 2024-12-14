# PowerShell script to generate project structure for Echo1
# Generates a markdown file with the complete directory structure

$outputFile = "project-structure.md"

# Define directories and files to exclude
$excludePatterns = @(
    "*\node_modules\*",
    "*\.git\*",
    "*\__pycache__\*",
    "*\.pytest_cache\*",
    "project-structure.md",
    "*\.vscode\*"
)

# Add header with timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss.ff"
@"
# ECHO2 Project Structure

Last Updated: $timestamp

## Overview
This document provides a complete structure of the ECHO2 repository for Echo1's reference.

## Directory Tree
"@ | Out-File $outputFile -Encoding UTF8

# Function to get indentation string
function Get-Indent {
    param([int]$level)
    return "  " * $level
}

# Function to get relative path with proper indentation
function Get-FormattedPath {
    param($path)
    $relativePath = $path.FullName.Replace($pwd.Path + "\", "")
    $level = ($relativePath.Split("\")).Count - 1
    $indent = Get-Indent -level $level
    $name = Split-Path $relativePath -Leaf
    
    if ($path.PSIsContainer) {
        return "$indent📁 $name/"
    } else {
        $ext = [System.IO.Path]::GetExtension($name)
        $icon = switch ($ext) {
            ".md"     { "📝" }
            ".ps1"    { "⚡" }
            ".bat"    { "🔨" }
            ".py"     { "🐍" }
            ".json"   { "📊" }
            ".txt"    { "📄" }
            default   { "📎" }
        }
        return "$indent$icon $name"
    }
}

# Get all files and directories, excluding specified patterns
Get-ChildItem -Path . -Recurse -Force | 
    Where-Object { 
        $path = $_.FullName
        -not ($excludePatterns | Where-Object { $path -like $_ })
    } |
    ForEach-Object {
        Get-FormattedPath $_ | Add-Content $outputFile
    }

# Add footer
@"

## Notes
- 📁 Folders are marked with directory icon
- 📝 Markdown files
- ⚡ PowerShell scripts
- 🔨 Batch files
- 🐍 Python files
- 📊 JSON files
- 📄 Text files
- 📎 Other files

Generated for Echo1's reference
"@ | Add-Content $outputFile

Write-Host "Structure has been updated in project-structure.md"