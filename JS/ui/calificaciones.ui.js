// Capa de vista de Calificaciones: arma el HTML, los selectores y el formulario.
import { escapeHtml, mismoId } from '../utils/dom.js';

export const formatearFecha = (iso) => {
    if (!iso) return '—';
    const [anio, mes, dia] = iso.split('-');
    return `${dia}/${mes}/${anio}`;
};

// Pinta la nota como una pill con su estado (aprobado/desaprobado) según la materia.
const renderEstadoNota = (cal, materia) => {
    // Sin materia asociada no se puede determinar la aprobación.
    if (!materia) {
        return `<span class="pill pill--neutral"><span class="nota">${escapeHtml(cal.nota)}</span> · sin materia</span>`;
    }
    const aprobada = Number(cal.nota) >= materia.notaMinima;
    const clase = aprobada ? 'pill--ok' : 'pill--bad';
    const texto = aprobada ? 'Aprobado' : 'Desaprobado';
    return `<span class="pill ${clase}"><span class="nota">${escapeHtml(cal.nota)}</span> · ${texto}</span>`;
};

// Rellena los <select> de alumno y materia del modal.
export const llenarSelectores = (estudiantes, materias) => {
    const selectAlumno = document.getElementById('ListadoAlumno');
    const selectMateria = document.getElementById('ListadoMateria');

    selectAlumno.innerHTML = '<option value="">Seleccioná un alumno...</option>'
        + estudiantes.map((est) =>
            `<option value="${escapeHtml(est.id)}">${escapeHtml(est.nombre)} ${escapeHtml(est.apellido)}</option>`
        ).join('');

    selectMateria.innerHTML = '<option value="">Seleccioná una materia...</option>'
        + materias.map((mat) =>
            `<option value="${escapeHtml(mat.id)}">${escapeHtml(mat.nombre)}</option>`
        ).join('');
};

// Pinta las cards de calificaciones, resolviendo el nombre del alumno y la materia.
export const renderCalificaciones = (calificaciones, estudiantes, materias) => {
    const lista = document.getElementById('listadoCalificacion');

    if (calificaciones.length === 0) {
        lista.innerHTML = '<div class="empty-state">Todavía no hay calificaciones registradas.</div>';
        return;
    }

    lista.innerHTML = calificaciones.map((cal) => {
        const alumno = estudiantes.find((e) => mismoId(e.id, cal.estudianteId));
        const materia = materias.find((m) => mismoId(m.id, cal.materiaId));
        const nombreAlumno = alumno ? `${alumno.nombre} ${alumno.apellido}` : 'Alumno desconocido';
        const nombreMateria = materia ? materia.nombre : 'Materia desconocida';

        return `
        <div class="col-md-6 col-lg-4">
            <div class="card h-100">
                <div class="card-header">
                    <h5 class="card-title mb-0">${escapeHtml(nombreAlumno)}</h5>
                </div>
                <div class="card-body">
                    <p class="card-text mb-0">
                        <strong>Materia:</strong> ${escapeHtml(nombreMateria)}<br>
                        <strong>Nota:</strong> ${renderEstadoNota(cal, materia)}<br>
                        <strong>Fecha:</strong> <span class="mono">${escapeHtml(formatearFecha(cal.fecha))}</span>
                    </p>
                </div>
                <div class="card-footer d-grid gap-2">
                    <button class="btn btn-warning btn-sm" data-action="editar" data-id="${escapeHtml(cal.id)}"
                        data-bs-toggle="modal" data-bs-target="#modalCalificacion">
                        Editar
                    </button>
                    <button class="btn btn-danger btn-sm" data-action="eliminar" data-id="${escapeHtml(cal.id)}">
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
        `;
    }).join('');
};

export const leerFormularioCalificacion = () => ({
    estudianteId: document.getElementById('ListadoAlumno').value,
    materiaId: document.getElementById('ListadoMateria').value,
    nota: document.getElementById('notaObtenida').value,
    fecha: document.getElementById('fechaEvaluativo').value
});

export const llenarFormularioCalificacion = (cal) => {
    document.getElementById('ListadoAlumno').value = cal.estudianteId;
    document.getElementById('ListadoMateria').value = cal.materiaId;
    document.getElementById('notaObtenida').value = cal.nota;
    document.getElementById('fechaEvaluativo').value = cal.fecha;
    document.getElementById('idCalificacionEditar').value = cal.id;

    document.querySelector('#modalCalificacion .modal-title').textContent = 'Editar calificación';
    document.getElementById('btnGuardarCalificacion').textContent = 'Actualizar';
};

export const limpiarFormularioCalificacion = () => {
    document.getElementById('formularioCalificacion').reset();
    document.getElementById('idCalificacionEditar').value = '';
    document.querySelector('#modalCalificacion .modal-title').textContent = 'Agregar calificación';
    document.getElementById('btnGuardarCalificacion').textContent = 'Guardar calificación';
};
