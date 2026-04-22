(function() {
  'use strict';

  // ---------- CONFIGURATION ----------
  // ⚠️ REPLACE WITH YOUR NEW OPENAI KEY
  const OPENAI_API_KEY = 'proj-6Ez04V1ajwUAVQ3N1KxQmCuDFDC2qqXWRE_K0biaJxN6flSxAdEuPCxsxGYej8Z24z95f-p2R7T3BlbkFJGqGQ-1NenleFNqBJB8kv02KYC36F6DCF9rHKqP8clx6vyw3h0dPqVde4TdRcLMWq0QUcTP4-sA';
  const AMAZON_AFFILIATE_TAG = 'discheap-20'; // Change to your tag

  // DOM elements
  const urlInput = document.getElementById('productUrl');
  const discountBtn = document.getElementById('discountBtn');
  const loadingPanel = document.getElementById('loadingPanel');
  const resultPanel = document.getElementById('resultPanel');
  const errorPanel = document.getElementById('errorPanel');
  
  const productNameDisplay = document.getElementById('productNameDisplay');
  const priceDisplay = document.getElementById('priceDisplay');
  const discountPercentSpan = document.getElementById('discountPercent');
  const couponCodeSpan = document.getElementById('couponCode');
  const codeSuccessRate = document.getElementById('codeSuccessRate');
  const usedPriceSpan = document.getElementById('usedPrice');
  const amazonLink = document.getElementById('amazonLink');
  const copyCodeBtn = document.getElementById('copyCodeBtn');
  const savingsBadge = document.getElementById('savingsBadge');

  // Mock coupon database (since Keepa free tier requires payment)
  const MOCK_COUPONS = [
    { code: 'SAVE15NOW', discount: 15, success: 88 },
    { code: 'DEAL10', discount: 10, success: 76 },
    { code: 'SMART5', discount: 5, success: 92 },
    { code: 'TECH20', discount: 20, success: 64 },
    { code: 'WAREHOUSE10', discount: 10, success: 81 }
  ];

  // Helper: extract ASIN from Amazon URL
  function extractAsin(url) {
    const patterns = [
      /\/dp\/([A-Z0-9]{10})/,
      /\/product\/([A-Z0-9]{10})/,
      /\/gp\/product\/([A-Z0-9]{10})/,
      /\/exec\/obidos\/tg\/detail\/-\/([A-Z0-9]{10})/,
      /\/asin\/([A-Z0-9]{10})/
    ];
    for (let p of patterns) {
      const match = url.match(p);
      if (match) return match[1];
    }
    return null;
  }

  // Extract product info via OpenAI
  async function extractProductInfo(url) {
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'YOUR_NEW_KEY_HERE') {
      throw new Error('Missing OpenAI API key. Add your key in script.js.');
    }

    const prompt = `Extract the main product name and estimated price from this Amazon URL: "${url}". Return ONLY a JSON object like: {"name": "Product Name", "price": 129.99}. If price is unclear, estimate based on similar items.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a product extraction assistant. Output only JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 150
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenAI error: ${response.status} - ${err}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    const jsonMatch = content.match(/\{.*\}/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Could not parse product info');
  }

  function computeDiscount(price) {
    const coupon = MOCK_COUPONS[Math.floor(Math.random() * MOCK_COUPONS.length)];
    return {
      code: coupon.code,
      percent: coupon.discount,
      success: coupon.success,
      discountedPrice: (price * (1 - coupon.discount/100)).toFixed(2)
    };
  }

  function computeUsedPrice(price) {
    const reduction = 0.22 + (Math.random() * 0.12);
    return (price * (1 - reduction)).toFixed(2);
  }

  function resetUI() {
    resultPanel.style.display = 'none';
    errorPanel.classList.add('hidden');
    errorPanel.innerHTML = '';
  }

  function showError(msg) {
    errorPanel.innerHTML = msg;
    errorPanel.classList.remove('hidden');
  }

  async function handleDiscount() {
    const url = urlInput.value.trim();
    if (!url) {
      showError('Please paste a product link.');
      return;
    }

    resetUI();
    loadingPanel.classList.remove('hidden');
    discountBtn.disabled = true;

    try {
      const productInfo = await extractProductInfo(url);
      const productName = productInfo.name || 'Item';
      const originalPrice = parseFloat(productInfo.price) || 129.99;

      const discount = computeDiscount(originalPrice);
      const usedPrice = computeUsedPrice(originalPrice);
      const asin = extractAsin(url) || 'B0EXAMPLE';
      
      const affUrl = `https://www.amazon.com/dp/${asin}?tag=${AMAZON_AFFILIATE_TAG}`;

      productNameDisplay.textContent = productName;
      priceDisplay.innerHTML = `Original price: <span style="font-weight:700; color:#f0f3f8;">$${originalPrice.toFixed(2)}</span>`;
      discountPercentSpan.textContent = `-${discount.percent}%`;
      couponCodeSpan.textContent = discount.code;
      codeSuccessRate.textContent = `${discount.success}%`;
      usedPriceSpan.textContent = `$${usedPrice}`;
      amazonLink.href = affUrl;
      
      savingsBadge.innerHTML = `<i class="fas fa-bolt"></i> <span id="discountPercent">-${discount.percent}%</span> with code · $${discount.discountedPrice}`;

      resultPanel.style.display = 'block';
    } catch (error) {
      console.error(error);
      showError(`⚠️ ${error.message}`);
    } finally {
      loadingPanel.classList.add('hidden');
      discountBtn.disabled = false;
    }
  }

  copyCodeBtn.addEventListener('click', () => {
    const code = couponCodeSpan.textContent;
    navigator.clipboard?.writeText(code).then(() => {
      copyCodeBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
      setTimeout(() => copyCodeBtn.innerHTML = '<i class="far fa-copy"></i> Copy', 2000);
    }).catch(() => alert('Copy manually: ' + code));
  });

  discountBtn.addEventListener('click', handleDiscount);

  urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      discountBtn.click();
    }
  });
})();
