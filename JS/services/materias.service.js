// Capa de datos de Materias: solo se comunica con la API. No toca el DOM.
import { API_URL } from '../config.js';

const RECURSO = `${API_URL}/materias`;

export const getMaterias = async () => {
    const res = await axios.get(RECURSO);
    return res.data;
};

export const getMateria = async (id) => {
    const res = await axios.get(`${RECURSO}/${id}`);
    return res.data;
};

export const crearMateria = async (materia) => {
    const res = await axios.post(RECURSO, materia);
    return res.data;
};

export const actualizarMateria = async (id, materia) => {
    const res = await axios.patch(`${RECURSO}/${id}`, materia);
    return res.data;
};

export const eliminarMateria = async (id) => {
    await axios.delete(`${RECURSO}/${id}`);
};
