// Navegación del navbar manejada desde el DOM.
// En vez de usar el href del <a>, cada link del navbar escucha el evento "click"
// y cambia la página con window.location.href. Se llama una vez por página.
export const initNavegacion = () => {
    const estudiantesNav = document.getElementById('estudiantesNav');
    const materiasNav = document.getElementById('materiasNav');
    const calificacionesNav = document.getElementById('calificacionesNav');

    estudiantesNav.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    materiasNav.addEventListener('click', () => {
        window.location.href = 'materias.html';
    });

    calificacionesNav.addEventListener('click', () => {
        window.location.href = 'calificaciones.html';
    });
};