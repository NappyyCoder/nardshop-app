# Quick Start: WordPress Integration

## 1. Set Up Environment Variables

Create a `.env` file in your project root with:

```env
VITE_WORDPRESS_URL=https://your-wordpress-site.com/wp-json/wc/v3
VITE_WORDPRESS_CONSUMER_KEY=your_consumer_key_here
VITE_WORDPRESS_CONSUMER_SECRET=your_consumer_secret_here
```

Replace `your-wordpress-site.com` with your actual WordPress domain.

## 2. WordPress Setup

### Install WooCommerce
1. Install WooCommerce plugin in WordPress
2. Complete the WooCommerce setup wizard
3. Add your products with images and pricing

### Configure Products
- Set featured images for each product
- Add product descriptions
- Set prices using WooCommerce price fields
- Create categories: "Regular Products" and "Limited Time"

## 3. Test the Integration

1. Start your React app: `npm run dev`
2. Check browser console for any errors
3. Verify products load from WordPress
4. Test product details and cart functionality

## 4. Troubleshooting

If products don't load:
1. Check your WordPress URL in `.env`
2. Test WordPress API directly: `https://your-site.com/wp-json/wp/v2/products`
3. Check browser console for CORS errors
4. Verify WooCommerce is properly configured

## 5. Next Steps

- Customize product fields in `src/services/wordpressApi.js`
- Add authentication if needed
- Configure caching for better performance
- Set up proper error handling for production

For detailed setup instructions, see `WORDPRESS_SETUP.md`.
