// Utilitário para carregar componentes HTML dinâmicos
export async function loadComponent(selector, path) {
    const element = document.querySelector(selector);
    if (element) {
        const response = await fetch(path);
        element.innerHTML = await response.text();
    }
}
