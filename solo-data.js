/* SOLO sample catalogue. Mirrors the demo data used in the SOLO mobile app.
   All products, prices, creators and like counts are sample data, not live retailer inventory. */
window.SOLO_DATA = (() => {
  const img = (id, w = 900) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
  const MERCHANT = 'SOLO Demo Edit';
  const p = (id, title, category, price, original, photo, tags = [], extra = {}) => ({
    id, title, category, price, original, image: img(photo), merchant: MERCHANT, tags: [category, ...tags], added: extra.added || 0, ...extra
  });

  const products = [
    p('p1', 'Embroidered Wine Lehenga', 'Lehengas', 2890, 4290, '1610030469983-98e550d6193c', ['Wedding Guest', 'Diwali Glam'], { added: 9, flash: true }),
    p('p2', 'Banarasi Silk Saree', 'Sarees', 2450, 3600, '1617627143750-d86bc21e42bb', ['Ethnic Classics'], { added: 8 }),
    p('p3', 'Ivory Chikankari Kurta', 'Kurtas', 1490, 2190, '1597983073493-88cd35cf93b0', ['Ethnic Classics'], { added: 7 }),
    p('p4', 'Rose Gold Jhumka Set', 'Jewellery', 890, 1290, '1617038220319-276d3cfab638', ['Diwali Glam'], { added: 6, flash: true }),
    p('p5', 'Midnight Anarkali Set', 'Dresses & Skirts', 2790, 3990, '1595777457583-95e059d581b8', ['Party Edit', 'Wedding Guest'], { added: 5 }),
    p('p6', 'Pearl Potli Bag', 'Bags', 790, 1190, '1584917865442-de89df76afd3', ['Diwali Glam'], { added: 4, flash: true }),
    p('p7', 'Mustard Gota Patti Kurta', 'Kurtas', 1890, 2890, '1515886657613-9f3515b0c78f', ['Diwali Glam'], { added: 3 }),
    p('p8', 'Champagne Embellished Saree', 'Sarees', 3190, 4590, '1539109136881-3be0616acf4b', ['Wedding Guest', 'Party Edit'], { added: 2 }),
    p('p9', 'Embroidered Velvet Potli', 'Bags', 990, 1490, '1584917865442-de89df76afd3', ['Diwali Glam'], { added: 1 }),
    p('p10', 'Printed Silk Dupatta', 'Accessories', 790, 1190, '1606760227091-3dd870d97f1d', ['Ethnic Classics'], { added: 1 }),
    p('p11', 'Ivory Occasion Top', 'Tops & T-Shirts', 1290, 1890, '1483985988355-763728e1935b', ['Minimalist'], { added: 6 }),
    p('p12', 'Straight Festive Trousers', 'Bottoms & Pants', 1390, 1990, '1541099649105-f69ad21f3246', ['Casual'], { added: 5 }),
    p('p13', 'Embroidered Festive Juttis', 'Shoes & Sneakers', 1590, 2390, '1543163521-1bf539c55dd2', ['Wedding Guest'], { added: 4 }),
    p('p14', 'Soft Flow Yoga Set', 'Activewear', 1690, 2290, '1518611012118-696072aa579a', ['Casual'], { added: 7, flash: true }),
    p('p15', 'Tailored Longline Coat', 'Outerwear', 3490, 4990, '1539533018447-63fcce2678e3', ['Winter', 'Minimalist'], { added: 3 }),
    p('p16', 'Quilted Utility Jacket', 'Outerwear', 2990, 3790, '1551028719-00167b16eac5', ['Streetwear', 'Winter'], { added: 2 }),
    p('p17', 'Pleated Midi Skirt', 'Dresses & Skirts', 1490, 2190, '1583496661160-fb5886a0aaaa', ['Spring', 'Date Night'], { added: 5 }),
    p('p18', 'Relaxed Street Tee', 'Tops & T-Shirts', 990, 1290, '1529139574466-a303027c1d8b', ['Streetwear', 'Summer'], { added: 8 }),
    p('p19', 'Layered Gold Chain Set', 'Jewellery', 1190, 1690, '1496747611176-843222e1e57c', ['Date Night'], { added: 2 }),
    p('p20', 'Cross-Body Day Bag', 'Bags', 1790, 2390, '1434389677669-e08b4cac3105', ['Minimalist', 'Casual'], { added: 3 })
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
  const trendingCategories = ['Lehengas', 'Sarees', 'Kurtas', 'Jewellery'];

  const o = (id, name, badge, tag, creator, verified, description, likes, productIds, image, extraTags = []) =>
    ({ id, name, badge, tag, creator, verified, description, likes, productIds, image, tags: [tag, ...extraTags] });

  const outfits = [
    o('o1', 'Street Style Chic', 'New', 'Streetwear', 'SOLO Style Edit', true, 'A festive silhouette styled with a modern point of view.', 248, ['p1', 'p4'], products[0].image, ['Trending']),
    o('o2', 'Casual Elegance', 'Trending', 'Casual', 'SOLO Everyday Edit', true, 'Soft tailoring and easy proportions for everyday plans.', 186, ['p3', 'p6'], products[2].image, ['Trending']),
    o('o3', 'Trendy Minimalism', 'Sale', 'Minimalist', 'SOLO Textile Edit', false, 'A clean shape lets a rich textile carry the look.', 132, ['p2', 'p4'], products[1].image),
    o('o4', 'Monochrome Magic', 'Trending', 'Formal', 'SOLO Occasion Edit', true, 'A tonal occasion look shaped around proportion and texture.', 97, ['p5', 'p6'], products[4].image, ['Minimalist', 'Trending']),
    o('o5', 'Sangeet in Bloom', 'New', 'Wedding Guest', 'SOLO Style Edit', true, 'Festive colour, grounded by one bright accessory.', 74, ['p8', 'p4'], products[7].image, ['Formal']),
    o('o6', 'Golden Hour', 'Sale', 'Diwali Glam', 'SOLO Festive Edit', false, 'An easy festive kurta look with a warm accent.', 63, ['p7', 'p6'], products[6].image, ['Casual']),
    o('o7', 'Weekend Layers', 'New', 'Streetwear', 'SOLO Everyday Edit', false, 'Relaxed layers with a structured bag to pull it together.', 58, ['p18', 'p16', 'p20'], products[17].image, ['Casual']),
    o('o8', 'Studio to Street', 'Trending', 'Casual', 'SOLO Everyday Edit', false, 'Activewear that carries comfortably into the rest of the day.', 51, ['p14', 'p20'], products[13].image, ['Trending'])
  ];

  const posts = [
    { id: 's1', creator: 'SOLO Community · Sample', caption: 'A little zari, a lot of festive feeling.', image: products[1].image, productIds: ['p1', 'p5'] },
    { id: 's2', creator: 'SOLO Community · Sample', caption: 'Diwali dressing, with a modern heirloom mood.', image: products[0].image, productIds: ['p2'] },
    { id: 's3', creator: 'SOLO Community · Sample', caption: 'The kurta set you will wear well past the season.', image: products[2].image, productIds: ['p3', 'p7'] }
  ];

  const styleTags = ['Casual', 'Formal', 'Streetwear', 'Minimalist', 'Vintage', 'Summer', 'Winter', 'Spring', 'Fall', 'Date Night'];
  const discoverFilters = ['For You', 'Trending', 'New', 'Casual', 'Streetwear', 'Minimalist'];

  return { products, categories, trendingCategories, outfits, posts, styleTags, discoverFilters, MERCHANT };
})();
