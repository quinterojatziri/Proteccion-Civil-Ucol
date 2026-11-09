// Se carga en <head> para aplicar el tema antes de pintar y evitar parpadeos.
(function () {
  var saved = null;
  try { saved = localStorage.getItem('pc_theme'); } catch (e) { /* almacenamiento no disponible */ }
  var dark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
})();
