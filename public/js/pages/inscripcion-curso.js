(function () {
  const { $, toast, esc } = PC.ui;
  const id = new URLSearchParams(location.search).get('id');
  const form = $('#form');

  if (!/^\d+$/.test(id || '')) {
    form.classList.add('hidden');
    $('#aviso').innerHTML = '<div class="notice notice-warn">Primero elige un curso. <a href="cursos.html">Ver cursos</a></div>';
    return;
  }

  PC.api.get('/cursos').then((r) => {
    const c = r.data.find((x) => String(x.id) === id);
    if (!c) { form.classList.add('hidden'); $('#aviso').innerHTML = '<div class="notice notice-warn">Ese curso ya no está disponible. <a href="cursos.html">Ver cursos</a></div>'; return; }
    $('#nombre-curso').textContent = c.titulo;
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const btn = $('#enviar');
    btn.disabled = true;
    try {
      const res = await PC.api.post(`/cursos/${id}/inscripciones`, {
        nombre_completo: $('#nombre').value, email: $('#email').value, telefono: $('#telefono').value,
        n_cuenta: $('#cuenta').value, semestre: $('#semestre').value, carrera: $('#carrera').value,
        motivacion: $('#motivacion').value
      });
      form.reset();
      form.classList.add('hidden');
      $('#aviso').innerHTML = `<div class="notice notice-ok"><strong>${esc(res.message)}</strong><br><a href="cursos.html">Volver a los cursos</a></div>`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      toast(err.message, 'error');
      btn.disabled = false;
    }
  });
})();
