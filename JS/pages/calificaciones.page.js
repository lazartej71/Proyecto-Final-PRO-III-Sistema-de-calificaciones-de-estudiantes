// Controlador de la página de Calificaciones.
// Esta página cruza datos de tres recursos: necesita estudiantes y materias en memoria
// para resolver los nombres y calcular el estado de aprobación.
import {
    getCalificaciones,
    getCalificacion,
    crearCalificacion,
    actualizarCalificacion,
    eliminarCalificacion
} from '../services/calificaciones.service.js';
import { getEstudiantes } from '../services/estudiantes.service.js';
import { getMaterias } from '../services/materias.service.js';
import { mismoId } from '../utils/dom.js';
import {
    llenarSelectores,
    renderCalificaciones,
    leerFormularioCalificacion,
    llenarFormularioCalificacion,
    limpiarFormularioCalificacion
} from '../ui/calificaciones.ui.js';
import { initNavegacion } from '../ui/navegacion.js';

const modalCalificacion = () => document.getElementById('modalCalificacion');

// Cache en memoria de alumnos y materias, para no pedirlos en cada card.
let estudiantes = [];
let materias = [];

const cargarListas = async () => {
    try {
        [estudiantes, materias] = await Promise.all([getEstudiantes(), getMaterias()]);
        llenarSelectores(estudiantes, materias);
    } catch (error) {
        console.error('Error cargando alumnos y materias:', error);
        alert('❌ Error al cargar alumnos y materias');
    }
};

const cargarCalificaciones = async () => {
    try {
        renderCalificaciones(await getCalificaciones(), estudiantes, materias);
    } catch (error) {
        console.error('Error cargando calificaciones:', error);
        alert('❌ Error al cargar las calificaciones');
    }
};

const datosValidos = (datos) => {
    if (!datos.estudianteId || !datos.materiaId || !datos.nota || !datos.fecha) {
        alert('❌ Completá todos los campos');
        return false;
    }
    if (Number(datos.nota) < 1 || Number(datos.nota) > 10) {
        alert('❌ La nota debe estar entre 1 y 10');
        return false;
    }
    return true;
};

const guardarCambios = async (e) => {
    e.preventDefault();

    const id = document.getElementById('idCalificacionEditar').value;
    const datos = leerFormularioCalificacion();
    if (!datosValidos(datos)) return;

    const btnGuardar = document.getElementById('btnGuardarCalificacion');
    btnGuardar.disabled = true;
    try {
        // Evita cargar dos veces la misma materia para el mismo alumno.
        const existentes = await getCalificaciones();
        const duplicada = existentes.some(
            (c) =>
                mismoId(c.estudianteId, datos.estudianteId) &&
                mismoId(c.materiaId, datos.materiaId) &&
                String(c.id) !== String(id)
        );
        if (duplicada) {
            alert('❌ Este alumno ya tiene una calificación cargada en esa materia');
            return;
        }

        const payload = {
            estudianteId: datos.estudianteId,
            materiaId: datos.materiaId,
            nota: Number(datos.nota),
            fecha: datos.fecha
        };
        if (id) {
            await actualizarCalificacion(id, payload);
        } else {
            await crearCalificacion(payload);
        }

        bootstrap.Modal.getInstance(modalCalificacion()).hide();
        limpiarFormularioCalificacion();
        cargarCalificaciones();
    } catch (error) {
        console.error('Error al guardar la calificación:', error);
        alert('❌ Error al guardar la calificación: ' + error.message);
    } finally {
        btnGuardar.disabled = false;
    }
};

const abrirEdicion = async (id) => {
    try {
        // Refresca alumnos/materias por si se agregaron desde otra página,
        // así las opciones existen antes de seleccionar el valor guardado.
        await cargarListas();
        llenarFormularioCalificacion(await getCalificacion(id));
    } catch (error) {
        console.error('Error cargando la calificación:', error);
        alert('❌ Error al cargar la calificación');
    }
};

const borrar = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta calificación?')) {
        return;
    }
    try {
        await eliminarCalificacion(id);
        cargarCalificaciones();
    } catch (error) {
        console.error('Error al eliminar la calificación:', error);
        alert('❌ Error al eliminar la calificación: ' + error.message);
    }
};

const manejarAccion = (e) => {
    const boton = e.target.closest('[data-action]');
    if (!boton) return;
    const { action, id } = boton.dataset;
    if (action === 'editar') abrirEdicion(id);
    if (action === 'eliminar') borrar(id);
};

document.addEventListener('DOMContentLoaded', async () => {
    initNavegacion();
    await cargarListas();
    cargarCalificaciones();

    document.getElementById('listadoCalificacion').addEventListener('click', manejarAccion);
    document.getElementById('formularioCalificacion').addEventListener('submit', guardarCambios);
    modalCalificacion().addEventListener('hidden.bs.modal', limpiarFormularioCalificacion);
    // Al abrir el modal para una calificación nueva, refresca alumnos/materias.
    document.getElementById('btnNuevaCalificacion').addEventListener('click', cargarListas);
});
