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

  /* ---------- topo: transparente sobre a foto, sólido depois ---------- */
  const top = $('[data-top]'); let lastY = 0;
  const onScroll = () => {
    const y = scrollY, past = y > innerHeight * 0.8;
    top.classList.toggle('is-solid', past);
    top.classList.toggle('is-hidden', past && y > lastY + 2);
    if (y < lastY - 2 || !past) top.classList.remove('is-hidden');
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

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

  /* ---------- abertura: o círculo se fecha, o símbolo aparece, a cortina abre em círculo ---------- */
  const intro = $('.intro');
  const heroIn = () => {
    gsap.fromTo('.hero-img.is-on', { scale: 1.18 }, { scale: 1, duration: 1.8, ease: 'power3.out' });
    gsap.fromTo('.hero-text > *', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: .9, stagger: .1, ease: 'power3.out', delay: .15 });
    gsap.fromTo('.top', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: .6, delay: .3 });
  };
  if (!hasG || reduce) { intro.classList.add('is-gone'); return; }
  gsap.set('.hero-text > *', { opacity: 0, y: 40 });
  setTimeout(() => { if (!intro.classList.contains('is-gone')) { intro.classList.add('is-gone'); gsap.set('.hero-text > *', { opacity: 1, y: 0 }); } }, 4200);
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => intro.classList.add('is-gone') });
  tl.to('.intro-ring circle', { strokeDashoffset: 0, duration: .9, ease: 'power2.inOut' })
    .fromTo('.intro-mark', { opacity: 0, scale: .6, rotate: -25 }, { opacity: 1, scale: 1, rotate: 0, duration: .9, ease: 'back.out(1.6)' }, .25)
    .fromTo('.intro-name span', { opacity: 0, y: 26, rotateX: -80 }, { opacity: 1, y: 0, rotateX: 0, duration: .5, stagger: .035 }, .55)
    .to('.intro-sub', { opacity: 1, duration: .3 }, 1.0)
    .to('.intro-sub i', { scaleX: 1, duration: .5, ease: 'power2.out' }, 1.0)
    .to('.intro-stage', { scale: 1.06, duration: .25, ease: 'power1.inOut', yoyo: true, repeat: 1 }, 1.25)
    .to('.intro', { clipPath: 'circle(0% at 50% 45%)', duration: .85, ease: 'power3.inOut' }, 1.8)
    .add(heroIn, 1.95);
})();
