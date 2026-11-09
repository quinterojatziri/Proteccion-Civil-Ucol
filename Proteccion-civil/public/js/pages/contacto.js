(function () {
  const { $, toast } = PC.ui;
  const form = $('#form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const btn = $('#enviar');
    btn.disabled = true;
    try {
      const res = await PC.api.post('/contacto', {
        nombre: $('#nombre').value, email: $('#email').value, telefono: $('#telefono').value,
        tipo: $('#tipo').value, asunto: $('#asunto').value, mensaje: $('#mensaje').value
      });
      toast(res.message);
      form.reset();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      btn.disabled = false;
    }
  });
})();
