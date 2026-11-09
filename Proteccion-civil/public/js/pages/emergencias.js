(function () {
  const { $, esc, toast } = PC.ui;
  const form = $('#form');

  PC.api.mode().then((m) => { if (m.demo) $('#aviso-demo').classList.remove('hidden'); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;

    const ok = await PC.ui.confirmDialog(
      'Se enviará el reporte con los datos capturados. ¿Deseas continuar?',
      { okText: 'Enviar reporte', title: 'Enviar reporte de emergencia' });
    if (!ok) return;

    const btn = $('#enviar');
    btn.disabled = true;
    try {
      const res = await PC.api.post('/emergencias', {
        nombre_solicitante: $('#nombre').value, telefono: $('#telefono').value, email: $('#email').value,
        tipo_emergencia: $('#tipo').value, nivel_urgencia: $('#urgencia').value,
        edificio: $('#edificio').value, piso: $('#piso').value, numero_afectados: $('#afectados').value,
        ubicacion_detallada: $('#ubicacion').value, descripcion: $('#descripcion').value
      });
      form.reset();
      $('#afectados').value = 1;
      PC.ui.dialog({
        title: 'Reporte recibido',
        body: `<p><strong>Folio: ${esc(res.data.folio)}</strong></p>
               <p>${esc(res.message)}</p>
               <p class="muted">Conserva el folio. Si la situación empeora, llama al 312 316 1017 o al 911.</p>`,
        actions: [{ label: 'Entendido', className: 'btn-primary', onClick: (d) => d.close() }]
      });
    } catch (err) {
      toast(err.message + ' Si es urgente, llama al 312 316 1017.', 'error');
    } finally {
      btn.disabled = false;
    }
  });
})();
