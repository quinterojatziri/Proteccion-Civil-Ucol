(function () {
  const { $, esc } = PC.ui;

  PC.api.get('/brigadas').then((r) => {
    $('#lista').innerHTML = r.data.length ? r.data.map((b) => `
      <article class="card">
        <h2 style="font-size:1.25rem">${esc(b.nombre)}</h2>
        <p class="muted">${esc(b.descripcion)}</p>
        <ul class="meta">
          <li><span>Coordinación</span><span>${esc(b.coordinador)}</span></li>
          <li><span>Contacto</span><span><a href="mailto:${esc(b.email_coordinador)}">${esc(b.email_coordinador)}</a></span></li>
          <li><span>Miembros activos</span><span>${esc(b.miembros_activos)}</span></li>
        </ul>
        <p style="font-size:.9rem"><strong>Requisitos:</strong> ${esc(b.requisitos)}</p>
        <a class="btn btn-primary" href="solicitud-brigada.html?id=${encodeURIComponent(b.id)}">Solicitar ingreso</a>
      </article>`).join('') : PC.ui.empty('No hay brigadas disponibles por ahora.');
  }).catch((e) => { $('#lista').innerHTML = PC.ui.empty(e.message); });
})();
