(() => {
  const D = window.SOLO_DATA;
  const main = document.querySelector('main[data-page]');
  if (!D || !main) return;
  const page = main.dataset.page;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
  const pct = (p) => Math.round((1 - p.price / p.original) * 100);
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
      <div class="s-product-img">${imgTag(p.image, p.title)}<span class="s-tag">${esc(p.category)}</span>
        ${opts.deal ? `<span class="s-off">${pct(p)}% OFF</span>` : ''}
        <button class="s-icon-btn s-wish ${wished ? 'is-on' : ''}" data-wish-prod="${p.id}" aria-pressed="${wished}" aria-label="${wished ? 'Remove from' : 'Add to'} wishlist">${icon.heart}</button></div>
      <div class="s-product-body">
        <p class="s-merchant">${esc(p.merchant)}</p>
        <h3>${esc(p.title)}</h3>
        <p class="s-price"><strong>${inr(p.price)}</strong><s>${inr(p.original)}</s><span class="s-save">Save ${inr(p.original - p.price)}</span></p>
        <button class="s-btn s-btn-soft" data-shop-prod="${p.id}">${icon.bag} Shop Now</button>
      </div></article>`;
  };

  const chips = (items, active, attr) => items.map((c) => `<button class="s-chip ${c === active ? 'is-on' : ''}" ${attr}="${esc(c)}" aria-pressed="${c === active}">${esc(c)}</button>`).join('');

  // ---------- Modal for shop actions ----------
  const shopDialog = (title, items, total) => {
    let dlg = $('#s-dialog');
    if (!dlg) { dlg = document.createElement('dialog'); dlg.id = 's-dialog'; dlg.className = 's-dialog'; document.body.appendChild(dlg); }
    dlg.innerHTML = `<form method="dialog"><button class="s-dialog-x" aria-label="Close">×</button></form>
      <h2>${esc(title)}</h2>
      <ul class="s-dialog-list">${items.map((p) => `<li>${imgTag(p.image, p.title)}<span>${esc(p.title)}<small>${esc(p.merchant)}</small></span><b>${inr(p.price)}</b></li>`).join('')}</ul>
      ${total ? `<p class="s-dialog-total"><span>Sample total</span><b>${inr(total)}</b></p>` : ''}
      <p class="s-note">Retailer checkout is not connected on this website yet. These are sample prices from the SOLO demo catalogue, so nothing can be purchased here.</p>
      <div class="s-dialog-actions">${items.map((p) => `<button class="s-btn s-btn-soft" data-closet="${p.id}">${has('closet', p.id) ? 'In closet ✓' : 'Add to My Closet'}</button>`).join('')}</div>`;
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
  };

  // ---------- Global interactions ----------
  const refreshWishButtons = () => {
    $$('[data-wish-look]').forEach((b) => { const on = has('wishLooks', b.dataset.wishLook); b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); });
    $$('[data-wish-prod]').forEach((b) => { const on = has('wishProds', b.dataset.wishProd); b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); });
    const n = state.wishLooks.length + state.wishProds.length;
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
      shopDialog(o.name + ' — full look', ps, ps.reduce((s, p) => s + p.price, 0));
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
    const hero = D.outfits;
    let filter = 'For You';
    const looksFor = (f) => D.outfits.filter((o) => f === 'For You' || (f === 'Trending' ? o.badge === 'Trending' || o.tags.includes('Trending') : f === 'New' ? o.badge === 'New' : o.tags.includes(f)));
    const draw = () => { $('#home-chips').innerHTML = chips(D.discoverFilters, filter, 'data-hf'); const l = looksFor(filter).slice(0, 4); $('#home-looks').innerHTML = l.length ? l.map(lookCard).join('') : '<p class="s-empty">No looks in this filter yet.</p>'; };
    main.innerHTML = `
    <section class="s-hero wrap">
      <div class="s-hero-copy">
        <p class="s-eyebrow">AI-powered fashion discovery</p>
        <h1>Find the look that feels like <em>you</em>.</h1>
        <p class="s-lead">SOLO is a personal styling platform that helps you discover outfits, compare prices and build a closet you actually wear.</p>
        <div class="s-cta"><a class="s-btn s-btn-lg" href="discover.html">Discover Your Style</a><a class="s-btn s-btn-lg s-btn-ghost" href="discover.html?filter=Trending">Explore Trending Looks</a></div>
        <ul class="s-hero-stats"><li><b>${D.outfits.length}</b> curated looks</li><li><b>${D.products.length}</b> sample pieces</li><li><b>${D.categories.length}</b> categories</li></ul>
      </div>
      <div class="s-hero-art" aria-hidden="false">
        <div class="s-hero-main">${imgTag(hero[0].image, hero[0].name)}<span class="s-hero-cap"><b>${esc(hero[0].name)}</b>by ${esc(hero[0].creator)}</span></div>
        <div class="s-hero-side"><div>${imgTag(hero[1].image, hero[1].name)}</div><div>${imgTag(hero[3].image, hero[3].name)}</div></div>
        <div class="s-hero-chip">✦ Styled by SOLO</div>
      </div>
    </section>
    <section class="wrap s-section">${heading('Trending fashion discovery', 'Looks to try now', 'discover.html', 'See all looks')}
      <div class="s-chips" id="home-chips"></div><div class="s-grid s-grid-looks" id="home-looks"></div></section>
    <section class="wrap s-section">${heading('Shop by category', 'Trending categories', 'categories.html', 'All categories')}
      <div class="s-cat-row">${D.trendingCategories.map(catTile).join('')}</div></section>
    <section class="wrap s-section"><div class="s-deal-banner"><div><p class="s-eyebrow s-light">Hot deals</p><h2>Sample price drops, up to ${Math.max(...D.products.map(pct))}% off</h2><p>Browse the demo price edit and see how savings are calculated.</p></div><a class="s-btn s-btn-white" href="deals.html">View Hot Deals</a></div>
      <div class="s-grid s-grid-products">${D.products.filter((p) => p.flash).slice(0, 4).map((p) => productCard(p, { deal: true })).join('')}</div></section>
    <section class="wrap s-section">${heading('Popular products', 'Most saved pieces', 'categories.html', 'Browse all')}
      <div class="s-grid s-grid-products">${D.products.slice(0, 8).map((p) => productCard(p)).join('')}</div></section>
    <section class="wrap s-section s-feature-pair">
      <a class="s-feature s-feature-ai" href="ai-styling.html"><p class="s-eyebrow s-light">AI Styling</p><h2>Tell SOLO the occasion. Get a look.</h2><p>Pick an occasion, mood and budget for a ready-to-shop outfit suggestion from the sample catalogue.</p><span class="s-link s-link-light">Try AI Styling ${icon.arrow}</span></a>
      <a class="s-feature s-feature-closet" href="closet.html"><p class="s-eyebrow">My Closet</p><h2>Keep every piece in one place.</h2><p>Save what you own or love, see your closet value and plan outfits around it.</p><span class="s-link">Open My Closet ${icon.arrow}</span></a>
    </section>
    <section class="wrap s-section">${heading('Social fashion community', 'Seen in the community', 'create.html', 'Create a post')}
      <div class="s-grid s-grid-community">${D.posts.map((po) => `<article class="s-post"><div class="s-post-img">${imgTag(po.image, po.caption)}</div><div class="s-post-body"><p class="s-creator">${esc(po.creator)}</p><p>“${esc(po.caption)}”</p><div class="s-post-tags">${po.productIds.map((id) => `<a href="categories.html">${esc(byId(id).title)}</a>`).join('')}</div></div></article>`).join('')}</div>
      <p class="s-note">Community posts shown here are sample content. Publishing to a live community is not available on the website yet.</p></section>`;
    draw();
    main.addEventListener('click', (e) => { const c = e.target.closest('[data-hf]'); if (c) { filter = c.dataset.hf; draw(); } });
  };

  const catTile = (name) => {
    const items = D.products.filter((p) => p.category === name);
    const slug = slugOf(name);
    return `<a class="s-cat-tile" href="category.html?c=${slug}">${imgTag(items[0] ? items[0].image : D.products[0].image, name)}${D.trendingCategories.includes(name) ? '<span class="s-badge s-badge-trending">Trending</span>' : ''}<span class="s-cat-label"><b>${esc(name)}</b><small>${items.length} ${items.length === 1 ? 'item' : 'items'}</small></span></a>`;
  };

  // ---------- Discover ----------
  renderers.discover = () => {
    const params = new URLSearchParams(location.search);
    let filter = D.discoverFilters.includes(params.get('filter')) ? params.get('filter') : 'For You';
    let q = ''; let cat = 'all';
    main.innerHTML = `<section class="wrap s-page-head"><p class="s-eyebrow">Discover</p><h1>Fashion inspiration, made personal.</h1><p class="s-lead">Browse looks by mood, search by creator or piece, and open any look to shop it.</p></section>
    <section class="wrap">
      <div class="s-toolbar"><label class="s-search"><span class="s-sr">Search looks</span><input type="search" id="d-q" placeholder="Search looks, creators or pieces" autocomplete="off"></label>
        <label class="s-select"><span class="s-sr">Category</span><select id="d-cat"><option value="all">All categories</option>${D.categories.map((c) => `<option value="${c.slug}">${esc(c.name)}</option>`).join('')}</select></label></div>
      <div class="s-chips" id="d-chips"></div><p class="s-count" id="d-count" aria-live="polite"></p>
      <div class="s-grid s-grid-looks" id="d-grid"></div><p class="s-empty" id="d-empty" hidden>No looks match. Try clearing a filter.</p></section>
    <section class="wrap s-section">${heading('Shop the picks', 'Pieces from these looks', 'categories.html', 'Shop by category')}<div class="s-grid s-grid-products" id="d-prods"></div></section>`;
    const draw = () => {
      $('#d-chips').innerHTML = chips(D.discoverFilters, filter, 'data-df');
      const ql = q.trim().toLowerCase();
      const list = D.outfits.filter((o) => {
        const ps = outfitProducts(o);
        const fm = filter === 'For You' || (filter === 'Trending' ? o.badge === 'Trending' || o.tags.includes('Trending') : filter === 'New' ? o.badge === 'New' : o.tags.includes(filter));
        const cm = cat === 'all' || ps.some((p) => slugOf(p.category) === cat);
        const qm = !ql || [o.name, o.creator, o.description, o.tag, ...ps.map((p) => p.title)].join(' ').toLowerCase().includes(ql);
        return fm && cm && qm;
      });
      $('#d-grid').innerHTML = list.map(lookCard).join('');
      $('#d-count').textContent = `${list.length} ${list.length === 1 ? 'look' : 'looks'}`;
      $('#d-empty').hidden = list.length > 0;
      const ids = [...new Set(list.flatMap((o) => o.productIds))];
      $('#d-prods').innerHTML = ids.slice(0, 8).map((id) => productCard(byId(id))).join('');
    };
    $('#d-q').addEventListener('input', (e) => { q = e.target.value; draw(); });
    $('#d-cat').addEventListener('change', (e) => { cat = e.target.value; draw(); });
    main.addEventListener('click', (e) => { const c = e.target.closest('[data-df]'); if (c) { filter = c.dataset.df; draw(); } });
    draw();
  };

  // ---------- Look detail ----------
  renderers.look = () => {
    const id = new URLSearchParams(location.search).get('id');
    const o = D.outfits.find((x) => x.id === id);
    if (!o) { main.innerHTML = `<section class="wrap s-page-head"><h1>Look not found</h1><p class="s-lead">This look may have moved. <a href="discover.html">Browse all looks</a>.</p></section>`; return; }
    document.title = `${o.name} — SOLO`;
    const ps = outfitProducts(o);
    const total = ps.reduce((s, p) => s + p.price, 0);
    const orig = ps.reduce((s, p) => s + p.original, 0);
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
            <ul class="s-shop-list">${ps.map((p) => `<li><img src="${p.image}" alt="${esc(p.title)}" loading="lazy"><div><b>${esc(p.title)}</b><small>${esc(p.category)} · ${esc(p.merchant)}</small>
              <span class="s-price"><strong>${inr(p.price)}</strong><s>${inr(p.original)}</s><span class="s-save">Save ${pct(p)}%</span></span></div>
              <button class="s-btn s-btn-soft s-btn-sm" data-shop-prod="${p.id}">Shop</button></li>`).join('')}</ul>
            <div class="s-total"><div><small>Full look</small><b>${inr(total)}</b> <s>${inr(orig)}</s></div><span class="s-save">You save ${inr(orig - total)}</span></div>
            <button class="s-btn s-btn-lg s-btn-block" data-shop-look="${o.id}">Shop Full Look · ${inr(total)}</button>
            <p class="s-note">Sample catalogue prices. Retailer checkout and best-price comparison are not connected on this website yet.</p></section>
        </div></div></section>
      <section class="wrap s-section">${heading('More to explore', 'You may also like', 'discover.html', 'All looks')}<div class="s-grid s-grid-looks">${D.outfits.filter((x) => x.id !== o.id).slice(0, 4).map(lookCard).join('')}</div></section>`;
  };

  // ---------- Categories ----------
  renderers.categories = () => {
    const count = (n) => D.products.filter((p) => p.category === n).length;
    main.innerHTML = `<section class="wrap s-page-head"><p class="s-eyebrow">Find your starting point</p><h1>Shop by Category</h1><p class="s-lead">Explore the sample edit by piece and styling mood.</p></section>
    <section class="wrap"><a class="s-banner" href="category.html?c=lehengas"><div><p class="s-eyebrow s-light">Trending now</p><h2>Festive, your way.</h2><p>Explore colour, craft and occasion ideas.</p></div>${icon.arrow}</a></section>
    <section class="wrap s-section">${heading('A few paths into the edit', 'Trending Categories')}<div class="s-cat-grid">${D.categories.map((c) => catTile(c.name)).join('')}</div></section>
    <section class="wrap s-section">${heading('More ways to browse', 'All Categories')}<ul class="s-cat-list">${D.categories.map((c) => { const first = D.products.find((p) => p.category === c.name); return `<li><a href="category.html?c=${c.slug}">${imgTag(first ? first.image : D.products[0].image, c.name)}<span><b>${esc(c.name)}</b><small>${count(c.name)} sample ${count(c.name) === 1 ? 'item' : 'items'}</small></span>${D.trendingCategories.includes(c.name) ? '<em class="s-pill">Trending</em>' : ''}${icon.arrow}</a></li>`; }).join('')}</ul>
      <p class="s-note">Counts refer to SOLO's sample catalogue only, not retailer inventory.</p></section>`;
  };

  renderers.category = () => {
    const c = catBySlug(new URLSearchParams(location.search).get('c'));
    if (!c) { main.innerHTML = `<section class="wrap s-page-head"><h1>Category not found</h1><p class="s-lead"><a href="categories.html">Back to all categories</a></p></section>`; return; }
    document.title = `${c.name} — SOLO`;
    let sort = 'featured'; let max = 'all'; let onSale = false;
    const all = D.products.filter((p) => p.category === c.name);
    main.innerHTML = `<section class="wrap s-page-head"><nav class="s-crumb" aria-label="Breadcrumb"><a href="categories.html">Categories</a> / <span>${esc(c.name)}</span></nav><h1>${esc(c.name)}</h1><p class="s-lead">${all.length} sample ${all.length === 1 ? 'item' : 'items'}. Filter and sort to narrow your search.</p></section>
    <section class="wrap"><div class="s-toolbar">
      <label class="s-select"><span class="s-sr">Sort</span><select id="c-sort"><option value="featured">Sort: Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="disc">Biggest discount</option><option value="new">Newest</option></select></label>
      <label class="s-select"><span class="s-sr">Price</span><select id="c-max"><option value="all">Any price</option><option value="1000">Under ₹1,000</option><option value="2000">Under ₹2,000</option><option value="3000">Under ₹3,000</option></select></label>
      <label class="s-check"><input type="checkbox" id="c-sale"> On sale (20%+ off)</label></div>
      <p class="s-count" id="c-count" aria-live="polite"></p><div class="s-grid s-grid-products" id="c-grid"></div><p class="s-empty" id="c-empty" hidden>No products match these filters.</p></section>
    <section class="wrap s-section">${heading('Keep browsing', 'Other categories', 'categories.html', 'All categories')}<div class="s-cat-row">${D.categories.filter((x) => x.slug !== c.slug).slice(0, 4).map((x) => catTile(x.name)).join('')}</div></section>`;
    const draw = () => {
      let list = all.filter((p) => (max === 'all' || p.price <= +max) && (!onSale || pct(p) >= 20));
      const sorters = { low: (a, b) => a.price - b.price, high: (a, b) => b.price - a.price, disc: (a, b) => pct(b) - pct(a), new: (a, b) => b.added - a.added };
      if (sorters[sort]) list = [...list].sort(sorters[sort]);
      $('#c-grid').innerHTML = list.map((p) => productCard(p)).join('');
      $('#c-count').textContent = `${list.length} ${list.length === 1 ? 'product' : 'products'}`;
      $('#c-empty').hidden = list.length > 0;
    };
    $('#c-sort').addEventListener('change', (e) => { sort = e.target.value; draw(); });
    $('#c-max').addEventListener('change', (e) => { max = e.target.value; draw(); });
    $('#c-sale').addEventListener('change', (e) => { onSale = e.target.checked; draw(); });
    draw();
  };

  // ---------- Deals ----------
  renderers.deals = () => {
    let f = 'All Deals';
    const filters = ['All Deals', 'Flash Deals', 'High Discount'];
    const stats = (list) => { const saved = list.reduce((s, p) => s + p.original - p.price, 0); return [[list.length, 'Deals'], [list.length ? Math.max(...list.map(pct)) + '%' : '—', 'Top discount'], [inr(saved), 'Total savings']]; };
    main.innerHTML = `<section class="wrap"><div class="s-deals-head"><p class="s-eyebrow s-light">The festive price edit</p><h1>Hot Deals</h1><p>Sample catalogue discounts. These are demo prices, not live retailer offers, and there are no countdowns.</p><div class="s-stats" id="x-stats"></div></div>
      <div class="s-chips" id="x-chips"></div><p class="s-count" id="x-count" aria-live="polite"></p><div class="s-grid s-grid-products" id="x-grid"></div></section>`;
    const draw = () => {
      $('#x-chips').innerHTML = chips(filters, f, 'data-xf');
      const list = D.products.filter((p) => f === 'All Deals' || (f === 'Flash Deals' ? p.flash : pct(p) >= 30)).sort((a, b) => pct(b) - pct(a));
      $('#x-stats').innerHTML = stats(list).map(([v, l]) => `<div><b>${v}</b><span>${l}</span></div>`).join('');
      $('#x-count').textContent = `${list.length} ${list.length === 1 ? 'deal' : 'deals'}`;
      $('#x-grid').innerHTML = list.length ? list.map((p) => productCard(p, { deal: true })).join('') : '<p class="s-empty">No deals in this filter.</p>';
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

  // ---------- AI Styling (rule-based demo) ----------
  renderers.ai = () => {
    const occasions = { 'Wedding Guest': ['Wedding Guest'], 'Diwali Glam': ['Diwali Glam'], 'Everyday': ['Casual', 'Ethnic Classics'], 'Date Night': ['Date Night', 'Party Edit'], 'Weekend Street': ['Streetwear', 'Casual'], 'Winter Layers': ['Winter', 'Minimalist'] };
    main.innerHTML = `<section class="wrap s-narrow"><div class="s-page-head"><p class="s-eyebrow">AI Styling</p><h1>Tell SOLO the occasion.</h1><p class="s-lead">Choose an occasion and a budget. SOLO assembles a look from the sample catalogue.</p></div>
    <form class="s-form" id="a-form"><div class="s-field"><label class="s-label" for="a-occ">Occasion</label><select id="a-occ">${Object.keys(occasions).map((k) => `<option>${k}</option>`).join('')}</select></div>
      <div class="s-field"><label class="s-label" for="a-bud">Budget <b id="a-bud-v">₹5,000</b></label><input type="range" id="a-bud" min="1500" max="10000" step="500" value="5000"></div>
      <button class="s-btn s-btn-lg s-btn-block" type="submit">Style me</button></form>
    <div id="a-out" aria-live="polite"></div>
    <p class="s-note">This is a rule-based demo that matches tags and prices in the sample catalogue. It is not a live AI model and doesn't analyse photos.</p></section>`;
    $('#a-bud').addEventListener('input', (e) => { $('#a-bud-v').textContent = inr(+e.target.value); });
    $('#a-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const want = occasions[$('#a-occ').value]; const budget = +$('#a-bud').value;
      let picks = []; let spent = 0;
      const pool = D.products.filter((p) => p.tags.some((t) => want.includes(t))).sort((a, b) => pct(b) - pct(a));
      const seenCats = new Set();
      for (const p of pool) { if (seenCats.has(p.category) || spent + p.price > budget) continue; picks.push(p); seenCats.add(p.category); spent += p.price; if (picks.length === 3) break; }
      const out = $('#a-out');
      if (!picks.length) { out.innerHTML = '<p class="s-empty">Nothing in the sample catalogue fits that budget. Try raising it.</p>'; return; }
      out.innerHTML = `<h2 class="s-out-title">Your look · ${inr(spent)}</h2><div class="s-grid s-grid-products">${picks.map((p) => productCard(p)).join('')}</div>`;
    });
  };

  // ---------- Closet ----------
  const renderCloset = () => {
    const items = state.closet.map(byId).filter(Boolean);
    const value = items.reduce((s, p) => s + p.price, 0);
    main.innerHTML = `<section class="wrap s-page-head"><p class="s-eyebrow">My Closet</p><h1>Your pieces, in one place.</h1><p class="s-lead">Items you add are kept in this browser only.</p></section>
    <section class="wrap"><div class="s-stats s-stats-light"><div><b>${items.length}</b><span>Pieces</span></div><div><b>${inr(value)}</b><span>Closet value (sample)</span></div></div>
      ${items.length ? `<div class="s-grid s-grid-products">${items.map((p) => `<article class="s-product"><div class="s-product-img">${imgTag(p.image, p.title)}<span class="s-tag">${esc(p.category)}</span></div><div class="s-product-body"><h3>${esc(p.title)}</h3><p class="s-price"><strong>${inr(p.price)}</strong></p><button class="s-btn s-btn-soft" data-closet="${p.id}">Remove from closet</button></div></article>`).join('')}</div>`
      : `<div class="s-emptybox"><h2>Your closet is empty</h2><p>Open any product with Shop Now and choose “Add to My Closet”.</p><a class="s-btn" href="categories.html">Browse categories</a></div>`}</section>`;
  };
  renderers.closet = renderCloset;

  // ---------- Wishlist ----------
  const renderWishlist = () => {
    const looks = state.wishLooks.map((id) => D.outfits.find((o) => o.id === id)).filter(Boolean);
    const prods = state.wishProds.map(byId).filter(Boolean);
    main.innerHTML = `<section class="wrap s-page-head"><p class="s-eyebrow">Wishlist</p><h1>Saved for later.</h1><p class="s-lead">Looks and products you've saved on this device.</p></section>
    <section class="wrap">${!looks.length && !prods.length ? `<div class="s-emptybox"><h2>Nothing saved yet</h2><p>Tap the heart on any look or product to save it here.</p><a class="s-btn" href="discover.html">Discover looks</a></div>` : ''}
      ${looks.length ? `<h2 class="s-sub">Looks</h2><div class="s-grid s-grid-looks">${looks.map(lookCard).join('')}</div>` : ''}
      ${prods.length ? `<h2 class="s-sub">Products</h2><div class="s-grid s-grid-products">${prods.map((p) => productCard(p)).join('')}</div>` : ''}</section>`;
  };
  renderers.wishlist = renderWishlist;

  // ---------- Profile / Login ----------
  renderers.profile = () => {
    main.innerHTML = `<section class="wrap s-narrow"><div class="s-page-head"><p class="s-eyebrow">Account</p><h1>Login &amp; Profile</h1><p class="s-lead">Accounts live in the SOLO mobile app. The website doesn't have sign-in yet, so nothing here asks for a password.</p></div>
    <div class="s-profile"><div class="s-avatar s-avatar-lg">S</div><div><b>Guest on this device</b><small>Your wishlist and closet are saved in this browser only.</small></div></div>
    <div class="s-stats s-stats-light"><div><b>${state.wishLooks.length + state.wishProds.length}</b><span>Wishlist</span></div><div><b>${state.closet.length}</b><span>Closet</span></div></div>
    <div class="s-cta"><a class="s-btn" href="wishlist.html">Open Wishlist</a><a class="s-btn s-btn-ghost" href="closet.html">Open My Closet</a></div>
    <p class="s-note"><button class="s-link-btn" id="clear-data">Clear saved data on this device</button></p></section>`;
    $('#clear-data').addEventListener('click', () => { state = { wishLooks: [], wishProds: [], closet: [], liked: [] }; save(); try { localStorage.removeItem('solo.web.drafts'); } catch { /* ignore */ } toast('Saved data cleared'); renderers.profile(); refreshWishButtons(); });
  };

  if (renderers[page]) renderers[page]();
  refreshWishButtons();
})();
