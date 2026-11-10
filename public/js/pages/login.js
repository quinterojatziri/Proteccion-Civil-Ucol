(function () {
  const { $, toast } = PC.ui;
  const params = new URLSearchParams(location.search);
  const formLogin = $('#form-login');
  const formReg = $('#form-registro');

  // Si ya hay sesión, ir directo al panel.
  const current = PC.auth.user();
  if (current) { location.replace(PC.auth.dashboardFor(current.rol)); return; }

  if (params.get('expirada')) {
    $('#aviso').innerHTML = '<div class="notice notice-warn">Tu sesión expiró. Inicia sesión de nuevo.</div>';
  }

  PC.api.mode().then((m) => {
    if (!m.demo) return;
    $('#demo-box').classList.remove('hidden');
    const roles = [['admin', 'Administración'], ['tecnico', 'Técnico'], ['brigadista', 'Brigadista'], ['capacitador', 'Capacitador'], ['usuario', 'Usuario']];
    $('#demo-roles').innerHTML = roles.map(([r, t]) =>
      `<button type="button" class="btn btn-outline btn-sm" data-email="${r}@demo.local">${t}</button>`).join('');
    $('#demo-roles').addEventListener('click', (e) => {
      const b = e.target.closest('[data-email]');
      if (!b) return;
      $('#email').value = b.dataset.email;
      $('#password').value = PC.demo.password;
      formLogin.requestSubmit();
    });
  });

  // Solo se permiten redirecciones a páginas del propio sitio.
  const next = /^[a-z0-9-]+\.html$/i.test(params.get('next') || '') ? params.get('next') : null;

  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!formLogin.reportValidity()) return;
    const btn = $('#entrar');
    btn.disabled = true;
    try {
      const user = await PC.auth.login($('#email').value, $('#password').value);
      location.href = next || PC.auth.dashboardFor(user.rol);
    } catch (err) {
      toast(err.message, 'error');
      btn.disabled = false;
    }
  });

  formReg.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!formReg.reportValidity()) return;
    const btn = $('#registrar');
    btn.disabled = true;
    try {
      const res = await PC.api.post('/auth/register', {
        nombre: $('#r-nombre').value, email: $('#r-email').value, password: $('#r-password').value
      });
      toast(res.message);
      $('#email').value = $('#r-email').value;
      formReg.reset();
      show('login');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      btn.disabled = false;
    }
  });

  function show(which) {
    formLogin.classList.toggle('hidden', which !== 'login');
    formReg.classList.toggle('hidden', which !== 'registro');
  }
  $('#ir-registro').addEventListener('click', (e) => { e.preventDefault(); show('registro'); });
  $('#ir-login').addEventListener('click', (e) => { e.preventDefault(); show('login'); });
})();
