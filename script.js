/* ============================================
   TrendPulse AI — Storefront Scripts
   ============================================ */

// --- Global state ---
let products = [];

// --- Fetch products ---
async function loadProducts() {
  try {
    const res = await fetch('/products.json');
    products = await res.json();
    return products;
  } catch (e) {
    console.error('Failed to load products:', e);
    return [];
  }
}

// --- Star rating helper ---
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

// --- Render product card ---
function renderProductCard(product) {
  const discount = Math.round((1 - product.sale_price / product.price) * 100);
  const badgeClass = (product.badge || '').toLowerCase().replace(/\s+/g, '');

  return `
    <div class="product-card">
      <a href="/product.html?id=${product.id}">
        <div class="product-card-image">
          <img src="${product.image}" alt="${product.title}" loading="lazy">
          ${product.badge ? `<span class="product-badge ${badgeClass}">${product.badge}</span>` : ''}
          ${product.free_shipping ? '<span class="free-shipping-badge">🚚 Free Shipping</span>' : ''}
        </div>
      </a>
      <div class="product-card-body">
        <div class="product-card-category">${product.category}</div>
        <a href="/product.html?id=${product.id}">
          <h3 class="product-card-title">${product.title}</h3>
        </a>
        <div class="product-card-rating">
          <span class="stars">${renderStars(product.rating)}</span>
          <span>(${product.review_count.toLocaleString()})</span>
        </div>
        <div class="product-card-price">
          <span class="current-price">$${product.sale_price.toFixed(2)}</span>
          <span class="original-price">$${product.price.toFixed(2)}</span>
          <span class="discount-tag">-${discount}%</span>
        </div>
        <div class="product-card-actions">
          <a href="/product.html?id=${product.id}" class="btn btn-secondary btn-sm">View Details</a>
          <a href="${product.paypal_link}" target="_blank" rel="noopener" class="btn btn-primary btn-sm">Buy Now</a>
        </div>
      </div>
    </div>
  `;
}

// --- Render product grid ---
function renderProductGrid(containerId, filterCategory = null) {
  const grid = document.getElementById(containerId);
  if (!grid) return;

  let filtered = products;
  if (filterCategory) {
    filtered = products.filter(p => p.category === filterCategory);
  }

  if (filtered.length === 0) {
    grid.innerHTML = '<p class="text-center" style="grid-column:1/-1;padding:40px;color:var(--gray-600);">No products found.</p>';
    return;
  }

  grid.innerHTML = filtered.map(renderProductCard).join('');
}

