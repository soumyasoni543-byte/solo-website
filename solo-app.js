(() => {
  const D = window.SOLO_DATA;
  const main = document.querySelector('main[data-page]');
  if (!D || !main) return;
  const page = main.dataset.page;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
  const priced = (p) => typeof p.price === 'number';
  const hasDiscount = (p) => priced(p) && typeof p.original === 'number' && p.original > p.price;
  const pct = (p) => (hasDiscount(p) ? Math.round((1 - p.price / p.original) * 100) : 0);
  const priceText = (p) => (priced(p) ? inr(p.price) : 'See price on Amazon');
  const priceHtml = (p) => (priced(p)
    ? `<strong>${inr(p.price)}</strong>${hasDiscount(p) ? `<s>${inr(p.original)}</s><span class="s-save">Save ${inr(p.original - p.price)}</span>` : ''}`
    : '<strong class="s-price-note">See price on Amazon</strong>');
  // Every retailer link opens in a new tab and keeps the exact catalogue URL.
  const shopLink = (p, cls = 's-btn s-btn-soft') => `<a class="${cls}" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer" data-track-prod="${esc(p.id)}">Shop on Amazon ${icon.arrow}</a>`;
  const byId = (id) => D.products.find((p) => p.id === id);
  const slugOf = (name) => D.categories.find((c) => c.name === name)?.slug;
  const catBySlug = (slug) => D.categories.find((c) => c.slug === slug);
  const icon = {
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.3-9.2C1.6 8.2 3.3 5 6.6 5c2 0 3.6 1.1 5.4 3 1.8-1.9 3.4-3 5.4-3 3.3 0 5 3.2 3.9 6.3-1.8 4.6-9.3 9.2-9.3 9.2z"/></svg>',
    bag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8h12l1 12H5L6 8zM9 8a3 3 0 016 0"/></svg>',
    share: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V4m0 0L8 8m4-4l4 4M5 13v6h14v-6"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6l6 6-6 6"/></svg>'
  };

  // Local-only state: nothing here is sent to a server.
  const KEY = 'solo.web.state.v1';
  const load = () => {
    try { return Object.assign({ wishLooks: [], wishProds: [], closet: [], liked: [] }, JSON.parse(localStorage.getItem(KEY) || '{}')); }
    catch { return { wishLooks: [], wishProds: [], closet: [], liked: [] }; }
  };
  let state = load();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage unavailable */ } };
  const has = (list, id) => state[list].includes(id);
  const toggle = (list, id) => {
    const on = has(list, id);
    state[list] = on ? state[list].filter((x) => x !== id) : [...state[list], id];
    save();
    return !on;
  };

  let toastTimer;
  const toast = (msg) => {
    let t = $('.s-toast');
    if (!t) { t = document.createElement('div'); t.className = 's-toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('is-on'), 2200);
  };

  const placeholder = (label) => `<div class="s-placeholder" role="img" aria-label="${esc(label)} image not available"><span>${esc(label)}</span></div>`;
  const pimg = (p) => (p && p.image ? imgTag(p.image, p.title) : placeholder(p ? p.category : 'SOLO'));
  const imgTag = (src, alt, cls = '') => `<img class="${cls}" src="${src}" alt="${esc(alt)}" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'s-img-fallback',textContent:'SOLO'}))">`;
  const heading = (eyebrow, title, link, label) => `<div class="s-head"><div><p class="s-eyebrow">${eyebrow}</p><h2>${title}</h2></div>${link ? `<a class="s-link" href="${link}">${label} ${icon.arrow}</a>` : ''}</div>`;

  const outfitProducts = (o) => o.productIds.map(byId);
  const lookCard = (o) => {
    const wished = has('wishLooks', o.id);
    const likes = o.likes + (has('liked', o.id) ? 1 : 0);
    return `<article class="s-look" data-look="${o.id}">
      <a class="s-look-img" href="look.html?id=${o.id}" aria-label="Open ${esc(o.name)}">${imgTag(o.image, o.name)}<span class="s-badge s-badge-${o.badge.toLowerCase()}">${o.badge}</span></a>
      <button class="s-icon-btn s-wish ${wished ? 'is-on' : ''}" data-wish-look="${o.id}" aria-pressed="${wished}" aria-label="${wished ? 'Remove from' : 'Add to'} wishlist">${icon.heart}</button>
      <div class="s-look-body">
        <h3><a href="look.html?id=${o.id}">${esc(o.name)}</a></h3>
        <p class="s-creator">by ${esc(o.creator)}${o.verified ? ' <span class="s-verified" title="Verified creator">' + icon.check + '</span>' : ''}</p>
        <div class="s-look-foot">
          <button class="s-like ${has('liked', o.id) ? 'is-on' : ''}" data-like="${o.id}" aria-pressed="${has('liked', o.id)}">${icon.heart}<span>${likes}</span></button>
          <a class="s-btn s-btn-sm" href="look.html?id=${o.id}#shop">Shop This Look</a>
        </div>
      </div>
    </article>`;
  };

  const productCard = (p, opts = {}) => {
    const wished = has('wishProds', p.id);
    return `<article class="s-product">
      <div class="s-product-img"><button class="s-product-open" data-shop-prod="${p.id}" aria-label="View ${esc(p.title)}">${pimg(p)}</button><span class="s-tag">${esc(p.category)}</span>
        ${opts.deal && hasDiscount(p) ? `<span class="s-off">${pct(p)}% OFF</span>` : ''}
        <button class="s-icon-btn s-wish ${wished ? 'is-on' : ''}" data-wish-prod="${p.id}" aria-pressed="${wished}" aria-label="${wished ? 'Remove from' : 'Add to'} wishlist">${icon.heart}</button></div>
      <div class="s-product-body">
        <p class="s-merchant">Listed on ${esc(p.merchant)}</p>
        <h3><button class="s-title-btn" data-shop-prod="${p.id}">${esc(p.title)}</button></h3>
        <p class="s-price">${priceHtml(p)}</p>
        ${shopLink(p)}
      </div></article>`;
  };

  const chips = (items, active, attr) => items.map((c) => `<button class="s-chip ${c === active ? 'is-on' : ''}" ${attr}="${esc(c)}" aria-pressed="${c === active}">${esc(c)}</button>`).join('');

  // ---------- Modal for shop actions ----------
  const shopDialog = (title, items, total) => {
    let dlg = $('#s-dialog');
    if (!dlg) { dlg = document.createElement('dialog'); dlg.id = 's-dialog'; dlg.className = 's-dialog'; document.body.appendChild(dlg); }
    dlg.innerHTML = `<form method="dialog"><button class="s-dialog-x" aria-label="Close">×</button></form>
      <h2>${esc(title)}</h2>
      <ul class="s-dialog-list">${items.map((p) => `<li>${pimg(p)}<span>${esc(p.title)}<small>${esc(p.category)} · Listed on ${esc(p.merchant)}</small><small>${esc(priceText(p))}</small></span>${shopLink(p, 's-btn s-btn-sm')}</li>`).join('')}</ul>
      ${total ? `<p class="s-dialog-total"><span>Total</span><b>${inr(total)}</b></p>` : ''}
      <p class="s-note">SOLO links to the Amazon listing. Price, sizes, delivery and availability are shown on Amazon and are not live on SOLO. Purchases happen on Amazon, not here. SOLO may earn a commission when you shop through affiliate links, at no additional cost to you.</p>
      <div class="s-dialog-actions">${items.map((p) => `<button class="s-btn s-btn-soft" data-closet="${p.id}">${has('closet', p.id) ? 'In closet ✓' : 'Add to My Closet'}</button>`).join('')}</div>`;
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
  };

  // ---------- Global interactions ----------
  const refreshWishButtons = () => {
    $$('[data-wish-look]').forEach((b) => { const on = has('wishLooks', b.dataset.wishLook); b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); });
    $$('[data-wish-prod]').forEach((b) => { const on = has('wishProds', b.dataset.wishProd); b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); });
    const n = state.wishProds.length;
    $$('[data-wish-count]').forEach((b) => { b.textContent = n; b.hidden = !n; });
  };

  document.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.dataset.wishLook) { const on = toggle('wishLooks', t.dataset.wishLook); refreshWishButtons(); toast(on ? 'Saved to your wishlist' : 'Removed from wishlist'); if (page === 'wishlist') renderWishlist(); }
    else if (t.dataset.wishProd) { const on = toggle('wishProds', t.dataset.wishProd); refreshWishButtons(); toast(on ? 'Saved to your wishlist' : 'Removed from wishlist'); if (page === 'wishlist') renderWishlist(); }
    else if (t.dataset.like) {
      toggle('liked', t.dataset.like);
      const o = D.outfits.find((x) => x.id === t.dataset.like);
      $$(`[data-like="${o.id}"]`).forEach((b) => { const on = has('liked', o.id); b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); $('span', b).textContent = o.likes + (on ? 1 : 0); });
    }
    else if (t.dataset.shopProd) { const p = byId(t.dataset.shopProd); shopDialog(p.title, [p]); }
    else if (t.dataset.shopLook) {
      const o = D.outfits.find((x) => x.id === t.dataset.shopLook); const ps = outfitProducts(o);
      shopDialog(o.name + ' — full look', ps, ps.every(priced) ? ps.reduce((s, p) => s + p.price, 0) : 0);
    }
    else if (t.dataset.closet) {
      const on = toggle('closet', t.dataset.closet);
      t.textContent = on ? 'In closet ✓' : 'Add to My Closet';
      toast(on ? 'Added to My Closet' : 'Removed from My Closet');
      if (page === 'closet') renderCloset();
    }
    else if (t.dataset.share) {
      const url = location.href; const title = t.dataset.share;
      if (navigator.share) navigator.share({ title, url }).catch(() => {});
      else if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => toast('Link copied'), () => toast('Copy the link from the address bar'));
      else toast('Copy the link from the address bar');
    }
  });
  document.addEventListener('click', (e) => { const d = $('#s-dialog'); if (d && e.target === d) d.close(); });

  const renderers = {};

  // ---------- Home ----------
  renderers.home = () => {
    const hero = D.products;
    main.innerHTML = `
    <section class="s-hero wrap">
      <div class="s-hero-copy">
        <p class="s-eyebrow">Fashion discovery, thoughtfully curated</p>
        <h1>Find pieces that feel like <em>you</em>.</h1>
        <p class="s-lead">Explore fashion picks by category, save your favourites and open retailer listings for current details.</p>
        <div class="s-cta"><a class="s-btn s-btn-lg" href="discover.html">Discover Products</a><a class="s-btn s-btn-lg s-btn-ghost" href="categories.html">Shop by Category</a></div>
        <ul class="s-hero-stats"><li><b>${D.products.length}</b> Amazon picks</li><li><b>${D.categories.length}</b> categories</li></ul>
      </div>
      <div class="s-hero-art" aria-hidden="false">
        <div class="s-hero-main">${pimg(hero[0])}<span class="s-hero-cap"><b>${esc(hero[0].title)}</b>Listed on ${esc(hero[0].merchant)}</span></div>
        <div class="s-hero-side"><div>${pimg(hero[1])}</div><div>${pimg(hero[7])}</div></div>
        <div class="s-hero-chip">✦ The SOLO edit</div>
      </div>
    </section>
    <section class="wrap s-section">${heading('Fashion discovery', 'Shop the picks', 'discover.html', 'See all products')}
      <p class="s-note">Prices and discounts are not shown until verified. Open a listing on Amazon to see the current price. SOLO may earn a commission when you shop through affiliate links, at no additional cost to you. <a href="affiliate-disclosure.html">Affiliate disclosure</a></p>
      <div class="s-grid s-grid-products">${D.products.map((p) => productCard(p)).join('')}</div></section>
    <section class="wrap s-section">${heading('Shop by category', 'Trending categories', 'categories.html', 'All categories')}
      <div class="s-cat-row">${D.trendingCategories.map(catTile).join('')}</div></section>
    <section class="wrap s-section s-feature-pair">
      <a class="s-feature s-feature-ai" href="ai-styling.html"><p class="s-eyebrow s-light">AI Styling</p><h2>Tell SOLO the occasion. Get a look.</h2><p>Pick an occasion for a ready-to-shop outfit suggestion from the SOLO catalogue.</p><span class="s-link s-link-light">Try AI Styling ${icon.arrow}</span></a>
      <a class="s-feature s-feature-closet" href="closet.html"><p class="s-eyebrow">My Closet</p><h2>Keep every piece in one place.</h2><p>Save what you own or love, see your closet value and plan outfits around it.</p><span class="s-link">Open My Closet ${icon.arrow}</span></a>
    </section>
    `;
  };

  const catTile = (name) => {
    const items = D.products.filter((p) => p.category === name);
    const slug = slugOf(name);
    return `<a class="s-cat-tile" href="category.html?c=${slug}">${pimg(items[0] || { category: name })}${D.trendingCategories.includes(name) ? '<span class="s-badge s-badge-trending">Trending</span>' : ''}<span class="s-cat-label"><b>${esc(name)}</b><small>${items.length} ${items.length === 1 ? 'item' : 'items'}</small></span></a>`;
  };

  // ---------- Discover ----------
  renderers.discover = () => {
    let q = ''; let cat = 'all';
    const productCategories = [...new Set(D.products.map((p) => p.category))];
    main.innerHTML = `<section class="wrap s-page-head"><p class="s-eyebrow">Discover</p><h1>Fashion picks, made easy to explore.</h1><p class="s-lead">Search the SOLO catalogue, filter by category, and save products for later.</p></section>
    <section class="wrap">
      <div class="s-toolbar"><label class="s-search"><span class="s-sr">Search products</span><input type="search" id="d-q" placeholder="Search products or categories" autocomplete="off"></label>
        <label class="s-select"><span class="s-sr">Category</span><select id="d-cat"><option value="all">All categories</option>${D.categories.map((c) => `<option value="${c.slug}">${esc(c.name)}</option>`).join('')}</select></label></div>
      <div class="s-chips" id="d-chips"></div><p class="s-count" id="d-count" aria-live="polite"></p>
      <div class="s-grid s-grid-products" id="d-grid"></div><p class="s-empty" id="d-empty" hidden>No products match. Try clearing a filter.</p></section>`;
    const draw = () => {
      $('#d-chips').innerHTML = chips(['All Picks', ...productCategories], cat === 'all' ? 'All Picks' : catBySlug(cat)?.name, 'data-df');
      const ql = q.trim().toLowerCase();
      const list = D.products.filter((p) => {
        const cm = cat === 'all' || slugOf(p.category) === cat;
        const qm = !ql || `${p.title} ${p.category} ${p.merchant}`.toLowerCase().includes(ql);
        return cm && qm;
      });
      $('#d-grid').innerHTML = list.map((p) => productCard(p)).join('');
      $('#d-count').textContent = `${list.length} ${list.length === 1 ? 'product' : 'products'}`;
      $('#d-empty').hidden = list.length > 0;
    };
    $('#d-q').addEventListener('input', (e) => { q = e.target.value; draw(); });
    $('#d-cat').addEventListener('change', (e) => { cat = e.target.value; draw(); });
    main.addEventListener('click', (e) => {
      const c = e.target.closest('[data-df]');
      if (!c) return;
      cat = c.dataset.df === 'All Picks' ? 'all' : slugOf(c.dataset.df);
      $('#d-cat').value = cat;
      draw();
    });
    draw();
  };

  // ---------- Look detail ----------
  renderers.look = () => {
    const id = new URLSearchParams(location.search).get('id');
    const o = D.outfits.find((x) => x.id === id);
    if (!o) { main.innerHTML = `<section class="wrap s-page-head"><h1>Look not found</h1><p class="s-lead">This look may have moved. <a href="discover.html">Browse products</a>.</p></section>`; return; }
    document.title = `${o.name} — SOLO`;
    const ps = outfitProducts(o);
    const total = ps.every(priced) ? ps.reduce((s, p) => s + p.price, 0) : null;
    const wished = has('wishLooks', o.id);
    main.innerHTML = `<section class="wrap s-look-detail">
      <nav class="s-crumb" aria-label="Breadcrumb"><a href="discover.html">Discover</a> / <span>${esc(o.name)}</span></nav>
      <div class="s-look-layout">
        <div class="s-look-hero">${imgTag(o.image, o.name)}<span class="s-badge s-badge-${o.badge.toLowerCase()}">${o.badge}</span></div>
        <div class="s-look-info">
          <div class="s-creator-row"><span class="s-avatar">${esc(o.creator[0])}</span><div><b>${esc(o.creator)}${o.verified ? ' <span class="s-verified" title="Verified creator">' + icon.check + '</span>' : ''}</b><small>${o.verified ? 'Verified SOLO creator' : 'SOLO creator'}</small></div></div>
          <h1>${esc(o.name)}</h1>
          <p class="s-lead">${esc(o.description)}</p>
          <div class="s-look-stats"><button class="s-like ${has('liked', o.id) ? 'is-on' : ''}" data-like="${o.id}" aria-pressed="${has('liked', o.id)}">${icon.heart}<span>${o.likes + (has('liked', o.id) ? 1 : 0)}</span></button><span>${ps.length} products</span>
            <button class="s-btn s-btn-ghost s-btn-sm" data-share="${esc(o.name)}">${icon.share} Share</button>
            <button class="s-btn s-btn-ghost s-btn-sm s-wish-inline ${wished ? 'is-on' : ''}" data-wish-look="${o.id}" aria-pressed="${wished}">${icon.heart} Wishlist</button></div>
          <section id="shop" class="s-shop"><h2>Shop This Look</h2>
            <ul class="s-shop-list">${ps.map((p) => `<li>${pimg(p)}<div><b>${esc(p.title)}</b><small>${esc(p.category)} · Listed on ${esc(p.merchant)}</small>
              <span class="s-price">${priceHtml(p)}</span></div>
              ${shopLink(p, 's-btn s-btn-soft s-btn-sm')}</li>`).join('')}</ul>
            ${total === null ? `<p class="s-note">${ps.length} pieces. A full-look total appears only when every piece has a verified price.</p>` : `<div class="s-total"><div><small>Full look</small><b>${inr(total)}</b></div></div>`}
            <button class="s-btn s-btn-lg s-btn-block" data-shop-look="${o.id}">Shop Full Look${total === null ? '' : ' · ' + inr(total)}</button>
            <p class="s-note">Each piece opens its Amazon listing. Price, delivery and availability are shown on Amazon and are not live on SOLO.</p></section>
        </div></div></section>
      <section class="wrap s-section">${heading('More to explore', 'You may also like', 'discover.html', 'All looks')}<div class="s-grid s-grid-looks">${D.outfits.filter((x) => x.id !== o.id).slice(0, 4).map(lookCard).join('')}</div></section>`;
  };

  // ---------- Categories ----------
  renderers.categories = () => {
    const count = (n) => D.products.filter((p) => p.category === n).length;
    main.innerHTML = `<section class="wrap s-page-head"><p class="s-eyebrow">Find your starting point</p><h1>Shop by Category</h1><p class="s-lead">Explore the catalogue by piece and styling mood.</p></section>
    <section class="wrap"><a class="s-banner" href="category.html?c=lehengas"><div><p class="s-eyebrow s-light">Trending now</p><h2>Festive, your way.</h2><p>Explore colour, craft and occasion ideas.</p></div>${icon.arrow}</a></section>
    <section class="wrap s-section">${heading('A few paths into the edit', 'Trending Categories')}<div class="s-cat-grid">${D.categories.map((c) => catTile(c.name)).join('')}</div></section>
    <section class="wrap s-section">${heading('More ways to browse', 'All Categories')}<ul class="s-cat-list">${D.categories.map((c) => { const first = D.products.find((p) => p.category === c.name); return `<li><a href="category.html?c=${c.slug}">${pimg(first || { category: c.name })}<span><b>${esc(c.name)}</b><small>${count(c.name)} ${count(c.name) === 1 ? 'item' : 'items'}</small></span>${D.trendingCategories.includes(c.name) ? '<em class="s-pill">Trending</em>' : ''}${icon.arrow}</a></li>`; }).join('')}</ul>
      <p class="s-note">Counts show items in SOLO's catalogue, not retailer inventory.</p></section>`;
  };

  renderers.category = () => {
    const c = catBySlug(new URLSearchParams(location.search).get('c'));
    if (!c) { main.innerHTML = `<section class="wrap s-page-head"><h1>Category not found</h1><p class="s-lead"><a href="categories.html">Back to all categories</a></p></section>`; return; }
    document.title = `${c.name} — SOLO`;
    let sort = 'featured'; let pricedOnly = false;
    const all = D.products.filter((p) => p.category === c.name);
    main.innerHTML = `<section class="wrap s-page-head"><nav class="s-crumb" aria-label="Breadcrumb"><a href="categories.html">Categories</a> / <span>${esc(c.name)}</span></nav><h1>${esc(c.name)}</h1>    <p class="s-lead">${all.length} ${all.length === 1 ? 'item' : 'items'}. Sort to narrow your search.</p></section>
        <section class="wrap"><div class="s-toolbar">
          <label class="s-select"><span class="s-sr">Sort</span><select id="c-sort"><option value="featured">Sort: Featured</option><option value="az">Name: A to Z</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label>
          <label class="s-check"><input type="checkbox" id="c-price"> Verified price only</label></div>
          <p class="s-count" id="c-count" aria-live="polite"></p><div class="s-grid s-grid-products" id="c-grid"></div><p class="s-empty" id="c-empty" hidden>No products match these filters.</p></section>
    <section class="wrap s-section">${heading('Keep browsing', 'Other categories', 'categories.html', 'All categories')}<div class="s-cat-row">${D.categories.filter((x) => x.slug !== c.slug).slice(0, 4).map((x) => catTile(x.name)).join('')}</div></section>`;
    const draw = () => {
      let list = all.filter((p) => !pricedOnly || priced(p));
      const byPrice = (dir) => (a, b) => (priced(a) ? (priced(b) ? dir * (a.price - b.price) : -1) : priced(b) ? 1 : 0);
      const sorters = { az: (a, b) => a.title.localeCompare(b.title), low: byPrice(1), high: byPrice(-1) };
      if (sorters[sort]) list = [...list].sort(sorters[sort]);
      $('#c-grid').innerHTML = list.map((p) => productCard(p)).join('');
      $('#c-count').textContent = `${list.length} ${list.length === 1 ? 'product' : 'products'}`;
      $('#c-empty').hidden = list.length > 0;
    };
    $('#c-sort').addEventListener('change', (e) => { sort = e.target.value; draw(); });
    $('#c-price').addEventListener('change', (e) => { pricedOnly = e.target.checked; draw(); });
    draw();
  };

  // ---------- Deals ----------
  renderers.deals = () => {
    let f = 'All Deals';
    const filters = ['All Deals', 'Flash Deals', 'High Discount'];
    const stats = (list) => [[D.products.length, 'Amazon picks'], [D.products.filter(hasDiscount).length, 'Verified discounts'], [list.length, 'Shown']];
    main.innerHTML = `<section class="wrap"><div class="s-deals-head"><p class="s-eyebrow s-light">Amazon picks</p><h1>Hot Deals</h1><p>No verified discounts yet. SOLO links to these Amazon listings and only shows a discount once one is verified. Check Amazon for current prices.</p><div class="s-stats" id="x-stats"></div></div>
      <div class="s-chips" id="x-chips"></div><p class="s-count" id="x-count" aria-live="polite"></p><div class="s-grid s-grid-products" id="x-grid"></div></section>`;
    const draw = () => {
      $('#x-chips').innerHTML = chips(filters, f, 'data-xf');
      const list = D.products.filter((p) => f === 'All Deals' || (f === 'Flash Deals' ? p.flash && hasDiscount(p) : pct(p) >= 30));
      $('#x-stats').innerHTML = stats(list).map(([v, l]) => `<div><b>${v}</b><span>${l}</span></div>`).join('');
      $('#x-count').textContent = `${list.length} ${list.length === 1 ? 'listing' : 'listings'}`;
      $('#x-grid').innerHTML = list.length ? list.map((p) => productCard(p, { deal: true })).join('') : '<p class="s-empty">No verified discounts in this filter yet.</p>';
    };
    main.addEventListener('click', (e) => { const c = e.target.closest('[data-xf]'); if (c) { f = c.dataset.xf; draw(); } });
    draw();
  };

  // ---------- Create post ----------
  renderers.create = () => {
    const MAX = 500; const MAXTAGS = 5;
    const tags = new Set(); let file = null; let previewUrl = '';
    main.innerHTML = `<section class="wrap s-narrow"><div class="s-page-head"><p class="s-eyebrow">Community</p><h1>Create Post</h1><p class="s-lead">Share an outfit with a photo, a description and up to five style tags.</p></div>
    <form id="p-form" class="s-form" novalidate>
      <div class="s-field"><span class="s-label" id="p-photo-label">Photo</span>
        <label class="s-drop" id="p-drop"><input type="file" id="p-file" accept="image/png,image/jpeg,image/webp" aria-labelledby="p-photo-label"><span id="p-drop-text"><b>Upload a photo</b><small>JPG, PNG or WebP, up to 8 MB</small></span><img id="p-preview" alt="Selected photo preview" hidden></label>
        <button type="button" class="s-link-btn" id="p-remove" hidden>Remove photo</button><p class="s-error" id="p-photo-err" role="alert" hidden></p></div>
      <div class="s-field"><label class="s-label" for="p-desc">Description</label><textarea id="p-desc" rows="5" maxlength="${MAX}" placeholder="Tell people about your look…"></textarea><div class="s-field-foot"><p class="s-error" id="p-desc-err" role="alert" hidden></p><span class="s-counter" id="p-count">0/${MAX}</span></div></div>
      <div class="s-field"><span class="s-label">Style tags <small id="p-tag-count">0/${MAXTAGS} selected</small></span><div class="s-chips s-chips-wrap" id="p-tags"></div></div>
      <button class="s-btn s-btn-lg s-btn-block" type="submit">Post</button></form>
    <div class="s-success" id="p-done" hidden role="status"><h2>Draft saved on this device</h2><p>Your post was checked and kept as a draft in this browser. SOLO's website isn't connected to a live community, so it has not been published anywhere.</p><button class="s-btn s-btn-ghost" id="p-another">Create another</button></div></section>`;
    const drawTags = () => {
      $('#p-tags').innerHTML = D.styleTags.map((t) => { const on = tags.has(t); const lock = !on && tags.size >= MAXTAGS; return `<button type="button" class="s-chip ${on ? 'is-on' : ''}" data-ptag="${t}" aria-pressed="${on}" ${lock ? 'disabled' : ''}>${t}</button>`; }).join('');
      $('#p-tag-count').textContent = `${tags.size}/${MAXTAGS} selected`;
    };
    const clearPhoto = () => { if (previewUrl) URL.revokeObjectURL(previewUrl); previewUrl = ''; file = null; $('#p-file').value = ''; $('#p-preview').hidden = true; $('#p-drop-text').hidden = false; $('#p-remove').hidden = true; };
    $('#p-file').addEventListener('change', (e) => {
      const f = e.target.files[0]; const err = $('#p-photo-err'); err.hidden = true;
      if (!f) return;
      if (!/^image\/(png|jpeg|webp)$/.test(f.type)) { clearPhoto(); err.textContent = 'Please choose a JPG, PNG or WebP image.'; err.hidden = false; return; }
      if (f.size > 8 * 1024 * 1024) { clearPhoto(); err.textContent = 'That image is larger than 8 MB.'; err.hidden = false; return; }
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      file = f; previewUrl = URL.createObjectURL(f);
      const pv = $('#p-preview'); pv.src = previewUrl; pv.hidden = false; $('#p-drop-text').hidden = true; $('#p-remove').hidden = false;
    });
    $('#p-remove').addEventListener('click', clearPhoto);
    $('#p-desc').addEventListener('input', (e) => { $('#p-count').textContent = `${e.target.value.length}/${MAX}`; $('#p-desc-err').hidden = true; });
    $('#p-tags').addEventListener('click', (e) => { const b = e.target.closest('[data-ptag]'); if (!b) return; const t = b.dataset.ptag; if (tags.has(t)) tags.delete(t); else if (tags.size < MAXTAGS) tags.add(t); drawTags(); });
    $('#p-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const desc = $('#p-desc').value.trim(); let ok = true;
      const pe = $('#p-photo-err'); const de = $('#p-desc-err');
      if (!file) { pe.textContent = 'Add a photo to continue.'; pe.hidden = false; ok = false; }
      if (!desc) { de.textContent = 'Write a short description.'; de.hidden = false; ok = false; }
      if (!ok) return;
      try {
        const drafts = JSON.parse(localStorage.getItem('solo.web.drafts') || '[]');
        drafts.push({ description: desc, tags: [...tags], savedAt: new Date().toISOString() });
        localStorage.setItem('solo.web.drafts', JSON.stringify(drafts.slice(-20)));
      } catch { /* storage unavailable */ }
      $('#p-form').hidden = true; $('#p-done').hidden = false; $('#p-done').scrollIntoView({ block: 'center' });
    });
    $('#p-another').addEventListener('click', () => { clearPhoto(); tags.clear(); $('#p-desc').value = ''; $('#p-count').textContent = `0/${MAX}`; drawTags(); $('#p-form').hidden = false; $('#p-done').hidden = true; });
    drawTags();
  };

  // ---------- AI Styling (catalogue-based suggestions) ----------
  renderers.ai = () => {
    const occasions = { 'Wedding Guest': ['Lehengas', 'Sarees', 'Shoes & Sneakers'], 'Diwali Glam': ['Lehengas', 'Sarees', 'Kurtas', 'Bags'], 'Everyday': ['Kurtas', 'Tops & T-Shirts', 'Shoes & Sneakers'], 'Date Night': ['Sarees', 'Bags', 'Shoes & Sneakers'], 'Weekend Street': ['Tops & T-Shirts', 'Shoes & Sneakers', 'Bags'] };
    main.innerHTML = `<section class="wrap s-narrow"><div class="s-page-head"><p class="s-eyebrow">AI Styling</p><h1>Tell SOLO the occasion.</h1><p class="s-lead">Choose an occasion. SOLO suggests pieces from the catalogue.</p></div>
    <form class="s-form" id="a-form"><div class="s-field"><label class="s-label" for="a-occ">Occasion</label><select id="a-occ">${Object.keys(occasions).map((k) => `<option>${k}</option>`).join('')}</select></div>
      <button class="s-btn s-btn-lg s-btn-block" type="submit">Style me</button></form>
    <div id="a-out" aria-live="polite"></div>
    <p class="s-note">Suggestions use fixed occasion-to-category matches from the SOLO catalogue. This is not a live AI model and doesn't analyse photos. Budget matching is unavailable until prices are verified.</p></section>`;
    $('#a-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const want = occasions[$('#a-occ').value];
      const picks = D.products.filter((p) => want.includes(p.category)).slice(0, 3);
      const out = $('#a-out');
      if (!picks.length) { out.innerHTML = '<p class="s-empty">Nothing in the catalogue fits that occasion yet.</p>'; return; }
      out.innerHTML = `<h2 class="s-out-title">Your look</h2><div class="s-grid s-grid-products">${picks.map((p) => productCard(p)).join('')}</div>`;
    });
  };

  // ---------- Closet ----------
  const renderCloset = () => {
    const items = state.closet.map(byId).filter(Boolean);
    const priceKnown = items.filter(priced);
    const value = priceKnown.reduce((s, p) => s + p.price, 0);
    main.innerHTML = `<section class="wrap s-page-head"><p class="s-eyebrow">My Closet</p><h1>Your pieces, in one place.</h1><p class="s-lead">Items you add are kept in this browser only.</p></section>
    <section class="wrap"><div class="s-stats s-stats-light"><div><b>${items.length}</b><span>Pieces</span></div><div><b>${priceKnown.length ? inr(value) : '—'}</b><span>${priceKnown.length === items.length ? 'Closet value' : 'Value of priced pieces'}</span></div></div>
      ${items.length ? `<div class="s-grid s-grid-products">${items.map((p) => `<article class="s-product"><div class="s-product-img">${pimg(p)}<span class="s-tag">${esc(p.category)}</span></div><div class="s-product-body"><h3>${esc(p.title)}</h3><p class="s-price">${priceHtml(p)}</p><button class="s-btn s-btn-soft" data-closet="${p.id}">Remove from closet</button></div></article>`).join('')}</div>`
      : `<div class="s-emptybox"><h2>Your closet is empty</h2><p>Open any product and choose “Add to My Closet”.</p><a class="s-btn" href="categories.html">Browse categories</a></div>`}</section>`;
  };
  renderers.closet = renderCloset;

  // ---------- Wishlist ----------
  const renderWishlist = () => {
    const prods = state.wishProds.map(byId).filter(Boolean);
    main.innerHTML = `<section class="wrap s-page-head"><p class="s-eyebrow">Wishlist</p><h1>Saved for later.</h1><p class="s-lead">Products you've saved on this device.</p></section>
    <section class="wrap">${!prods.length ? `<div class="s-emptybox"><h2>Nothing saved yet</h2><p>Tap the heart on any product to save it here.</p><a class="s-btn" href="discover.html">Discover products</a></div>` : ''}
      ${prods.length ? `<div class="s-grid s-grid-products">${prods.map((p) => productCard(p)).join('')}</div>` : ''}</section>`;
  };
  renderers.wishlist = renderWishlist;

  // ---------- Profile / Login ----------
  renderers.profile = () => {
    main.innerHTML = `<section class="wrap s-narrow"><div class="s-page-head"><p class="s-eyebrow">Account</p><h1>Login &amp; Profile</h1><p class="s-lead">Accounts live in the SOLO mobile app. The website doesn't have sign-in yet, so nothing here asks for a password.</p></div>
    <div class="s-profile"><div class="s-avatar s-avatar-lg">S</div><div><b>Guest on this device</b><small>Your wishlist and closet are saved in this browser only.</small></div></div>
    <div class="s-stats s-stats-light"><div><b>${state.wishProds.length}</b><span>Wishlist</span></div><div><b>${state.closet.length}</b><span>Closet</span></div></div>
    <div class="s-cta"><a class="s-btn" href="wishlist.html">Open Wishlist</a><a class="s-btn s-btn-ghost" href="closet.html">Open My Closet</a></div>
    <p class="s-note"><button class="s-link-btn" id="clear-data">Clear saved data on this device</button></p></section>`;
    $('#clear-data').addEventListener('click', () => { state = { wishLooks: [], wishProds: [], closet: [], liked: [] }; save(); try { localStorage.removeItem('solo.web.drafts'); } catch { /* ignore */ } toast('Saved data cleared'); renderers.profile(); refreshWishButtons(); });
  };

  if (renderers[page]) renderers[page]();
  refreshWishButtons();
})();
