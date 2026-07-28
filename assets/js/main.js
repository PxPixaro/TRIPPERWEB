(() => {
  'use strict';
  const qs = (selector, parent = document) => parent.querySelector(selector);
  const qsa = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));
  const body = document.body;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Active navigation.
  const page = body.dataset.page;
  qsa('[data-nav]').forEach(link => link.classList.toggle('active', link.dataset.nav === page));

  // Mobile navigation.
  const menuBtn = qs('.menu-btn');
  const nav = qs('.main-nav');
  menuBtn?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  qsa('.dropdown-toggle').forEach(button => button.addEventListener('click', event => {
    if (window.innerWidth <= 1000) {
      event.preventDefault();
      button.parentElement.classList.toggle('open');
    }
  }));

  // Reusable visibility-aware auto-rotation to avoid background work in hidden tabs.
  const createRotator = (advance, delay) => {
    let timer = 0;
    const start = () => {
      if (reducedMotion || document.hidden || timer) return;
      timer = window.setInterval(advance, delay);
    };
    const stop = () => {
      if (timer) window.clearInterval(timer);
      timer = 0;
    };
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
    start();
    return { start, stop };
  };

  // Hero slider.
  const slides = qsa('.hero-slide');
  const heroDots = qsa('.hero-dot');
  let slideIndex = 0;
  const setSlide = index => {
    if (!slides.length) return;
    slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
    heroDots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    slideIndex = index;
  };
  heroDots.forEach((dot, index) => dot.addEventListener('click', () => setSlide(index)));
  if (slides.length > 1) createRotator(() => setSlide((slideIndex + 1) % slides.length), 6500);

  // Horizontal carousels.
  qsa('[data-carousel]').forEach(wrapper => {
    const track = qs('.carousel-track', wrapper);
    if (!track) return;
    qsa('[data-dir]', wrapper).forEach(button => button.addEventListener('click', () => {
      const direction = button.dataset.dir === 'next' ? 1 : -1;
      track.scrollBy({ left: direction * track.clientWidth * 0.86, behavior: reducedMotion ? 'auto' : 'smooth' });
    }));
  });

  // Lightweight one-time reveal.
  const revealItems = qsa('.reveal');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach(item => item.classList.add('visible'));
  } else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px 80px' });
    revealItems.forEach(item => observer.observe(item));
  }

  // Testimonials.
  const reviews = qsa('.testimonial-card');
  const reviewDots = qsa('.review-dot');
  let reviewIndex = 0;
  const setReview = index => {
    reviews.forEach((review, i) => { review.hidden = i !== index; });
    reviewDots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    reviewIndex = index;
  };
  if (reviews.length) {
    setReview(0);
    reviewDots.forEach((dot, index) => dot.addEventListener('click', () => setReview(index)));
    if (reviews.length > 1) createRotator(() => setReview((reviewIndex + 1) % reviews.length), 7000);
  }

  // Search routing.
  qsa('.trip-search').forEach(form => form.addEventListener('submit', event => {
    event.preventDefault();
    const params = new URLSearchParams();
    new FormData(form).forEach((value, key) => { if (value) params.set(key, value); });
    window.location.href = `tour.html?${params.toString()}`;
  }));

  // Tour filters.
  const params = new URLSearchParams(window.location.search);
  const city = (params.get('city') || '').toLowerCase();
  const category = (params.get('category') || '').toLowerCase();
  const search = (params.get('search') || '').toLowerCase();
  const cards = qsa('.filterable-trip');
  const applyFilter = (filter = 'all') => {
    let visible = 0;
    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      const tags = (card.dataset.tags || '').toLowerCase();
      const show = (filter === 'all' || tags.includes(filter)) &&
        (!city || city === 'any' || tags.includes(city)) &&
        (!category || category === 'all' || tags.includes(category)) &&
        (!search || text.includes(search));
      card.hidden = !show;
      if (show) visible += 1;
    });
    const empty = qs('.empty-state');
    if (empty) empty.style.display = visible ? 'none' : 'block';
  };
  if (cards.length) {
    const initial = category && category !== 'all' ? category : (city && city !== 'any' ? city : 'all');
    applyFilter(initial);
    qsa('.filter-btn').forEach(button => {
      button.classList.toggle('active', button.dataset.filter === initial);
      button.addEventListener('click', () => {
        qsa('.filter-btn').forEach(item => item.classList.remove('active'));
        button.classList.add('active');
        applyFilter(button.dataset.filter);
      });
    });
  }

  // Demo enquiry forms.
  qsa('.demo-form').forEach(form => form.addEventListener('submit', event => {
    event.preventDefault();
    form.reset();
    const message = qs('.form-message', form) || form.parentElement.querySelector('.form-message');
    if (message) {
      message.style.display = 'block';
      window.setTimeout(() => { message.style.display = 'none'; }, 4000);
    }
    showToast('Thank you! Your enquiry has been received.');
  }));

  // Booking modal.
  const modal = qs('#bookingModal');
  qsa('[data-book]').forEach(button => button.addEventListener('click', event => {
    event.preventDefault();
    if (!modal) return;
    modal.classList.add('open');
    const tripField = qs('[name="trip"]', modal);
    if (tripField) tripField.value = button.dataset.book || document.title;
  }));
  qsa('[data-close-modal]').forEach(button => button.addEventListener('click', () => modal?.classList.remove('open')));
  modal?.addEventListener('click', event => { if (event.target === modal) modal.classList.remove('open'); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') modal?.classList.remove('open'); });

  // Detail tabs.
  qsa('.tab-btn').forEach(button => button.addEventListener('click', () => {
    qsa('.tab-btn').forEach(item => item.classList.remove('active'));
    qsa('.tab-panel').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    qs(`#${button.dataset.tab}`)?.classList.add('active');
  }));

  // Gallery.
  qsa('.gallery-thumbs img').forEach(image => image.addEventListener('click', () => {
    const main = qs('#mainGallery');
    if (main) main.src = image.src;
    qsa('.gallery-thumbs img').forEach(item => item.classList.remove('active'));
    image.classList.add('active');
  }));

  // FAQ.
  qsa('.accordion-btn').forEach(button => button.addEventListener('click', () => button.parentElement.classList.toggle('open')));

  // Dynamic trip detail.
  if (body.dataset.page === 'detail') {
    const title = params.get('trip');
    const price = params.get('price');
    if (title) qsa('[data-trip-title]').forEach(item => { item.textContent = title; });
    if (price) qsa('[data-trip-price]').forEach(item => { item.textContent = `₹ ${price}`; });
  }

  // Demo itinerary download.
  qsa('[data-download]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    const blob = new Blob(['DEMO ITINERARY\n\nReplace this file/content with the final itinerary PDF.\n'], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const download = document.createElement('a');
    download.href = url;
    download.download = 'demo-kalsubai-itinerary.txt';
    download.click();
    URL.revokeObjectURL(url);
  }));

  function showToast(text) {
    let toast = qs('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = text;
    toast.classList.add('show');
    window.setTimeout(() => toast.classList.remove('show'), 3000);
  }
})();
