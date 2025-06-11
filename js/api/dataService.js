import { events } from './eventsData.js';
import { users } from './usersData.js';
import { enrollments } from './enrollmentsData.js';

// Serviço de dados para buscar eventos, usuários e matrículas dos arquivos JSON
export async function getEvents() {
    return events;
}

export async function getUsers() {
    return users;
}

export async function getEnrollments() {
    return enrollments;
}

export async function getEventDetails(eventId) {
    return events.find(ev => String(ev.id) === String(eventId));
}
