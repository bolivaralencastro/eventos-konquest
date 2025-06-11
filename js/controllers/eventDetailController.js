// Controller da página de detalhe do evento
import { getEventDetails, getEnrollments, getUsers } from '../api/dataService.js';

export async function initEventDetailPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');
    if (!eventId) return;
    const event = await getEventDetails(eventId);
    if (!event) return;
    document.querySelector('#event-title').textContent = event.name;

    // Carregar usuários e matrículas
    const [users, enrollments] = await Promise.all([
        getUsers(),
        getEnrollments()
    ]);
    // Filtrar matrículas deste evento
    const eventEnrollments = enrollments.filter(e => String(e.eventId) === String(eventId));

    // Montar lista de participantes
    const participants = eventEnrollments.map(enrollment => {
        const user = users.find(u => String(u.id) === String(enrollment.userId));
        return {
            ...user,
            status: enrollment.status,
            presence: enrollment.presence
        };
    });

    // Renderizar tabela de participantes
    let html = `<h2>Participantes</h2><table class="data-table"><thead><tr><th>Nome</th><th>Email</th><th>Status</th><th>Presença</th></tr></thead><tbody>`;
    participants.forEach(p => {
        html += `<tr><td>${p.name}</td><td>${p.email}</td><td>${p.status}</td><td>${p.presence ? '✔️' : '❌'}</td></tr>`;
    });
    html += `</tbody></table>`;
    document.querySelector('#event-detail-section').insertAdjacentHTML('beforeend', html);
}
