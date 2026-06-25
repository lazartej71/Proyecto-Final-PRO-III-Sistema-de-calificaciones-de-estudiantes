// Capa de datos de Estudiantes: solo se comunica con la API. No toca el DOM.
import { API_URL } from '../config.js';

const RECURSO = `${API_URL}/estudiantes`;

export const getEstudiantes = async () => {
    const res = await axios.get(RECURSO);
    return res.data;
};

export const getEstudiante = async (id) => {
    const res = await axios.get(`${RECURSO}/${id}`);
    return res.data;
};

export const crearEstudiante = async (estudiante) => {
    const res = await axios.post(RECURSO, estudiante);
    return res.data;
};

export const actualizarEstudiante = async (id, estudiante) => {
    const res = await axios.patch(`${RECURSO}/${id}`, estudiante);
    return res.data;
};

export const eliminarEstudiante = async (id) => {
    await axios.delete(`${RECURSO}/${id}`);
};

// Devuelve true si ya existe otro estudiante con ese DNI.
// idActual permite excluir al propio estudiante cuando se está editando.
// Se filtra del lado del cliente para no depender del tipado del query de json-server.
export const dniDuplicado = async (dni, idActual = null) => {
    const estudiantes = await getEstudiantes();
    return estudiantes.some(
        (est) => String(est.dni) === String(dni) && String(est.id) !== String(idActual)
    );
};
