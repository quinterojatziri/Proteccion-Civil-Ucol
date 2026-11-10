# Protección Civil UCOL

Sitio web y sistema de gestión para la Unidad de Protección Civil de la Universidad de Colima, desarrollado como proyecto escolar.

Reúne en un solo lugar la información de la unidad y las tareas que antes se hacían por separado: la comunidad universitaria puede consultar novedades, reportar emergencias, inscribirse a cursos y solicitar su ingreso a una brigada, mientras que el personal cuenta con paneles internos para dar seguimiento a todo ello.

**Sitio publicado:** https://quinterojatziri.github.io/Proteccion-Civil-Ucol/

## Funcionalidades

**Sitio público**

- Información institucional, novedades y comunicados.
- Brigadas universitarias, con sus requisitos y formulario de solicitud de ingreso.
- Cursos de capacitación con control de cupo e inscripción en línea.
- Centro de documentación con visor y descarga de PDF.
- Reporte de emergencias con folio de seguimiento.
- Directorio de brigadistas con filtros y mapa interactivo.
- Formulario de contacto.
- Modo claro y oscuro, y diseño adaptable a celular.

**Paneles internos**

| Rol | Qué puede hacer |
| --- | --- |
| Administración | Gestionar usuarios y roles, resolver solicitudes de ingreso a brigadas y revisar los mensajes de contacto. |
| Técnico | Atender emergencias, cambiar su estatus y consultar el mapa con la ubicación exacta de los brigadistas. |
| Brigadista | Consultar su perfil, actualizar su disponibilidad y compartir su ubicación. |
| Capacitador | Revisar y aprobar las inscripciones a los cursos. |

## Tecnologías

- **Frontend:** HTML, CSS y JavaScript, sin frameworks ni paso de compilación.
- **Backend:** Node.js y Express.
- **Base de datos:** MySQL.
- **Autenticación:** tokens JWT y contraseñas cifradas con bcrypt.
- **Mapas:** Leaflet.
- **Publicación de la demostración:** GitHub Pages.

## Modo demostración

El sitio publicado en GitHub Pages funciona en **modo demostración**. GitHub Pages solo aloja archivos estáticos: no puede ejecutar Node.js ni conectarse a una base de datos, y el sistema completo necesita ambos.

Para poder mostrar el proyecto en línea de todos modos, programé el frontend para que detecte si hay un servidor disponible. Si no lo hay, usa un servidor simulado que corre dentro del propio navegador (`public/js/demo.js`) con datos de ejemplo. Con esto se puede recorrer todo el sitio, incluidos los cuatro paneles, y los cambios que se hacen (aprobar una solicitud, crear un usuario, atender una emergencia) se conservan en el navegador de quien lo prueba.

Hay que tener presente lo siguiente al usar la demostración:

- Todos los datos son ficticios.
- Nada de lo que se captura llega a la Unidad de Protección Civil ni a una base de datos; se queda en el navegador.
- El sitio lo indica con una franja amarilla en la parte superior de cada página, y el formulario de emergencias aclara que no se despacha ningún equipo.

Cuando el sitio se ejecuta con el servidor (en mi computadora o desplegado en un servicio de alojamiento), el modo demostración se desactiva solo y todo funciona con la base de datos real.

### Cuentas de prueba

Todas usan la contraseña `Demo1234!`.

| Rol | Correo |
| --- | --- |
| Administración | `admin@demo.local` |
| Técnico | `tecnico@demo.local` |
| Brigadista | `brigadista@demo.local` |
| Capacitador | `capacitador@demo.local` |
| Usuario | `usuario@demo.local` |

En modo demostración, la pantalla de acceso incluye un botón por cada rol para entrar directamente. El rol no se elige al iniciar sesión: lo determina la cuenta.

## Estructura del proyecto

```
public/                 Sitio estático (lo que se publica en GitHub Pages)
  css/styles.css        Estilos, modo claro y oscuro
  js/config.js          Configuración: API, mapa, contacto y redes sociales
  js/api.js             Cliente de la API con detección de modo
  js/demo.js            Servidor simulado del modo demostración
  js/auth.js            Sesión y protección de páginas
  js/ui.js              Cabecera, pie, avisos y diálogos compartidos
  js/panel.js           Utilidades de los paneles internos
  js/pages/             Un script por página
  docs/                 PDF de la sección de documentos
  vendor/leaflet/       Biblioteca de mapas
src/                    API: configuración, base de datos, autenticación y rutas
server.js               Servidor Express
database/               Esquema, datos de ejemplo y script completo
scripts/                Inicialización de la base y creación de usuarios
.github/workflows/      Publicación automática en GitHub Pages
```

## API

Las respuestas son JSON. Las correctas incluyen `"success": true` junto con `data` o `message`; los errores incluyen `"success": false` y `message`. Las rutas protegidas esperan el encabezado `Authorization: Bearer <token>`.

| Ruta | Acceso | Descripción |
| --- | --- | --- |
| `GET /api/health` | Público | Estado del servidor y de la base de datos. |
| `POST /api/auth/login` | Público | Inicio de sesión. |
| `POST /api/auth/register` | Público | Crea una cuenta con rol `usuario`. |
| `GET /api/auth/me` | Sesión | Datos de la sesión actual. |
| `GET /api/novedades`, `/brigadas`, `/cursos`, `/documentos`, `/estadisticas` | Público | Contenido del sitio. |
| `POST /api/brigadas/:id/solicitudes` | Público | Solicitud de ingreso a una brigada. |
| `POST /api/cursos/:id/inscripciones` | Público | Inscripción a un curso, con validación de cupo. |
| `POST /api/contacto` | Público | Mensaje de contacto. |
| `POST /api/emergencias` | Público | Reporte de emergencia; devuelve un folio. |
| `GET /api/brigadistas/buscar` | Público | Directorio sin datos de contacto. |
| `GET /api/brigadistas/mapa` | Público | Mapa con posiciones aproximadas; el personal autorizado recibe las exactas. |
| `/api/brigadistas/me` | Brigadista | Perfil, estado y ubicación propios. |
| `/api/usuarios`, `/solicitudes`, `/mensajes`, `/panel/admin` | Administración | Gestión interna. |
| `/api/emergencias`, `/panel/tecnico` | Técnico y administración | Seguimiento de emergencias. |
| `/api/inscripciones`, `/panel/capacitador` | Capacitador y administración | Aprobación de inscripciones. |

## Seguridad

- Las contraseñas se almacenan cifradas con bcrypt.
- Los permisos por rol se verifican en el servidor en cada petición, y el estado de la cuenta se consulta en la base de datos, de modo que desactivar a un usuario surte efecto de inmediato.
- El registro público siempre crea cuentas de rol `usuario`; los demás roles los asigna la administración.
- El directorio público no muestra teléfonos ni correos, y el mapa público solo muestra zonas aproximadas, sin nombres.
- Las consultas a la base usan parámetros, el contenido dinámico se escapa antes de mostrarse y los datos de entrada se validan.
- Hay límite de intentos en el inicio de sesión y en los formularios públicos, además de cabeceras de seguridad con `helmet`.
- Las credenciales y la clave de los tokens se leen de variables de entorno y el archivo `.env` está excluido del repositorio.
- El cupo de los cursos se valida dentro de una transacción para evitar inscripciones de más cuando llegan varias a la vez.
