(function () {
  const { $, $$, esc, label } = PC.ui;
  const TIPO = { manual: 'badge-blue', protocolo: 'badge-green', guia: 'badge-yellow', reporte: 'badge-orange', otro: '' };
  // Solo se aceptan rutas internas o enlaces http(s).
  const safeUrl = (u) => (/^(docs\/|https?:\/\/)/.test(u || '') ? u : '#');

  PC.api.get('/documentos').then((r) => {
    const docs = r.data;
    $('#lista').innerHTML = docs.length ? docs.map((d, i) => `
      <article class="card">
        <div class="badge-row"><span class="badge ${TIPO[d.tipo_documento] || ''}">${esc(label(d.tipo_documento))}</span></div>
        <h2 style="font-size:1.2rem">${esc(d.titulo)}</h2>
        <p class="muted">${esc(d.descripcion)}</p>
        <div class="actions card-footer">
          <button type="button" class="btn btn-primary btn-sm" data-i="${i}">Visualizar</button>
          <a class="btn btn-outline btn-sm" href="${esc(safeUrl(d.archivo_url))}" download>Descargar PDF</a>
        </div>
      </article>`).join('') : PC.ui.empty('No hay documentos disponibles por ahora.');

    $$('#lista [data-i]').forEach((b) => b.addEventListener('click', () => {
      const d = docs[Number(b.dataset.i)];
      const url = safeUrl(d.archivo_url);
      const dlg = PC.ui.dialog({
        title: d.titulo, wide: true,
        body: `<iframe class="pdf-frame" title="${esc(d.titulo)}" src="${esc(url)}"></iframe>`,
        actions: [
          { label: 'Cerrar', onClick: (x) => x.close() },
          { label: 'Descargar', className: 'btn-primary', onClick: () => { const a = document.createElement('a'); a.href = url; a.download = ''; a.click(); } }
        ]
      });
      dlg.querySelector('.dialog-body').style.padding = '0';
    }));
  }).catch((e) => { $('#lista').innerHTML = PC.ui.empty(e.message); });
})();
