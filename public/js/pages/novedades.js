(function () {
  const { $, $$, esc, fmtDate, label } = PC.ui;
  const CAT = { noticia: 'badge-blue', evento: 'badge-green', aviso: 'badge-yellow', logro: 'badge-orange', comunicado: 'badge-red' };

  PC.api.get('/novedades').then((r) => {
    const list = r.data;
    if (!list.length) { $('#lista').innerHTML = PC.ui.empty('Aún no hay novedades publicadas.'); return; }

    $('#lista').innerHTML = list.map((n, i) => `
      <article class="card">
        <div class="badge-row">
          <span class="badge ${CAT[n.categoria] || ''}">${esc(label(n.categoria))}</span>
          ${n.destacado ? '<span class="badge badge-orange">Destacado</span>' : ''}
          <span class="news-date" style="margin-left:auto">${fmtDate(n.fecha_publicacion)}</span>
        </div>
        <h2 style="font-size:1.3rem">${esc(n.titulo)}</h2>
        <p class="muted">${esc(n.resumen || n.contenido.slice(0, 200))}</p>
        <div class="card-footer"><button type="button" class="btn btn-outline btn-sm" data-i="${i}">Leer completo</button></div>
      </article>`).join('');

    $$('#lista [data-i]').forEach((b) => b.addEventListener('click', () => {
      const n = list[Number(b.dataset.i)];
      PC.ui.dialog({
        title: n.titulo,
        body: `<p class="news-date">${fmtDate(n.fecha_publicacion)}</p>
               ${esc(n.contenido).split(/\n+/).map((p) => `<p>${p}</p>`).join('')}`,
        actions: [{ label: 'Cerrar', onClick: (d) => d.close() }]
      });
    }));
  }).catch((e) => { $('#lista').innerHTML = PC.ui.empty(e.message); });
})();
