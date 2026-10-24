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

document.querySelectorAll('.site-mobile-nav').forEach(menu => {
  const summary = menu.querySelector('summary');
  const label = summary.querySelector('.sr-only');
  const updateLabel = () => {
    const text = menu.open ? 'Close navigation menu' : 'Open navigation menu';
    summary.setAttribute('aria-label', text);
    label.textContent = text;
  };
  updateLabel();
  menu.addEventListener('toggle', updateLabel);
});

document.addEventListener('input', event => {
  const field = event.target;
  if (field.matches?.("[aria-invalid='true']")) {
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-describedby');
  }
});

document.body.addEventListener('htmx:afterSwap', event => {
  const { target } = event.detail;
  if (target?.id === 'menu-category') target.focus();
  if (target?.id !== 'form-feedback' || !target.textContent.trim()) return;

  const invalidFields = target.querySelector('[data-invalid-fields]')?.dataset.invalidFields?.split(',') ?? [];
  target.closest('.form-panel')?.querySelectorAll('[aria-invalid]').forEach(field => {
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-describedby');
  });
  invalidFields.forEach(name => {
    const field = target.closest('section')?.querySelector(`[name="${name}"]`);
    field?.setAttribute('aria-invalid', 'true');
    field?.setAttribute('aria-describedby', 'form-feedback');
  });
  target.tabIndex = -1;
  target.focus();
});
