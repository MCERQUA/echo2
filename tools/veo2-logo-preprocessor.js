/**
 * Veo2 Logo Preprocessing Script
 * Automatically adds canvas padding to logos before Veo2 video generation
 * Solves the zoom-in issue by giving logos proper breathing room
 * 
 * Usage:
 * - Can be used with file system images
 * - Integrates with existing Veo2 workflow
 * - Supports batch processing
 */

class LogoPreprocessor {
    constructor(options = {}) {
        this.defaultSettings = {
            padding: 50,           // Percentage of logo size to add as padding
            backgroundColor: 'white', // 'white', 'black', 'gray', or hex color
            outputFormat: 'png',   // 'png', 'jpg', 'webp'
            canvasSize: 'auto',    // 'auto', '1080', '1920x1080', '1080x1920'
            quality: 0.9           // For JPEG compression
        };
        
        this.settings = { ...this.defaultSettings, ...options };
    }

    /**
     * Process a single image and return canvas with expanded background
     */
    async processImage(imageElement, customSettings = {}) {
        const settings = { ...this.settings, ...customSettings };
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Calculate canvas dimensions
        const { width: canvasWidth, height: canvasHeight } = this.calculateCanvasDimensions(
            imageElement.width, 
            imageElement.height, 
            settings
        );

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // Fill background
        ctx.fillStyle = this.getBackgroundColor(settings.backgroundColor);
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Calculate logo placement (centered with proper scaling)
        const logoPlacement = this.calculateLogoPlacement(
            imageElement.width,
            imageElement.height,
            canvasWidth,
            canvasHeight,
            settings
        );

        // Draw the logo
        ctx.drawImage(
            imageElement,
            logoPlacement.x,
            logoPlacement.y,
            logoPlacement.width,
            logoPlacement.height
        );

        return canvas;
    }

    /**
     * Calculate optimal canvas dimensions based on settings
     */
    calculateCanvasDimensions(imgWidth, imgHeight, settings) {
        switch (settings.canvasSize) {
            case '1080':
                return { width: 1080, height: 1080 };
            
            case '1920x1080':
                return { width: 1920, height: 1080 };
            
            case '1080x1920':
                return { width: 1080, height: 1920 };
            
            case 'auto':
            default:
                const paddingMultiplier = 1 + (settings.padding / 100);
                return {
                    width: Math.round(imgWidth * paddingMultiplier),
                    height: Math.round(imgHeight * paddingMultiplier)
                };
        }
    }

    /**
     * Calculate logo placement to center it properly
     */
    calculateLogoPlacement(imgWidth, imgHeight, canvasWidth, canvasHeight, settings) {
        // Logo should take maximum 70% of canvas to ensure proper padding
        const maxLogoWidth = canvasWidth * 0.7;
        const maxLogoHeight = canvasHeight * 0.7;
        
        // Calculate scale to fit logo within bounds while maintaining aspect ratio
        const scaleX = maxLogoWidth / imgWidth;
        const scaleY = maxLogoHeight / imgHeight;
        const scale = Math.min(scaleX, scaleY);
        
        const logoWidth = imgWidth * scale;
        const logoHeight = imgHeight * scale;
        
        // Center the logo
        const x = (canvasWidth - logoWidth) / 2;
        const y = (canvasHeight - logoHeight) / 2;
        
        return { x, y, width: logoWidth, height: logoHeight };
    }

    /**
     * Get background color value
     */
    getBackgroundColor(colorName) {
        const colorMap = {
            'white': '#FFFFFF',
            'black': '#2C3E50',
            'gray': '#95A5A6',
            'transparent': 'rgba(0,0,0,0)'
        };
        
        return colorMap[colorName] || colorName; // Return hex color if provided
    }

    /**
     * Convert canvas to blob for download/upload
     */
    async canvasToBlob(canvas, settings = {}) {
        const finalSettings = { ...this.settings, ...settings };
        const mimeType = this.getMimeType(finalSettings.outputFormat);
        
        return new Promise((resolve) => {
            canvas.toBlob(resolve, mimeType, finalSettings.quality);
        });
    }

    /**
     * Get MIME type for output format
     */
    getMimeType(format) {
        const mimeTypes = {
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'webp': 'image/webp'
        };
        
        return mimeTypes[format] || 'image/png';
    }

    /**
     * Process multiple images in batch
     */
    async processBatch(imageFiles, progressCallback = null) {
        const results = [];
        
        for (let i = 0; i < imageFiles.length; i++) {
            try {
                const img = await this.loadImage(imageFiles[i]);
                const canvas = await this.processImage(img);
                const blob = await this.canvasToBlob(canvas);
                
                results.push({
                    originalFile: imageFiles[i],
                    processedCanvas: canvas,
                    processedBlob: blob,
                    fileName: this.generateFileName(imageFiles[i].name)
                });
                
                if (progressCallback) {
                    progressCallback(i + 1, imageFiles.length, imageFiles[i].name);
                }
            } catch (error) {
                console.error(`Error processing ${imageFiles[i].name}:`, error);
                results.push({
                    originalFile: imageFiles[i],
                    error: error.message
                });
            }
        }
        
        return results;
    }

