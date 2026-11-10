(function () {
  const { $, toast } = PC.ui;
  const id = new URLSearchParams(location.search).get('id');
  const form = $('#form');

  if (!/^\d+$/.test(id || '')) {
    form.classList.add('hidden');
    $('#aviso').innerHTML = '<div class="notice notice-warn">Primero elige una brigada. <a href="brigadas.html">Ver brigadas</a></div>';
    return;
  }

  // El nombre se obtiene de la API, no de la URL, para no mostrar texto arbitrario.
  PC.api.get('/brigadas').then((r) => {
    const b = r.data.find((x) => String(x.id) === id);
    if (!b) { form.classList.add('hidden'); $('#aviso').innerHTML = '<div class="notice notice-warn">Esa brigada no existe. <a href="brigadas.html">Ver brigadas</a></div>'; return; }
    $('#nombre-brigada').textContent = b.nombre;
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const btn = $('#enviar');
    btn.disabled = true;
    try {
      const res = await PC.api.post(`/brigadas/${id}/solicitudes`, {
        nombre_completo: $('#nombre').value, email: $('#email').value, telefono: $('#telefono').value,
        n_cuenta: $('#cuenta').value, semestre: $('#semestre').value, carrera: $('#carrera').value,
        facultad: $('#facultad').value, experiencia_previa: $('#experiencia').value, motivacion: $('#motivacion').value
      });
      form.reset();
      form.classList.add('hidden');
      $('#aviso').innerHTML = `<div class="notice notice-ok"><strong>${PC.ui.esc(res.message)}</strong><br><a href="brigadas.html">Volver a las brigadas</a></div>`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      toast(err.message, 'error');
      btn.disabled = false;
    }
  });
})();
