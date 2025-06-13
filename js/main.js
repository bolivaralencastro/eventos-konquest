// Arquivo principal de entrada do JS
// Carrega componentes globais e inicializa o controller da página
import { loadComponent } from './utils/componentLoader.js';
import { initEventListPage } from './controllers/eventListController.js';
import { initEventDetailPage } from './controllers/eventDetailController.js';

document.addEventListener('DOMContentLoaded', async () => {
    await loadComponent('#sidebar-container', 'components/sidebar.html');
    await loadComponent('#header-container', 'components/header.html');

    if (document.querySelector('#event-list-section')) {
        initEventListPage();
    }
    if (document.querySelector('#event-detail-section')) {
        initEventDetailPage();
    }
});
