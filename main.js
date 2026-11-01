(() => {
  const prefix = document.body.dataset.pathPrefix || '';
  const headerHost = document.querySelector('[data-site-header]');
  const footerHost = document.querySelector('[data-site-footer]');

  if (headerHost) {
    const here = location.pathname.split('/').pop() || 'index.html';
    const links = [['index.html', 'Home'], ['discover.html', 'Discover'], ['categories.html', 'Categories'], ['deals.html', 'Deals'], ['ai-styling.html', 'AI Styling'], ['closet.html', 'My Closet']];
    const current = (file) => (file === here || (file === 'categories.html' && here === 'category.html') || (file === 'discover.html' && here === 'look.html') ? ' aria-current="page"' : '');
    headerHost.innerHTML = `
      <header class="site-header">
        <a class="brand" href="${prefix}index.html" aria-label="SOLO home"><span class="brand-mark" aria-hidden="true">S</span><span>SOLO</span></a>
        <nav class="site-nav" id="site-navigation" aria-label="Main navigation">
          ${links.map(([file, label]) => `<a href="${prefix}${file}"${current(file)}>${label}</a>`).join('')}
          <a class="nav-wish" href="${prefix}wishlist.html"${current('wishlist.html')}>Wishlist <span class="nav-count" data-wish-count hidden>0</span></a>
          <a class="nav-cta" href="${prefix}profile.html">Login</a>
        </nav>
        <a class="header-wish" href="${prefix}wishlist.html" aria-label="Wishlist"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.3-9.2C1.6 8.2 3.3 5 6.6 5c2 0 3.6 1.1 5.4 3 1.8-1.9 3.4-3 5.4-3 3.3 0 5 3.2 3.9 6.3-1.8 4.6-9.3 9.2-9.3 9.2z"/></svg><span class="nav-count" data-wish-count hidden>0</span></a>
        <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-navigation"><span class="menu-icon" aria-hidden="true">☰</span><span>Menu</span></button>
      </header>`;
  }

  if (footerHost) {
    footerHost.innerHTML = `
      <footer class="site-footer">
        <div class="wrap">
          <div class="footer-top">
            <div><a class="brand" href="${prefix}index.html"><span class="brand-mark" aria-hidden="true">S</span><span>SOLO</span></a><p class="footer-note">An independent fashion discovery project. Thoughtful style ideas, without retailer affiliation.</p></div>
            <nav class="footer-links" aria-label="Footer navigation">
              <a href="${prefix}categories.html">Categories</a>
              <a href="${prefix}deals.html">Hot Deals</a>
              <a href="${prefix}ai-styling.html">AI Styling</a>
              <a href="${prefix}closet.html">My Closet</a>
              <a href="${prefix}wishlist.html">Wishlist</a>
              <a href="${prefix}create.html">Create Post</a>
              <a href="${prefix}about.html">About</a>
              <a href="${prefix}contact.html">Contact</a>
              <a href="${prefix}privacy.html">Privacy</a>
              <a href="${prefix}terms.html">Terms</a>
              <a href="${prefix}affiliate-disclosure.html">Affiliate disclosure</a>
              <a href="${prefix}discover.html">Discover</a>
              <a href="${prefix}styling-guides.html">Styling Guides</a>
              <a href="${prefix}articles/index.html">Journal</a>
            </nav>
          </div>
          <div class="footer-bottom"><span>© <span data-year></span> SOLO. Independent project.</span><span>Not affiliated with Amazon, Flipkart or Myntra.</span></div>
        </div>
      </footer>`;
  }

  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.site-nav');
  if (menuButton && navigation) {
    const closeMenu = () => {
      menuButton.setAttribute('aria-expanded', 'false');
      navigation.classList.remove('is-open');
      const icon = menuButton.querySelector('.menu-icon');
      if (icon) icon.textContent = '☰';
    };
    menuButton.addEventListener('click', () => {
      const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!isOpen));
      navigation.classList.toggle('is-open', !isOpen);
      const icon = menuButton.querySelector('.menu-icon');
      if (icon) icon.textContent = isOpen ? '☰' : '×';
    });
    navigation.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeMenu();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
        closeMenu();
        menuButton.focus();
      }
    });
  }

  document.querySelectorAll('[data-year]').forEach((node) => { node.textContent = new Date().getFullYear(); });

  const search = document.querySelector('[data-article-search]');
  const category = document.querySelector('[data-article-category]');
  const cards = Array.from(document.querySelectorAll('[data-article-card]'));
  const count = document.querySelector('[data-article-count]');
  const emptyState = document.querySelector('[data-article-empty]');
  if (search && cards.length) {
    const filterArticles = () => {
      const query = search.value.trim().toLowerCase();
      const selectedCategory = category ? category.value : 'all';
      let visible = 0;
      cards.forEach((card) => {
        const categoryMatches = selectedCategory === 'all' || card.dataset.category === selectedCategory;
        const queryMatches = !query || card.textContent.toLowerCase().includes(query);
        const matches = categoryMatches && queryMatches;
        card.hidden = !matches;
        if (matches) visible += 1;
      });
      if (count) count.textContent = `${visible} ${visible === 1 ? 'guide' : 'guides'}`;
      if (emptyState) emptyState.hidden = visible !== 0;
    };
    search.addEventListener('input', filterArticles);
    if (category) category.addEventListener('change', filterArticles);
  }

  const articleBody = document.querySelector('.article-body .prose');
  const articleHeader = document.querySelector('.article-header');
  if (articleBody && articleHeader) {
    const wordCount = articleBody.textContent.trim().split(/\s+/).filter(Boolean).length;
    const readTime = Math.max(3, Math.ceil(wordCount / 210));
    const metadata = document.createElement('p');
    metadata.className = 'article-reading-time';
    metadata.textContent = `${readTime} min read · SOLO editorial guide`;
    const deck = articleHeader.querySelector('.article-deck');
    if (deck) deck.insertAdjacentElement('afterend', metadata);

    const breadcrumb = document.createElement('nav');
    breadcrumb.className = 'article-breadcrumb wrap';
    breadcrumb.setAttribute('aria-label', 'Breadcrumb');
    const categoryName = articleHeader.querySelector('.article-byline')?.textContent || 'Article';
    breadcrumb.innerHTML = `<a href="${prefix}articles/index.html">Journal</a><span aria-hidden="true"> / </span><span>${categoryName}</span>`;
    articleHeader.insertAdjacentElement('beforebegin', breadcrumb);
  }

  document.querySelectorAll('img:not([data-fallback])').forEach((image) => { image.dataset.fallback = 'image-fallback'; });
  document.querySelectorAll('img[data-fallback]').forEach((image) => {
    image.addEventListener('error', () => {
      const container = image.parentElement;
      if (!container || container.querySelector('.image-fallback-label')) return;
      container.classList.add('image-failed');
      const fallback = document.createElement('div');
      fallback.className = 'image-fallback-label';
      fallback.setAttribute('aria-hidden', 'true');
      fallback.textContent = image.dataset.fallback === 'hero-fallback' ? 'SOLO — STYLE IN PERSPECTIVE' : 'SOLO — STYLE NOTES';
      container.appendChild(fallback);
    }, { once: true });
  });
})();
