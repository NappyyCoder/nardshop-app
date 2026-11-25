# WordPress Integration Setup Guide

This guide will help you connect your React e-commerce app to your WordPress site so that products, images, and pricing sync automatically.

## Prerequisites

1. A WordPress site with WooCommerce installed
2. WordPress REST API enabled (usually enabled by default)
3. Your React app deployed and accessible

## Step 1: WordPress Configuration

### 1.1 Install Required Plugins

Install these WordPress plugins if you don't have them:

- **WooCommerce** - For e-commerce functionality
- **Advanced Custom Fields (ACF)** - For custom product fields (optional but recommended)
- **WooCommerce REST API** - Usually included with WooCommerce

### 1.2 Configure WooCommerce Settings

1. Go to **WooCommerce > Settings > Advanced > REST API**
2. Create a new API key with read permissions
3. Note down the Consumer Key and Consumer Secret

### 1.3 Set Up Product Categories

Create these categories in WordPress:
- **Regular Products** - For standard products
- **Limited Time** - For limited edition products
- **Limited Edition** - Alternative category for limited products

### 1.4 Configure Product Fields

For each product, ensure you have:

**Required Fields:**
- Product Name
- Price (using WooCommerce price field)
- Featured Image
- Product Gallery (optional)

**Optional Custom Fields (using ACF):**
- `sizes` - Array of size options with stock status
- `limited_time` - Boolean field for limited time products
- `product_description` - Custom description field

## Step 2: React App Configuration

### 2.1 Environment Variables

Create a `.env` file in your React app root directory:

```env
# WordPress Configuration
REACT_APP_WORDPRESS_URL=https://your-wordpress-site.com/wp-json/wp/v2

# Optional: Authentication (if your WordPress requires it)
REACT_APP_WORDPRESS_USERNAME=your_username
REACT_APP_WORDPRESS_PASSWORD=your_password
```

### 2.2 Update WordPress API Service

The `wordpressApi.js` file is already configured to work with standard WooCommerce products. You may need to adjust the field mappings based on your specific WordPress setup.

## Step 3: WordPress Product Setup

### 3.1 Product Structure

Each product in WordPress should have:

1. **Basic Information:**
   - Title
   - Description
   - Price
   - Featured Image

2. **Product Attributes:**
   - Size variations (if applicable)
   - Stock status for each variation

3. **Categories:**
   - Assign to "Regular Products" or "Limited Time" category

### 3.2 Image Setup

- Upload high-quality product images
- Set a featured image for each product
- Add gallery images if you have multiple product photos
- Ensure images are optimized for web (recommended: 800x800px or larger)

### 3.3 Pricing Setup

- Set regular price in WooCommerce
- Use WooCommerce sale price for discounts
- Ensure prices are in your desired currency

## Step 4: Testing the Integration

### 4.1 Test WordPress API

Test your WordPress REST API by visiting:
```
https://your-wordpress-site.com/wp-json/wp/v2/products
```

You should see JSON data with your products.

### 4.2 Test React App

1. Start your React development server
2. Check the browser console for any errors
3. Verify that products load from WordPress
4. Test product details, cart functionality, etc.

## Step 5: Advanced Configuration

### 5.1 Custom Fields (ACF)

If you want to use custom fields, set up ACF with these field groups:

**Product Sizes:**
- Field Name: `sizes`
- Field Type: Repeater
- Sub-fields:
  - `size` (Text)
  - `in_stock` (True/False)

**Limited Time Flag:**
- Field Name: `limited_time`
- Field Type: True/False

### 5.2 Stock Management

Configure WooCommerce stock management:
1. Go to **WooCommerce > Settings > Products > Inventory**
2. Enable stock management
3. Set low stock threshold
4. Configure stock status display

### 5.3 SEO and Performance

- Install a caching plugin (WP Rocket, W3 Total Cache)
- Optimize images with a plugin like Smush
- Use a CDN for faster image delivery
- Enable GZIP compression

## Troubleshooting

### Common Issues:

1. **CORS Errors:**
   - Install a CORS plugin or add CORS headers to your WordPress site
   - Or configure your web server to allow cross-origin requests

2. **Authentication Issues:**
   - Check your API credentials
   - Ensure the API key has proper permissions

3. **Image Loading Issues:**
   - Check image URLs in the WordPress API response
   - Ensure images are publicly accessible
   - Check for SSL/HTTPS issues

4. **Product Data Issues:**
   - Verify product fields in WordPress
   - Check the data transformation in `wordpressApi.js`
   - Test the API endpoints directly

### Debug Mode:

Enable debug mode in your React app by adding to your `.env`:
```env
REACT_APP_DEBUG=true
```

This will show additional console logs for debugging.

## Security Considerations

1. **API Security:**
   - Use HTTPS for all API calls
   - Implement rate limiting on your WordPress site
   - Consider using JWT tokens for authentication

2. **Data Validation:**
   - Validate all data coming from WordPress
   - Sanitize user inputs
   - Implement proper error handling

## Maintenance

1. **Regular Updates:**
   - Keep WordPress and plugins updated
   - Monitor API performance
   - Check for broken product links

2. **Backup Strategy:**
   - Regular WordPress database backups
   - Backup product images
   - Test restore procedures

3. **Monitoring:**
   - Set up uptime monitoring for your WordPress site
   - Monitor API response times
   - Track product update frequency

## Support

If you encounter issues:

1. Check the browser console for JavaScript errors
2. Test the WordPress API endpoints directly
3. Verify your environment variables
4. Check WordPress error logs
5. Test with a simple product first

For additional help, refer to:
- WooCommerce REST API documentation
- WordPress REST API documentation
- React documentation for state management
