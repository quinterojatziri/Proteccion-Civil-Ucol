(function () {
  const user = PC.auth.require(['tecnico', 'admin']);
  if (!user) return;
  const { $, $$, esc, fmtDateTime, label } = PC.ui;
  const { badge, run } = PC.panel;

  async function tiles() {
    try {
      const s = (await PC.api.get('/panel/tecnico')).data;
      const tile = (t, v, alert) => `<div class="tile${alert && v ? ' alert' : ''}"><span>${t}</span><strong>${v}</strong></div>`;
      $('#tiles').innerHTML =
        tile('Emergencias hoy', s.emergencias_hoy) + tile('Emergencias activas', s.emergencias_activas, true) +
        tile('Brigadistas disponibles', s.brigadistas_disponibles) +
        tile('Respuesta promedio', s.tiempo_respuesta_promedio == null ? 'Sin datos' : s.tiempo_respuesta_promedio + ' min');
    } catch (e) { $('#tiles').innerHTML = PC.ui.empty(e.message); }
  }

  async function emergencias() {
    const box = $('#lista-emergencias');
    box.innerHTML = PC.ui.loading();
    try {
      const list = (await PC.api.get('/emergencias' + ($('#solo-activas').checked ? '?activas=1' : ''))).data;
      box.innerHTML = list.length ? list.map((e) => {
        const activa = ['reportada', 'en_camino', 'atendiendo'].includes(e.estatus);
        return `
        <article class="card urgency-${esc(e.nivel_urgencia)}">
          <div class="badge-row">${badge(e.estatus)}${badge(e.nivel_urgencia)}<span class="badge">${esc(label(e.tipo_emergencia))}</span>
            <span class="news-date" style="margin-left:auto">${esc(e.folio)} &middot; ${fmtDateTime(e.fecha_reporte)}</span></div>
          <p style="margin-bottom:.4rem">${esc(e.descripcion)}</p>
          <p class="muted" style="margin-bottom:.4rem">
            ${esc(e.ubicacion_detallada)}${e.edificio ? ' &middot; ' + esc(e.edificio) : ''}${e.piso ? ' &middot; ' + esc(e.piso) : ''}
            &middot; ${esc(e.numero_afectados)} persona(s)</p>
          <p class="muted" style="margin-bottom:0">Reporta: ${esc(e.nombre_solicitante)} &middot; <a href="tel:${esc(e.telefono)}">${esc(e.telefono)}</a></p>
          ${activa ? `<div class="actions card-footer">
            ${e.estatus === 'reportada' ? `<button class="btn btn-accent btn-sm" data-st="en_camino" data-id="${e.id}">Brigada en camino</button>` : ''}
            ${e.estatus !== 'atendiendo' ? `<button class="btn btn-outline btn-sm" data-st="atendiendo" data-id="${e.id}">Atendiendo</button>` : ''}
            <button class="btn btn-primary btn-sm" data-st="resuelta" data-id="${e.id}">Resuelta</button>
            <button class="btn btn-outline btn-sm" data-st="cancelada" data-id="${e.id}">Cancelar reporte</button></div>` : ''}
        </article>`;
      }).join('') : PC.ui.empty('No hay emergencias para mostrar.');

      $$('[data-st]', box).forEach((b) => b.addEventListener('click', async () => {
        if (b.dataset.st === 'cancelada' &&
            !(await PC.ui.confirmDialog('¿Cancelar este reporte? Úsalo solo si fue una falsa alarma o un duplicado.', { okText: 'Cancelar reporte', danger: true }))) return;
        run(PC.api.patch('/emergencias/' + b.dataset.id, { estatus: b.dataset.st }), () => { emergencias(); tiles(); });
      }));
    } catch (e) { box.innerHTML = PC.ui.empty(e.message); }
  }

  $('#solo-activas').addEventListener('change', emergencias);
  tiles();
  emergencias();
  setInterval(() => { tiles(); emergencias(); }, 60000);
})();
