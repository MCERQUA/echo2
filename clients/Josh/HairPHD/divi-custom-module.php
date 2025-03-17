<?php
/**
 * Plugin Name: HairPHD Nail Polish Display
 * Plugin URI: https://github.com/MCERQUA/ECHO2/tree/main/clients/Josh/HairPHD
 * Description: Custom Divi module for displaying nail polish colors with filtering and search functionality
 * Version: 1.0
 * Author: Echo AI Systems
 * Author URI: https://echoai.systems
 */

if (!defined('ABSPATH')) exit; // Exit if accessed directly

/**
 * Register the custom module
 */
function hairphd_nail_polish_register_modules() {
    if (class_exists('ET_Builder_Module')) {
        include_once('class-hairphd-nail-polish-module.php');
    }
}
add_action('et_builder_ready', 'hairphd_nail_polish_register_modules');

/**
 * Create custom Divi module
 */
class HAIRPHD_Nail_Polish_Module extends ET_Builder_Module {

    public $slug = 'hairphd_nail_polish_display';
    public $vb_support = 'on';

    public function init() {
        $this->name = esc_html__('Nail Polish Display', 'hairphd-module');
        $this->icon = 'H';
        $this->main_css_element = '%%order_class%%';
    }

    public function get_fields() {
        return array(
            'show_brand_tabs' => array(
                'label' => esc_html__('Show Brand Tabs', 'hairphd-module'),
                'type' => 'yes_no_button',
                'options' => array(
                    'on' => esc_html__('Yes', 'hairphd-module'),
                    'off' => esc_html__('No', 'hairphd-module'),
                ),
                'default' => 'on',
                'description' => esc_html__('Enable or disable brand tabs at the top.', 'hairphd-module'),
            ),
            'primary_brand_color' => array(
                'label' => esc_html__('Primary Brand Color', 'hairphd-module'),
                'type' => 'color-alpha',
                'default' => '#e50000',
                'description' => esc_html__('Choose the main color for active tabs and buttons.', 'hairphd-module'),
            ),
            'secondary_color' => array(
                'label' => esc_html__('Secondary Color', 'hairphd-module'),
                'type' => 'color-alpha',
                'default' => '#333333',
                'description' => esc_html__('Choose the secondary color for text and accents.', 'hairphd-module'),
            ),
            'background_color' => array(
                'label' => esc_html__('Background Color', 'hairphd-module'),
                'type' => 'color-alpha',
                'default' => '#ffffff',
                'description' => esc_html__('Choose the background color for the module.', 'hairphd-module'),
            ),
            'custom_css' => array(
                'label' => esc_html__('Custom CSS', 'hairphd-module'),
                'type' => 'text',
                'option_category' => 'basic_option',
                'description' => esc_html__('Enter custom CSS for additional styling.', 'hairphd-module'),
            ),
        );
    }

    public function render($attrs, $content = null, $render_slug) {
        // Get attributes
        $show_brand_tabs = $this->props['show_brand_tabs'] === 'on';
        $primary_color = $this->props['primary_brand_color'];
        $secondary_color = $this->props['secondary_color'];
        $background_color = $this->props['background_color'];
        $custom_css = $this->props['custom_css'];
        
        // Inline CSS for custom colors
        $custom_style = "<style>
            .color-gallery-container { background-color: {$background_color}; }
            .brand-tab.active { background-color: {$primary_color}; }
            .filter-btn:hover, .filter-btn.active { background-color: {$secondary_color}; }
            {$custom_css}
        </style>";
        
        // Load the main component HTML
        ob_start();
        include(plugin_dir_path(__FILE__) . 'nail-polish-display.html');
        $output = ob_get_clean();
        
        // Insert custom styles
        $output = $custom_style . $output;
        
        // Hide brand tabs if disabled
        if (!$show_brand_tabs) {
            $output = str_replace('<div class="brand-tabs">', '<div class="brand-tabs" style="display:none;">', $output);
        }
        
        return $output;
    }
}

/**
 * Register shortcode for non-Divi use
 */
function hairphd_nail_colors_shortcode() {
    ob_start();
    include(plugin_dir_path(__FILE__) . 'nail-polish-display.html');
    return ob_get_clean();
}
add_shortcode('hairphd_nail_colors', 'hairphd_nail_colors_shortcode');

/**
 * Enqueue scripts and styles if needed
 */
function hairphd_nail_polish_enqueue_scripts() {
    wp_enqueue_style(
        'hairphd-nail-polish-styles',
        plugin_dir_url(__FILE__) . 'css/styles.css',
        array(),
        '1.0.0'
    );
}
add_action('wp_enqueue_scripts', 'hairphd_nail_polish_enqueue_scripts');
