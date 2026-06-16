const API_URL = 'http://localhost:3000';

const cargarEstudiantes = async () => {
    try {
        const res = await axios.get(`${API_URL}/estudiantes`);
        mostrarEstudiantes(res.data);
    } catch (error) {
        console.error('Error cargando estudiantes:', error);
        alert('❌ Error al cargar estudiantes');
    }
}; 

const clasePillTurno = (turno) => {
    const clases = {
        'mañana': 'pill--manana',
        'tarde': 'pill--tarde',
        'noche': 'pill--noche'
    };
    return clases[turno] || 'pill--neutral';
};

const mostrarEstudiantes = (estudiantes) => {
    const lista = document.getElementById('listaEstudiantes');
    lista.innerHTML = '';

    if (estudiantes.length === 0) {
        lista.innerHTML = '<div class="empty-state">Todavía no hay estudiantes registrados.</div>';
        return;
    }

    estudiantes.forEach((est) => {
        lista.innerHTML += `
            <div class="col-md-6 col-lg-4">
                <div class="card h-100">
                    <div class="card-header">
                        <h5 class="card-title mb-0">${est.nombre} ${est.apellido}</h5>
                    </div>
                    <div class="card-body">
                        <p class="card-text mb-0">
                            <strong>DNI:</strong> <span class="mono">${est.dni}</span><br>
                            <strong>Año:</strong> <span class="mono">${est.anio}º</span><br>
                            <strong>Turno:</strong> <span class="pill ${clasePillTurno(est.turno)}">${est.turno}</span>
                        </p>
                    </div>
                    <div class="card-footer d-grid gap-2">
                        <button
                            class="btn btn-warning btn-sm"
                            onclick="editarEstudiante('${est.id}')"
                            data-bs-toggle="modal"
                            data-bs-target="#modalEstudiante"
                        >
                            Editar
                        </button>
                        <button
                            class="btn btn-danger btn-sm"
                            onclick="eliminarEstudiante('${est.id}')"
                        >
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
};

// Devuelve true si ya existe otro estudiante con ese DNI.
// idActual permite excluir al propio estudiante cuando se está editando.
// Se filtra del lado del cliente para no depender del tipado del query de json-server.
const dniDuplicado = async (dni, idActual = null) => {
    const res = await axios.get(`${API_URL}/estudiantes`);
    return res.data.some(
        (est) => String(est.dni) === String(dni) && String(est.id) !== String(idActual)
    );
};

const crearEstudiante = async () => {
    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const dni = document.getElementById('dni').value.trim();
    const anio = document.getElementById('anio').value;
    const turno = document.getElementById('turno').value;

    if (!nombre || !apellido || !dni || !anio || !turno) {
        alert('❌ Completa todos los campos');
        return;
    }

    const btnGuardar = document.getElementById('btnGuardarEstudiante');
    btnGuardar.disabled = true;
    try {
        if (await dniDuplicado(dni)) {
            alert('❌ Ya existe un estudiante con ese DNI');
            return;
        }

        await axios.post(`${API_URL}/estudiantes`, {
            nombre,
            apellido,
            dni,
            anio: parseInt(anio),
            turno
        });

        const modal = bootstrap.Modal.getInstance(document.getElementById('modalEstudiante'));
        modal.hide();

        limpiarFormulario();
        cargarEstudiantes();

        alert('✅ Estudiante agregado exitosamente');
    } catch (error) {
        console.error('Error creando estudiante:', error);
        alert('❌ Error al crear estudiante: ' + error.message);
    } finally {
        btnGuardar.disabled = false;
    }
};

const editarEstudiante = async (id) => {
    try {
        const res = await axios.get(`${API_URL}/estudiantes/${id}`);
        const est = res.data;

        document.getElementById('nombre').value = est.nombre;
        document.getElementById('apellido').value = est.apellido;
        document.getElementById('dni').value = est.dni;
        document.getElementById('anio').value = est.anio;
        document.getElementById('turno').value = est.turno;

        document.getElementById('idEstudianteEditar').value = id;

        document.querySelector('#modalEstudiante .modal-title').textContent = 'Editar estudiante';
        document.getElementById('btnGuardarEstudiante').textContent = 'Actualizar';
    } catch (error) {
        console.error('Error cargando estudiante:', error);
        alert('❌ Error al cargar estudiante');
    }
};

const guardarCambiosEstudiante = async (e) => {
    e.preventDefault();

    const idEstudianteEditar = document.getElementById('idEstudianteEditar').value;

    if (!idEstudianteEditar) {
        crearEstudiante();
        return;
    }

    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const dni = document.getElementById('dni').value.trim();
    const anio = document.getElementById('anio').value;
    const turno = document.getElementById('turno').value;

    if (!nombre || !apellido || !dni || !anio || !turno) {
        alert('❌ Completa todos los campos');
        return;
    }

    const btnGuardar = document.getElementById('btnGuardarEstudiante');
    btnGuardar.disabled = true;
    try {
        if (await dniDuplicado(dni, idEstudianteEditar)) {
            alert('❌ Ya existe otro estudiante con ese DNI');
            return;
        }

        await axios.patch(`${API_URL}/estudiantes/${idEstudianteEditar}`, {
            nombre,
            apellido,
            dni,
            anio: parseInt(anio),
            turno
        });

        const modal = bootstrap.Modal.getInstance(document.getElementById('modalEstudiante'));
        modal.hide();

        limpiarFormulario();
        cargarEstudiantes();

        alert('✅ Estudiante actualizado exitosamente');
    } catch (error) {
        console.error('Error editando estudiante:', error);
        alert('❌ Error al actualizar estudiante: ' + error.message);
    } finally {
        btnGuardar.disabled = false;
    }
};

const eliminarEstudiante = async (id) => {
    if (!confirm('⚠️ ¿Estás seguro de que quieres eliminar este estudiante? Se eliminarán todas sus calificaciones.')) {
        return;
    }

    try {
        const resCalificaciones = await axios.get(`${API_URL}/calificaciones?estudianteId=${id}`);

        for (const calificacion of resCalificaciones.data) {
            await axios.delete(`${API_URL}/calificaciones/${calificacion.id}`);
        }

        await axios.delete(`${API_URL}/estudiantes/${id}`);

        cargarEstudiantes();

        alert('✅ Estudiante eliminado exitosamente');
    } catch (error) {
        console.error('Error eliminando estudiante:', error);
        alert('❌ Error al eliminar estudiante: ' + error.message);
    }
};

const limpiarFormulario = () => {
    document.getElementById('formularioEstudiante').reset();
    document.getElementById('idEstudianteEditar').value = '';
    document.querySelector('#modalEstudiante .modal-title').textContent = 'Agregar estudiante';
    document.getElementById('btnGuardarEstudiante').textContent = 'Guardar estudiante';
};

document.addEventListener('DOMContentLoaded', () => {
    cargarEstudiantes();

    document
        .getElementById('formularioEstudiante')
        .addEventListener('submit', guardarCambiosEstudiante);

    document
        .getElementById('modalEstudiante')
        .addEventListener('hidden.bs.modal', limpiarFormulario);
});

window.editarEstudiante = editarEstudiante;
window.eliminarEstudiante = eliminarEstudiante;
