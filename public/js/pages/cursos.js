(function () {
  const { $, esc, fmtDate, label } = PC.ui;

  PC.api.get('/cursos').then((r) => {
    $('#lista').innerHTML = r.data.length ? r.data.map((c) => {
      const abierto = c.estatus === 'inscripciones_abiertas';
      const lleno = c.cupo_disponible <= 0;
      return `
      <article class="card">
        <div class="badge-row">
          <span class="badge ${abierto ? 'badge-green' : 'badge-yellow'}">${abierto ? 'Inscripciones abiertas' : 'Programado'}</span>
          <span class="badge">${esc(label(c.modalidad))}</span>
        </div>
        <h2 style="font-size:1.25rem">${esc(c.titulo)}</h2>
        <p class="muted">${esc(c.descripcion)}</p>
        <ul class="meta">
          <li><span>Inicio</span><span>${fmtDate(c.fecha_inicio)}</span></li>
          <li><span>Horario</span><span>${esc(c.horario)}</span></li>
          <li><span>Duración</span><span>${esc(c.duracion_horas)} horas</span></li>
          <li><span>Lugar</span><span>${esc(c.ubicacion || 'Por confirmar')}</span></li>
          <li><span>Cupo disponible</span><span>${Math.max(0, c.cupo_disponible)} de ${esc(c.cupo_maximo)}</span></li>
          <li><span>Costo</span><span>${c.costo > 0 ? '$' + esc(c.costo) : 'Gratuito'}</span></li>
        </ul>
        ${lleno
          ? '<button class="btn btn-outline" disabled>Sin cupo</button>'
          : `<a class="btn btn-primary" href="inscripcion-curso.html?id=${encodeURIComponent(c.id)}">Inscribirme</a>`}
      </article>`;
    }).join('') : PC.ui.empty('No hay cursos disponibles por ahora.');
  }).catch((e) => { $('#lista').innerHTML = PC.ui.empty(e.message); });
})();
