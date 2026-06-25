// Helpers compartidos por toda la app.

// Escapa los caracteres especiales de HTML antes de inyectar texto del usuario
// en innerHTML. Evita XSS: un nombre como "<img src=x onerror=alert(1)>" se
// mostraría como texto en vez de ejecutarse.
export const escapeHtml = (valor) => {
    if (valor === null || valor === undefined) return '';
    return String(valor)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
};

// Compara dos ids que pueden ser numéricos o alfanuméricos. json-server genera
// ids string ("Lox5gM1IUq8") pero el seed inicial usa números, así que las
// relaciones se comparan siempre como String para no fallar por el tipo.
export const mismoId = (a, b) => String(a) === String(b);
