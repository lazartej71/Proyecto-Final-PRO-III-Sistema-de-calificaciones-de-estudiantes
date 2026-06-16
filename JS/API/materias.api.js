const API_URL = 'http://localhost:3000';

const cargarMaterias = async () => {
    try {
        const res = await axios.get(`${API_URL}/materias`);
        mostrarMaterias(res.data);
    } catch (error) {
        console.error('Error cargando materias:', error);
        alert('❌ Error al cargar las materias');
    }
};

const mostrarMaterias = (materias) => {
    const lista = document.getElementById('listaMaterias');
    lista.innerHTML = '';

    if (materias.length === 0) {
        lista.innerHTML = '<div class="empty-state">Todavía no hay materias registradas.</div>';
        return;
    }

    materias.forEach((mat) => {
        lista.innerHTML += `
        <div class="col-md-6 col-lg-4">
            <div class="card h-100">
                <div class="card-header">
                    <h5 class="card-title mb-0">${mat.nombre}</h5>
                </div>
                <div class="card-body">
                    <p class="card-text mb-0">
                        <strong>Docente:</strong> ${mat.docente}<br>
                        <strong>Nota mínima:</strong> <span class="mono">${mat.notaMinima}</span>
                    </p>
                </div>
                <div class="card-footer d-grid gap-2">
                    <button
                        class="btn btn-warning btn-sm"
                        onclick="editarMateria('${mat.id}')"
                        data-bs-toggle="modal"
                        data-bs-target="#modalMaterias"
                    >
                        Editar
                    </button>
                    <button
                        class="btn btn-danger btn-sm"
                        onclick="eliminarMateria('${mat.id}')"
                    >
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
        `;
    });
};

const limpiarFormulario = () => {
    document.getElementById('formularioMateria').reset();
    document.getElementById('idMateriaEditar').value = '';
    document.querySelector('#modalMaterias .modal-title').textContent = 'Agregar materia';
    document.getElementById('btnGuardarMateria').textContent = 'Guardar materia';
};

const crearMateria = async () => {
    const nombre = document.getElementById('nombreMateria').value.trim();
    const docente = document.getElementById('docenteMateria').value.trim();
    const notaMinima = document.getElementById('notaMinima').value.trim();

    if (!nombre || !docente || !notaMinima) {
        alert('❌ Completa todos los campos');
        return;
    }

    if (Number(notaMinima) < 1 || Number(notaMinima) > 10) {
        alert('❌ La nota mínima debe estar entre 1 y 10');
        return;
    }

    const btnGuardar = document.getElementById('btnGuardarMateria');
    btnGuardar.disabled = true;
    try {
        await axios.post(`${API_URL}/materias`, {
            nombre,
            docente,
            notaMinima: Number(notaMinima)
        });

        const modal = bootstrap.Modal.getInstance(document.getElementById('modalMaterias'));
        modal.hide();

        cargarMaterias();

        alert('✅ Materia agregada exitosamente');
    } catch (error) {
        console.error('Error agregando una materia:', error);
        alert('❌ Error al agregar una materia: ' + error.message);
    } finally {
        btnGuardar.disabled = false;
    }
};

const editarMateria = async (id) => {
    try {
        const res = await axios.get(`${API_URL}/materias/${id}`);
        const mat = res.data;

        document.getElementById('nombreMateria').value = mat.nombre;
        document.getElementById('docenteMateria').value = mat.docente;
        document.getElementById('notaMinima').value = mat.notaMinima;

        document.getElementById('idMateriaEditar').value = id;

        document.querySelector('#modalMaterias .modal-title').textContent = 'Editar materia';
        document.getElementById('btnGuardarMateria').textContent = 'Actualizar';
    } catch (error) {
        console.error('Error cargando materia:', error);
        alert('❌ Error al cargar la materia');
    }
};

const guardarCambiosMateria = async (e) => {
    e.preventDefault();

    const idMateriaEditar = document.getElementById('idMateriaEditar').value;

    if (!idMateriaEditar) {
        crearMateria();
        return;
    }

    const nombre = document.getElementById('nombreMateria').value.trim();
    const docente = document.getElementById('docenteMateria').value.trim();
    const notaMinima = document.getElementById('notaMinima').value.trim();

    if (!nombre || !docente || !notaMinima) {
        alert('❌ Completa todos los campos');
        return;
    }

    if (Number(notaMinima) < 1 || Number(notaMinima) > 10) {
        alert('❌ La nota mínima debe estar entre 1 y 10');
        return;
    }

    const btnGuardar = document.getElementById('btnGuardarMateria');
    btnGuardar.disabled = true;
    try {
        await axios.patch(`${API_URL}/materias/${idMateriaEditar}`, {
            nombre,
            docente,
            notaMinima: Number(notaMinima)
        });

        const modal = bootstrap.Modal.getInstance(document.getElementById('modalMaterias'));
        modal.hide();

        cargarMaterias();

        alert('✅ Materia actualizada exitosamente');
    } catch (error) {
        console.error('Error editando materia:', error);
        alert('❌ Error al actualizar la materia: ' + error.message);
    } finally {
        btnGuardar.disabled = false;
    }
};

const eliminarMateria = async (id) => {
    if (!confirm('⚠️ ¿Estás seguro de que quieres eliminar esta materia? Se eliminarán todas las calificaciones asociadas.')) {
        return;
    }

    try {
        // Borrado en cascada: primero las calificaciones de esta materia,
        // así no quedan calificaciones huérfanas apuntando a una materia inexistente.
        const resCalificaciones = await axios.get(`${API_URL}/calificaciones?materiaId=${id}`);

        for (const calificacion of resCalificaciones.data) {
            await axios.delete(`${API_URL}/calificaciones/${calificacion.id}`);
        }

        await axios.delete(`${API_URL}/materias/${id}`);

        cargarMaterias();

        alert('✅ Materia eliminada exitosamente');
    } catch (error) {
        console.error('Error eliminando materia:', error);
        alert('❌ Error al eliminar la materia: ' + error.message);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    cargarMaterias();

    document
        .getElementById('formularioMateria')
        .addEventListener('submit', guardarCambiosMateria);

    document
        .getElementById('modalMaterias')
        .addEventListener('hidden.bs.modal', limpiarFormulario);
});

window.editarMateria = editarMateria;
window.eliminarMateria = eliminarMateria;