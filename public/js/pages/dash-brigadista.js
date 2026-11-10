(function () {
  const user = PC.auth.require(['brigadista']);
  if (!user) return;
  const { $, esc, fmtDate, fmtDateTime, label } = PC.ui;
  const ESTADOS = ['disponible', 'en_servicio', 'no_disponible', 'fuera_de_servicio'];

  async function cargar() {
    const box = $('#contenido-perfil');
    try {
      const b = (await PC.api.get('/brigadistas/me')).data;
      box.innerHTML = `
        <div class="grid grid-4">
          <div class="tile"><span>Horas de servicio</span><strong>${esc(b.horas_servicio)}</strong></div>
          <div class="tile"><span>Cursos completados</span><strong>${esc(b.cursos_completados)}</strong></div>
          <div class="tile"><span>Brigada</span><strong style="font-size:1.1rem;line-height:1.5">${esc(b.brigada_nombre)}</strong></div>
          <div class="tile"><span>Ingreso</span><strong style="font-size:1.1rem;line-height:1.5">${fmtDate(b.fecha_ingreso)}</strong></div>
        </div>
        <div class="grid grid-2" style="margin-top:1.5rem;align-items:start">
          <section class="card">
            <h2 style="font-size:1.2rem">Mi perfil</h2>
            <ul class="meta">
              <li><span>Nombre</span><span>${esc(b.nombre_completo)}</span></li>
              <li><span>Correo</span><span>${esc(b.email)}</span></li>
              <li><span>Teléfono</span><span>${esc(b.telefono || 'Sin registro')}</span></li>
              <li><span>Facultad</span><span>${esc(b.facultad || 'No especificada')}</span></li>
              <li><span>Cursos que imparto</span><span>${esc(b.cursos_imparte || 'Ninguno')}</span></li>
            </ul>
          </section>
          <section class="card">
            <h2 style="font-size:1.2rem">Disponibilidad y ubicación</h2>
            <div class="field"><label for="estado">Mi estado</label>
              <select id="estado">${ESTADOS.map((s) => `<option value="${s}"${s === b.estado_disponibilidad ? ' selected' : ''}>${label(s)}</option>`).join('')}</select></div>
            <p class="muted" style="margin:.9rem 0">Última ubicación: ${b.ubicacion_actual ? esc(b.ubicacion_actual) : 'sin registro'}${b.ubicacion_actualizada ? ' (' + fmtDateTime(b.ubicacion_actualizada) + ')' : ''}</p>
            <div class="actions">
              <button class="btn btn-primary btn-sm" id="guardar-estado" type="button">Guardar estado</button>
              <button class="btn btn-outline btn-sm" id="ubicacion" type="button">Compartir mi ubicación</button>
            </div>
            <p class="hint" style="margin:.75rem 0 0">Tu ubicación solo la ve el personal técnico y de administración.</p>
          </section>
        </div>`;

      $('#guardar-estado').addEventListener('click', () => PC.panel.run(PC.api.put('/brigadistas/me/estado', { estado: $('#estado').value })));
      $('#ubicacion').addEventListener('click', compartir);
    } catch (e) {
      box.innerHTML = `<div class="notice notice-warn">${esc(e.message)}</div>`;
    }
  }

  function compartir() {
    if (!navigator.geolocation) { PC.ui.toast('Tu navegador no admite geolocalización.', 'error'); return; }
    const dlg = PC.ui.dialog({
      title: 'Compartir ubicación',
      body: `<p>Se enviará tu posición actual al personal técnico. Describe brevemente dónde estás.</p>
             <div class="field"><label for="desc">Descripción</label><input type="text" id="desc" placeholder="Ej. Entrada principal, Facultad de Medicina"></div>`,
      actions: [
        { label: 'Cancelar', onClick: (d) => d.close() },
        { label: 'Enviar ubicación', className: 'btn-primary', onClick: (d) => {
          const texto = $('#desc', d).value;
          navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
              const res = await PC.api.put('/brigadistas/me/ubicacion', {
                latitud: pos.coords.latitude, longitud: pos.coords.longitude, ubicacion: texto, estado: $('#estado').value
              });
              PC.ui.toast(res.message);
              d.close();
              cargar();
            } catch (e) { PC.ui.toast(e.message, 'error'); }
          }, (err) => PC.ui.toast('No se pudo obtener tu ubicación: ' + err.message, 'error'), { enableHighAccuracy: true, timeout: 10000 });
        } }
      ]
    });
    $('#desc', dlg).focus();
  }

  cargar();
})();
