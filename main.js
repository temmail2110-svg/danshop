let currentLang = localStorage.getItem('danshop_lang') || 'ar';
const t = (key) => translations[currentLang][key] || key;

function applyLanguage() {
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        el.placeholder = t(el.dataset.i18nPlaceholder);
    });
}

function toggleLang(lang) {
    currentLang = lang;
    localStorage.setItem('danshop_lang', lang);
    window.location.reload();
}

function productCardHTML(p) {
    const name = currentLang === 'ar' ? p.name_ar : p.name_en;
    return `
    <div class="product-card">
        <a href="product.html?id=${p.id}" class="product-image">
            <img src="${p.images[0]}" alt="${name}" loading="lazy">
            ${p.old_price ? `<span class="badge-sale">-${Math.round((1 - p.price/p.old_price)*100)}%</span>` : ''}
        </a>
        <div class="product-body">
            <h3 class="product-title"><a href="product.html?id=${p.id}">${name}</a></h3>
            <div class="product-price">
                <span class="price-now">${p.price} ${currentLang === 'ar' ? 'ج.م' : 'EGP'}</span>
                ${p.old_price ? `<span class="price-old">${p.old_price}</span>` : ''}
            </div>
            <a href="product.html?id=${p.id}" class="btn btn-primary btn-block" style="margin-top:10px;">
                <i class="fa-solid fa-eye"></i> ${t('view_details')}
            </a>
        </div>
    </div>`;
}

function renderFeaturedProducts() {
    const container = document.getElementById('featured-products');
    if (!container) return;
    const featured = products.filter(p => p.featured).slice(0, 4);
    container.innerHTML = featured.map(p => productCardHTML(p)).join('');
}

function renderProducts() {
    const container = document.getElementById('products-grid');
    if (!container) return;

    const q = document.getElementById('search-input')?.value.toLowerCase() || '';
    const cat = parseInt(document.getElementById('filter-cat')?.value) || 0;
    const sort = document.getElementById('filter-sort')?.value || 'newest';

    let filtered = products.filter(p => {
        const name = currentLang === 'ar' ? p.name_ar : p.name_en;
        const matchQ = name.toLowerCase().includes(q);
        const matchCat = cat === 0 || p.cat === cat;
        return matchQ && matchCat;
    });

    if (sort === 'low') filtered.sort((a, b) => a.price - b.price);
    else if (sort === 'high') filtered.sort((a, b) => b.price - a.price);
    else filtered.sort((a, b) => b.id - a.id);

    if (filtered.length === 0) {
        container.innerHTML = `<p style="text-align:center; width:100%; padding:50px;">لا توجد منتجات تطابق بحثك.</p>`;
    } else {
        container.innerHTML = filtered.map(p => productCardHTML(p)).join('');
    }
}

function renderProductDetails() {
    const container = document.getElementById('product-detail-container');
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));
    const p = products.find(x => x.id === id);

    if (!p) { container.innerHTML = '<h1 style="text-align:center; padding:50px;">المنتج غير موجود</h1>'; return; }

    const name = currentLang === 'ar' ? p.name_ar : p.name_en;
    const desc = currentLang === 'ar' ? p.desc_ar : p.desc_en;

    container.innerHTML = `
    <div class="pd-gallery">
        <div class="main-image">
            <img id="mainImg" src="${p.images[0]}" alt="${name}">
        </div>
        <div class="thumbnails-bar">
            ${p.images.map((img, i) => `<img src="${img}" class="${i === 0 ? 'active' : ''}" onclick="changeImg(this, '${img}')" loading="lazy">`).join('')}
        </div>
    </div>
    <div class="pd-info">
        <h1>${name}</h1>
        <div class="pd-price">
            ${p.price} ${currentLang === 'ar' ? 'ج.م' : 'EGP'}
            ${p.old_price ? `<span style="font-size:1rem; text-decoration:line-through; color:#999; margin-right:10px;">${p.old_price}</span>` : ''}
        </div>
        <p class="pd-desc">${desc}</p>
        
        <div style="margin-top:20px;">
            <a href="https://wa.me/201000000000?text=مرحباً، أريد الاستفسار عن المنتج: ${name}" target="_blank" class="btn btn-accent" style="width:100%; font-size:1.1rem; padding:15px;">
                <i class="fa-brands fa-whatsapp"></i> ${t('contact_whatsapp')}
            </a>
        </div>
    </div>`;
}

function changeImg(el, src) {
    document.getElementById('mainImg').src = src;
    document.querySelectorAll('.thumbnails-bar img').forEach(img => img.classList.remove('active'));
    el.classList.add('active');
}

function toggleMenu() {
    document.getElementById('navLinks').classList.toggle('open');
}

document.addEventListener('DOMContentLoaded', () => {
    applyLanguage();
    
    if (document.getElementById('featured-products')) renderFeaturedProducts();
    if (document.getElementById('products-grid')) renderProducts();
    if (document.getElementById('product-detail-container')) renderProductDetails();

    document.getElementById('search-input')?.addEventListener('input', renderProducts);
    document.getElementById('filter-cat')?.addEventListener('change', renderProducts);
    document.getElementById('filter-sort')?.addEventListener('change', renderProducts);
});