/* SOLO catalogue. This is the single place to update products on the website.
   The 8 products below mirror lib/services/product_catalogue.dart in the SOLO Flutter app:
   same ids, titles, categories and Amazon links. Keep the two files in sync.
   Product images are local files in images/products. Price, original price, brand and rating are
   deliberately left empty and are never invented. Nothing on this website is live retailer data. */
window.SOLO_DATA = (() => {
  const RETAILER = 'Amazon';
  const AMAZON_LINKS_AFFILIATE_APPROVED = false;

  const entry = (id, title, category, url, extra = {}) => ({
    id, title, category, url, merchant: RETAILER, tags: [category], image: null, price: null, original: null, ...extra
  });

  const products = [
    entry('amz-mens-tshirt', "Men's White T-Shirt", 'Tops & T-Shirts', 'https://link.amazon/B07nuQ5DG', { image: 'images/products/amz-mens-tshirt.png' }),
    entry('amz-handbag', 'Handbag', 'Bags', 'https://link.amazon/B00XML9Kf', { image: 'images/products/amz-handbag.png' }),
    entry('amz-mens-kurta', "Men's Kurta", 'Kurtas', 'https://link.amazon/B0bOXCJ7c', { image: 'images/products/amz-mens-kurta.png' }),
    entry('amz-womens-kurta', "Women's Kurta", 'Kurtas', 'https://link.amazon/B07INrxdV', { image: 'images/products/amz-womens-kurta.png' }),
    entry('amz-womens-footwear', "Women's Footwear", 'Shoes & Sneakers', 'https://link.amazon/B07Q9pFK0', { image: 'images/products/amz-womens-footwear.png' }),
    entry('amz-mens-footwear', "Men's Footwear", 'Shoes & Sneakers', 'https://link.amazon/B06bYbkO9', { image: 'images/products/amz-mens-footwear.png' }),
    entry('amz-lehenga', 'Lehenga', 'Lehengas', 'https://link.amazon/B02XGTuDg', { image: 'images/products/amz-lehenga.png' }),
    entry('amz-saree', 'Saree', 'Sarees', 'https://link.amazon/B05vsG5W2', { image: 'images/products/amz-saree.png' })
  ];

  const categories = [
    { name: 'Tops & T-Shirts', slug: 'tops-t-shirts' },
    { name: 'Bottoms & Pants', slug: 'bottoms-pants' },
    { name: 'Dresses & Skirts', slug: 'dresses-skirts' },
    { name: 'Shoes & Sneakers', slug: 'shoes-sneakers' },
    { name: 'Activewear', slug: 'activewear' },
    { name: 'Accessories', slug: 'accessories' },
    { name: 'Bags', slug: 'bags' },
    { name: 'Jewellery', slug: 'jewellery' },
    { name: 'Outerwear', slug: 'outerwear' },
    { name: 'Lehengas', slug: 'lehengas' },
    { name: 'Sarees', slug: 'sarees' },
    { name: 'Kurtas', slug: 'kurtas' }
  ];
  const trendingCategories = ['Lehengas', 'Sarees', 'Kurtas', 'Bags'];

  const outfits = [];
  const posts = [];
  const styleTags = ['Casual', 'Formal', 'Streetwear', 'Minimalist', 'Vintage', 'Summer', 'Winter', 'Spring', 'Fall', 'Date Night'];

  return { products, categories, trendingCategories, outfits, posts, styleTags, RETAILER, AMAZON_LINKS_AFFILIATE_APPROVED };
})();
