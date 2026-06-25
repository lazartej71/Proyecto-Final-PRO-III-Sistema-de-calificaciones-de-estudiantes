// Capa de vista de Materias: arma el HTML y maneja el formulario. No hace peticiones.
import { escapeHtml } from '../utils/dom.js';

// Pinta las cards de materias. Botones por delegación (data-action/data-id).
export const renderMaterias = (materias) => {
    const lista = document.getElementById('listaMaterias');

    if (materias.length === 0) {
        lista.innerHTML = '<div class="empty-state">Todavía no hay materias registradas.</div>';
        return;
    }

    lista.innerHTML = materias.map((mat) => `
        <div class="col-md-6 col-lg-4">
            <div class="card h-100">
                <div class="card-header">
                    <h5 class="card-title mb-0">${escapeHtml(mat.nombre)}</h5>
                </div>
                <div class="card-body">
                    <p class="card-text mb-0">
                        <strong>Docente:</strong> ${escapeHtml(mat.docente)}<br>
                        <strong>Nota mínima:</strong> <span class="mono">${escapeHtml(mat.notaMinima)}</span>
                    </p>
                </div>
                <div class="card-footer d-grid gap-2">
                    <button class="btn btn-warning btn-sm" data-action="editar" data-id="${escapeHtml(mat.id)}"
                        data-bs-toggle="modal" data-bs-target="#modalMaterias">
                        Editar
                    </button>
                    <button class="btn btn-danger btn-sm" data-action="eliminar" data-id="${escapeHtml(mat.id)}">
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    `).join('');
};

export const leerFormularioMateria = () => ({
    nombre: document.getElementById('nombreMateria').value.trim(),
    docente: document.getElementById('docenteMateria').value.trim(),
    notaMinima: document.getElementById('notaMinima').value.trim()
});

export const llenarFormularioMateria = (mat) => {
    document.getElementById('nombreMateria').value = mat.nombre;
    document.getElementById('docenteMateria').value = mat.docente;
    document.getElementById('notaMinima').value = mat.notaMinima;
    document.getElementById('idMateriaEditar').value = mat.id;

    document.querySelector('#modalMaterias .modal-title').textContent = 'Editar materia';
    document.getElementById('btnGuardarMateria').textContent = 'Actualizar';
};

export const limpiarFormularioMateria = () => {
    document.getElementById('formularioMateria').reset();
    document.getElementById('idMateriaEditar').value = '';
    document.querySelector('#modalMaterias .modal-title').textContent = 'Agregar materia';
    document.getElementById('btnGuardarMateria').textContent = 'Guardar materia';
};
