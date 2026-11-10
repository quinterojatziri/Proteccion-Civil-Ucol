// Utilidades de interfaz compartidas: escape de HTML, avisos, diálogos y layout común.
window.PC = window.PC || {};

PC.ui = (function () {
  const cfg = window.PC_CONFIG;

  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const fmtDateTime = (d) =>
    d ? new Date(d).toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

  const ACENTOS = {
    medica: 'Médica', quimica: 'Química', evacuacion: 'Evacuación', critica: 'Crítica', felicitacion: 'Felicitación',
    hibrido: 'Híbrido', leido: 'Leído', tecnico: 'Técnico', capacitador: 'Capacitador'
  };
  const label = (v) => ACENTOS[v] || String(v || '').replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());

  /* ---------- Avisos ---------- */
  function toast(message, type = 'ok') {
    let box = $('.toasts');
    if (!box) {
      box = document.createElement('div');
      box.className = 'toasts';
      box.setAttribute('role', 'status');
      box.setAttribute('aria-live', 'polite');
      document.body.appendChild(box);
    }
    const el = document.createElement('div');
    el.className = 'toast' + (type === 'error' ? ' error' : '');
    el.textContent = message;
    box.appendChild(el);
    setTimeout(() => el.remove(), type === 'error' ? 6500 : 4000);
  }

  /* ---------- Diálogos ---------- */
  function dialog({ title, body, actions = [], wide = false, onClose }) {
    const dlg = document.createElement('dialog');
    if (wide) dlg.className = 'dialog-wide';
    dlg.innerHTML = `
      <div class="dialog-head"><h3>${esc(title)}</h3>
        <button type="button" class="icon-btn" data-close aria-label="Cerrar">${ICONS.close}</button></div>
      <div class="dialog-body">${body}</div>
      ${actions.length ? '<div class="dialog-actions"></div>' : ''}`;
    const bar = $('.dialog-actions', dlg);
    actions.forEach((a) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn ' + (a.className || 'btn-outline');
      b.textContent = a.label;
      b.addEventListener('click', () => a.onClick && a.onClick(dlg));
      bar.appendChild(b);
    });
    $('[data-close]', dlg).addEventListener('click', () => dlg.close());
    dlg.addEventListener('close', () => { dlg.remove(); if (onClose) onClose(); });
    document.body.appendChild(dlg);
    dlg.showModal();
    return dlg;
  }

  function confirmDialog(message, { okText = 'Confirmar', danger = false, title = 'Confirmar acción' } = {}) {
    return new Promise((resolve) => {
      let result = false;
      dialog({
        title,
        body: `<p>${esc(message)}</p>`,
        actions: [
          { label: 'Cancelar', onClick: (d) => d.close() },
          { label: okText, className: danger ? 'btn-danger' : 'btn-primary', onClick: (d) => { result = true; d.close(); } }
        ],
        onClose: () => resolve(result)
      });
    });
  }

  /* ---------- Iconos (SVG en línea) ---------- */
  const ICONS = {
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-7.5h2.6l.5-3.2h-3.1V8.4c0-.9.4-1.7 1.8-1.7h1.4V3.9s-1.2-.2-2.4-.2c-2.5 0-4.1 1.5-4.1 4.2v2.4H7.6v3.2h2.6V21h3.3z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4.5 4.5l15 15M19.5 4.5l-15 15"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3L10 15z"/></svg>'
  };

  // Íconos de redes sociales con enlace directo a cada perfil.
  const socialLinks = () =>
    `<span class="social">${(cfg.redes || []).map((r) =>
      `<a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(r.nombre)} (se abre en una pestaña nueva)" title="${esc(r.nombre)}">${ICONS[r.icono] || ''}</a>`
    ).join('')}</span>`;

  /* ---------- Layout común ---------- */
  const NAV = [
    ['index.html', 'Inicio'],
    ['novedades.html', 'Novedades'],
    ['brigadas.html', 'Brigadas'],
    ['cursos.html', 'Cursos'],
    ['documentos.html', 'Documentos'],
    ['busqueda.html', 'Brigadistas'],
    ['contacto.html', 'Contacto']
  ];

  function renderHeader() {
    const host = $('#site-header');
    if (!host) return;
    const current = document.body.dataset.nav || location.pathname.split('/').pop() || 'index.html';
    const user = PC.auth.user();

    const links = NAV.map(([href, text]) =>
      `<li><a href="${href}"${href === current ? ' aria-current="page"' : ''}>${text}</a></li>`).join('');

    const session = user
      ? `<a class="btn btn-outline btn-sm" href="${PC.auth.dashboardFor(user.rol)}">Mi panel</a>
         <button class="btn btn-outline btn-sm" type="button" data-logout>Salir</button>`
      : `<a class="btn btn-outline btn-sm" href="login.html">Iniciar sesión</a>`;

    host.innerHTML = `
      <div id="demo-slot"></div>
      <div class="topbar"><div class="container">
        <span>Emergencias 24 h: <strong><a href="tel:${cfg.contacto.emergenciasHref}">${cfg.contacto.emergencias}</a></strong></span>
        <span>Línea institucional: <a href="tel:${cfg.contacto.telefonoHref}">${cfg.contacto.telefono}</a></span>
        <span class="topbar-social"><span>Síguenos</span>${socialLinks()}</span>
      </div></div>
      <header class="site-header"><div class="container">
        <a class="brand" href="index.html">
          <img src="images/logo.png" alt="" width="46" height="46">
          <span class="brand-text"><strong>Protección Civil</strong><span>Universidad de Colima</span></span>
        </a>
        <nav class="main-nav" id="main-nav" aria-label="Principal"><ul>${links}<li class="nav-session">${session}</li></ul></nav>
        <div class="header-actions">
          <a class="btn btn-accent btn-sm" href="emergencias.html">Emergencias</a>
          <span class="session-actions">${session}</span>
          <button class="icon-btn" type="button" id="theme-btn"></button>
          <button class="icon-btn nav-toggle" type="button" id="nav-btn" aria-controls="main-nav" aria-expanded="false" aria-label="Abrir menú">${ICONS.menu}</button>
        </div>
      </div></header>`;

    const themeBtn = $('#theme-btn');
    const paintTheme = () => {
      const dark = document.documentElement.dataset.theme === 'dark';
      themeBtn.innerHTML = dark ? ICONS.sun : ICONS.moon;
      themeBtn.setAttribute('aria-label', dark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro');
    };
    paintTheme();
    themeBtn.addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('pc_theme', next); } catch (e) { /* sin almacenamiento */ }
      paintTheme();
    });

    const navBtn = $('#nav-btn');
    navBtn.addEventListener('click', () => {
      const open = $('#main-nav').classList.toggle('open');
      navBtn.setAttribute('aria-expanded', String(open));
    });

    $$('[data-logout]').forEach((b) => b.addEventListener('click', () => PC.auth.logout()));

    PC.api.mode().then((m) => {
      if (!m.demo) return;
      $('#demo-slot').innerHTML = `<div class="demo-banner"><div class="container">
        <strong>Modo demostración.</strong> Los datos son ficticios y nada de lo que captures se envía a la Unidad de Protección Civil.
      </div></div>`;
    });
  }

  function renderFooter() {
    const host = $('#site-footer');
    if (!host) return;
    const c = cfg.contacto;
    host.innerHTML = `
      <footer class="site-footer">
        <div class="container">
          <div>
            <h4>Unidad de Protección Civil</h4>
            <p>Universidad de Colima<br>Campus Universitario, Colima, Col.</p>
            <p>Correo: <a href="mailto:${c.email}">${c.email}</a><br>
               Teléfono: <a href="tel:${c.telefonoHref}">${c.telefono}</a><br>
               Emergencias 24 h: <a href="tel:${c.emergenciasHref}">${c.emergencias}</a></p>
          </div>
          <div>
            <h4>Sitio</h4>
            <ul>
              <li><a href="novedades.html">Novedades</a></li>
              <li><a href="brigadas.html">Brigadas</a></li>
              <li><a href="cursos.html">Cursos</a></li>
              <li><a href="documentos.html">Documentos</a></li>
              <li><a href="contacto.html">Contacto</a></li>
            </ul>
          </div>
          <div>
            <h4>Redes sociales</h4>
            ${socialLinks()}
            <p style="margin-top:1rem">En peligro inmediato, llama al <strong>${c.emergenciasNacional}</strong>.</p>
          </div>
        </div>
        <div class="footer-bottom">&copy; ${new Date().getFullYear()} Universidad de Colima. Unidad de Protección Civil.</div>
      </footer>`;
  }

  function init() {
    const main = $('main');
    if (main && !main.id) main.id = 'contenido';
    const skip = document.createElement('a');
    skip.className = 'skip-link';
    skip.href = '#contenido';
    skip.textContent = 'Saltar al contenido';
    document.body.prepend(skip);
    renderHeader();
    renderFooter();
  }

  // Estado de carga / vacío reutilizable.
  const loading = (msg = 'Cargando...') => `<div class="loading"><span class="spinner"></span>${esc(msg)}</div>`;
  const empty = (msg) => `<div class="empty">${esc(msg)}</div>`;

  return { esc, $, $$, fmtDate, fmtDateTime, label, toast, dialog, confirmDialog, init, loading, empty, ICONS };
})();
