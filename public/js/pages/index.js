(function () {
  const { $, esc, fmtDate } = PC.ui;

  PC.api.get('/estadisticas').then((r) => {
    $('#stat-brigadas').textContent = r.data.brigadas;
    $('#stat-brigadistas').textContent = r.data.brigadistas;
    $('#stat-cursos').textContent = r.data.cursos;
  }).catch(() => { $('.stats-strip').classList.add('hidden'); });

  PC.api.get('/novedades').then((r) => {
    const items = r.data.slice(0, 3);
    $('#home-news').innerHTML = items.length
      ? items.map((n) => `
        <article class="card news-item">
          <span class="news-date">${fmtDate(n.fecha_publicacion)}</span>
          <h3>${esc(n.titulo)}</h3>
          <p class="muted">${esc(n.resumen || '')}</p>
        </article>`).join('')
      : PC.ui.empty('Aún no hay novedades publicadas.');
  }).catch(() => { $('#home-news').innerHTML = PC.ui.empty('No se pudieron cargar las novedades.'); });
})();
