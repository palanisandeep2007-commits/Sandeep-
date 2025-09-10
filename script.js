/* app.js - Portfolio interactive behavior */

// Basic DOM helpers
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

document.addEventListener('DOMContentLoaded', () => {
  // Fill year
  $('#year').textContent = new Date().getFullYear();

  // Theme toggle
  const themeToggle = $('#themeToggle');
  const savedTheme = localStorage.getItem('theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  setTheme(savedTheme);

  themeToggle.addEventListener('click', () => {
    const next = document.documentElement.classList.contains('light') ? 'dark' : 'light';
    setTheme(next);
  });

  function setTheme(mode) {
    if (mode === 'light') {
      document.documentElement.classList.add('light');
      themeToggle.textContent = '🌞';
    } else {
      document.documentElement.classList.remove('light');
      themeToggle.textContent = '🌙';
    }
    localStorage.setItem('theme', mode);
  }

  // Mobile nav toggles
  const nav = $('#primary-nav');
  $('#navToggle').addEventListener('click', () => nav.style.display = 'flex');
  $('#navClose').addEventListener('click', () => nav.style.display = 'none');
  // Close nav when nav links clicked in mobile
  $$('.nav-link').forEach(a => a.addEventListener('click', () => {
    if (window.innerWidth < 721) nav.style.display = 'none';
  }));

  // Smooth scroll for anchor links
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href.length > 1) {
        e.preventDefault();
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({behavior: 'smooth', block: 'start'});
      }
    });
  });

  // Projects data (sample data) - replace or expand as needed
  const projects = [
    { id: 'p1', title: 'Portfolio Website', desc: 'Personal portfolio with animations and CMS-free workflow.', tags: ['web','ui'], links: [{label:'View',url:'#'},{label:'Source',url:'#'}] },
    { id: 'p2', title: 'Task Manager App', desc: 'Progressive web app for managing tasks with offline support.', tags: ['web'], links:[{label:'Demo',url:'#'}] },
    { id: 'p3', title: 'Mini Game', desc: 'A small canvas game showcasing physics and rendering.', tags: ['game'], links:[{label:'Play',url:'#'}] },
    { id: 'p4', title: 'Design System', desc: 'Component library and style guide for scalable UI.', tags: ['ui'], links:[{label:'Docs',url:'#'}] },
    { id: 'p5', title: 'Data Visualizer', desc: 'Interactive charts with accessibility and performance in mind.', tags: ['web','ui'], links:[{label:'Explore',url:'#'}] },
    { id: 'p6', title: 'Animation Experiments', desc: 'Micro-interactions and CSS/JS animation library.', tags: ['ui','game'], links:[{label:'Read',url:'#'}] },
  ];

  const projectsGrid = $('#projectsGrid');
  function renderProjects(filter = 'all') {
    projectsGrid.innerHTML = '';
    const filtered = filter === 'all' ? projects : projects.filter(p => p.tags.includes(filter));
    if (!filtered.length) {
      projectsGrid.innerHTML = `<p class="muted">No projects in this category.</p>`;
      return;
    }
    filtered.forEach(p => {
      const card = document.createElement('article');
      card.className = 'project-card';
      card.tabIndex = 0;
      card.innerHTML = `
        <div>
          <h3>${p.title}</h3>
          <p class="muted small">${p.desc}</p>
        </div>
        <div class="project-meta">
          <div class="project-tags">${p.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
          <div><button class="btn ghost view-btn" data-id="${p.id}">Details</button></div>
        </div>
      `;
      projectsGrid.appendChild(card);
    });

    // attach event handlers
    $$('.view-btn', projectsGrid).forEach(btn => {
      btn.addEventListener('click', () => openProjectModal(btn.dataset.id));
    });

    // make cards clickable for accessibility
    $$('.project-card', projectsGrid).forEach(card => {
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const btn = card.querySelector('.view-btn');
          if (btn) btn.click();
        }
      });
    });
  }

  // Filters
  $$('.filter').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderProjects(btn.dataset.filter);
    });
  });

  // Initial render
  renderProjects('all');

  // Modal behavior
  const modal = $('#projectModal');
  const modalTitle = $('#modalTitle');
  const modalDesc = $('#modalDesc');
  const modalLinks = $('#modalLinks');
  $('#modalClose').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  function openProjectModal(id) {
    const p = projects.find(x => x.id === id);
    if (!p) return;
    modalTitle.textContent = p.title;
    modalDesc.textContent = p.desc;
    modalLinks.innerHTML = p.links.map(l => `<a class="btn ghost" href="${l.url}" target="_blank" rel="noopener">${l.label}</a>`).join(' ');
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(){
    modal.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }

  // Skills animation when visible (intersection observer)
  const skillFills = $$('.skill-fill');
  const skillPercents = $$('.skill-percent');
  const skillObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        skillFills.forEach((el, i) => {
          const target = parseInt(skillPercents[i].dataset.percent, 10);
          el.style.width = target + '%';
          // animate percent text
          let cur = 0;
          const step = Math.max(1, Math.round(target / 30));
          const intv = setInterval(() => {
            cur += step;
            if (cur >= target) { cur = target; clearInterval(intv); }
            skillPercents[i].textContent = cur + '%';
          }, 20);
        })
        skillObserver.disconnect();
      }
    });
  }, {threshold: 0.25});
skillObserver.observe($('#skills'));

  // Contact form simple client-side validation + fake submit
  const contactForm = $('#contactForm');
  const formStatus = $('#formStatus');
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    formStatus.textContent = '';
    const data = new FormData(contactForm);
    const name = data.get('name').trim();
    const email = data.get('email').trim();
    const message = data.get('message').trim();

    if (!name || !email || !message) {
      formStatus.textContent = 'Please complete all fields.';
      return;
    }
    if (message.length < 10) {
      formStatus.textContent = 'Message must be at least 10 characters.';
      return;
    }

    // Simulate async submit (client-side only)
    formStatus.textContent = 'Sending…';
    setTimeout(() => {
      formStatus.textContent = 'Message sent — thank you! (This demo does not actually send messages.)';
      contactForm.reset();
    }, 800);
  });

  // Accessibility: focus trap for modal (basic)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

});
