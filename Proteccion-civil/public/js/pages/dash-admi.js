(function () {
  const user = PC.auth.require(['admin']);
  if (!user) return;
  const { $, $$, esc, fmtDate, fmtDateTime, label } = PC.ui;
  const { badge, setCount, run } = PC.panel;
  const ROLES = ['admin', 'tecnico', 'brigadista', 'capacitador', 'usuario'];

  const tabs = PC.panel.tabs({ resumen, usuarios, solicitudes, mensajes });

  async function resumen() {
    try {
      const { stats, actividad } = (await PC.api.get('/panel/admin')).data;
      const tile = (t, v, alert) => `<div class="tile${alert && v ? ' alert' : ''}"><span>${t}</span><strong>${v}</strong></div>`;
      $('#tiles').innerHTML =
        tile('Usuarios activos', stats.usuarios) + tile('Brigadistas activos', stats.brigadistas) +
        tile('Emergencias activas', stats.emergencias_activas, true) + tile('Solicitudes pendientes', stats.solicitudes_pendientes);
      $('#actividad').innerHTML = actividad.length
        ? actividad.map((a) => `<li><span>${esc(a.descripcion)}</span><span class="muted" style="white-space:nowrap">${fmtDateTime(a.fecha)}</span></li>`).join('')
        : `<li>${'Sin actividad reciente.'}</li>`;
      setCount('solicitudes', stats.solicitudes_pendientes);
      setCount('mensajes', stats.mensajes_nuevos);
    } catch (e) { $('#tiles').innerHTML = PC.ui.empty(e.message); }
  }

  /* ---------- Usuarios ---------- */
  async function usuarios() {
    const body = $('#tabla-usuarios');
    body.innerHTML = `<tr><td colspan="5">${PC.ui.loading()}</td></tr>`;
    try {
      const list = (await PC.api.get('/usuarios')).data;
      body.innerHTML = list.map((u) => {
        const self = u.id === user.id;
        return `<tr>
          <td>${esc(u.nombre)}${self ? ' <span class="badge">Tú</span>' : ''}</td>
          <td>${esc(u.email)}</td>
          <td>${self ? esc(label(u.rol)) : `<select data-rol="${u.id}" aria-label="Rol de ${esc(u.nombre)}" style="width:auto">
                ${ROLES.map((r) => `<option value="${r}"${r === u.rol ? ' selected' : ''}>${label(r)}</option>`).join('')}</select>`}</td>
          <td>${u.activo ? badge('confirmada').replace('Confirmada', 'Activo') : '<span class="badge">Inactivo</span>'}</td>
          <td>${self ? '' : `<div class="actions">
              <button class="btn btn-outline btn-sm" data-toggle="${u.id}" data-activo="${u.activo ? 1 : 0}">${u.activo ? 'Desactivar' : 'Activar'}</button>
              <button class="btn btn-outline btn-sm" data-del="${u.id}" data-nombre="${esc(u.nombre)}">Eliminar</button></div>`}</td>
        </tr>`;
      }).join('');

      $$('[data-rol]', body).forEach((s) => s.addEventListener('change', () =>
        run(PC.api.patch('/usuarios/' + s.dataset.rol, { rol: s.value }), () => tabs.reload('usuarios'))));
      $$('[data-toggle]', body).forEach((b) => b.addEventListener('click', () =>
        run(PC.api.patch('/usuarios/' + b.dataset.toggle, { activo: b.dataset.activo !== '1' }), () => tabs.reload('usuarios'))));
      $$('[data-del]', body).forEach((b) => b.addEventListener('click', async () => {
        if (await PC.ui.confirmDialog(`Se eliminará la cuenta de ${b.dataset.nombre}. Esta acción no se puede deshacer.`, { okText: 'Eliminar', danger: true })) {
          run(PC.api.del('/usuarios/' + b.dataset.del), () => tabs.reload('usuarios'));
        }
      }));
    } catch (e) { body.innerHTML = `<tr><td colspan="5">${PC.ui.empty(e.message)}</td></tr>`; }
  }

  $('#nuevo-usuario').addEventListener('click', () => {
    const dlg = PC.ui.dialog({
      title: 'Nuevo usuario',
      body: `<form class="form" id="f-usuario" novalidate>
        <div class="field"><label for="u-nombre">Nombre completo</label><input type="text" id="u-nombre" required></div>
        <div class="field"><label for="u-email">Correo electrónico</label><input type="email" id="u-email" required></div>
        <div class="form-row">
          <div class="field"><label for="u-pass">Contraseña inicial</label><input type="password" id="u-pass" minlength="8" autocomplete="new-password" required></div>
          <div class="field"><label for="u-rol">Rol</label><select id="u-rol">${ROLES.map((r) => `<option value="${r}"${r === 'usuario' ? ' selected' : ''}>${label(r)}</option>`).join('')}</select></div>
        </div></form>`,
      actions: [
        { label: 'Cancelar', onClick: (d) => d.close() },
        { label: 'Crear usuario', className: 'btn-primary', onClick: async (d) => {
          const f = $('#f-usuario', d);
          if (!f.reportValidity()) return;
          try {
            const res = await PC.api.post('/usuarios', {
              nombre: $('#u-nombre', d).value, email: $('#u-email', d).value,
              password: $('#u-pass', d).value, rol: $('#u-rol', d).value
            });
            PC.ui.toast(res.message);
            d.close();
            tabs.reload('usuarios');
          } catch (e) { PC.ui.toast(e.message, 'error'); }
        } }
      ]
    });
    $('#u-nombre', dlg).focus();
  });

  /* ---------- Solicitudes ---------- */
  async function solicitudes() {
    const box = $('#lista-solicitudes');
    box.innerHTML = PC.ui.loading();
    try {
      const list = (await PC.api.get('/solicitudes')).data;
      setCount('solicitudes', list.filter((s) => s.estatus === 'pendiente').length);
      box.innerHTML = list.length ? list.map((s) => `
        <article class="card">
          <div class="badge-row">${badge(s.estatus)}<span class="badge">${esc(s.brigada_nombre)}</span>
            <span class="news-date" style="margin-left:auto">${fmtDate(s.fecha_solicitud)}</span></div>
          <h3>${esc(s.nombre_completo)}</h3>
          <p class="muted" style="margin-bottom:.5rem">${esc(s.email)} &middot; ${esc(s.telefono)}${s.carrera ? ' &middot; ' + esc(s.carrera) : ''}${s.semestre ? ', semestre ' + esc(s.semestre) : ''}</p>
          ${s.experiencia_previa ? `<p style="margin-bottom:.5rem"><strong>Experiencia:</strong> ${esc(s.experiencia_previa)}</p>` : ''}
          <p style="margin-bottom:0"><strong>Motivación:</strong> ${esc(s.motivacion)}</p>
          ${s.estatus === 'pendiente' ? `<div class="actions card-footer">
            <button class="btn btn-primary btn-sm" data-act="aceptado" data-id="${s.id}">Aceptar</button>
            <button class="btn btn-outline btn-sm" data-act="rechazado" data-id="${s.id}">Rechazar</button></div>` : ''}
        </article>`).join('') : PC.ui.empty('No hay solicitudes registradas.');
      $$('[data-act]', box).forEach((b) => b.addEventListener('click', () =>
        run(PC.api.patch('/solicitudes/' + b.dataset.id, { estatus: b.dataset.act }), () => { tabs.reload('solicitudes'); resumen(); })));
    } catch (e) { box.innerHTML = PC.ui.empty(e.message); }
  }

  /* ---------- Mensajes ---------- */
  async function mensajes() {
    const box = $('#lista-mensajes');
    box.innerHTML = PC.ui.loading();
    try {
      const list = (await PC.api.get('/mensajes')).data;
      setCount('mensajes', list.filter((m) => m.estatus === 'nuevo').length);
      box.innerHTML = list.length ? list.map((m) => `
        <article class="card">
          <div class="badge-row">${badge(m.estatus)}<span class="badge">${esc(label(m.tipo))}</span>
            <span class="news-date" style="margin-left:auto">${fmtDateTime(m.fecha_envio)}</span></div>
          <h3>${esc(m.asunto)}</h3>
          <p class="muted" style="margin-bottom:.5rem">${esc(m.nombre)} &middot; <a href="mailto:${esc(m.email)}">${esc(m.email)}</a>${m.telefono ? ' &middot; ' + esc(m.telefono) : ''}</p>
          <p style="margin-bottom:0">${esc(m.mensaje)}</p>
          ${m.estatus !== 'cerrado' ? `<div class="actions card-footer">
            ${m.estatus === 'nuevo' ? `<button class="btn btn-outline btn-sm" data-st="leido" data-id="${m.id}">Marcar como leído</button>` : ''}
            ${m.estatus !== 'respondido' ? `<button class="btn btn-outline btn-sm" data-st="respondido" data-id="${m.id}">Marcar como respondido</button>` : ''}
            <button class="btn btn-outline btn-sm" data-st="cerrado" data-id="${m.id}">Cerrar</button></div>` : ''}
        </article>`).join('') : PC.ui.empty('No hay mensajes.');
      $$('[data-st]', box).forEach((b) => b.addEventListener('click', () =>
        run(PC.api.patch('/mensajes/' + b.dataset.id, { estatus: b.dataset.st }), () => { tabs.reload('mensajes'); resumen(); })));
    } catch (e) { box.innerHTML = PC.ui.empty(e.message); }
  }
})();
