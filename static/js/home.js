const homeHeader = document.querySelector('.site-header--home');
if (homeHeader) {
  const updateHomeHeader = () => homeHeader.classList.toggle('is-scrolled', window.scrollY > 8);
  updateHomeHeader();
  window.addEventListener('scroll', updateHomeHeader, { passive: true });
}

const carousel = document.querySelector('.home-carousel');
if (carousel) {
  const slides = [...carousel.querySelectorAll('.home-carousel__slide')];
  const video = carousel.querySelector('video');
  const pauseButton = carousel.querySelector('[data-carousel-pause]');
  const muteButton = carousel.querySelector('[data-carousel-mute]');
  let activeSlide = 0;
  let paused = false;
  let imageTimer;

  const showSlide = index => {
    activeSlide = index;
    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === activeSlide;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
    });
    if (activeSlide === 0 && !paused) video?.play();
    else video?.pause();
    if (activeSlide === 1 && !paused) imageTimer = window.setTimeout(() => showSlide(0), 6000);
  };

  const setCarouselIcon = (button, name) => {
    button.querySelectorAll('[data-carousel-icon]').forEach(icon => {
      icon.hidden = icon.dataset.carouselIcon !== name;
    });
  };

  video?.addEventListener('ended', () => showSlide(1));
  pauseButton?.addEventListener('click', () => {
    paused = !paused;
    window.clearTimeout(imageTimer);
    pauseButton.setAttribute('aria-label', paused ? 'Play carousel' : 'Pause carousel');
    setCarouselIcon(pauseButton, paused ? 'play' : 'pause');
    if (paused) video?.pause();
    else showSlide(activeSlide);
  });
  muteButton?.addEventListener('click', () => {
    if (!video) return;
    video.muted = !video.muted;
    muteButton.setAttribute('aria-label', video.muted ? 'Unmute video' : 'Mute video');
    setCarouselIcon(muteButton, video.muted ? 'muted' : 'unmuted');
  });
}

const communityCarousel = document.querySelector('[data-community-carousel]');
if (communityCarousel) {
  const slides = [...communityCarousel.querySelectorAll('.community-carousel__slide')];
  const dots = [...communityCarousel.querySelectorAll('.community-carousel__dots span')];
  const pauseButton = communityCarousel.querySelector('[data-community-carousel-pause]');
  let activeSlide = 0;
  let paused = false;
  let timer;

  const showSlide = index => {
    activeSlide = index;
    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === activeSlide;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
      dots[slideIndex]?.classList.toggle('is-active', active);
    });
    if (!paused) timer = window.setTimeout(() => showSlide((activeSlide + 1) % slides.length), 6000);
  };

  showSlide(0);
  pauseButton?.addEventListener('click', () => {
    paused = !paused;
    window.clearTimeout(timer);
    pauseButton.textContent = paused ? '▶' : 'Ⅱ';
    pauseButton.setAttribute('aria-label', paused ? 'Play carousel' : 'Pause carousel');
    if (!paused) showSlide(activeSlide);
  });
}

const reviewsCarousel = document.querySelector('[data-reviews-carousel]');
if (reviewsCarousel) {
  const slides = [...reviewsCarousel.querySelectorAll('.review-slide')];
  const dots = [...reviewsCarousel.querySelectorAll('.reviews-dots button')];
  const pauseButton = reviewsCarousel.querySelector('[data-reviews-pause]');
  let activeSlide = 0;
  let paused = false;
  let timer;

  const showReview = index => {
    activeSlide = index;
    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === activeSlide;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
      dots[slideIndex].classList.toggle('is-active', active);
    });
    if (!paused) timer = window.setTimeout(() => showReview((activeSlide + 1) % slides.length), 7000);
  };

  showReview(0);
  dots.forEach((dot, index) => dot.addEventListener('click', () => {
    window.clearTimeout(timer);
    showReview(index);
  }));
  pauseButton?.addEventListener('click', () => {
    paused = !paused;
    window.clearTimeout(timer);
    pauseButton.textContent = paused ? '▶' : 'Ⅱ';
    pauseButton.setAttribute('aria-label', paused ? 'Play reviews carousel' : 'Pause reviews carousel');
    if (!paused) showReview(activeSlide);
  });
}
