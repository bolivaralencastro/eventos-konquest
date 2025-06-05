document.addEventListener('DOMContentLoaded', () => {
    // Elementos da página
    const eventTitleEl = document.getElementById('checkin-event-title');
    const eventTypeIconEl = document.getElementById('checkin-event-type-icon');
    const eventDateEl = document.getElementById('checkin-event-date');
    const eventTimeEl = document.getElementById('checkin-event-time');
    const participantIdentifierInput = document.getElementById('participant-identifier');
    const confirmCheckinBtn = document.getElementById('confirm-checkin');
    const successModal = document.getElementById('success-modal');
    const closeSuccessModalBtn = document.getElementById('close-success-modal');

    // Obter dados do evento da URL
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('eventId');
    const sessionId = urlParams.get('sessionId');

    // Carregar dados do evento
    function loadEventData() {
        // Buscar dados do evento do localStorage
        const events = JSON.parse(localStorage.getItem('events') || '[]');
        const event = events.find(e => e.id === eventId);
        
        if (!event) {
            alert('Evento não encontrado. Por favor, acesse o evento através do QR Code válido.');
            return;
        }

        const session = event.sessions.find(s => s.id === sessionId);
        if (!session) {
            alert('Sessão do evento não encontrada. Por favor, acesse o evento através do QR Code válido.');
            return;
        }

        // Preencher os dados na interface
        eventTitleEl.textContent = event.name;
        eventTypeIconEl.textContent = event.type === 'Presencial' ? 'location_on' : 'live_tv';
        eventTypeIconEl.className = `material-icons event-type-icon ${event.type.toLowerCase()}`;
        
        // Formatar a data
        const sessionDate = new Date(session.date);
        const formattedDate = sessionDate.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        eventDateEl.textContent = formattedDate;
        
        // Formatar o horário (compatível com diferentes nomes de propriedades)
        const startTime = session.start || session.startTime;
        const endTime = session.end || session.endTime;
        eventTimeEl.textContent = `${startTime} - ${endTime}`;
    }

    // Validar identificação do participante
    function validateIdentifier(identifier) {
        // Em um ambiente real, aqui seria feita a validação com o backend
        // Por enquanto, vamos apenas verificar se o campo não está vazio
        return identifier.trim() !== '';
    }

    // Registrar check-in
    function registerCheckin(identifier) {
        // Em um ambiente real, aqui seria feita a requisição para registrar o check-in
        // Por enquanto, vamos apenas simular o sucesso
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(true);
            }, 1000);
        });
    }

    // Mostrar modal de sucesso
    function showSuccessModal() {
        successModal.classList.add('show');
    }

    // Fechar modal de sucesso
    function closeSuccessModal() {
        successModal.classList.remove('show');
    }

    // Event Listeners
    confirmCheckinBtn.addEventListener('click', async () => {
        const identifier = participantIdentifierInput.value;
        
        if (!validateIdentifier(identifier)) {
            alert('Por favor, preencha sua identificação.');
            return;
        }

        confirmCheckinBtn.disabled = true;
        confirmCheckinBtn.innerHTML = '<span class="material-icons">hourglass_empty</span> Processando...';

        try {
            const success = await registerCheckin(identifier);
            if (success) {
                showSuccessModal();
            } else {
                alert('Erro ao registrar check-in. Por favor, tente novamente.');
            }
        } catch (error) {
            alert('Erro ao registrar check-in. Por favor, tente novamente.');
        } finally {
            confirmCheckinBtn.disabled = false;
            confirmCheckinBtn.innerHTML = '<span class="material-icons">check_circle</span> Confirmar Presença';
        }
    });

    closeSuccessModalBtn.addEventListener('click', closeSuccessModal);

    // Carregar dados do evento ao iniciar
    loadEventData();
}); 