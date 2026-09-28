(() => {
  const DESIGN_W = 1920;
  const DESIGN_H = 1080;
  const slides = [...document.querySelectorAll('.slide')];
  const notes = document.querySelector('.presenter-notes');
  const notesText = notes.querySelector('p');
  const counter = document.querySelector('.counter');
  const progress = document.querySelector('.progress i');
  let index = Math.max(0, Math.min(slides.length - 1, Number(location.hash.replace('#', '')) - 1 || 0));
  let step = 0;

  function fit() {
    const scale = Math.min(innerWidth / DESIGN_W, innerHeight / DESIGN_H);
    document.documentElement.style.setProperty('--deck-scale', scale);
  }

  function fragments(slide = slides[index]) {
    return [...slide.querySelectorAll('.fragment')].sort((a, b) => Number(a.dataset.step) - Number(b.dataset.step));
  }

  function maxStep(slide = slides[index]) {
    return fragments(slide).reduce((max, el) => Math.max(max, Number(el.dataset.step) || 0), 0);
  }

  function render(reason = 'navigation') {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
      slide.setAttribute('aria-hidden', i === index ? 'false' : 'true');
      if (i !== index) slide.querySelectorAll('.fragment').forEach(el => el.classList.remove('visible'));
    });
    fragments().forEach(el => el.classList.toggle('visible', Number(el.dataset.step) <= step));
    counter.textContent = `${index + 1} / ${slides.length}`;
    progress.style.width = `${((index + (maxStep() ? step / (maxStep() + 1) : 0)) / slides.length) * 100}%`;
    notesText.textContent = slides[index].dataset.notes || '';
    history.replaceState(null, '', `#${index + 1}`);
    document.title = `${slides[index].dataset.title} — From lab to industry`;
    if (reason === 'navigation') {
      const video = slides[index].querySelector('video');
      if (video) video.play().catch(() => {});
    }
  }

  function next() {
    if (step < maxStep()) {
      step += 1;
    } else if (index < slides.length - 1) {
      index += 1;
      step = 0;
    }
    render();
  }

  function previous() {
    if (step > 0) {
      step -= 1;
    } else if (index > 0) {
      index -= 1;
      step = maxStep();
    }
    render();
  }

  function toggleNotes(force) {
    notes.classList.toggle('open', force === undefined ? !notes.classList.contains('open') : force);
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  }

  addEventListener('resize', fit);
  addEventListener('hashchange', () => {
    index = Math.max(0, Math.min(slides.length - 1, Number(location.hash.replace('#', '')) - 1 || 0));
    step = 0;
    render();
  });
  addEventListener('keydown', event => {
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(event.key)) { event.preventDefault(); next(); }
    if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key)) { event.preventDefault(); previous(); }
    if (event.key === 'Home') { index = 0; step = 0; render(); }
    if (event.key === 'End') { index = slides.length - 1; step = maxStep(); render(); }
    if (event.key.toLowerCase() === 'n') toggleNotes();
    if (event.key.toLowerCase() === 'f') toggleFullscreen();
    if (event.key === 'Escape') toggleNotes(false);
  });

  document.querySelector('.forward').addEventListener('click', next);
  document.querySelector('.back').addEventListener('click', previous);
  document.querySelector('.notes-toggle').addEventListener('click', () => toggleNotes());
  document.querySelector('.fullscreen').addEventListener('click', toggleFullscreen);
  notes.querySelector('button').addEventListener('click', () => toggleNotes(false));

  let touchX = 0;
  addEventListener('touchstart', e => { touchX = e.changedTouches[0].clientX; }, { passive: true });
  addEventListener('touchend', e => {
    const delta = e.changedTouches[0].clientX - touchX;
    if (Math.abs(delta) > 45) delta < 0 ? next() : previous();
  }, { passive: true });

  fit();
  render();
})();
