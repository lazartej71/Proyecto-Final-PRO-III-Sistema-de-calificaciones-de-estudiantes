const API_URL = 'http://localhost:3000';

let estudiantes = [];
let materias = [];

const cargarListas = async () => {
    const resEst = await axios.get(`${API_URL}/estudiantes`);
    const resMat = await axios.get(`${API_URL}/materias`);
    estudiantes = resEst.data;
    materias = resMat.data;

    const selectAlumno = document.getElementById('ListadoAlumno');
    const selectMateria = document.getElementById('ListadoMateria');

    selectAlumno.innerHTML = '<option value="">Seleccioná un alumno...</option>';
    estudiantes.forEach((est) => {
        selectAlumno.innerHTML += `<option value="${est.id}">${est.nombre} ${est.apellido}</option>`;
    });

    selectMateria.innerHTML = '<option value="">Seleccioná una materia...</option>';
    materias.forEach((mat) => {
        selectMateria.innerHTML += `<option value="${mat.id}">${mat.nombre}</option>`;
    });
};

const cargarCalificaciones = async () => {
    const res = await axios.get(`${API_URL}/calificaciones`);
    const lista = document.getElementById('listadoCalificacion');
    lista.innerHTML = '';

    if (res.data.length === 0) {
        lista.innerHTML = '<p class="text-center text-muted mt-4">No hay calificaciones registradas</p>';
        return;
    }

    res.data.forEach((cal) => {
        const alumno = estudiantes.find((e) => e.id == cal.estudianteId);
        const materia = materias.find((m) => m.id == cal.materiaId);
        const aprobada = Number(cal.nota) >= (materia ? materia.notaMinima : 6);

        lista.innerHTML += `
        <div class="col-md-4 mb-3">
            <div class="card h-100">
                <div class="card-header bg-info text-white">
                    <h5 class="card-title mb-0">${alumno ? alumno.nombre + ' ' + alumno.apellido : 'Alumno desconocido'}</h5>
                </div>
                <div class="card-body">
                    <p class="card-text">
                        <strong>Materia:</strong> ${materia ? materia.nombre : 'Materia desconocida'}<br>
                        <strong>Nota:</strong>
                        <span class="badge ${aprobada ? 'bg-success' : 'bg-danger'}">${cal.nota}</span><br>
                        <strong>Fecha:</strong> ${cal.fecha}
                    </p>
                </div>
                <div class="card-footer d-grid gap-2">
                    <button class="btn btn-warning btn-sm" onclick="editarCalificacion('${cal.id}')"
                        data-bs-toggle="modal" data-bs-target="#modalCalificacion">
                        ✏️ Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="eliminarCalificacion('${cal.id}')">
                        🗑️ Eliminar
                    </button>
                </div>
            </div>
        </div>
        `;
    });
};

const guardarCalificacion = async (e) => {
    e.preventDefault();

    const idEditar = document.getElementById('idCalificacionEditar').value;
    const estudianteId = document.getElementById('ListadoAlumno').value;
    const materiaId = document.getElementById('ListadoMateria').value;
    const nota = document.getElementById('notaObtenida').value;
    const fecha = document.getElementById('fechaEvaluativo').value;

    if (!estudianteId || !materiaId || !nota || !fecha) {
        alert('❌ Completá todos los campos');
        return;
    }

    const calificacion = { estudianteId, materiaId, nota: Number(nota), fecha };

    try {
        if (idEditar) {
            await axios.patch(`${API_URL}/calificaciones/${idEditar}`, calificacion);
        } else {
            await axios.post(`${API_URL}/calificaciones`, calificacion);
        }

        bootstrap.Modal.getInstance(document.getElementById('modalCalificacion')).hide();
        cargarCalificaciones();
    } catch (error) {
        console.error('Error al guardar la calificación:', error);
        alert('❌ Error al guardar la calificación: ' + error.message);
    }
};

const editarCalificacion = async (id) => {
    const res = await axios.get(`${API_URL}/calificaciones/${id}`);
    const cal = res.data;

    document.getElementById('ListadoAlumno').value = cal.estudianteId;
    document.getElementById('ListadoMateria').value = cal.materiaId;
    document.getElementById('notaObtenida').value = cal.nota;
    document.getElementById('fechaEvaluativo').value = cal.fecha;
    document.getElementById('idCalificacionEditar').value = id;

    document.querySelector('#modalCalificacion .modal-title').textContent = '✏️ Editar Calificación';
    document.getElementById('btnGuardarCalificacion').textContent = 'Actualizar';
};

const eliminarCalificacion = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta calificación?')) {
        return;
    }
    try {
        await axios.delete(`${API_URL}/calificaciones/${id}`);
        cargarCalificaciones();
    } catch (error) {
        console.error('Error al eliminar la calificación:', error);
        alert('❌ Error al eliminar la calificación: ' + error.message);
    }
};

const limpiarFormulario = () => {
    document.getElementById('formularioCalificacion').reset();
    document.getElementById('idCalificacionEditar').value = '';
    document.querySelector('#modalCalificacion .modal-title').textContent = '➕ Agregar Calificación';
    document.getElementById('btnGuardarCalificacion').textContent = 'Guardar Calificación';
};

document.addEventListener('DOMContentLoaded', async () => {
    await cargarListas();
    cargarCalificaciones();

    document.getElementById('formularioCalificacion').addEventListener('submit', guardarCalificacion);
    document.getElementById('modalCalificacion').addEventListener('hidden.bs.modal', limpiarFormulario);
});

window.editarCalificacion = editarCalificacion;
window.eliminarCalificacion = eliminarCalificacion;
