// Configuración del sitio. Edita este archivo para apuntar a tu propia API.
window.PC_CONFIG = {
  // URL base de la API cuando el backend está en otro dominio, por ejemplo:
  //   apiBase: 'https://mi-api.onrender.com/api'
  // Si se deja vacío, el sitio intenta usar '/api' en su mismo origen y, si no
  // responde (por ejemplo en GitHub Pages), funciona en modo demostración.
  apiBase: '',

  // Fuerza el modo demostración aunque exista una API disponible.
  forceDemo: false,

  contacto: {
    email: 'proteccioncivil@ucol.mx',
    telefono: '312 316 1000, ext. 30011',
    telefonoHref: '+523123161000',
    emergencias: '312 316 1017',
    emergenciasHref: '+523123161017',
    emergenciasNacional: '911'
  },

  // Mapa base opcional. Por omisión se usan proveedores gratuitos sin clave
  // (Esri y OpenStreetMap). Si contratas uno con clave, por ejemplo MapTiler:
  //   mapa: { url: 'https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=TU_CLAVE',
  //           attribution: '&copy; MapTiler &copy; OpenStreetMap' }
  // Si usas el servidor Node, agrega también su dominio en MAP_IMG_HOSTS (.env).
  mapa: null,

  // Redes sociales. Para agregar otra, añade una línea con su nombre, la URL
  // y el tipo de ícono: 'facebook', 'instagram', 'x' o 'youtube'.
  redes: [
    { nombre: 'Facebook', url: 'https://www.facebook.com/profile.php?id=100077086370710', icono: 'facebook' },
    { nombre: 'Instagram', url: 'https://www.instagram.com/proteccion_civil_udc/', icono: 'instagram' }
  ]
};
