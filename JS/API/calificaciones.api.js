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

// Las relaciones se comparan con String() porque los ids de json-server
// pueden ser numéricos o alfanuméricos según cómo se hayan creado.
const mismoId = (a, b) => String(a) === String(b);

const formatearFecha = (iso) => {
    if (!iso) return '—';
    const [anio, mes, dia] = iso.split('-');
    return `${dia}/${mes}/${anio}`;
};

const renderEstadoNota = (cal, materia) => {
    // Sin materia asociada no se puede determinar la aprobación.
    if (!materia) {
        return `<span class="pill pill--neutral"><span class="nota">${cal.nota}</span> · sin materia</span>`;
    }
    const aprobada = Number(cal.nota) >= materia.notaMinima;
    const clase = aprobada ? 'pill--ok' : 'pill--bad';
    const texto = aprobada ? 'Aprobado' : 'Desaprobado';
    return `<span class="pill ${clase}"><span class="nota">${cal.nota}</span> · ${texto}</span>`;
};

const cargarCalificaciones = async () => {
    const res = await axios.get(`${API_URL}/calificaciones`);
    const lista = document.getElementById('listadoCalificacion');
    lista.innerHTML = '';

    if (res.data.length === 0) {
        lista.innerHTML = '<div class="empty-state">Todavía no hay calificaciones registradas.</div>';
        return;
    }

    res.data.forEach((cal) => {
        const alumno = estudiantes.find((e) => mismoId(e.id, cal.estudianteId));
        const materia = materias.find((m) => mismoId(m.id, cal.materiaId));

        lista.innerHTML += `
        <div class="col-md-6 col-lg-4">
            <div class="card h-100">
                <div class="card-header">
                    <h5 class="card-title mb-0">${alumno ? alumno.nombre + ' ' + alumno.apellido : 'Alumno desconocido'}</h5>
                </div>
                <div class="card-body">
                    <p class="card-text mb-0">
                        <strong>Materia:</strong> ${materia ? materia.nombre : 'Materia desconocida'}<br>
                        <strong>Nota:</strong> ${renderEstadoNota(cal, materia)}<br>
                        <strong>Fecha:</strong> <span class="mono">${formatearFecha(cal.fecha)}</span>
                    </p>
                </div>
                <div class="card-footer d-grid gap-2">
                    <button class="btn btn-warning btn-sm" onclick="editarCalificacion('${cal.id}')"
                        data-bs-toggle="modal" data-bs-target="#modalCalificacion">
                        Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="eliminarCalificacion('${cal.id}')">
                        Eliminar
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

    if (Number(nota) < 1 || Number(nota) > 10) {
        alert('❌ La nota debe estar entre 1 y 10');
        return;
    }

    const btnGuardar = document.getElementById('btnGuardarCalificacion');
    btnGuardar.disabled = true;
    try {
        // Evita cargar dos veces la misma materia para el mismo alumno.
        // Se filtra del lado del cliente para no depender del tipado del query de json-server.
        const resExistentes = await axios.get(`${API_URL}/calificaciones`);
        const duplicada = resExistentes.data.some(
            (c) =>
                mismoId(c.estudianteId, estudianteId) &&
                mismoId(c.materiaId, materiaId) &&
                String(c.id) !== String(idEditar)
        );
        if (duplicada) {
            alert('❌ Este alumno ya tiene una calificación cargada en esa materia');
            return;
        }

        const calificacion = { estudianteId, materiaId, nota: Number(nota), fecha };

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
    } finally {
        btnGuardar.disabled = false;
    }
};

const editarCalificacion = async (id) => {
    // Refresca alumnos/materias por si se agregaron nuevos desde otra página,
    // así las opciones existen antes de seleccionar el valor guardado.
    await cargarListas();

    const res = await axios.get(`${API_URL}/calificaciones/${id}`);
    const cal = res.data;

    document.getElementById('ListadoAlumno').value = cal.estudianteId;
    document.getElementById('ListadoMateria').value = cal.materiaId;
    document.getElementById('notaObtenida').value = cal.nota;
    document.getElementById('fechaEvaluativo').value = cal.fecha;
    document.getElementById('idCalificacionEditar').value = id;

    document.querySelector('#modalCalificacion .modal-title').textContent = 'Editar calificación';
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
    document.querySelector('#modalCalificacion .modal-title').textContent = 'Agregar calificación';
    document.getElementById('btnGuardarCalificacion').textContent = 'Guardar calificación';
};

document.addEventListener('DOMContentLoaded', async () => {
    await cargarListas();
    cargarCalificaciones();

    document.getElementById('formularioCalificacion').addEventListener('submit', guardarCalificacion);
    document.getElementById('modalCalificacion').addEventListener('hidden.bs.modal', limpiarFormulario);

    // Al abrir el modal para una calificación nueva, refresca alumnos/materias.
    document.getElementById('btnNuevaCalificacion').addEventListener('click', cargarListas);
});

window.editarCalificacion = editarCalificacion;
window.eliminarCalificacion = eliminarCalificacion;
