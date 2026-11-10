// Utilidades compartidas por los paneles internos.
window.PC = window.PC || {};

PC.panel = (function () {
  const { $, $$, esc } = PC.ui;

  // Navegación por pestañas con hash (#seccion). `loaders` se llama al mostrar cada sección.
  function tabs(loaders) {
    const buttons = $$('.panel-nav [data-tab]');
    const sections = $$('[data-section]');
    const loaded = new Set();

    function show(name, force) {
      if (!loaders[name]) name = buttons[0].dataset.tab;
      buttons.forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === name)));
      sections.forEach((s) => s.classList.toggle('hidden', s.dataset.section !== name));
      if (force || !loaded.has(name)) { loaded.add(name); loaders[name](); }
      if (location.hash !== '#' + name) history.replaceState(null, '', '#' + name);
    }
    buttons.forEach((b) => b.addEventListener('click', () => show(b.dataset.tab)));
    show(location.hash.slice(1) || buttons[0].dataset.tab);
    return { show, reload: (name) => show(name, true) };
  }

  const BADGES = {
    pendiente: 'badge-yellow', reportada: 'badge-red', en_camino: 'badge-orange', atendiendo: 'badge-orange',
    resuelta: 'badge-green', cancelada: '', cancelado: '', confirmada: 'badge-green', completada: 'badge-green',
    aceptado: 'badge-green', rechazado: 'badge-red', nuevo: 'badge-orange', leido: 'badge-blue', respondido: 'badge-green',
    cerrado: '', disponible: 'badge-green', en_servicio: 'badge-yellow', no_disponible: 'badge-red', fuera_de_servicio: '',
    critica: 'badge-red', alta: 'badge-orange', media: 'badge-yellow', baja: 'badge-blue'
  };
  const badge = (v) => `<span class="badge ${BADGES[v] || ''}">${esc(PC.ui.label(v))}</span>`;

  function setCount(tab, n) {
    const btn = $(`.panel-nav [data-tab="${tab}"]`);
    if (!btn) return;
    let c = $('.count', btn);
    if (!n) { if (c) c.remove(); return; }
    if (!c) { c = document.createElement('span'); c.className = 'count'; btn.appendChild(c); }
    c.textContent = n;
  }

  // Ejecuta una acción de la API mostrando el resultado en un aviso.
  async function run(promise, onDone) {
    try {
      const res = await promise;
      PC.ui.toast(res.message || 'Listo');
      if (onDone) await onDone();
    } catch (e) {
      PC.ui.toast(e.message, 'error');
    }
  }

  return { tabs, badge, setCount, run };
})();
