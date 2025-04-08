document.addEventListener('DOMContentLoaded', () => {
    // --- Views & Containers ---
    const adminView = document.getElementById('admin-view');
    const adminListArea = document.getElementById('admin-list-area'); // Contains header + list/empty
    const adminEventListsContainer = document.getElementById('admin-event-lists-container'); // The actual list card
    const manageEventView = document.getElementById('manage-event-view');
    const mainTitle = document.getElementById('main-title');

    // --- Buttons ---
    const showCreateEventBtn = document.getElementById('btn-show-create-event');
    const backToEventsBtn = document.getElementById('back-to-events');

    // --- Event List Elements ---
    const adminEventTbody = document.getElementById('admin-event-tbody');
    const adminEventSearch = document.getElementById('admin-event-search');

    // --- Manage Event View Elements ---
    const manageEventTitle = document.getElementById('manage-event-title');
    const manageEventTypeIcon = document.getElementById('manage-event-type-icon');
    const indicatorInscritos = document.getElementById('indicator-inscritos');
    const indicatorPresentes = document.getElementById('indicator-presentes');
    const participantTbody = document.getElementById('participant-tbody');
    const participantSearch = document.getElementById('participant-search');
    const sessionSelect = document.getElementById('session-select');
    const manageEventHeaderActions = document.querySelector('.event-header-actions'); // Container for detail actions

    // --- Modal Elements ---
    const modalBackdrop = document.getElementById('modal-backdrop');
    const createEventModal = document.getElementById('create-event-modal');
    const modalTitleEl = document.getElementById('modal-title');
    const closeModalBtn = document.getElementById('btn-close-modal');
    const modalCancelBtn = document.getElementById('btn-modal-cancel');
    const modalPublishBtn = document.getElementById('btn-modal-publish');
    const modalEventTypeSelect = document.getElementById('modal-event-type');
    const modalLocationField = document.getElementById('modal-location-field');
    const modalLinkField = document.getElementById('modal-link-field');
    const modalSessionsContainer = document.getElementById('modal-sessions-container');
    const addSessionBtn = document.getElementById('btn-modal-add-session');
    const modalEventTitleInput = document.getElementById('modal-event-title'); // Example input for edit

    // --- State ---
    let currentView = 'admin-list'; // 'admin-list', 'admin-manage'
    let isEditingEvent = false;
    let editingEventId = null;
    let sampleAdminEvents = generateSampleEvents(15); // Generate some initial data
    let sampleParticipants = generateSampleParticipants(10); // Sample participants for detail view

    // --- Sample Data Generation ---
    function generateSampleEvents(count) {
        const events = [];
        const types = ['Presencial', 'Live'];
        const statuses = ['open', 'concluded']; // Corresponds to CSS classes
        const statusText = { open: 'Aberto', concluded: 'Finalizado' };
        const typeIcons = { Presencial: 'location_on', Live: 'videocam_outline' };

        for (let i = 1; i <= count; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const startDate = new Date(2024, 8 + Math.floor(Math.random() * 3), 1 + Math.floor(Math.random() * 28));
            const endDate = new Date(startDate.getTime() + Math.floor(Math.random() * 3) * 24 * 60 * 60 * 1000); // 0-2 days longer
            events.push({
                id: `evt-${i}`,
                type: type,
                typeIcon: typeIcons[type],
                name: `${type === 'Live' ? 'Webinar' : 'Workshop'} Tópico ${i}`,
                startDate: startDate,
                endDate: endDate,
                registrations: Math.floor(Math.random() * 50),
                attendance: Math.floor(Math.random() * 40),
                status: status,
                statusLabel: statusText[status],
                location: type === 'Presencial' ? `Sala ${100 + i}` : null,
                link: type === 'Live' ? `https://meeting.example.com/topic${i}` : null,
                description: `Descrição detalhada sobre o Tópico ${i}...`,
                sessions: [{ date: startDate, start: '09:00', end: '11:00' }], // Basic session
            });
        }
        return events;
    }

    function generateSampleParticipants(count) {
        const participants = [];
        const firstNames = ["Ana", "Bruno", "Carla", "Daniel", "Elena", "Fábio", "Gisele", "Hugo"];
        const lastNames = ["Silva", "Santos", "Oliveira", "Pereira", "Costa", "Rodrigues"];
        for (let i = 1; i <= count; i++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            participants.push({
                id: `usr-${i}`,
                name: `${firstName} ${lastName}`,
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
                registrationDate: new Date(2024, 8, 1 + Math.floor(Math.random() * 15)),
                present: Math.random() > 0.4, // ~60% present
                avatarInitial: firstName.charAt(0)
            });
        }
        return participants;
    }

    // --- Rendering Functions ---
    function renderAdminEventList(eventsToRender) {
        adminEventTbody.innerHTML = ''; // Clear existing rows
        if (eventsToRender.length === 0) {
            adminEventTbody.innerHTML = `<tr><td colspan="8" class="empty-state">Nenhum evento encontrado.</td></tr>`;
            adminEventListsContainer.classList.remove('hidden'); // Show container even if empty
            return;
        }

        eventsToRender.forEach(event => {
            const row = document.createElement('tr');
            row.dataset.eventId = event.id;

            const formattedStartDate = event.startDate.toLocaleDateString('pt-BR');
            const formattedEndDate = event.endDate.toLocaleDateString('pt-BR');
            const dateString = formattedStartDate === formattedEndDate ? formattedStartDate : `${formattedStartDate} - ${formattedEndDate}`;

            row.innerHTML = `
                <td><input type="checkbox" class="md-checkbox" title="Selecionar ${event.name}"></td>
                <td>
                    <div class="event-name">
                        <span class="material-icons event-type-icon ${event.type.toLowerCase()}">${event.typeIcon}</span>
                        <span>${event.name}</span>
                    </div>
                </td>
                <td>${dateString}</td>
                <td>${event.registrations}</td>
                <td>${event.attendance}</td>
                <td><span class="status-chip ${event.status}">${event.statusLabel}</span></td>
                <td>
                    <div class="event-actions">
                        <button class="icon-button" title="Gerenciar Participantes" data-action="manage"><span class="material-icons">group</span></button>
                        <button class="icon-button" title="Editar" data-action="edit"><span class="material-icons">edit</span></button>
                        <button class="icon-button" title="Gerar QR Code" data-action="qr"><span class="material-icons">qr_code_2</span></button>
                        <button class="icon-button" title="Excluir" data-action="delete"><span class="material-icons">delete</span></button>
                    </div>
                </td>
            `;
            adminEventTbody.appendChild(row);
            
            // Adiciona a classe clickable à linha
            row.classList.add('clickable-row');
        });
        adminEventListsContainer.classList.remove('hidden');
    }

    function renderParticipantList(participantsToRender) {
        participantTbody.innerHTML = '';
         if (participantsToRender.length === 0) {
            participantTbody.innerHTML = `<tr><td colspan="6" class="empty-state">Nenhum participante encontrado.</td></tr>`;
            return;
        }

        participantsToRender.forEach(p => {
            const row = document.createElement('tr');
            row.dataset.participantId = p.id;
            row.innerHTML = `
                <td><input type="checkbox" class="md-checkbox"></td>
                <td>
                    <div class="participant-name">
                        <span class="participant-avatar">${p.avatarInitial}</span>
                        <span>${p.name}</span>
                    </div>
                </td>
                <td>${p.email}</td>
                <td>${p.registrationDate.toLocaleDateString('pt-BR')}</td>
                <td>
                    <label class="presence-toggle">
                        <input type="checkbox" ${p.present ? 'checked' : ''}>
                        <span class="presence-toggle-slider"></span>
                    </label>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-button" title="Remover Participante"><span class="material-icons">person_remove</span></button>
                    </div>
                </td>
            `;
            participantTbody.appendChild(row);
        });
    }

    // --- View Management ---
    function showView(viewName) {
        // Hide all primary views first
        adminListArea.classList.add('hidden');
        manageEventView.classList.add('hidden');

        // Hide the event list container specifically within the admin area
        adminEventListsContainer.classList.add('hidden');

        switch (viewName) {
            case 'admin-list':
                adminListArea.classList.remove('hidden');
                adminEventListsContainer.classList.remove('hidden');
                mainTitle.textContent = 'Eventos';
                currentView = 'admin-list';
                // Re-apply filters when returning to list
                applyFiltersAndRender();
                break;
            case 'admin-manage':
                manageEventView.classList.remove('hidden');
                currentView = 'admin-manage';
                break;
        }
        window.scrollTo(0, 0);
    }

    // Função para carregar os dados do evento na tela interna
    function loadEventDetails(eventId) {
        const eventData = sampleAdminEvents.find(ev => ev.id === eventId);
        if (eventData) {
            manageEventTitle.textContent = eventData.name;
            manageEventTypeIcon.textContent = eventData.typeIcon;
            manageEventTypeIcon.className = `material-icons event-type-indicator ${eventData.type.toLowerCase()}`; // Update class for color
            indicatorInscritos.textContent = eventData.registrations;
            indicatorPresentes.textContent = eventData.attendance;
            
            // Load participants (using sample for now)
            renderParticipantList(sampleParticipants);
            
            // Verificar se o evento tem múltiplos dias
            const sessionContainer = document.querySelector('.filter-session-container');
            const singleDateDisplay = document.querySelector('.single-date-display');
            const dayOptionsContainer = document.querySelector('.day-options-container');
            
            if (eventData.sessions && eventData.sessions.length > 1) {
                // Evento com múltiplos dias - mostrar dropdown
                if (sessionContainer) sessionContainer.classList.remove('hidden');
                if (singleDateDisplay) singleDateDisplay.classList.add('hidden');
                
                // Populate day options
                dayOptionsContainer.innerHTML = ''; // Reset
                
                // Criar opção "Todas as sessões"
                const allOption = document.createElement('button');
                allOption.classList.add('day-option');
                allOption.dataset.value = 'all';
                allOption.innerHTML = `
                    <span class="material-icons">check</span>
                    <span>Todas as sessões</span>
                `;
                allOption.classList.add('selected');
                dayOptionsContainer.appendChild(allOption);
                
                // Selecionar primeira sessão como padrão para exibição no chip
                const firstSession = eventData.sessions[0];
                const date = new Date(firstSession.date);
                const formattedDate = formatDayString(date, firstSession.start, firstSession.end);
                sessionContainer.querySelector('.day-content').textContent = formattedDate;
                
                // Adicionar cada sessão como opção
                eventData.sessions.forEach((session, index) => {
                    const date = new Date(session.date);
                    const formattedDate = formatDayString(date, session.start, session.end);
                    
                    const option = document.createElement('button');
                    option.classList.add('day-option');
                    option.dataset.value = `session-${index}`;
                    option.dataset.index = index;
                    option.innerHTML = `
                        <span class="material-icons">check</span>
                        <span>${formattedDate}</span>
                    `;
                    
                    option.addEventListener('click', function() {
                        // Atualizar seleção visual
                        document.querySelectorAll('.day-option').forEach(opt => {
                            opt.classList.remove('selected');
                        });
                        this.classList.add('selected');
                        
                        // Atualizar texto do chip
                        if (this.dataset.value !== 'all') {
                            sessionContainer.querySelector('.day-content').textContent = this.querySelector('span:last-child').textContent;
                        } else {
                            // Retornar para o primeiro dia se "Todas" for selecionado
                            const firstSession = eventData.sessions[0];
                            const date = new Date(firstSession.date);
                            const formattedDate = formatDayString(date, firstSession.start, firstSession.end);
                            sessionContainer.querySelector('.day-content').textContent = formattedDate;
                        }
                        
                        // Fechar dropdown
                        document.getElementById('session-dropdown').classList.remove('show');
                        document.querySelector('.day-chip').classList.remove('selected');
                        
                        // Filtrar participantes por sessão
                        filterParticipantsBySession(this.dataset.value);
                    });
                    
                    dayOptionsContainer.appendChild(option);
                });
                
                // Event listener para o chip de seleção de dia
                const dayChip = document.querySelector('.day-chip');
                if (dayChip) {
                    // Remover listeners anteriores para evitar duplicação
                    const newDayChip = dayChip.cloneNode(true);
                    dayChip.parentNode.replaceChild(newDayChip, dayChip);
                    
                    newDayChip.addEventListener('click', function(e) {
                        e.stopPropagation();
                        const dropdown = document.getElementById('session-dropdown');
                        dropdown.classList.toggle('show');
                        this.classList.toggle('selected');
                    });
                }
            } else {
                // Evento de dia único - mostrar data como texto
                if (sessionContainer) sessionContainer.classList.add('hidden');
                if (singleDateDisplay) {
                    singleDateDisplay.classList.remove('hidden');
                    // Formatar a data
                    const session = eventData.sessions?.[0];
                    if (session) {
                        const date = new Date(session.date);
                        const formattedDate = formatDayString(date, session.start, session.end);
                        singleDateDisplay.querySelector('.day-content').textContent = formattedDate;
                    } else {
                        const date = new Date(eventData.startDate);
                        singleDateDisplay.querySelector('.day-content').textContent = formatDayString(date);
                    }
                }
            }

            showView('admin-manage');
        }
    }
    
    // Função para formatar a string de data no formato desejado
    function formatDayString(date, start, end) {
        const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        const diaSemana = diasSemana[date.getDay()];
        const dia = date.getDate();
        const mes = date.getMonth() + 1;
        const ano = date.getFullYear();
        
        let result = `${diaSemana}, ${dia}/${mes}/${ano}`;
        
        if (start && end) {
            result += `, ${start} - ${end}`;
        }
        
        return result;
    }
    
    // Função para filtrar participantes por sessão
    function filterParticipantsBySession(sessionValue) {
        console.log(`Filtrando participantes para sessão: ${sessionValue}`);
        // Aqui você implementaria a lógica para filtrar participantes com base na sessão selecionada
        // Por enquanto, apenas atualizamos o filtro na interface
        filterParticipants();
    }

    // --- Modal Management ---
    function openModal() {
        // Reset form before showing (if creating)
        if (!isEditingEvent) {
            resetModalForm();
            modalTitleEl.textContent = 'Criar Novo Evento';
            modalPublishBtn.innerHTML = '<span class="material-icons">publish</span> Publicar Evento';
        } else {
            modalTitleEl.textContent = 'Editar Evento';
             modalPublishBtn.innerHTML = '<span class="material-icons">save</span> Salvar Alterações';
            // Population happens in the 'edit' event handler
        }
        modalBackdrop.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    function closeModal() {
        modalBackdrop.classList.add('hidden');
        document.body.style.overflow = ''; // Restore background scroll
        isEditingEvent = false;
        editingEventId = null;
        resetModalForm(); // Clear form fields after closing
    }

    function resetModalForm() {
        createEventModal.querySelectorAll('.md-input, .md-select, textarea').forEach(input => {
            input.value = '';
            input.classList.remove('error');
            const errorMsg = input.parentElement.querySelector('.input-error-message');
            if (errorMsg) errorMsg.style.display = 'none';
            if (input.type === 'checkbox') input.checked = false;
        });
        createEventModal.querySelectorAll('details').forEach((details, index) => {
            details.open = (index === 0); // Open only the first section
        });
        // Reset file input
        const fileInput = document.getElementById('modal-event-image');
        if (fileInput) fileInput.value = null;

        // Remove extra session inputs, keeping only the first one
        const sessions = modalSessionsContainer.querySelectorAll('.session-input');
        sessions.forEach((session, index) => {
            if (index > 0) session.remove();
            else { // Clear the first one
                session.querySelectorAll('input').forEach(input => input.value = '');
            }
        });

        // Reset type-dependent fields visibility
        modalLocationField.classList.remove('hidden');
        modalLinkField.classList.add('hidden');
        modalEventTypeSelect.value = ""; // Reset select
    }

    // --- Form Logic ---
    function handleEventTypeChange() {
        const selectedType = modalEventTypeSelect.value;
        if (selectedType === 'Presencial') {
            modalLocationField.classList.remove('hidden');
            modalLinkField.classList.add('hidden');
        } else if (selectedType === 'Live') {
            modalLocationField.classList.add('hidden');
            modalLinkField.classList.remove('hidden');
        } else {
            // Default or if nothing selected - show location? Or hide both?
            modalLocationField.classList.remove('hidden');
            modalLinkField.classList.add('hidden');
        }
        // Clear validation on fields that become hidden
        clearValidation(selectedType === 'Presencial' ? modalLinkField : modalLocationField);
    }

     function clearValidation(fieldContainer) {
         const inputs = fieldContainer.querySelectorAll('[data-validation]');
         inputs.forEach(input => {
             input.classList.remove('error');
             const errorMsg = input.parentElement.querySelector('.input-error-message');
             if (errorMsg) errorMsg.style.display = 'none';
         });
     }


    function addSessionInput() {
        const firstSession = modalSessionsContainer.querySelector('.session-input');
        if (!firstSession) return; // Should not happen

        const newSession = firstSession.cloneNode(true);
        newSession.querySelectorAll('input').forEach(input => input.value = ''); // Clear values
        newSession.querySelectorAll('.input-error-message').forEach(span => span.textContent = ''); // Clear errors

        // Add a remove button to the new session
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.classList.add('icon-button', 'remove-session-btn');
        removeBtn.title = 'Remover Sessão';
        removeBtn.innerHTML = '<span class="material-icons">remove_circle_outline</span>';
        removeBtn.addEventListener('click', () => newSession.remove());

        newSession.appendChild(removeBtn);
        modalSessionsContainer.appendChild(newSession);
    }

    function validateModalForm() {
        let isValid = true;
        const inputsToValidate = createEventModal.querySelectorAll('[data-validation]');

        inputsToValidate.forEach(input => {
            const validationType = input.dataset.validation;
            const errorMsgContainer = input.parentElement.querySelector('.input-error-message');
            let inputValid = true;

             // Clear previous error
             input.classList.remove('error');
             if (errorMsgContainer) errorMsgContainer.style.display = 'none';


            if (validationType.includes('required')) {
                 // Handle conditional requirements
                 if (validationType === 'required-if-presencial' && modalEventTypeSelect.value !== 'Presencial') {
                      // Skip validation if not presencial
                 } else if (validationType === 'required-if-live' && modalEventTypeSelect.value !== 'Live') {
                      // Skip validation if not live
                 }
                // Standard required check
                else if (input.value.trim() === '') {
                    inputValid = false;
                }
            }

             // Add more validation types here (e.g., URL, date order)

            if (!inputValid) {
                isValid = false;
                input.classList.add('error');
                if (errorMsgContainer) {
                    errorMsgContainer.textContent = input.dataset.error || 'Campo obrigatório';
                    errorMsgContainer.style.display = 'block';
                }
            }
        });

        return isValid;
    }

    function handlePublishEvent() {
        if (!validateModalForm()) {
            console.warn("Form validation failed.");
            // Optionally scroll to the first error
            const firstError = createEventModal.querySelector('.error');
            firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        // Gather form data (example)
        const eventData = {
            id: isEditingEvent ? editingEventId : `evt-${Date.now()}`,
            name: document.getElementById('modal-event-title').value,
            type: document.getElementById('modal-event-type').value,
            status: 'open', // Default new events to open? Or add a status field?
            statusLabel: 'Aberto',
            typeIcon: document.getElementById('modal-event-type').value === 'Live' ? 'videocam' : 'store',
            registrations: 0, // New event
            attendance: 0, // New event
            // ... gather other fields (dates, description, location/link etc.)
            startDate: new Date(), // Placeholder
            endDate: new Date(), // Placeholder
        };
        console.log("Saving Event Data:", eventData);


        if (isEditingEvent) {
            // Find and update the event in the sampleAdminEvents array
            const index = sampleAdminEvents.findIndex(e => e.id === editingEventId);
            if (index !== -1) {
                 // Merge new data - be careful with overwriting details
                 sampleAdminEvents[index] = { ...sampleAdminEvents[index], ...eventData };
            }
        } else {
            // Add the new event to the beginning of the array
            sampleAdminEvents.unshift(eventData);
        }

        applyFiltersAndRender(); // Re-render the list with the new/updated event
        closeModal();

        // If created new, ensure list view is shown
         if (!isEditingEvent) {
             showView('admin-list');
         }
    }

    // --- Filtering Logic ---
    function applyFiltersAndRender() {
        const searchTerm = adminEventSearch.value.toLowerCase();
        const typeFilter = document.querySelector('#type-dropdown .filter-chip-option.selected')?.dataset.value;
        const selectedStatuses = Array.from(document.querySelectorAll('#status-dropdown .filter-chip-option.selected'))
            .map(opt => opt.dataset.value);
        const periodFilter = document.querySelector('#period-dropdown .filter-chip-option.selected')?.dataset.value;

        let filteredEvents = [...sampleAdminEvents];

        // Apply search filter
        if (searchTerm) {
            filteredEvents = filteredEvents.filter(event => 
                event.name.toLowerCase().includes(searchTerm)
            );
        }

        // Apply type filter
        if (typeFilter && typeFilter !== 'all') {
            filteredEvents = filteredEvents.filter(event => 
                event.type.toLowerCase() === typeFilter
            );
        }

        // Apply status filter
        if (selectedStatuses.length > 0) {
            filteredEvents = filteredEvents.filter(event => 
                selectedStatuses.includes(event.status)
            );
        }

        // Apply period filter
        if (periodFilter && periodFilter !== 'all') {
            const today = new Date();
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

            filteredEvents = filteredEvents.filter(event => {
                const eventDate = new Date(event.startDate);
                switch (periodFilter) {
                    case 'today':
                        return eventDate.toDateString() === today.toDateString();
                    case 'week':
                        return eventDate >= startOfWeek && eventDate <= today;
                    case 'month':
                        return eventDate >= startOfMonth && eventDate <= today;
                    default:
                        return true;
                }
            });
        }

        renderAdminEventList(filteredEvents);
    }

    // --- Event Listeners ---
    backToEventsBtn.addEventListener('click', () => showView('admin-list'));

    // Modal Triggers
    showCreateEventBtn.addEventListener('click', () => {
        isEditingEvent = false;
        editingEventId = null;
        openModal();
    });
    closeModalBtn.addEventListener('click', closeModal);
    modalCancelBtn.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) { // Close only if backdrop itself is clicked
            closeModal();
        }
    });
    modalPublishBtn.addEventListener('click', handlePublishEvent);

    // Modal Form Interactions
    modalEventTypeSelect.addEventListener('change', handleEventTypeChange);
    addSessionBtn.addEventListener('click', addSessionInput);

    // Admin Event List Table Actions (Event Delegation)
    adminEventTbody.addEventListener('click', (e) => {
        const targetButton = e.target.closest('.icon-button');
        const targetLink = e.target.closest('.event-name-link');
        const targetCheckbox = e.target.closest('input[type="checkbox"]');
        const row = e.target.closest('tr');

        if (!row) return;
        const eventId = row.dataset.eventId;

        // Se o clique foi em um checkbox ou botão, não abrir a tela de detalhes
        if (targetButton) {
            const action = targetButton.dataset.action;
            if (action === 'edit') {
                isEditingEvent = true;
                editingEventId = eventId;
                const eventToEdit = sampleAdminEvents.find(ev => ev.id === eventId);
                if (eventToEdit) {
                    // --- Populate Modal ---
                    modalEventTitleInput.value = eventToEdit.name;
                    modalEventTypeSelect.value = eventToEdit.type;
                    document.getElementById('modal-event-code').value = eventToEdit.id; // Example
                    document.getElementById('modal-event-description').value = eventToEdit.description || '';
                    document.getElementById('modal-event-location').value = eventToEdit.location || '';
                    document.getElementById('modal-event-link').value = eventToEdit.link || '';
                    // ... populate other fields (category, language, image, settings)
                    // ... populate sessions
                    handleEventTypeChange(); // Ensure correct fields are shown
                    openModal();
                }
            } else if (action === 'manage') {
                loadEventDetails(eventId);
            } else if (action === 'delete') {
                if (confirm(`Tem certeza que deseja excluir o evento "${row.querySelector('td:nth-child(3)')?.textContent || eventId}"?`)) {
                    sampleAdminEvents = sampleAdminEvents.filter(ev => ev.id !== eventId);
                    applyFiltersAndRender(); // Re-render list
                }
            } else if (action === 'qr') {
                alert(`Simular exibição do QR Code para Evento ID: ${eventId}`);
                // Later: Open a dedicated QR Code modal
            }
        } else if (targetLink) {
            e.preventDefault(); // Prevent default link behavior
            // --- Load Manage Event View ---
            loadEventDetails(eventId);
        } else if (!targetCheckbox) {
            // Se o clique não foi em botão, link ou checkbox, abrir a tela de detalhes
            loadEventDetails(eventId);
        }
    });

     // Manage Event Participants Table Actions (Event Delegation)
     participantTbody.addEventListener('click', (e) => {
         const targetToggle = e.target.closest('.presence-toggle input');
         const targetDeleteBtn = e.target.closest('.action-button[title="Remover Participante"]');
         const row = e.target.closest('tr');
         if (!row) return;
         const participantId = row.dataset.participantId;

         if (targetToggle) {
             console.log(`Toggled presence for participant ${participantId} to ${targetToggle.checked}`);
             // Update the sampleParticipants data if needed for persistence simulation
             const pIndex = sampleParticipants.findIndex(p => p.id === participantId);
             if(pIndex !== -1) {
                 sampleParticipants[pIndex].present = targetToggle.checked;
                 // Atualizar contador de presentes
                 indicatorPresentes.textContent = sampleParticipants.filter(p => p.present).length;
                 
                 // Reapply filters after changing presence
                 filterParticipants();
             }
         } else if (targetDeleteBtn) {
             if (confirm(`Remover o participante "${row.querySelector('.participant-name span:last-child')?.textContent || participantId}"?`)) {
                 sampleParticipants = sampleParticipants.filter(p => p.id !== participantId);
                 filterParticipants(); // Re-render participant list with filters
                 // Update the main event attendance count (optional simulation)
                 const currentEvent = sampleAdminEvents.find(ev => ev.id === editingEventId); // Assumes editingEventId is set when in detail view
                 if(currentEvent) {
                    // This is simplified - real count might be complex
                    currentEvent.registrations = Math.max(0, currentEvent.registrations -1);
                    // Update indicators
                     indicatorInscritos.textContent = currentEvent.registrations;
                    // Update presence indicator based on remaining participants
                    indicatorPresentes.textContent = sampleParticipants.filter(p => p.present).length;
                 }
             }
         }
     });
     
     // Filter participants based on search and filter selections
     function filterParticipants() {
         const searchTerm = participantSearch.value.toLowerCase();
         const presenceFilter = document.querySelector('#presence-dropdown .filter-chip-option.selected')?.dataset.value;
         const sessionFilter = sessionSelect.value;
         
         let filteredParticipants = [...sampleParticipants];
         
         // Apply search filter
         if (searchTerm) {
             filteredParticipants = filteredParticipants.filter(p => 
                 p.name.toLowerCase().includes(searchTerm) || 
                 p.email.toLowerCase().includes(searchTerm)
             );
         }
         
         // Apply presence filter
         if (presenceFilter && presenceFilter !== 'all') {
             filteredParticipants = filteredParticipants.filter(p => 
                 presenceFilter === 'present' ? p.present : !p.present
             );
         }
         
         // Apply session filter (em implementação real, filtraria por presença em sessões específicas)
         if (sessionFilter && sessionFilter !== 'all') {
             // Simulação: filtraria participantes baseado em qual sessão compareceram
             console.log(`Filtro de sessão aplicado: ${sessionFilter}`);
             // No exemplo atual, não temos dados de presença por sessão
         }
         
         renderParticipantList(filteredParticipants);
     }
     
     // Add listener for participant search
     participantSearch.addEventListener('input', filterParticipants);

    // Filtering Listeners
    adminEventSearch.addEventListener('input', applyFiltersAndRender);

    // --- Filter Chip Management ---
    const filterChips = document.querySelectorAll('.filter-chip');
    const filterDropdowns = document.querySelectorAll('.filter-chip-dropdown');

    // Close all dropdowns
    function closeAllDropdowns() {
        filterDropdowns.forEach(dropdown => {
            dropdown.classList.remove('show');
        });
        filterChips.forEach(chip => {
            chip.classList.remove('selected');
        });
    }

    // Handle chip click
    filterChips.forEach(chip => {
        chip.addEventListener('click', (e) => {
            e.stopPropagation();
            const filterType = chip.dataset.filter;
            const dropdown = document.getElementById(`${filterType}-dropdown`);
            
            if (!dropdown) return;
            
            // Close other dropdowns
            filterDropdowns.forEach(d => {
                if (d !== dropdown) {
                    d.classList.remove('show');
                }
            });
            filterChips.forEach(c => {
                if (c !== chip) {
                    c.classList.remove('selected');
                }
            });

            // Toggle current dropdown
            dropdown.classList.toggle('show');
            chip.classList.toggle('selected');
            
            // Se for o dropdown de sessão, dar foco ao select
            if (filterType === 'session' && dropdown.classList.contains('show')) {
        setTimeout(() => {
                    sessionSelect.focus();
                }, 10);
            }
        });
    });

    // Handle option selection
    document.querySelectorAll('.filter-chip-option').forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdown = option.closest('.filter-chip-dropdown');
            const filterType = dropdown.id.replace('-dropdown', '');
            
            if (filterType === 'status') {
                // Toggle selection for status (multiple selection allowed)
                option.classList.toggle('selected');
                const selectedStatuses = Array.from(dropdown.querySelectorAll('.filter-chip-option.selected'))
                    .map(opt => opt.dataset.value);
                
                // Update chip appearance
                const chip = document.querySelector(`[data-filter="status"]`);
                chip.classList.toggle('selected', selectedStatuses.length > 0);
                
                // Apply filter
                applyFiltersAndRender();
            } else if (filterType === 'presence') {
                // Single selection for presence filter
                dropdown.querySelectorAll('.filter-chip-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                option.classList.add('selected');
                
                // Update chip appearance
                const chip = document.querySelector(`[data-filter="presence"]`);
                chip.classList.add('selected');
                
                // Close dropdown
                dropdown.classList.remove('show');
                
                // Apply filter
                filterParticipants();
            } else {
                // Single selection for other filters (type, period)
                dropdown.querySelectorAll('.filter-chip-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                option.classList.add('selected');
                
                // Update chip appearance
                const chip = document.querySelector(`[data-filter="${filterType}"]`);
                chip.classList.add('selected');
                
                // Close dropdown
                dropdown.classList.remove('show');
                
                // Apply filter for events
                applyFiltersAndRender();
            }
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.filter-chip') && !e.target.closest('.filter-chip-dropdown')) {
            closeAllDropdowns();
        }
    });

    // --- Initial Load ---
    renderAdminEventList(sampleAdminEvents);
    showView('admin-list');
});