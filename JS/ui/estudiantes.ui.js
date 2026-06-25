// Capa de vista de Estudiantes: arma el HTML y maneja el formulario. No hace peticiones.
import { escapeHtml } from '../utils/dom.js';

const clasePillTurno = (turno) => {
    const clases = {
        'mañana': 'pill--manana',
        'tarde': 'pill--tarde',
        'noche': 'pill--noche'
    };
    return clases[turno] || 'pill--neutral';
};

// Pinta las cards de estudiantes. Los botones llevan data-action/data-id en vez de
// onclick inline: el controlador los maneja por delegación de eventos.
export const renderEstudiantes = (estudiantes) => {
    const lista = document.getElementById('listaEstudiantes');

    if (estudiantes.length === 0) {
        lista.innerHTML = '<div class="empty-state">Todavía no hay estudiantes registrados.</div>';
        return;
    }

    lista.innerHTML = estudiantes.map((est) => `
        <div class="col-md-6 col-lg-4">
            <div class="card h-100">
                <div class="card-header">
                    <h5 class="card-title mb-0">${escapeHtml(est.nombre)} ${escapeHtml(est.apellido)}</h5>
                </div>
                <div class="card-body">
                    <p class="card-text mb-0">
                        <strong>DNI:</strong> <span class="mono">${escapeHtml(est.dni)}</span><br>
                        <strong>Año:</strong> <span class="mono">${escapeHtml(est.anio)}º</span><br>
                        <strong>Turno:</strong> <span class="pill ${clasePillTurno(est.turno)}">${escapeHtml(est.turno)}</span>
                    </p>
                </div>
                <div class="card-footer d-grid gap-2">
                    <button class="btn btn-warning btn-sm" data-action="editar" data-id="${escapeHtml(est.id)}"
                        data-bs-toggle="modal" data-bs-target="#modalEstudiante">
                        Editar
                    </button>
                    <button class="btn btn-danger btn-sm" data-action="eliminar" data-id="${escapeHtml(est.id)}">
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    `).join('');
};

// Lee los campos del formulario y devuelve un objeto con los datos crudos.
export const leerFormularioEstudiante = () => ({
    nombre: document.getElementById('nombre').value.trim(),
    apellido: document.getElementById('apellido').value.trim(),
    dni: document.getElementById('dni').value.trim(),
    anio: document.getElementById('anio').value,
    turno: document.getElementById('turno').value
});

// Carga un estudiante existente en el formulario y pone el modal en modo edición.
export const llenarFormularioEstudiante = (est) => {
    document.getElementById('nombre').value = est.nombre;
    document.getElementById('apellido').value = est.apellido;
    document.getElementById('dni').value = est.dni;
    document.getElementById('anio').value = est.anio;
    document.getElementById('turno').value = est.turno;
    document.getElementById('idEstudianteEditar').value = est.id;

    document.querySelector('#modalEstudiante .modal-title').textContent = 'Editar estudiante';
    document.getElementById('btnGuardarEstudiante').textContent = 'Actualizar';
};

// Resetea el formulario y vuelve el modal a modo "alta".
export const limpiarFormularioEstudiante = () => {
    document.getElementById('formularioEstudiante').reset();
    document.getElementById('idEstudianteEditar').value = '';
    document.querySelector('#modalEstudiante .modal-title').textContent = 'Agregar estudiante';
    document.getElementById('btnGuardarEstudiante').textContent = 'Guardar estudiante';
};
