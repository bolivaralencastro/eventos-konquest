// Controller da página de lista de eventos
import { getEvents } from '../api/dataService.js';

export async function initEventListPage() {
    const events = await getEvents();
    const tableBody = document.querySelector('#events-table-body');
    const searchInput = document.createElement('input');
    searchInput.type = 'search';
    searchInput.placeholder = 'Buscar evento...';
    searchInput.style.margin = '1rem 0 1.5rem 0';
    const section = document.querySelector('#event-list-section');
    section.insertBefore(searchInput, section.querySelector('table'));

    function render(filteredEvents) {
        let rowsHtml = '';
        filteredEvents.forEach(event => {
            const start = new Date(event.startDate).toLocaleDateString('pt-BR');
            const end = new Date(event.endDate).toLocaleDateString('pt-BR');
            const dateString = start === end ? start : `${start} - ${end}`;
            rowsHtml += `
                <tr>
                    <td><a href="detalhe-evento.html?id=${event.id}">${event.name}</a></td>
                    <td>${event.type}</td>
                    <td>${dateString}</td>
                    <td>${event.registrations}</td>
                    <td>${event.attendance}</td>
                    <td>${event.status}</td>
                </tr>
            `;
        });
        tableBody.innerHTML = rowsHtml;
    }

    // Filtro por busca
    searchInput.addEventListener('input', () => {
        const term = searchInput.value.trim().toLowerCase();
        const filtered = events.filter(ev =>
            ev.name.toLowerCase().includes(term) ||
            ev.type.toLowerCase().includes(term) ||
            ev.status.toLowerCase().includes(term)
        );
        render(filtered);
    });

    render(events);
}
