// Capa de datos de Calificaciones: solo se comunica con la API. No toca el DOM.
import { API_URL } from '../config.js';
import { mismoId } from '../utils/dom.js';

const RECURSO = `${API_URL}/calificaciones`;

export const getCalificaciones = async () => {
    const res = await axios.get(RECURSO);
    return res.data;
};

export const getCalificacion = async (id) => {
    const res = await axios.get(`${RECURSO}/${id}`);
    return res.data;
};

export const crearCalificacion = async (calificacion) => {
    const res = await axios.post(RECURSO, calificacion);
    return res.data;
};

export const actualizarCalificacion = async (id, calificacion) => {
    const res = await axios.patch(`${RECURSO}/${id}`, calificacion);
    return res.data;
};

export const eliminarCalificacion = async (id) => {
    await axios.delete(`${RECURSO}/${id}`);
};

// Calificaciones de un estudiante (usado para el borrado en cascada).
// Se filtra en el cliente con mismoId para no depender del tipado de los ids.
export const calificacionesDeEstudiante = async (estudianteId) => {
    const todas = await getCalificaciones();
    return todas.filter((cal) => mismoId(cal.estudianteId, estudianteId));
};

// Calificaciones de una materia (usado para el borrado en cascada).
export const calificacionesDeMateria = async (materiaId) => {
    const todas = await getCalificaciones();
    return todas.filter((cal) => mismoId(cal.materiaId, materiaId));
};