// --- Product detail page ---
async function renderProductDetail() {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');
  const container = document.getElementById('product-detail');
  
  if (!container) return;

  if (!productId) {
    container.innerHTML = '<p class="text-center" style="padding:60px 0;color:var(--gray-600);">Product not found. <a href="/" style="color:var(--primary);text-decoration:underline;">Browse products</a></p>';
    return;
  }

  const product = products.find(p => p.id === productId);
  if (!product) {
    container.innerHTML = '<p class="text-center" style="padding:60px 0;color:var(--gray-600);">Product not found. <a href="/" style="color:var(--primary);text-decoration:underline;">Browse products</a></p>';
    return;
  }

  const discount = Math.round((1 - product.sale_price / product.price) * 100);
  const badgeClass = (product.badge || '').toLowerCase().replace(/\s+/g, '');

  document.title = `${product.title} — TrendPulse AI`;

  container.innerHTML = `
    <div class="container">
      <div class="product-detail-grid">
        <div class="product-detail-image">
          ${product.badge ? `<span class="product-badge ${badgeClass}" style="position:absolute;top:16px;left:16px;z-index:2;">${product.badge}</span>` : ''}
          ${product.free_shipping ? '<span class="free-shipping-badge" style="position:absolute;top:16px;right:16px;z-index:2;">🚚 Free Shipping</span>' : ''}
          <img src="${product.image}" alt="${product.title}">
        </div>
        <div class="product-detail-info">
          <div class="product-detail-category">${product.category}</div>
          <h1>${product.title}</h1>
          <div class="product-detail-rating">
            <span class="stars" style="font-size:1.2rem;">${renderStars(product.rating)}</span>
            <span>${product.rating} · ${product.review_count.toLocaleString()} reviews</span>
          </div>
          <p class="product-detail-description">${product.description}</p>
          <ul class="product-features">
            ${product.features.map(f => `<li>${f}</li>`).join('')}
          </ul>
          <div class="product-detail-price">
            <div class="price-row">
              <span class="current-price">$${product.sale_price.toFixed(2)}</span>
              <span class="original-price">$${product.price.toFixed(2)}</span>
              <span class="discount-tag">Save ${discount}%</span>
            </div>
            <p class="price-note">🔥 Limited time offer — Buy now before price increases</p>
          </div>
          <div class="product-detail-actions">
            <a href="${product.paypal_link}" target="_blank" rel="noopener" class="btn btn-accent btn-lg">
              🛒 Buy Now — $${product.sale_price.toFixed(2)}
            </a>
            <a href="https://pinterest.com/pin/create/button/?url=${encodeURIComponent(window.location.href)}&media=${encodeURIComponent(product.image)}&description=${encodeURIComponent(product.title + ' — Only $' + product.sale_price.toFixed(2) + ' at TrendPulse AI')}" 
               target="_blank" rel="noopener" class="btn btn-secondary btn-lg">
              📌 Pin It
            </a>
          </div>
          <div class="product-shipping" style="margin-top:16px;padding:12px 16px;background:#f8f9fa;border-radius:10px;font-size:0.85rem;">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
              <span>🚚 <strong>Free Worldwide Shipping</strong></span>
              <span style="color:var(--gray-600);">📬 Tracking included</span>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:8px;font-size:0.8rem;color:var(--gray-600);">
              <span>🇺🇸 US/CA: <strong>10–20 days</strong></span>
              <span>🇪🇺 Europe: <strong>10–20 days</strong></span>
              <span>🇦🇺 Australia: <strong>12–22 days</strong></span>
              <span>🌏 Asia: <strong>7–15 days</strong></span>
              <span>🇬🇧 UK: <strong>10–18 days</strong></span>
              <span>🌍 Other: <strong>15–30 days</strong></span>
            </div>
          </div>
          <div class="guarantee-badges">
            <span class="guarantee-badge">✅ Secure checkout via PayPal</span>
            <span class="guarantee-badge">🔒 30-Day Money-Back Guarantee</span>
            <span class="guarantee-badge">🚚 Tracking on every order</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// --- Mobile menu toggle ---
function setupMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const nav = document.querySelector('.main-nav');
  
  if (!hamburger || !nav) return;

  hamburger.addEventListener('click', () => {
    nav.classList.toggle('open');
  });

  // Close on link click
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
    });
  });
}

// --- Active nav highlighting ---
function highlightActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.main-nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (path === href || (path === '/' && href === '/')) {
      a.classList.add('active');
    } else if (href !== '/' && path.startsWith(href)) {
      a.classList.add('active');
    }
  });
}

// --- Pinterest share on product cards ---
function setupPinterestShare() {
  document.querySelectorAll('.pinterest-share-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const url = btn.dataset.url || window.location.href;
      const media = btn.dataset.media || '';
      const desc = btn.dataset.desc || 'TrendPulse AI — Trending Products';
      const pinUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(media)}&description=${encodeURIComponent(desc)}`;
      window.open(pinUrl, '_blank', 'width=750,height=600');
    });
  });
}

// --- Newsletter form ---
function setupNewsletter() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = form.querySelector('input[type="email"]').value;
    if (email) {
      // In production, this would send to an API
      alert('🎉 Thanks for subscribing! Stay tuned for trending deals.');
      form.querySelector('input[type="email"]').value = '';
    }
  });
}

// --- Contact form ---
function setupContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('✅ Message sent! We\'ll get back to you within 24 hours.');
    form.reset();
  });
}

// --- Initialize ---
async function init() {
  await loadProducts();

  // Check what page we're on and initialize accordingly
  const path = window.location.pathname;

  if (path === '/' || path === '/index.html') {
    renderProductGrid('product-grid');
  }

  if (path.includes('/product.html')) {
    await renderProductDetail();
  }

  setupMobileMenu();
  highlightActiveNav();
  setupPinterestShare();
  setupNewsletter();
  setupContactForm();
}

document.addEventListener('DOMContentLoaded', init);