    /**
     * Load image file as Image element
     */
    loadImage(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            
            if (file instanceof File) {
                const reader = new FileReader();
                reader.onload = (e) => img.src = e.target.result;
                reader.readAsDataURL(file);
            } else {
                img.src = file; // Assume it's a URL
            }
        });
    }

    /**
     * Generate processed file name
     */
    generateFileName(originalName) {
        const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
        const extension = this.settings.outputFormat === 'jpg' ? 'jpg' : 'png';
        return `${nameWithoutExt}_veo2_ready.${extension}`;
    }

    /**
     * Create download link for processed image
     */
    downloadProcessedImage(canvas, originalFileName) {
        const blob = this.canvasToBlob(canvas);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.href = url;
        link.download = this.generateFileName(originalFileName);
        link.click();
        
        URL.revokeObjectURL(url);
    }

    /**
     * Get optimal settings for different logo types
     */
    static getPresetSettings(logoType) {
        const presets = {
            'social-media': {
                padding: 40,
                backgroundColor: 'white',
                canvasSize: '1080',
                outputFormat: 'png'
            },
            'website-hero': {
                padding: 60,
                backgroundColor: 'white',
                canvasSize: '1920x1080',
                outputFormat: 'png'
            },
            'mobile-video': {
                padding: 50,
                backgroundColor: 'black',
                canvasSize: '1080x1920',
                outputFormat: 'png'
            },
            'professional': {
                padding: 55,
                backgroundColor: 'white',
                canvasSize: 'auto',
                outputFormat: 'png'
            }
        };
        
        return presets[logoType] || presets['professional'];
    }
}

/**
 * Veo2 Integration Helper
 * Provides methods to integrate with the Veo2 video generation workflow
 */
class Veo2LogoIntegration {
    constructor(preprocessor) {
        this.preprocessor = preprocessor;
    }

    /**
     * Prepare logo for Veo2 video generation
     * Returns blob ready for upload to Veo2
     */
    async prepareLogoForVeo2(logoFile, videoType = 'professional') {
        const settings = LogoPreprocessor.getPresetSettings(videoType);
        const img = await this.preprocessor.loadImage(logoFile);
        const canvas = await this.preprocessor.processImage(img, settings);
        const blob = await this.preprocessor.canvasToBlob(canvas, settings);
        
        return {
            blob: blob,
            canvas: canvas,
            fileName: this.preprocessor.generateFileName(logoFile.name),
            settings: settings
        };
    }

    /**
     * Batch prepare logos for Veo2 campaign
     */
    async prepareBatchForVeo2(logoFiles, videoType = 'professional', progressCallback = null) {
        const settings = LogoPreprocessor.getPresetSettings(videoType);
        const preprocessor = new LogoPreprocessor(settings);
        
        return await preprocessor.processBatch(logoFiles, progressCallback);
    }

    /**
     * Generate Veo2 prompts optimized for preprocessed logos
     */
    generateVeo2Prompts(logoName, style = 'professional') {
        const prompts = {
            'professional': [
                `Professional ${logoName} logo animation with subtle glow effect, smooth rotation, clean corporate presentation style, white background`,
                `${logoName} logo with elegant fade-in animation, minimal movement, business presentation quality, centered composition`
            ],
            'dynamic': [
                `Dynamic ${logoName} logo animation with energy effects, bold movement, engaging presentation style`,
                `${logoName} logo with powerful zoom and glow effects, modern style, high impact animation`
            ],
            'social-media': [
                `${logoName} logo optimized for social media, quick engaging animation, eye-catching movement`,
                `Social media ready ${logoName} logo with modern animation style, mobile-friendly presentation`
            ]
        };
        
        return prompts[style] || prompts['professional'];
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LogoPreprocessor, Veo2LogoIntegration };
}

// Example usage:
/*
// Initialize preprocessor
const preprocessor = new LogoPreprocessor({
    padding: 60,
    backgroundColor: 'white',
    outputFormat: 'png'
});

// Process single logo
const logoFile = // ... your logo file
const img = await preprocessor.loadImage(logoFile);
const processedCanvas = await preprocessor.processImage(img);
preprocessor.downloadProcessedImage(processedCanvas, logoFile.name);

// Batch process for Veo2
const integration = new Veo2LogoIntegration(preprocessor);
const preparedLogos = await integration.prepareBatchForVeo2(logoFiles, 'professional');

// Each prepared logo is now ready for Veo2 video generation
preparedLogos.forEach(logo => {
    if (!logo.error) {
        // Use logo.blob with Veo2 API
        console.log(`Ready for Veo2: ${logo.fileName}`);
    }
});
*/