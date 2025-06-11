// Controller da página de lista de eventos
import { getEvents } from '../api/dataService.js';

export async function initEventListPage() {
    const events = await getEvents();
    const tableBody = document.querySelector('#events-table-body');
    let rowsHtml = '';
    events.forEach(event => {
        // Formatar datas
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
    // Adicione listeners para filtros, etc.
}
