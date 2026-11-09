(function () {
  const user = PC.auth.require(['capacitador', 'admin']);
  if (!user) return;
  const { $, $$, esc, fmtDate } = PC.ui;
  const { badge, setCount, run } = PC.panel;

  const tabs = PC.panel.tabs({ resumen, pendientes, inscritos });

  async function resumen() {
    try {
      const [s, cursos] = await Promise.all([PC.api.get('/panel/capacitador'), PC.api.get('/cursos')]);
      const t = s.data;
      const tile = (l, v) => `<div class="tile"><span>${l}</span><strong>${v}</strong></div>`;
      $('#tiles').innerHTML = tile('Cursos activos', t.cursos_activos) + tile('Inscritos', t.inscritos) +
        tile('Por aprobar', t.pendientes) + tile('Certificados emitidos', t.certificados);
      setCount('pendientes', t.pendientes);
      $('#lista-cursos').innerHTML = cursos.data.length ? cursos.data.map((c) => `
        <article class="card">
          <h3>${esc(c.titulo)}</h3>
          <p class="muted" style="margin-bottom:.5rem">Inicio: ${fmtDate(c.fecha_inicio)} &middot; ${esc(c.horario || '')}</p>
          <p style="margin:0">Lugares ocupados: <strong>${c.cupo_maximo - c.cupo_disponible}</strong> de ${esc(c.cupo_maximo)}</p>
        </article>`).join('') : PC.ui.empty('No hay cursos activos.');
      const sel = $('#filtro-curso');
      if (sel.options.length === 1) cursos.data.forEach((c) => sel.add(new Option(c.titulo, c.id)));
    } catch (e) { $('#tiles').innerHTML = PC.ui.empty(e.message); }
  }

  async function pendientes() {
    const box = $('#lista-pendientes');
    box.innerHTML = PC.ui.loading();
    try {
      const list = (await PC.api.get('/inscripciones?estatus=pendiente')).data;
      setCount('pendientes', list.length);
      box.innerHTML = list.length ? list.map((i) => `
        <article class="card">
          <div class="badge-row"><span class="badge">${esc(i.curso_titulo)}</span><span class="news-date" style="margin-left:auto">${fmtDate(i.fecha_inscripcion)}</span></div>
          <h3>${esc(i.nombre_completo)}</h3>
          <p class="muted" style="margin:0">${esc(i.email)} &middot; ${esc(i.telefono)}${i.carrera ? ' &middot; ' + esc(i.carrera) : ''}</p>
          <div class="actions card-footer">
            <button class="btn btn-primary btn-sm" data-st="confirmada" data-id="${i.id}">Aprobar</button>
            <button class="btn btn-outline btn-sm" data-st="cancelada" data-id="${i.id}">Rechazar</button></div>
        </article>`).join('') : PC.ui.empty('No hay inscripciones pendientes.');
      $$('[data-st]', box).forEach((b) => b.addEventListener('click', () =>
        run(PC.api.patch('/inscripciones/' + b.dataset.id, { estatus: b.dataset.st }), () => { tabs.reload('pendientes'); resumen(); })));
    } catch (e) { box.innerHTML = PC.ui.empty(e.message); }
  }

  async function inscritos() {
    const body = $('#tabla-inscritos');
    body.innerHTML = `<tr><td colspan="5">${PC.ui.loading()}</td></tr>`;
    try {
      const curso = $('#filtro-curso').value;
      const list = (await PC.api.get('/inscripciones' + (curso ? '?curso_id=' + encodeURIComponent(curso) : ''))).data;
      body.innerHTML = list.length ? list.map((i) => `<tr>
        <td>${esc(i.nombre_completo)}</td><td>${esc(i.curso_titulo)}</td>
        <td>${esc(i.email)}<br><span class="muted">${esc(i.telefono)}</span></td>
        <td>${fmtDate(i.fecha_inscripcion)}</td><td>${badge(i.estatus)}</td></tr>`).join('')
        : `<tr><td colspan="5">${PC.ui.empty('No hay inscripciones.')}</td></tr>`;
    } catch (e) { body.innerHTML = `<tr><td colspan="5">${PC.ui.empty(e.message)}</td></tr>`; }
  }

  $('#filtro-curso').addEventListener('change', inscritos);
})();
