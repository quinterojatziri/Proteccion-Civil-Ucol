(function () {
  const { $, $$, esc, label } = PC.ui;
  const user = PC.auth.user();
  const staff = !!user && ['admin', 'tecnico'].includes(user.rol);

  let map = null;
  let layer = null;
  let puntos = [];
  let primerAjuste = true;

  if (staff) {
    $$('.staff-only').forEach((el) => el.classList.remove('hidden'));
    $('#nota-mapa').textContent = 'Vista de personal: posiciones exactas. Haz clic en un punto para ver el detalle y el contacto.';
  } else {
    $('#nota-mapa').innerHTML = 'Muestra brigadistas disponibles o en servicio, en una zona aproximada y sin datos personales. ' +
      'El personal autorizado puede ver posiciones exactas y contacto <a href="login.html?next=busqueda.html">iniciando sesión</a>.';
  }

  const estadoClase = (e) => ({ disponible: 'badge-green', en_servicio: 'badge-yellow', no_disponible: 'badge-red' }[e] || '');

  /* ---------------- Listado ---------------- */
  PC.api.get('/brigadas').then((r) => {
    $('#f-brigada').insertAdjacentHTML('beforeend',
      r.data.map((b) => `<option value="${esc(b.id)}">${esc(b.nombre)}</option>`).join(''));
  }).catch(() => {});

  async function buscar() {
    const params = new URLSearchParams();
    [['nombre', '#f-nombre'], ['brigada_id', '#f-brigada'], ['estado', '#f-estado'], ['facultad', '#f-facultad']]
      .forEach(([k, sel]) => { const v = $(sel).value.trim(); if (v) params.set(k, v); });

    $('#lista').innerHTML = PC.ui.loading('Buscando...');
    try {
      const qs = params.toString();
      const r = await PC.api.get('/brigadistas/buscar' + (qs ? '?' + qs : ''));
      $('#total').textContent = `(${r.data.length})`;
      $('#lista').innerHTML = r.data.length ? r.data.map((b) => `
        <article class="card">
          <div class="badge-row"><span class="badge ${estadoClase(b.estado_disponibilidad)}">${esc(label(b.estado_disponibilidad))}</span></div>
          <h3>${esc(b.nombre_completo)}</h3>
          <ul class="meta">
            <li><span>Brigada</span><span>${esc(b.brigada_nombre)}</span></li>
            <li><span>Facultad</span><span>${esc(b.facultad || 'No especificada')}</span></li>
            ${b.cursos_imparte ? `<li><span>Imparte</span><span>${esc(b.cursos_imparte)}</span></li>` : ''}
            ${staff ? `<li><span>Ubicación</span><span>${esc(b.ubicacion_actual || 'Sin registro')}</span></li>` : ''}
          </ul>
          ${staff ? `<p style="margin:0;font-size:.9rem"><a href="mailto:${esc(b.email)}">${esc(b.email)}</a>${b.telefono ? ` &middot; <a href="tel:${esc(b.telefono)}">${esc(b.telefono)}</a>` : ''}</p>` : ''}
        </article>`).join('') : PC.ui.empty('No se encontraron brigadistas con esos filtros.');
    } catch (err) {
      $('#total').textContent = '';
      $('#lista').innerHTML = PC.ui.empty(err.message);
    }
    pintarMapa();
  }

  /* ---------------- Mapa ---------------- */
  function iniciarMapa() {
    if (typeof L === 'undefined') {
      $('#map').innerHTML = '<div class="empty">No se pudo cargar el mapa.</div>';
      return;
    }
    map = L.map('map', { scrollWheelZoom: true }).setView([19.2452, -103.7241], 16);
    ponerFondo(0);
    layer = L.layerGroup().addTo(map);
    // Los contenedores recién mostrados necesitan recalcular su tamaño.
    setTimeout(() => map.invalidateSize(), 100);
  }

  // Proveedores de mapa base, en orden de preferencia. Si uno rechaza las
  // peticiones (bloqueo, límite de uso o sin conexión), se pasa al siguiente.
  const OSM = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
  const propio = window.PC_CONFIG.mapa;
  const PROVEEDORES = [
    // Proveedor propio (con clave), si se configuró en config.js.
    ...(propio && propio.url ? [{ url: propio.url, opts: { maxZoom: 19, attribution: propio.attribution || '', subdomains: propio.subdomains || 'abc' } }] : []),
    // Proveedores sin clave.
    { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      opts: { maxZoom: 19, attribution: 'Mapa &copy; Esri y colaboradores' } },
    { url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      opts: { maxZoom: 19, attribution: OSM } }
  ];
  let fondo = null;

  function ponerFondo(i) {
    if (fondo) { fondo.off(); map.removeLayer(fondo); }
    const p = PROVEEDORES[i];
    let cargados = 0;
    let errores = 0;
    fondo = L.tileLayer(p.url, p.opts).addTo(map);
    fondo.on('tileload', () => { cargados += 1; });
    fondo.on('tileerror', () => {
      errores += 1;
      if (cargados > 0 || errores < 3) return;
      if (i + 1 < PROVEEDORES.length) ponerFondo(i + 1);
      else $('#nota-mapa').insertAdjacentHTML('beforeend',
        ' <strong>No se pudo cargar el fondo del mapa; los puntos siguen disponibles.</strong>');
    });
  }

  async function cargarPuntos() {
    try {
      puntos = (await PC.api.get('/brigadistas/mapa')).data;
    } catch (err) {
      puntos = [];
      PC.ui.toast(err.message, 'error');
    }
    pintarMapa();
  }

  function pintarMapa() {
    if (!map) return;
    layer.clearLayers();

    const brigada = $('#f-brigada').value;
    const estado = $('#f-estado').value;
    const nombre = $('#f-nombre').value.trim().toLowerCase();
    const visibles = puntos.filter((p) =>
      (!brigada || String(p.brigada_id) === brigada) &&
      (!estado || p.estado_disponibilidad === estado) &&
      (!staff || !nombre || (p.nombre_completo || '').toLowerCase().includes(nombre)));

    const marcadores = visibles.map((p) => {
      const icon = L.divIcon({
        className: '', iconSize: [22, 22], iconAnchor: [11, 11], popupAnchor: [0, -10],
        html: `<div class="marker-dot marker-${esc(p.estado_disponibilidad)}"></div>`
      });
      const detalle = staff
        ? `<strong>${esc(p.nombre_completo)}</strong><br>${esc(p.brigada_nombre)}<br>${esc(label(p.estado_disponibilidad))}` +
          (p.ubicacion_actual ? '<br>' + esc(p.ubicacion_actual) : '') +
          (p.telefono ? `<br><a href="tel:${esc(p.telefono)}">${esc(p.telefono)}</a>` : '')
        : `<strong>${esc(p.brigada_nombre)}</strong><br>${esc(label(p.estado_disponibilidad))}<br><span class="muted">Zona aproximada</span>`;
      return L.marker([p.latitud, p.longitud], { icon }).bindPopup(detalle).addTo(layer);
    });

    if (marcadores.length && primerAjuste) {
      primerAjuste = false;
      map.fitBounds(L.featureGroup(marcadores).getBounds().pad(0.3), { maxZoom: 17 });
    }
    $('#nota-mapa').dataset.visibles = String(marcadores.length);
  }

  $('#filtros').addEventListener('submit', (e) => { e.preventDefault(); buscar(); });
  $('#limpiar').addEventListener('click', () => { $('#filtros').reset(); buscar(); });
  // Los listados desplegables aplican el filtro al instante.
  $$('#filtros select').forEach((s) => s.addEventListener('change', buscar));

  iniciarMapa();
  cargarPuntos();
  buscar();
})();
