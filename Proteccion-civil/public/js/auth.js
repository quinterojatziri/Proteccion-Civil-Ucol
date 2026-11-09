// Sesión del lado del cliente. Es solo una ayuda de navegación: la
// autorización real siempre la aplica el servidor.
window.PC = window.PC || {};

PC.auth = (function () {
  const KEY = 'pc_session';

  const DASHBOARDS = {
    admin: 'dash-admi.html',
    tecnico: 'dash-tec.html',
    brigadista: 'dash-brigadista.html',
    capacitador: 'dash-capaci.html',
    usuario: 'index.html'
  };

  const read = () => {
    try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { return null; }
  };

  const user = () => (read() || {}).user || null;
  const token = () => (read() || {}).token || null;
  const dashboardFor = (rol) => DASHBOARDS[rol] || 'index.html';

  function save(session) {
    try { localStorage.setItem(KEY, JSON.stringify(session)); } catch (e) { /* sin almacenamiento */ }
  }

  function clear() {
    try { localStorage.removeItem(KEY); } catch (e) { /* sin almacenamiento */ }
  }

  function logout() {
    clear();
    location.href = 'index.html';
  }

  async function login(email, password) {
    const res = await PC.api.post('/auth/login', { email, password });
    save({ token: res.token, user: res.user });
    return res.user;
  }

  // Redirige si no hay sesión o si el rol no corresponde a la página.
  function require(roles) {
    const u = user();
    if (!u) {
      location.replace('login.html?next=' + encodeURIComponent(location.pathname.split('/').pop()));
      return null;
    }
    if (roles && !roles.includes(u.rol)) {
      location.replace(dashboardFor(u.rol));
      return null;
    }
    return u;
  }

  return { user, token, save, clear, logout, login, require, dashboardFor };
})();
