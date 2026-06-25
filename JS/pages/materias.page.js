// Controlador de la página de Materias.
import {
    getMaterias,
    getMateria,
    crearMateria,
    actualizarMateria,
    eliminarMateria
} from '../services/materias.service.js';
import {
    calificacionesDeMateria,
    eliminarCalificacion
} from '../services/calificaciones.service.js';
import {
    renderMaterias,
    leerFormularioMateria,
    llenarFormularioMateria,
    limpiarFormularioMateria
} from '../ui/materias.ui.js';
import { initNavegacion } from '../ui/navegacion.js';

const modalMaterias = () => document.getElementById('modalMaterias');

const cargarMaterias = async () => {
    try {
        renderMaterias(await getMaterias());
    } catch (error) {
        console.error('Error cargando materias:', error);
        alert('❌ Error al cargar las materias');
    }
};

const datosValidos = (datos) => {
    if (!datos.nombre || !datos.docente || !datos.notaMinima) {
        alert('❌ Completa todos los campos');
        return false;
    }
    if (Number(datos.notaMinima) < 1 || Number(datos.notaMinima) > 10) {
        alert('❌ La nota mínima debe estar entre 1 y 10');
        return false;
    }
    return true;
};

const guardarCambios = async (e) => {
    e.preventDefault();

    const id = document.getElementById('idMateriaEditar').value;
    const datos = leerFormularioMateria();
    if (!datosValidos(datos)) return;

    const btnGuardar = document.getElementById('btnGuardarMateria');
    btnGuardar.disabled = true;
    try {
        const payload = {
            nombre: datos.nombre,
            docente: datos.docente,
            notaMinima: Number(datos.notaMinima)
        };
        if (id) {
            await actualizarMateria(id, payload);
        } else {
            await crearMateria(payload);
        }

        bootstrap.Modal.getInstance(modalMaterias()).hide();
        limpiarFormularioMateria();
        cargarMaterias();
        alert(id ? '✅ Materia actualizada exitosamente' : '✅ Materia agregada exitosamente');
    } catch (error) {
        console.error('Error guardando materia:', error);
        alert('❌ Error al guardar la materia: ' + error.message);
    } finally {
        btnGuardar.disabled = false;
    }
};

const abrirEdicion = async (id) => {
    try {
        llenarFormularioMateria(await getMateria(id));
    } catch (error) {
        console.error('Error cargando materia:', error);
        alert('❌ Error al cargar la materia');
    }
};

const borrar = async (id) => {
    if (!confirm('⚠️ ¿Estás seguro de que quieres eliminar esta materia? Se eliminarán todas las calificaciones asociadas.')) {
        return;
    }
    try {
        // Borrado en cascada: primero las calificaciones de esta materia.
        const calificaciones = await calificacionesDeMateria(id);
        for (const cal of calificaciones) {
            await eliminarCalificacion(cal.id);
        }
        await eliminarMateria(id);
        cargarMaterias();
        alert('✅ Materia eliminada exitosamente');
    } catch (error) {
        console.error('Error eliminando materia:', error);
        alert('❌ Error al eliminar la materia: ' + error.message);
    }
};

const manejarAccion = (e) => {
    const boton = e.target.closest('[data-action]');
    if (!boton) return;
    const { action, id } = boton.dataset;
    if (action === 'editar') abrirEdicion(id);
    if (action === 'eliminar') borrar(id);
};

document.addEventListener('DOMContentLoaded', () => {
    initNavegacion();
    cargarMaterias();
    document.getElementById('listaMaterias').addEventListener('click', manejarAccion);
    document.getElementById('formularioMateria').addEventListener('submit', guardarCambios);
    modalMaterias().addEventListener('hidden.bs.modal', limpiarFormularioMateria);
});
