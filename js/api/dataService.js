// Serviço de dados para buscar eventos, usuários e matrículas dos arquivos JSON
export async function getEvents() {
    const response = await fetch('data/events.json');
    return await response.json();
}

export async function getUsers() {
    const response = await fetch('data/users.json');
    return await response.json();
}

export async function getEnrollments() {
    const response = await fetch('data/enrollments.json');
    return await response.json();
}

export async function getEventDetails(eventId) {
    const events = await getEvents();
    return events.find(ev => String(ev.id) === String(eventId));
}
