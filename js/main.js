/* VII RAA 2027 — funcionalidades da página. Edite os textos no index.html. */
(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#nav-principal');
  menuButton?.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
  }));

  // Filtros da programação
  const filterButtons = [...document.querySelectorAll('[data-filter]')];
  const cards = [...document.querySelectorAll('.activity-card')];
  filterButtons.forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    filterButtons.forEach(item => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    cards.forEach(card => { card.hidden = filter !== 'all' && card.dataset.category !== filter; });
  }));

  // Agenda local: guarda título, data e horário neste navegador (sem servidor).
  const storageKey = 'vii-raa-2027-agenda-v2';
  const agendaDialog = document.querySelector('#agenda-dialog');
  const savedList = document.querySelector('#saved-list');
  const count = document.querySelector('#agenda-count');
  const status = document.querySelector('#agenda-status');
  let saved = [];
  try { saved = JSON.parse(localStorage.getItem(storageKey) || '[]'); } catch (_) { saved = []; }
  if (!Array.isArray(saved)) saved = [];
  const getActivity = card => ({
    title: card.querySelector('h3')?.textContent.trim() || 'Atividade',
    date: card.dataset.date || 'Data a confirmar',
    time: card.dataset.time || 'Horário a confirmar'
  });
  const sameActivity = (a, b) => a.title === b.title;
  function renderAgenda() {
    document.querySelectorAll('.activity-card').forEach(card => {
      const activity = getActivity(card);
      const button = card.querySelector('.save-activity');
      const active = saved.some(item => item.title === activity.title);
      button.setAttribute('aria-pressed', String(active));
      button.textContent = active ? '✓ Na minha agenda' : '＋ Monte sua agenda';
    });
    count.textContent = String(saved.length);
    status.textContent = saved.length ? `${saved.length} atividade(s) selecionada(s).` : 'Selecione uma atividade para ver nome, data e horário nesta agenda.';
    savedList.replaceChildren();
    if (!saved.length) {
      const empty = document.createElement('div'); empty.className = 'empty-state';
      empty.textContent = 'Nenhuma atividade selecionada. Use “Monte sua agenda” nos cards da programação.';
      savedList.append(empty); return;
    }
    saved.forEach(activity => {
      const row = document.createElement('div'); row.className = 'saved-item';
      const details = document.createElement('div'); details.className = 'saved-details';
      const title = document.createElement('strong'); title.textContent = activity.title;
      const when = document.createElement('small'); when.textContent = `${activity.date} · ${activity.time}`;
      details.append(title, when);
      const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = 'Remover';
      remove.addEventListener('click', () => { saved = saved.filter(item => !sameActivity(item, activity)); persist(); });
      row.append(details, remove); savedList.append(row);
    });
  }
  function persist() {
    try { localStorage.setItem(storageKey, JSON.stringify(saved)); } catch (_) { /* armazenamento pode estar bloqueado */ }
    renderAgenda();
  }
  document.querySelectorAll('.activity-card').forEach(card => {
    card.querySelector('.save-activity').addEventListener('click', () => {
      const activity = getActivity(card);
      saved = saved.some(item => sameActivity(item, activity))
        ? saved.filter(item => !sameActivity(item, activity))
        : [...saved, activity];
      persist();
    });
  });
  document.querySelector('#show-agenda')?.addEventListener('click', () => {
    renderAgenda();
    if (typeof agendaDialog.showModal === 'function') agendaDialog.showModal();
    else alert(saved.map(item => `${item.title} — ${item.date}, ${item.time}`).join('\n') || 'Nenhuma atividade selecionada.');
  });
  document.querySelector('.close-dialog')?.addEventListener('click', () => agendaDialog.close());
  document.querySelector('#clear-agenda')?.addEventListener('click', () => { saved = []; persist(); });
  agendaDialog?.addEventListener('click', event => {
    if (event.target === agendaDialog) agendaDialog.close();
  });
  document.querySelector('#year').textContent = new Date().getFullYear();
  renderAgenda();
})();


  // Galeria automática de imagens de São Luís.
  const citySlides = [...document.querySelectorAll('.city-slide')];
  const cityDots = [...document.querySelectorAll('.carousel-dot')];
  let cityIndex = 0;
  let cityTimer;
  function showCitySlide(index) {
    if (!citySlides.length) return;
    cityIndex = (index + citySlides.length) % citySlides.length;
    citySlides.forEach((slide, i) => slide.classList.toggle('is-active', i === cityIndex));
    cityDots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === cityIndex);
      dot.setAttribute('aria-pressed', String(i === cityIndex));
    });
  }
  function restartCityTimer() {
    clearInterval(cityTimer);
    cityTimer = setInterval(() => showCitySlide(cityIndex + 1), 5000);
  }
  document.querySelector('#city-prev')?.addEventListener('click', () => { showCitySlide(cityIndex - 1); restartCityTimer(); });
  document.querySelector('#city-next')?.addEventListener('click', () => { showCitySlide(cityIndex + 1); restartCityTimer(); });
  cityDots.forEach((dot, index) => dot.addEventListener('click', () => { showCitySlide(index); restartCityTimer(); }));
  restartCityTimer();

  // Animação de entrada conforme as seções aparecem na tela.
  const revealItems = document.querySelectorAll('.section, .numbers-band, .registration-section, .city-carousel, .ufma-map-block, .activity-card, .price-card, .submission-steps article, .organizer-card');
  revealItems.forEach(item => item.classList.add('reveal-on-scroll'));
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(item => revealObserver.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('is-visible'));
  }
