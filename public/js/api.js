// Cliente de la API. Detecta si hay un backend disponible; si no, usa el
// módulo de demostración (PC.demo), que guarda los datos en el navegador.
window.PC = window.PC || {};

PC.ApiError = class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
};

PC.api = (function () {
  const cfg = window.PC_CONFIG;
  let modePromise = null;

  function detect() {
    if (cfg.forceDemo) return Promise.resolve({ demo: true });
    if (cfg.apiBase) return Promise.resolve({ demo: false, base: cfg.apiBase.replace(/\/$/, '') });

    // Hostings estáticos conocidos y archivos locales: no hay backend que sondear.
    if (location.protocol === 'file:' || /\.github\.io$/i.test(location.hostname)) {
      return Promise.resolve({ demo: true });
    }

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 2500);
    return fetch('/api/health', { signal: ctrl.signal, headers: { Accept: 'application/json' } })
      .then((r) => r.json().catch(() => null).then((j) => (r.ok && j && j.status === 'ok'
        ? { demo: false, base: '/api' }
        : { demo: true })))
      .catch(() => ({ demo: true }))
      .finally(() => clearTimeout(timer));
  }

  const mode = () => (modePromise = modePromise || detect());

  async function request(method, path, body) {
    const m = await mode();
    const token = PC.auth.token();

    if (m.demo) return PC.demo.handle(method, path, body, token);

    let res;
    try {
      res = await fetch(m.base + path, {
        method,
        headers: {
          Accept: 'application/json',
          ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
          ...(token ? { Authorization: 'Bearer ' + token } : {})
        },
        body: body !== undefined ? JSON.stringify(body) : undefined
      });
    } catch (e) {
      throw new PC.ApiError('No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.', 0);
    }

    let data = null;
    try { data = await res.json(); } catch (e) { /* respuesta sin cuerpo JSON */ }

    if (res.status === 401 && token) {
      PC.auth.clear();
      if (!/login\.html$/.test(location.pathname)) location.replace('login.html?expirada=1');
    }
    if (!res.ok) throw new PC.ApiError((data && data.message) || 'Ocurrió un error inesperado', res.status);
    return data;
  }

  return {
    mode,
    get: (p) => request('GET', p),
    post: (p, b) => request('POST', p, b || {}),
    put: (p, b) => request('PUT', p, b || {}),
    patch: (p, b) => request('PATCH', p, b || {}),
    del: (p) => request('DELETE', p)
  };
})();
