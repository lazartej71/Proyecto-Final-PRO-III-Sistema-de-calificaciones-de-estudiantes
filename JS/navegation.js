const materiasNav = document.getElementById("materiasNav");
const estudiantesNav = document.getElementById("estudiantesNav");
const calificacionesNav = document.getElementById("calificacionesNav");

materiasNav.addEventListener("click", () => {
    window.location.href = "materias.html";
});

estudiantesNav.addEventListener("click", () => {
    window.location.href = "index.html";
});

calificacionesNav.addEventListener("click", () => {
    window.location.href = "calificaciones.html";
});