// Reads products from the public WooCommerce Store API. It needs no API keys,
// so nothing secret ships to the browser. Never put WooCommerce keys in a VITE_ variable.

const STORE_API = import.meta.env.DEV
  ? '/wp-json/wc/store/v1'
  : import.meta.env.VITE_STORE_API_URL || 'https://nardshop.com/wp-json/wc/store/v1';

const PER_PAGE = 100;

const toText = (html = '') => {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
};

class WordPressAPI {
  constructor() {
    this.baseUrl = STORE_API;
  }

  async request(path) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  }

  async getProducts() {
    try {
      const products = [];
      let page = 1;
      let totalPages = 1;
      do {
        const response = await this.request(`/products?per_page=${PER_PAGE}&page=${page}`);
        totalPages = Number(response.headers.get('X-WP-TotalPages')) || 1;
        products.push(...(await response.json()));
        page += 1;
      } while (page <= totalPages);
      return this.transformProducts(products);
    } catch (error) {
      console.error('Error fetching products from WordPress:', error);
      throw error;
    }
  }

  async getProduct(id) {
    try {
      const response = await this.request(`/products/${id}`);
      return this.transformProduct(await response.json());
    } catch (error) {
      console.error('Error fetching product from WordPress:', error);
      throw error;
    }
  }

  transformProducts(products) {
    return products.map((product) => this.transformProduct(product));
  }

  transformProduct(wcProduct) {
    const images = this.extractImages(wcProduct);

    return {
      id: wcProduct.id,
      name: toText(wcProduct.name) || 'Untitled Product',
      description: this.extractDescription(wcProduct),
      price: this.extractPrice(wcProduct),
      image: images.length > 0 ? images[0] : '/placeholder-image.jpg',
      images,
      sizes: this.extractSizes(wcProduct),
      isLimitedTime: this.isLimitedTimeProduct(wcProduct),
      stockStatus: wcProduct.is_in_stock === false ? 'outofstock' : 'instock',
      categories: wcProduct.categories || [],
      sku: wcProduct.sku || '',
      permalink: wcProduct.permalink || '',
      type: wcProduct.type || 'simple',
    };
  }

  extractImages(wcProduct) {
    return (wcProduct.images || []).map((img) => img.src).filter(Boolean);
  }

  extractPrice(wcProduct) {
    const prices = wcProduct.prices;
    if (!prices || prices.price === undefined) return 0;
    const minor = Number(prices.currency_minor_unit ?? 2);
    return Number(prices.price) / 10 ** minor;
  }

  extractSizes(wcProduct) {
    const sizeAttribute = (wcProduct.attributes || []).find(
      (attr) => attr.name?.toLowerCase() === 'size' || attr.taxonomy === 'pa_size',
    );
    const terms = sizeAttribute?.terms || [];

    if (terms.length === 0) {
      return ['S', 'M', 'L', 'XL', '2XL'].map((size) => ({ size, inStock: true }));
    }

    return terms.map((term) => ({ size: toText(term.name), inStock: true }));
  }

  extractDescription(wcProduct) {
    const short = toText(wcProduct.short_description);
    if (short) return short;
    const full = toText(wcProduct.description);
    if (full) return full.length > 200 ? `${full.substring(0, 200)}...` : full;
    return 'No description available';
  }

  isLimitedTimeProduct(wcProduct) {
    const limitedTimeCategories = ['limited-time', 'limited-edition', 'special'];
    return (wcProduct.categories || []).some((category) => limitedTimeCategories.includes(category.slug));
  }
}

export default new WordPressAPI();
