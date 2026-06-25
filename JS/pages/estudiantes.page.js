// Controlador de la página de Estudiantes.
// Orquesta la capa de datos (services) con la capa de vista (ui) y maneja los eventos.
import {
    getEstudiantes,
    getEstudiante,
    crearEstudiante,
    actualizarEstudiante,
    eliminarEstudiante,
    dniDuplicado
} from '../services/estudiantes.service.js';
import {
    calificacionesDeEstudiante,
    eliminarCalificacion
} from '../services/calificaciones.service.js';
import {
    renderEstudiantes,
    leerFormularioEstudiante,
    llenarFormularioEstudiante,
    limpiarFormularioEstudiante
} from '../ui/estudiantes.ui.js';
import { initNavegacion } from '../ui/navegacion.js';

const modalEstudiante = () => document.getElementById('modalEstudiante');

const cargarEstudiantes = async () => {
    try {
        renderEstudiantes(await getEstudiantes());
    } catch (error) {
        console.error('Error cargando estudiantes:', error);
        alert('❌ Error al cargar estudiantes');
    }
};

const datosValidos = (datos) => {
    if (!datos.nombre || !datos.apellido || !datos.dni || !datos.anio || !datos.turno) {
        alert('❌ Completa todos los campos');
        return false;
    }
    return true;
};

// Maneja el submit del formulario: decide entre crear y actualizar según haya id.
const guardarCambios = async (e) => {
    e.preventDefault();

    const id = document.getElementById('idEstudianteEditar').value;
    const datos = leerFormularioEstudiante();
    if (!datosValidos(datos)) return;

    const btnGuardar = document.getElementById('btnGuardarEstudiante');
    btnGuardar.disabled = true;
    try {
        if (await dniDuplicado(datos.dni, id || null)) {
            alert(id ? '❌ Ya existe otro estudiante con ese DNI' : '❌ Ya existe un estudiante con ese DNI');
            return;
        }

        const payload = { ...datos, anio: parseInt(datos.anio) };
        if (id) {
            await actualizarEstudiante(id, payload);
        } else {
            await crearEstudiante(payload);
        }

        bootstrap.Modal.getInstance(modalEstudiante()).hide();
        limpiarFormularioEstudiante();
        cargarEstudiantes();
        alert(id ? '✅ Estudiante actualizado exitosamente' : '✅ Estudiante agregado exitosamente');
    } catch (error) {
        console.error('Error guardando estudiante:', error);
        alert('❌ Error al guardar estudiante: ' + error.message);
    } finally {
        btnGuardar.disabled = false;
    }
};

const abrirEdicion = async (id) => {
    try {
        llenarFormularioEstudiante(await getEstudiante(id));
    } catch (error) {
        console.error('Error cargando estudiante:', error);
        alert('❌ Error al cargar estudiante');
    }
};

const borrar = async (id) => {
    if (!confirm('⚠️ ¿Estás seguro de que quieres eliminar este estudiante? Se eliminarán todas sus calificaciones.')) {
        return;
    }
    try {
        // Borrado en cascada: primero sus calificaciones, así no quedan huérfanas.
        const calificaciones = await calificacionesDeEstudiante(id);
        for (const cal of calificaciones) {
            await eliminarCalificacion(cal.id);
        }
        await eliminarEstudiante(id);
        cargarEstudiantes();
        alert('✅ Estudiante eliminado exitosamente');
    } catch (error) {
        console.error('Error eliminando estudiante:', error);
        alert('❌ Error al eliminar estudiante: ' + error.message);
    }
};

// Delegación de eventos: un único listener en el contenedor atiende Editar/Eliminar
// de todas las cards, sin onclick inline ni funciones globales.
const manejarAccion = (e) => {
    const boton = e.target.closest('[data-action]');
    if (!boton) return;
    const { action, id } = boton.dataset;
    if (action === 'editar') abrirEdicion(id);
    if (action === 'eliminar') borrar(id);
};

document.addEventListener('DOMContentLoaded', () => {
    initNavegacion();
    cargarEstudiantes();
    document.getElementById('listaEstudiantes').addEventListener('click', manejarAccion);
    document.getElementById('formularioEstudiante').addEventListener('submit', guardarCambios);
    modalEstudiante().addEventListener('hidden.bs.modal', limpiarFormularioEstudiante);
});
