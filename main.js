/* Studio Pilates GB — HGS Dev */
(() => {
  document.documentElement.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasG = typeof window.gsap !== 'undefined';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- hero: a luz muda devagar ---------- */
  const heroImgs = $$('.hero-img'); let hi = 0, heroTimer;
  const heroLoop = () => {
    clearInterval(heroTimer);
    if (reduce) return;
    heroTimer = setInterval(() => {
      if (document.hidden) return;
      heroImgs[hi].classList.remove('is-on'); hi = (hi + 1) % heroImgs.length; heroImgs[hi].classList.add('is-on');
    }, 5600);
  };
  heroLoop();

  /* ---------- trilho: atravessa o meio e vira cabeçalho ---------- */
  const rail = $('[data-rail]');
  const dock = () => rail.classList.toggle('is-docked', rail.getBoundingClientRect().top <= 0 && scrollY > innerHeight * 0.45);
  addEventListener('scroll', dock, { passive: true }); dock();

  /* ---------- sessões: 10 sente, 20 vê, 30 corpo novo ---------- */
  const range = $('#aulas'), nEl = $('[data-n]'), stEl = $('[data-stage]'), whenEl = $('[data-when]');
  const photos = $$('.ses-photo img'); let freq = 2;
  const stages = [
    [1, 9, 'O corpo está aprendendo os movimentos.'],
    [10, 19, 'Você sente a diferença.'],
    [20, 29, 'Você vê a diferença.'],
    [30, 30, 'Um corpo novo.']
  ];
  const paint = () => {
    const n = +range.value, si = stages.findIndex(s => n >= s[0] && n <= s[1]);
    nEl.textContent = n;
    stEl.textContent = stages[si][2];
    const weeks = Math.ceil(n / freq);
    const d = new Date(); d.setDate(d.getDate() + weeks * 7);
    const data = d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
    whenEl.textContent = `Com ${freq} ${freq > 1 ? 'aulas' : 'aula'} por semana, isso leva cerca de ${weeks} ${weeks > 1 ? 'semanas' : 'semana'}. Começando agora, por volta de ${data}.`;
    photos.forEach((p, i) => p.classList.toggle('is-on', i === si));
    range.style.setProperty('--p', ((n - 1) / 29 * 100) + '%');
  };
  range.addEventListener('input', () => {
    paint();
    if (hasG && !reduce) gsap.fromTo(nEl, { y: -6 }, { y: 0, duration: .3, ease: 'power2.out' });
  });
  $$('[data-freq]').forEach(b => b.addEventListener('click', () => {
    freq = +b.dataset.freq;
    $$('[data-freq]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    paint();
  }));
  paint();

  /* ---------- primeira aula: linha arrastável ---------- */
  const row = $('[data-row]'), prog = $('[data-prog]');
  const upd = () => {
    const max = row.scrollWidth - row.clientWidth;
    const vis = row.clientWidth / row.scrollWidth;
    prog.style.width = Math.max(vis, max ? (row.scrollLeft + row.clientWidth) / row.scrollWidth : 1) * 100 + '%';
  };
  row.addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
  $$('[data-dir]').forEach(b => b.addEventListener('click', () => row.scrollBy({ left: +b.dataset.dir * 312, behavior: reduce ? 'auto' : 'smooth' })));

  /* ---------- vídeos só tocam quando aparecem ---------- */
  const vio = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target;
    if (e.isIntersecting && !reduce) { if (v.preload === 'none') v.preload = 'auto'; v.play().catch(() => {}); }
    else v.pause();
  }), { threshold: .15 });
  $$('video').forEach(v => vio.observe(v));

  /* ---------- marca do rodapé ocupa a largura ---------- */
  const mark = $('[data-fit]');
  const fit = () => {
    mark.style.fontSize = '100px';
    const foot = mark.closest('footer'), cs = getComputedStyle(foot);
    const avail = foot.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    mark.style.fontSize = (100 * avail / mark.scrollWidth * 0.99) + 'px';
  };
  fit(); addEventListener('resize', fit); document.fonts && document.fonts.ready.then(fit);

  /* ---------- entradas por rolagem ---------- */
  let pending = $$('[data-rise]');
  const reveal = () => {
    if (!pending.length) return;
    const lim = innerHeight * 0.94; let n = 0;
    pending = pending.filter(el => {
      const r = el.getBoundingClientRect();
      if (r.top < lim && r.bottom > -innerHeight) { el.style.setProperty('--d', (n++ * 70) + 'ms'); el.classList.add('is-in'); return false; }
      return true;
    });
  };
  addEventListener('scroll', reveal, { passive: true });
  addEventListener('resize', reveal);
  setInterval(reveal, 300);
  reveal();

  /* ---------- abertura: a mola estica e solta ---------- */
  const intro = $('.intro');
  if (!hasG || reduce) { intro.classList.add('is-gone'); return; }
  setTimeout(() => intro.classList.add('is-gone'), 2400);
  const tl = gsap.timeline({ onComplete: () => intro.classList.add('is-gone') });
  tl.fromTo('.mola', { scaleX: .35 }, { scaleX: 1, duration: .55, ease: 'elastic.out(1, .45)' })
    .to('.intro-name', { opacity: 1, duration: .25 }, .2)
    .to('.intro', { yPercent: -100, duration: .45, ease: 'power3.inOut' }, '+=.15')
    .fromTo('.rail', { opacity: 0 }, { opacity: 1, duration: .4 }, '-=.2');
})();
