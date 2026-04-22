// Configuration
const OPENAI_API_KEY = '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'; // Replace with your key
const AMAZON_AFFILIATE_TAG = 'discheap-20';

// Mock Data for Featured Deals & Categories
const categories = [
  { name: 'Electronics', icon: 'fa-laptop', slug: 'electronics', color: 'emerald' },
  { name: 'Fashion', icon: 'fa-tshirt', slug: 'fashion', color: 'blue' },
  { name: 'Home & Kitchen', icon: 'fa-couch', slug: 'home', color: 'purple' },
  { name: 'Beauty', icon: 'fa-spa', slug: 'beauty', color: 'pink' },
  { name: 'Sports', icon: 'fa-futbol', slug: 'sports', color: 'orange' },
  { name: 'Toys', icon: 'fa-puzzle-piece', slug: 'toys', color: 'yellow' }
];

const featuredDeals = [
  { name: 'Sony WH-1000XM5', price: 349.99, discount: 28, image: '🎧', category: 'Electronics' },
  { name: 'Nike Air Max', price: 129.99, discount: 35, image: '👟', category: 'Fashion' },
  { name: 'Instant Pot Duo', price: 89.99, discount: 22, image: '🍲', category: 'Home' }
];

// Populate categories on categories.html
if (document.getElementById('categoriesContainer')) {
  const container = document.getElementById('categoriesContainer');
  container.innerHTML = categories.map(cat => `
    <a href="product.html?cat=${cat.slug}" class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition flex items-center gap-4">
      <div class="w-14 h-14 bg-${cat.color}-100 rounded-xl flex items-center justify-center text-${cat.color}-600 text-xl"><i class="fas ${cat.icon}"></i></div>
      <div><h3 class="font-semibold text-gray-800">${cat.name}</h3><p class="text-sm text-gray-500">View deals →</p></div>
    </a>
  `).join('');
}

// Populate featured deals on homepage
if (document.getElementById('featuredDealsContainer')) {
  const container = document.getElementById('featuredDealsContainer');
  container.innerHTML = featuredDeals.map(deal => `
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
      <div class="text-4xl mb-3">${deal.image}</div>
      <h3 class="font-semibold text-gray-800">${deal.name}</h3>
      <p class="text-sm text-gray-500">${deal.category}</p>
      <div class="flex items-center justify-between mt-3">
        <span class="text-2xl font-bold text-gray-900">$${deal.price}</span>
        <span class="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">-${deal.discount}%</span>
      </div>
    </div>
  `).join('');
}

// Hero discount button (redirect to product page with URL)
const heroBtn = document.getElementById('heroDiscountBtn');
const heroInput = document.getElementById('heroUrlInput');
if (heroBtn && heroInput) {
  heroBtn.addEventListener('click', () => {
    const url = heroInput.value.trim();
    if (url) {
      window.location.href = `product.html?url=${encodeURIComponent(url)}`;
    } else {
      window.location.href = 'product.html';
    }
  });
}

// Product page AI logic (only if elements exist)
const discountBtn = document.getElementById('discountBtn');
if (discountBtn) {
  const urlInput = document.getElementById('productUrl');
  const loadingPanel = document.getElementById('loadingPanel');
  const resultPanel = document.getElementById('resultPanel');
  const errorPanel = document.getElementById('errorPanel');
  
  // Prefill from query param
  const params = new URLSearchParams(window.location.search);
  if (params.get('url')) urlInput.value = params.get('url');

  const MOCK_COUPONS = [
    { code: 'SAVE15NOW', discount: 15, success: 88 },
    { code: 'DEAL10', discount: 10, success: 76 },
    { code: 'TECH20', discount: 20, success: 64 }
  ];

  function extractAsin(url) {
    const match = url.match(/\/dp\/([A-Z0-9]{10})/) || url.match(/\/product\/([A-Z0-9]{10})/);
    return match ? match[1] : 'B0EXAMPLE';
  }

  async function handleDiscount() {
    const url = urlInput.value.trim();
    if (!url) return alert('Please paste a link');

    loadingPanel.classList.remove('hidden');
    resultPanel.classList.add('hidden');
    errorPanel.classList.add('hidden');

    try {
      // In production, call OpenAI API here
      // For demo, simulate
      await new Promise(r => setTimeout(r, 1500));
      
      const productName = 'Premium Wireless Headphones';
      const originalPrice = 199.99;
      const coupon = MOCK_COUPONS[Math.floor(Math.random() * MOCK_COUPONS.length)];
      const usedPrice = (originalPrice * 0.73).toFixed(2);
      const asin = extractAsin(url);
      
      document.getElementById('productNameDisplay').textContent = productName;
      document.getElementById('priceDisplay').innerHTML = `Original price: <span class="font-semibold">$${originalPrice}</span>`;
      document.getElementById('discountPercent').textContent = `-${coupon.discount}%`;
      document.getElementById('couponCode').textContent = coupon.code;
      document.getElementById('codeSuccessRate').textContent = `${coupon.success}%`;
      document.getElementById('usedPrice').textContent = `$${usedPrice}`;
      document.getElementById('amazonLink').href = `https://www.amazon.com/dp/${asin}?tag=${AMAZON_AFFILIATE_TAG}`;
      
      resultPanel.classList.remove('hidden');
    } catch (err) {
      errorPanel.textContent = 'Error: ' + err.message;
      errorPanel.classList.remove('hidden');
    } finally {
      loadingPanel.classList.add('hidden');
    }
  }

  discountBtn.addEventListener('click', handleDiscount);
  urlInput.addEventListener('keypress', e => e.key === 'Enter' && discountBtn.click());

  // Copy coupon
  document.getElementById('copyCodeBtn').addEventListener('click', () => {
    const code = document.getElementById('couponCode').textContent;
    navigator.clipboard?.writeText(code).then(() => {
      const btn = document.getElementById('copyCodeBtn');
      btn.innerHTML = '<i class="fas fa-check mr-1"></i> Copied!';
      setTimeout(() => btn.innerHTML = '<i class="far fa-copy mr-1"></i> Copy', 2000);
    });
  });
}
