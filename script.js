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
    const editCurrentEventBtn = manageEventView.querySelector('[data-action="edit-current"]');
    const qrCurrentEventBtn = manageEventView.querySelector('[data-action="qr-current"]');


    // --- Event List Elements ---
    const adminEventTable = document.getElementById('admin-event-table'); // Reference to the table itself
    const adminEventTbody = document.getElementById('admin-event-tbody');
    const adminEventSearch = document.getElementById('admin-event-search');

    // --- Manage Event View Elements ---
    const manageEventTitle = document.getElementById('manage-event-title');
    const manageEventTypeIcon = document.getElementById('manage-event-type-icon');
    const indicatorInscritos = document.getElementById('indicator-inscritos');
    const indicatorPresentes = document.getElementById('indicator-presentes');
    const participantTbody = document.getElementById('participant-tbody');
    const participantSearch = document.getElementById('participant-search');
    const sessionDropdown = document.getElementById('session-dropdown'); // The dropdown itself
    const dayOptionsContainer = document.querySelector('.day-options-container'); // Container for options
    const filterSessionContainer = document.querySelector('.filter-session-container'); // Container for chip/dropdown
    const singleDateDisplay = document.querySelector('.single-date-display');
    const dayChip = document.querySelector('.day-chip');
    const dayChipContent = dayChip?.querySelector('.day-content');

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

    // --- QR Code Modal Elements ---
    const qrCodeModal = document.getElementById('qr-code-modal');
    const closeQrModalBtn = document.getElementById('close-qr-modal');
    const copySvgBtn = document.getElementById('copy-svg-btn');
    const printQrBtn = document.getElementById('print-qr-btn');

    // --- State ---
    let currentView = 'admin-list'; // 'admin-list', 'admin-manage'
    let isEditingEvent = false;
    let editingEventId = null; // Store ID of the event being edited OR viewed in detail
    let sampleAdminEvents = generateSampleEvents(15); // Generate some initial data
    let sampleParticipants = generateSampleParticipants(30); // Sample participants for detail view

    // --- Date Filter Specific Logic ---
    const applyCustomDateBtn = document.getElementById('apply-custom-date');
    const applyDateRangeBtn = document.getElementById('apply-date-range');
    const customDateInput = document.getElementById('custom-date');
    const dateStartInput = document.getElementById('date-start');
    const dateEndInput = document.getElementById('date-end');
    
    // Set today's date as default for the custom date picker
    if (customDateInput) {
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        customDateInput.value = formattedDate;
    }
    
    // Handle custom date filter
    applyCustomDateBtn?.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent dropdown closing
        
        // Deselect all predefined period options
        document.querySelectorAll('#period-dropdown .filter-chip-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Add custom date as a data attribute to the filter chip
        const periodChip = document.querySelector('.filter-chip[data-filter="period"]');
        periodChip.dataset.customDate = customDateInput.value;
        periodChip.classList.add('selected');
        
        // Update the chip text to show selected date
        const formattedDisplayDate = new Date(customDateInput.value).toLocaleDateString('pt-BR');
        periodChip.innerHTML = `
            <span class="material-icons">date_range</span>
            ${formattedDisplayDate}
        `;
        
        // Close dropdown and apply filter
        closeAllFilterDropdowns();
        applyFiltersAndRender();
    });
    
    // Handle date range filter
    applyDateRangeBtn?.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent dropdown closing
        
        // Validate date range
        if (!dateStartInput.value || !dateEndInput.value) {
            alert('Por favor, selecione as datas inicial e final.');
            return;
        }
        
        const startDate = new Date(dateStartInput.value);
        const endDate = new Date(dateEndInput.value);
        
        if (startDate > endDate) {
            alert('A data inicial deve ser anterior à data final.');
            return;
        }
        
        // Deselect all predefined period options
        document.querySelectorAll('#period-dropdown .filter-chip-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Add date range as data attributes to the filter chip
        const periodChip = document.querySelector('.filter-chip[data-filter="period"]');
        periodChip.dataset.dateStart = dateStartInput.value;
        periodChip.dataset.dateEnd = dateEndInput.value;
        periodChip.classList.add('selected');
        
        // Update the chip text to show selected range
        const formattedStartDate = startDate.toLocaleDateString('pt-BR');
        const formattedEndDate = endDate.toLocaleDateString('pt-BR');
        periodChip.innerHTML = `
            <span class="material-icons">date_range</span>
            ${formattedStartDate} - ${formattedEndDate}
        `;
        
        // Close dropdown and apply filter
        closeAllFilterDropdowns();
        applyFiltersAndRender();
    });

    // --- Sample Data Generation ---
    function generateSampleEvents(count) {
        const events = [];
        const types = ['Presencial', 'Live'];
        const statuses = ['open', 'concluded', 'cancelled']; // Corresponds to CSS classes
        const statusText = { open: 'Aberto', concluded: 'Encerrado', cancelled: 'Cancelado' };
        const typeIcons = { Presencial: 'location_on', Live: 'videocam' }; // Updated icons

        for (let i = 1; i <= count; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const startDate = new Date(2025, 8 + Math.floor(Math.random() * 3), 1 + Math.floor(Math.random() * 28));
            const numSessions = Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 2 : 1; // 1 to 4 sessions
            const sessions = [];
            let currentDate = new Date(startDate);

            for(let j=0; j<numSessions; j++){
                const startHour = 9 + Math.floor(Math.random() * 3); // 9, 10, 11
                const endHour = startHour + 2;
                sessions.push({
                    id: `sess-${i}-${j+1}`,
                    date: new Date(currentDate),
                    start: `${String(startHour).padStart(2,'0')}:00`,
                    end: `${String(endHour).padStart(2,'0')}:00`
                });
                // Increment date for next session if multi-day
                if (numSessions > 1) {
                     currentDate.setDate(currentDate.getDate() + 1);
                }
            }

            const endDate = sessions[sessions.length - 1].date; // Last session date

            events.push({
                id: `evt-${i}`,
                type: type,
                typeIcon: typeIcons[type],
                name: `${type === 'Live' ? 'Webinar' : 'Workshop'} Tópico ${i}${numSessions > 1 ? ' (Múltiplos Dias)' : ''}`,
                startDate: startDate, // First session date
                endDate: endDate,     // Last session date
                registrations: Math.floor(Math.random() * 50) + 5, // Min 5
                attendance: 0, // Calculated later
                status: status,
                statusLabel: statusText[status],
                location: type === 'Presencial' ? `Auditório ${100 + i}` : null,
                link: type === 'Live' ? `https://meeting.example.com/topic${i}` : null,
                description: `Descrição detalhada sobre o Tópico ${i} e seus objetivos. Cobre os aspectos X, Y e Z.`,
                sessions: sessions,
                participants: generateSampleParticipantsForEvent(Math.floor(Math.random() * 40) + 5, `evt-${i}`, sessions) // Generate participants specific to this event
            });
        }
         // Calculate initial attendance
        events.forEach(ev => {
            ev.attendance = ev.participants.filter(p => p.present).length;
        });
        return events;
    }

    function generateSampleParticipantsForEvent(count, eventId, eventSessions) {
         const participants = [];
         const firstNames = ["Ana", "Bruno", "Carla", "Daniel", "Elena", "Fábio", "Gisele", "Hugo", "Inês", "João", "Laura", "Marcos"];
         const lastNames = ["Silva", "Santos", "Oliveira", "Pereira", "Costa", "Rodrigues", "Almeida", "Ferreira"];
         for (let i = 1; i <= count; i++) {
             const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
             const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
             const isPresent = Math.random() > 0.4; // ~60% present overall

             // Simulate presence per session if multi-day
             const sessionPresence = {};
             if (eventSessions.length > 1) {
                 eventSessions.forEach((session, index) => {
                     sessionPresence[`session-${index}`] = isPresent && (Math.random() > 0.1); // If present overall, small chance of missing a session
                 });
             }

             participants.push({
                 id: `usr-${eventId}-${i}`,
                 name: `${firstName} ${lastName}`,
                 email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`,
                 registrationDate: new Date(2025, 8, 1 + Math.floor(Math.random() * 15)),
                 present: isPresent, // Overall presence (used for main list count)
                 sessionPresence: sessionPresence, // Presence per session
                 avatarInitial: firstName.charAt(0)
             });
         }
         return participants;
    }


    // Function to generate participants (can be removed if using per-event generation)
    function generateSampleParticipants(count) {
        const participants = [];
        const firstNames = ["Ana", "Bruno", "Carla", "Daniel", "Elena", "Fábio", "Gisele", "Hugo", "Inês", "João", "Laura", "Marcos"];
        const lastNames = ["Silva", "Santos", "Oliveira", "Pereira", "Costa", "Rodrigues", "Almeida", "Ferreira"];
        
        for (let i = 1; i <= count; i++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const isPresent = Math.random() > 0.4; // ~60% present
            
            participants.push({
                id: `usr-${i}`,
                name: `${firstName} ${lastName}`,
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`,
                registrationDate: new Date(2025, 8, 1 + Math.floor(Math.random() * 15)),
                present: isPresent,
                avatarInitial: firstName.charAt(0)
            });
        }
        return participants;
    }


    // --- Rendering Functions ---
    function renderAdminEventList(eventsToRender) {
        adminEventTbody.innerHTML = ''; // Clear existing rows
        if (eventsToRender.length === 0) {
            adminEventTbody.innerHTML = `<tr class="no-pointer"><td colspan="7" class="empty-state" style="display: table-cell;">Nenhum evento encontrado.</td></tr>`;
            adminEventListsContainer.classList.remove('hidden');
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
                    <a href="#" class="event-name" data-action="manage">
                        <div class="event-type-icon-container">
                            <span class="material-icons event-type-icon ${event.type.toLowerCase()}">${event.typeIcon}</span>
                        </div>
                        <span>${event.name}</span>
                    </a>
                </td>
                <td>${dateString}</td>
                <td>${event.registrations}</td>
                <td>${event.attendance}</td>
                <td><span class="status-chip ${event.status}">${event.statusLabel}</span></td>
                <td>
                    <div class="event-actions">
                        <!-- <button class="icon-button" title="Gerenciar Participantes" data-action="manage"><span class="material-icons">group</span></button> --> <!-- Removed, click row/name -->
                        <button class="icon-button" title="Editar" data-action="edit"><span class="material-icons">edit</span></button>
                        <button class="icon-button" title="Gerar QR Code" data-action="qr"><span class="material-icons">qr_code_2</span></button>
                        <button class="icon-button" title="Excluir" data-action="delete"><span class="material-icons">delete</span></button>
                    </div>
                </td>
            `;
            adminEventTbody.appendChild(row);
        });
        adminEventListsContainer.classList.remove('hidden');
    }

    function renderParticipantList(participantsToRender, selectedSession = 'all') {
         participantTbody.innerHTML = '';
         if (participantsToRender.length === 0) {
            participantTbody.innerHTML = `<tr class="no-pointer"><td colspan="6" class="empty-state" style="display: table-cell;">Nenhum participante encontrado para os filtros aplicados.</td></tr>`;
            return;
         }

         participantsToRender.forEach(p => {
            const row = document.createElement('tr');
            row.dataset.participantId = p.id;

            // Determine presence based on selected session
            let displayPresence = p.present; // Default to overall presence
            if (selectedSession !== 'all' && p.sessionPresence && p.sessionPresence[selectedSession] !== undefined) {
                displayPresence = p.sessionPresence[selectedSession];
            }


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
                        <input type="checkbox" ${displayPresence ? 'checked' : ''} data-session="${selectedSession}">
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
    function showView(viewName, eventId = null) {
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
                 editingEventId = null; // Clear editing ID when returning to list
                 // Re-apply filters when returning to list
                 applyFiltersAndRender();
                 break;
             case 'admin-manage':
                 if (eventId) {
                     editingEventId = eventId; // Store the ID of the event being viewed/managed
                     loadEventDetails(eventId); // Load data before showing
                     manageEventView.classList.remove('hidden');
                     currentView = 'admin-manage';
                 } else {
                     console.error("Event ID is required to show manage view.");
                     showView('admin-list'); // Fallback to list view
                 }
                 break;
         }
         window.scrollTo(0, 0); // Scroll to top on view change
     }

    // Função para carregar os dados do evento na tela interna
    function loadEventDetails(eventId) {
        const eventData = sampleAdminEvents.find(ev => ev.id === eventId);
        if (eventData) {
            // --- Update Header ---
            mainTitle.textContent = 'Gerenciar Evento'; // Change main title
            manageEventTitle.textContent = eventData.name;
            manageEventTypeIcon.textContent = eventData.typeIcon;
            manageEventTypeIcon.className = `material-icons ${eventData.type.toLowerCase()}`; // Update class for color/icon specific style
            indicatorInscritos.textContent = eventData.participants.length; // Count actual participants
            indicatorPresentes.textContent = eventData.participants.filter(p => p.present).length; // Count present

            // --- Update Date/Session Display ---
            const sessions = eventData.sessions || [];
            if (sessions.length > 1) {
                // Multi-day event - Show dropdown
                filterSessionContainer?.classList.remove('hidden');
                singleDateDisplay?.classList.add('hidden');

                // Populate day options
                dayOptionsContainer.innerHTML = ''; // Reset

                // Option for "All Sessions" (shows overall presence)
                const allOption = createSessionOption('all', 'Todas as Sessões');
                 allOption.classList.add('selected'); // Select 'All' by default
                dayOptionsContainer.appendChild(allOption);

                // Set default chip text (e.g., first session date)
                const firstSession = sessions[0];
                const firstDate = new Date(firstSession.date);
                dayChipContent.textContent = formatDayString(firstDate, firstSession.start, firstSession.end);

                // Add each session as an option
                sessions.forEach((session, index) => {
                    const sessionValue = `session-${index}`;
                    const date = new Date(session.date);
                    const formattedDate = formatDayString(date, session.start, session.end);
                    const option = createSessionOption(sessionValue, formattedDate, index);
                    dayOptionsContainer.appendChild(option);
                });

                // Ensure dropdown is closed initially
                sessionDropdown.classList.remove('show');
                dayChip.classList.remove('selected');


            } else {
                // Single-day event - Show text display
                filterSessionContainer?.classList.add('hidden');
                singleDateDisplay?.classList.remove('hidden');

                const session = sessions[0];
                if (session) {
                    const date = new Date(session.date);
                    singleDateDisplay.querySelector('.day-content').textContent = formatDayString(date, session.start, session.end);
                } else { // Fallback if no sessions array
                    singleDateDisplay.querySelector('.day-content').textContent = formatDayString(new Date(eventData.startDate));
                }
            }

            // --- Load Participants ---
            // Initial load shows all participants with overall presence
            filterParticipants(eventData.participants, 'all'); // Pass participants and default session filter

            // Set editingEventId for context in other functions (like edit/QR buttons)
            editingEventId = eventId;

            // manageEventView is made visible by showView function AFTER loading is done

        } else {
            console.error(`Event data not found for ID: ${eventId}`);
            showView('admin-list'); // Go back to list if event not found
        }
    }

    // Helper to create session dropdown options
    function createSessionOption(value, text, index = -1) {
        const option = document.createElement('button');
        option.classList.add('filter-chip-option', 'day-option'); // Use existing style
        option.dataset.value = value;
        if (index !== -1) option.dataset.index = index;
        option.innerHTML = `
            <span class="material-icons">check</span>
            <span>${text}</span>
        `;
         option.addEventListener('click', handleSessionSelection);
        return option;
    }

    // Handle clicking a session option
    function handleSessionSelection(event) {
         const selectedOption = event.currentTarget;
         const sessionValue = selectedOption.dataset.value;
         const eventData = sampleAdminEvents.find(ev => ev.id === editingEventId);

         // Update selection visual
         dayOptionsContainer.querySelectorAll('.day-option').forEach(opt => {
             opt.classList.remove('selected');
         });
         selectedOption.classList.add('selected');

         // Update chip text
         if (sessionValue !== 'all') {
             dayChipContent.textContent = selectedOption.querySelector('span:last-child').textContent;
         } else {
             // Show first session date if 'All' is selected
             const firstSession = eventData?.sessions[0];
             if(firstSession) {
                const date = new Date(firstSession.date);
                dayChipContent.textContent = formatDayString(date, firstSession.start, firstSession.end);
             } else {
                dayChipContent.textContent = 'Todas as Sessões';
             }
         }

         // Close dropdown
         sessionDropdown.classList.remove('show');
         dayChip.classList.remove('selected');

        // Update presence count based on selected session
        if (sessionValue === 'all') {
            // Show total presence count
            indicatorPresentes.textContent = eventData.participants.filter(p => p.present).length;
        } else {
            // Show presence count for specific session
            const sessionPresenceCount = eventData.participants.filter(p => 
                p.sessionPresence && p.sessionPresence[sessionValue]
            ).length;
            indicatorPresentes.textContent = sessionPresenceCount;
        }

         // Filter participants based on the selected session
         filterParticipants(eventData?.participants || [], sessionValue);
    }


    // Função para formatar a string de data no formato desejado
    function formatDayString(date, start, end) {
        if (!(date instanceof Date) || isNaN(date)) {
            return "Data inválida";
        }
        const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const diaSemana = diasSemana[date.getDay()];
        const dia = String(date.getDate()).padStart(2, '0');
        const mes = String(date.getMonth() + 1).padStart(2, '0');
        //const ano = date.getFullYear(); // Optional: add year if needed

        let result = `${diaSemana}, ${dia}/${mes}`;

        if (start && end) {
            result += ` (${start}-${end})`;
        }

        return result;
    }

    // --- Modal Management ---
    function openModal(editMode = false, eventData = null) {
        isEditingEvent = editMode;
        editingEventId = editMode ? eventData?.id : null; // Set ID only if editing

        if (editMode && eventData) {
             // --- Populate Modal for Editing ---
             modalTitleEl.textContent = 'Editar Evento';
             modalPublishBtn.innerHTML = '<span class="material-icons">save</span> Salvar Alterações';

             modalEventTitleInput.value = eventData.name;
             modalEventTypeSelect.value = eventData.type;
             document.getElementById('modal-event-code').value = eventData.id; // Use event ID as code example
             document.getElementById('modal-event-description').value = eventData.description || '';
             document.getElementById('modal-event-location').value = eventData.location || '';
             document.getElementById('modal-event-link').value = eventData.link || '';

             // Clear existing sessions except first (template)
             const sessionInputs = modalSessionsContainer.querySelectorAll('.session-input');
             sessionInputs.forEach((session, index) => {
                 if (index > 0) session.remove();
             });

             // Populate sessions
             eventData.sessions.forEach((session, index) => {
                 let currentSessionInput;
                 if (index === 0) {
                     currentSessionInput = sessionInputs[0];
                 } else {
                     currentSessionInput = addSessionInput(false); // Add without focus/scroll
                 }
                 currentSessionInput.querySelector('.session-date').valueAsDate = new Date(session.date);
                 currentSessionInput.querySelector('.session-start').value = session.start;
                 currentSessionInput.querySelector('.session-end').value = session.end;
             });


             // TODO: Populate other fields (category, language, image, settings, people)
             handleEventTypeChange(); // Ensure correct fields (location/link) are shown/hidden
         } else {
             // --- Reset Modal for Creation ---
             resetModalForm();
             modalTitleEl.textContent = 'Criar Novo Evento';
             modalPublishBtn.innerHTML = '<span class="material-icons">publish</span> Publicar Evento';
         }

         modalBackdrop.classList.remove('hidden');
         document.body.style.overflow = 'hidden'; // Prevent background scroll
         modalEventTitleInput.focus(); // Focus first field
    }

    function closeModal() {
        modalBackdrop.classList.add('hidden');
        document.body.style.overflow = ''; // Restore background scroll
        isEditingEvent = false;
        editingEventId = null; // Clear ID on close regardless
        resetModalForm(); // Clear form fields after closing
    }

    function resetModalForm() {
        createEventModal.querySelector('form')?.reset(); // Reset form if wrapped in one
        createEventModal.querySelectorAll('.md-input, .md-select, textarea').forEach(input => {
            input.value = '';
            input.classList.remove('error');
            const errorMsg = input.closest('.form-group')?.querySelector('.input-error-message') || input.parentElement.querySelector('.input-error-message');
            if (errorMsg) errorMsg.style.display = 'none';
            if (input.type === 'checkbox') input.checked = false;
        });
        createEventModal.querySelectorAll('details').forEach((details, index) => {
            details.open = (index === 0); // Open only the first section
        });
        // Reset file input
        const fileInput = document.getElementById('modal-event-image');
        if (fileInput) fileInput.value = null;

        // Remove extra session inputs, keeping only the first one and clearing it
        const sessions = modalSessionsContainer.querySelectorAll('.session-input');
        sessions.forEach((session, index) => {
            if (index > 0) session.remove();
            else { // Clear the first one
                session.querySelectorAll('input').forEach(input => {
                    input.value = '';
                    input.classList.remove('error');
                    const errorMsg = input.parentElement.querySelector('.input-error-message');
                     if (errorMsg) errorMsg.style.display = 'none';
                });
            }
        });

        // Reset type-dependent fields visibility
        modalLocationField.classList.remove('hidden'); // Default to showing location
        modalLinkField.classList.add('hidden');
        modalEventTypeSelect.value = ""; // Reset select
    }

    // --- Form Logic ---
    function handleEventTypeChange() {
        const selectedType = modalEventTypeSelect.value;
        const locationInput = modalLocationField.querySelector('input');
        const linkInput = modalLinkField.querySelector('input');

        if (selectedType === 'Presencial') {
            modalLocationField.classList.remove('hidden');
            modalLinkField.classList.add('hidden');
            locationInput.required = true; // Make required
            linkInput.required = false; // Make not required
            clearValidation(modalLinkField);
        } else if (selectedType === 'Live') {
            modalLocationField.classList.add('hidden');
            modalLinkField.classList.remove('hidden');
            locationInput.required = false;
            linkInput.required = true;
            clearValidation(modalLocationField);
        } else {
            // Default or if nothing selected - show location, but not required initially
            modalLocationField.classList.remove('hidden');
            modalLinkField.classList.add('hidden');
            locationInput.required = false;
            linkInput.required = false;
            clearValidation(modalLinkField);
            clearValidation(modalLocationField);
        }
    }

     function clearValidation(fieldContainer) {
         const inputs = fieldContainer?.querySelectorAll('[data-validation]');
         inputs?.forEach(input => {
             input.classList.remove('error');
             const errorMsg = input.parentElement.querySelector('.input-error-message');
             if (errorMsg) errorMsg.style.display = 'none';
         });
     }


    function addSessionInput(focusAndScroll = true) {
         const firstSession = modalSessionsContainer.querySelector('.session-input');
         if (!firstSession) return null; // Should not happen

         const newSession = firstSession.cloneNode(true);
         const inputs = newSession.querySelectorAll('input');
         inputs.forEach(input => {
            input.value = ''; // Clear values
            input.id = ''; // Remove duplicate IDs
            input.classList.remove('error'); // Clear errors
         });
         newSession.querySelectorAll('.input-error-message').forEach(span => {
             span.textContent = ''; // Clear errors
             span.style.display = 'none';
         });


         // Add a remove button only if it's not the very first session input
         if (modalSessionsContainer.querySelectorAll('.session-input').length > 0) {
             const removeBtn = document.createElement('button');
             removeBtn.type = 'button';
             removeBtn.classList.add('icon-button', 'remove-session-btn');
             removeBtn.title = 'Remover Sessão';
             removeBtn.innerHTML = '<span class="material-icons">remove_circle_outline</span>';
             removeBtn.addEventListener('click', () => newSession.remove());
             newSession.appendChild(removeBtn);
         }

         modalSessionsContainer.appendChild(newSession);

         if (focusAndScroll) {
             const firstInput = newSession.querySelector('input');
             firstInput?.focus();
             newSession.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
         }
         return newSession; // Return the created element
     }

    function validateModalForm() {
         let isValid = true;
         const inputsToValidate = createEventModal.querySelectorAll('[data-validation]');

         inputsToValidate.forEach(input => {
             const validationType = input.dataset.validation;
              const errorMsgContainer = input.parentElement.querySelector('.input-error-message') || input.closest('.form-group')?.querySelector('.input-error-message');
             let inputValid = true;

             // Clear previous error
             input.classList.remove('error');
             if (errorMsgContainer) errorMsgContainer.style.display = 'none';


             if (validationType.includes('required')) {
                  // Handle conditional requirements
                  const isVisible = input.offsetParent !== null; // Check if element is visible
                  if(!isVisible) {
                     // Skip validation if not visible (e.g. location field for live event)
                     inputValid = true;
                  }
                  else if (validationType === 'required-if-presencial' && modalEventTypeSelect.value !== 'Presencial') {
                      inputValid = true; // Skip validation if not presencial
                  } else if (validationType === 'required-if-live' && modalEventTypeSelect.value !== 'Live') {
                      inputValid = true; // Skip validation if not live
                  }
                  // Standard required check for visible fields
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

         // Validate session times (end > start) - Example
         modalSessionsContainer.querySelectorAll('.session-input').forEach(sessionInput => {
             const startInput = sessionInput.querySelector('.session-start');
             const endInput = sessionInput.querySelector('.session-end');
             const errorMsg = sessionInput.querySelector('.input-error-message'); // Specific error for session

             if (startInput.value && endInput.value && startInput.value >= endInput.value) {
                 isValid = false;
                 startInput.classList.add('error');
                 endInput.classList.add('error');
                  if (errorMsg) {
                      errorMsg.textContent = 'Hora de término deve ser após o início.';
                      errorMsg.style.display = 'block';
                  }
             }
         });


         return isValid;
     }

     function handlePublishEvent() {
         if (!validateModalForm()) {
             console.warn("Form validation failed.");
             const firstError = createEventModal.querySelector('.error');
             firstError?.focus();
             firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
             return;
         }

         // Gather form data
         const sessionsData = [];
        modalSessionsContainer.querySelectorAll('.session-input').forEach((sessionEl, index) => {
            sessionsData.push({
                id: `sess-${Date.now()}-${index}`,
                date: new Date(sessionEl.querySelector('.session-date').value + 'T00:00:00'), // Ensure date is parsed correctly
                start: sessionEl.querySelector('.session-start').value,
                end: sessionEl.querySelector('.session-end').value
            });
        });
         sessionsData.sort((a, b) => a.date - b.date); // Sort sessions by date

         const type = document.getElementById('modal-event-type').value;
         const eventData = {
             id: isEditingEvent ? editingEventId : `evt-${Date.now()}`, // Keep existing ID if editing
             name: document.getElementById('modal-event-title').value,
             type: type,
             typeIcon: type === 'Live' ? 'videocam' : 'location_on',
             status: 'open', // Default new/edited events to open for now
             statusLabel: 'Aberto',
             startDate: sessionsData[0]?.date || new Date(),
             endDate: sessionsData[sessionsData.length - 1]?.date || new Date(),
             location: type === 'Presencial' ? document.getElementById('modal-event-location').value : null,
             link: type === 'Live' ? document.getElementById('modal-event-link').value : null,
             description: document.getElementById('modal-event-description').value,
             sessions: sessionsData,
             // --- Keep existing participants if editing, generate new empty if creating ---
             participants: isEditingEvent
                 ? sampleAdminEvents.find(e => e.id === editingEventId)?.participants || []
                 : [],
             registrations: 0, // Recalculated below
             attendance: 0 // Recalculated below
             // TODO: Gather category, language, image, settings, people
         };

         // Recalculate counts based on participant array
         eventData.registrations = eventData.participants.length;
         eventData.attendance = eventData.participants.filter(p => p.present).length;

         console.log("Saving Event Data:", eventData);

         if (isEditingEvent) {
             // Find and update the event in the sampleAdminEvents array
             const index = sampleAdminEvents.findIndex(e => e.id === editingEventId);
             if (index !== -1) {
                 sampleAdminEvents[index] = eventData; // Replace entire object
                  // If the currently viewed event was edited, reload its details
                 if (currentView === 'admin-manage' && editingEventId === eventData.id) {
                     loadEventDetails(eventData.id);
                 }
             } else {
                  console.error("Could not find event to update with ID:", editingEventId);
                  sampleAdminEvents.unshift(eventData); // Add as new if update failed
             }
         } else {
             // Add the new event to the beginning of the array
             sampleAdminEvents.unshift(eventData);
         }

         applyFiltersAndRender(); // Re-render the list view
         closeModal();

         // Ensure list view is shown *after* creating a new event
          if (!isEditingEvent) {
              showView('admin-list');
          }
     }

    // --- Filtering Logic ---
    function applyFiltersAndRender() {
        const searchTerm = adminEventSearch.value.toLowerCase();
        
        // Get selected values from filter chips - support multiple selections
        const typeFilters = Array.from(document.querySelectorAll('#type-dropdown .filter-chip-option.selected'))
            .map(opt => opt.dataset.value);
            
        const selectedStatuses = Array.from(document.querySelectorAll('#status-dropdown .filter-chip-option.selected'))
            .map(opt => opt.dataset.value);
            
        const periodFilters = Array.from(document.querySelectorAll('#period-dropdown .filter-chip-option.selected'))
            .map(opt => opt.dataset.value);
            
        // Check for custom date filters
        const periodChip = document.querySelector('.filter-chip[data-filter="period"]');
        const customDate = periodChip?.dataset.customDate;
        const dateStart = periodChip?.dataset.dateStart;
        const dateEnd = periodChip?.dataset.dateEnd;

        let filteredEvents = [...sampleAdminEvents];

        // Apply search filter
        if (searchTerm) {
            filteredEvents = filteredEvents.filter(event =>
                event.name.toLowerCase().includes(searchTerm) ||
                event.description?.toLowerCase().includes(searchTerm) // Optional: search description too
            );
        }

        // Apply type filter - support multiple types
        if (typeFilters.length > 0 && !typeFilters.includes('all')) {
            filteredEvents = filteredEvents.filter(event =>
                typeFilters.some(filter => event.type.toLowerCase() === filter.toLowerCase())
            );
        }

        // Apply status filter - support multiple statuses
        if (selectedStatuses.length > 0 && !selectedStatuses.includes('all')) {
            filteredEvents = filteredEvents.filter(event =>
                selectedStatuses.includes(event.status)
            );
        }

        // Apply period filter
        if ((periodFilters.length > 0 && !periodFilters.includes('all')) || customDate || (dateStart && dateEnd)) {
            const todayStart = new Date(); 
            todayStart.setHours(0,0,0,0);
            const todayEnd = new Date(); 
            todayEnd.setHours(23,59,59,999);

            const startOfWeek = new Date(todayStart);
            startOfWeek.setDate(todayStart.getDate() - todayStart.getDay() + (todayStart.getDay() === 0 ? -6 : 1)); // Adjust to start on Monday

            const startOfMonth = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);

            filteredEvents = filteredEvents.filter(event => {
                const eventStartDate = new Date(event.startDate); 
                eventStartDate.setHours(0,0,0,0);
                const eventEndDate = new Date(event.endDate); 
                eventEndDate.setHours(23,59,59,999);

                // Custom date filter
                if (customDate) {
                    const filterDate = new Date(customDate);
                    filterDate.setHours(0,0,0,0);
                    const filterDateEnd = new Date(customDate);
                    filterDateEnd.setHours(23,59,59,999);
                    
                    return eventStartDate <= filterDateEnd && eventEndDate >= filterDate;
                }
                
                // Date range filter
                if (dateStart && dateEnd) {
                    const filterStart = new Date(dateStart);
                    filterStart.setHours(0,0,0,0);
                    const filterEnd = new Date(dateEnd);
                    filterEnd.setHours(23,59,59,999);
                    
                    return eventStartDate <= filterEnd && eventEndDate >= filterStart;
                }

                // Check if the event matches any of the selected period filters
                if (periodFilters.length > 0 && !periodFilters.includes('all')) {
                    return periodFilters.some(periodFilter => {
                switch (periodFilter) {
                    case 'today':
                        // Event happens today if its range includes today
                        return eventStartDate <= todayEnd && eventEndDate >= todayStart;
                    case 'week':
                        // Event happens this week if its range overlaps with the week
                                const endOfWeek = new Date(startOfWeek); 
                                endOfWeek.setDate(startOfWeek.getDate() + 6); 
                                endOfWeek.setHours(23,59,59,999);
                        return eventStartDate <= endOfWeek && eventEndDate >= startOfWeek;
                    case 'month':
                        // Event happens this month if its range overlaps with the month
                                const endOfMonth = new Date(todayStart.getFullYear(), todayStart.getMonth() + 1, 0); 
                                endOfMonth.setHours(23,59,59,999);
                        return eventStartDate <= endOfMonth && eventEndDate >= startOfMonth;
                    default:
                        return true;
                }
                    });
                }
                
                return true;
            });
        }

        renderAdminEventList(filteredEvents);
    }

    // Filter participants based on search and filter selections (updated)
     function filterParticipants(allParticipants = null, selectedSession = 'all') {
         const eventData = sampleAdminEvents.find(ev => ev.id === editingEventId);
         const participantsToFilter = allParticipants || eventData?.participants || [];

         const searchTerm = participantSearch.value.toLowerCase();

        // Get all selected presence filters
        const presenceFilters = Array.from(document.querySelectorAll('#presence-dropdown .filter-chip-option.selected'))
            .map(opt => opt.dataset.value);
            
        const currentSessionFilter = document.querySelector('#session-dropdown .filter-chip-option.selected')?.dataset.value || 'all';

         let filteredParticipants = [...participantsToFilter];

         // Apply search filter
         if (searchTerm) {
             filteredParticipants = filteredParticipants.filter(p =>
                 p.name.toLowerCase().includes(searchTerm) ||
                 p.email.toLowerCase().includes(searchTerm)
             );
         }

        // Apply presence filter with multiple selection support
        if (presenceFilters.length > 0 && !presenceFilters.includes('all')) {
             filteredParticipants = filteredParticipants.filter(p => {
                 let isPresentInContext = p.present; // Default to overall
                
                 if (currentSessionFilter !== 'all' && p.sessionPresence && p.sessionPresence[currentSessionFilter] !== undefined) {
                     isPresentInContext = p.sessionPresence[currentSessionFilter];
                 }
                
                // Check if participant presence status matches any of the selected filters
                return (presenceFilters.includes('present') && isPresentInContext) ||
                       (presenceFilters.includes('absent') && !isPresentInContext);
             });
         }

        renderParticipantList(filteredParticipants, currentSessionFilter);
     }

    // --- Event Listeners ---
    backToEventsBtn.addEventListener('click', () => showView('admin-list'));

    // Modal Triggers
    showCreateEventBtn.addEventListener('click', () => openModal(false)); // Open for creation
    closeModalBtn.addEventListener('click', closeModal);
    modalCancelBtn.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) { closeModal(); } // Close only if backdrop itself is clicked
    });
    modalPublishBtn.addEventListener('click', handlePublishEvent);

    // Modal Form Interactions
    modalEventTypeSelect.addEventListener('change', handleEventTypeChange);
    addSessionBtn.addEventListener('click', () => addSessionInput());

     // Admin Event List Table Actions (Event Delegation on TBODY)
     adminEventTbody.addEventListener('click', (e) => {
         const row = e.target.closest('tr');
         if (!row || row.classList.contains('no-pointer')) return; // Ignore clicks on empty state row

         const eventId = row.dataset.eventId;
         const targetButton = e.target.closest('.icon-button');
         const targetCheckbox = e.target.closest('input[type="checkbox"]');
         const targetLink = e.target.closest('.event-name'); // Click on name/icon area

         if (targetButton) {
             // --- Button Action ---
             e.stopPropagation(); // Prevent row click when clicking button
             const action = targetButton.dataset.action;
             const eventToActOn = sampleAdminEvents.find(ev => ev.id === eventId);

             if (action === 'edit') {
                 if (eventToActOn) {
                     openModal(true, eventToActOn); // Open modal in edit mode
                 }
             } else if (action === 'delete') {
                 if (confirm(`Tem certeza que deseja excluir o evento "${eventToActOn?.name || eventId}"?`)) {
                     sampleAdminEvents = sampleAdminEvents.filter(ev => ev.id !== eventId);
                     applyFiltersAndRender(); // Re-render list
                 }
             } else if (action === 'qr') {
                  if (eventToActOn) {
                     showQRCodeModal(eventToActOn);
                  }
             }
         } else if (targetCheckbox) {
             // --- Checkbox Action ---
             e.stopPropagation(); // Prevent row click when clicking checkbox
             console.log(`Checkbox for event ${eventId} clicked.`);
             // Add logic for selection state if needed
         } else if (targetLink || e.target === row || row.contains(e.target)) {
              // --- Row/Link Click Action (Navigate to Manage View) ---
             if (eventId) {
                 showView('admin-manage', eventId);
             }
         }
     });

      // Manage Event View Header Actions
     editCurrentEventBtn.addEventListener('click', () => {
         if (editingEventId) {
             const eventToEdit = sampleAdminEvents.find(ev => ev.id === editingEventId);
             if (eventToEdit) {
                 openModal(true, eventToEdit);
             }
         }
     });

     // Adicionar evento de clique para o botão de QR Code
     qrCurrentEventBtn.addEventListener('click', () => {
         if (editingEventId) {
             const eventToQR = sampleAdminEvents.find(ev => ev.id === editingEventId);
              if (eventToQR) {
                 showQRCodeModal(eventToQR);
             }
         }
     });

     // Manage Event Participants Table Actions (Event Delegation on TBODY)
     participantTbody.addEventListener('click', (e) => {
         const row = e.target.closest('tr');
          if (!row || row.classList.contains('no-pointer')) return;

         const participantId = row.dataset.participantId;
         const targetToggleInput = e.target.closest('.presence-toggle input');
         const targetDeleteBtn = e.target.closest('.action-button[title="Remover Participante"]');
         const targetCheckbox = e.target.closest('input[type="checkbox"]');

         const eventData = sampleAdminEvents.find(ev => ev.id === editingEventId);
         if (!eventData) return; // Should have event context

         const participantIndex = eventData.participants.findIndex(p => p.id === participantId);
          if (participantIndex === -1) return; // Participant not found


         if (targetToggleInput) {
             // --- Presence Toggle Action ---
             e.stopPropagation();
             const newPresence = targetToggleInput.checked;
             const sessionKey = targetToggleInput.dataset.session || 'all';

             console.log(`Toggled presence for participant ${participantId} to ${newPresence} for session ${sessionKey}`);

             // Update presence in the data model
             if (sessionKey === 'all' || eventData.sessions.length <= 1) {
                eventData.participants[participantIndex].present = newPresence;
                // Also update all session presences if toggling 'all' or single day
                if(eventData.participants[participantIndex].sessionPresence){
                    Object.keys(eventData.participants[participantIndex].sessionPresence).forEach(key => {
                        eventData.participants[participantIndex].sessionPresence[key] = newPresence;
                    });
                }
             } else if (eventData.participants[participantIndex].sessionPresence) {
                eventData.participants[participantIndex].sessionPresence[sessionKey] = newPresence;
                // Recalculate overall presence if any session presence changes
                eventData.participants[participantIndex].present = Object.values(eventData.participants[participantIndex].sessionPresence).some(present => present);
             }

              // Update main event attendance count display
              indicatorPresentes.textContent = eventData.participants.filter(p => p.present).length;
              // Also update the count in the main events list data
              const mainEventIndex = sampleAdminEvents.findIndex(ev => ev.id === editingEventId);
              if(mainEventIndex !== -1) {
                  sampleAdminEvents[mainEventIndex].attendance = eventData.participants.filter(p => p.present).length;
              }

              // Re-apply participant filters AFTER updating data
              filterParticipants(eventData.participants, sessionKey);

         } else if (targetDeleteBtn) {
             // --- Delete Participant Action ---
             e.stopPropagation();
              if (confirm(`Remover o participante "${eventData.participants[participantIndex]?.name || participantId}"?`)) {
                 // Remove from the event's participant list
                 eventData.participants.splice(participantIndex, 1);

                 // Update counts in the event data
                 eventData.registrations = eventData.participants.length;
                 eventData.attendance = eventData.participants.filter(p => p.present).length;

                 // Update counts in the header display
                 indicatorInscritos.textContent = eventData.registrations;
                 indicatorPresentes.textContent = eventData.attendance;

                  // Update the main event list data
                  const mainEventIndex = sampleAdminEvents.findIndex(ev => ev.id === editingEventId);
                  if(mainEventIndex !== -1) {
                     sampleAdminEvents[mainEventIndex].registrations = eventData.registrations;
                     sampleAdminEvents[mainEventIndex].attendance = eventData.attendance;
                  }

                 // Re-render participant list with filters
                 filterParticipants(eventData.participants);
             }
         } else if (targetCheckbox) {
             // --- Checkbox Action ---
             e.stopPropagation();
             console.log(`Checkbox for participant ${participantId} clicked.`);
             // Add selection logic if needed
         }
         // No action if clicking elsewhere on the participant row for now
     });


    // Add listener for participant search input
    participantSearch.addEventListener('input', () => filterParticipants());

    // Filtering Listeners
    adminEventSearch.addEventListener('input', applyFiltersAndRender);

    // --- Filter Chip Management ---
    const filterChipContainers = document.querySelectorAll('.filter-chip-container, .filter-session-container'); // Include session container

    // Close all dropdowns
    function closeAllFilterDropdowns(exceptDropdown = null) {
        console.log('Closing all dropdowns except:', exceptDropdown?.id); // Diagnóstico
        filterChipContainers.forEach(container => {
            const dropdown = container.querySelector('.filter-chip-dropdown');
            const chip = container.querySelector('.filter-chip');
            if (dropdown && dropdown !== exceptDropdown) {
                console.log('Closing dropdown:', dropdown.id); // Diagnóstico
                dropdown.classList.remove('show');
                 if(chip) chip.classList.remove('selected'); // Deselect chip when closing dropdown
            }
        });
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            // Verificando se o clique foi fora dos containers de filtro e dropdowns
            if (!e.target.closest('.filter-chip-container') && 
                !e.target.closest('.filter-session-container') && 
                !e.target.closest('.filter-chip-dropdown')) {
                
                console.log('Click outside detected, closing all dropdowns'); // Diagnóstico
                closeAllFilterDropdowns();
            }
        }, { once: true }); // Use once: true para evitar múltiplos listeners
    }

    // Handle chip click
    filterChipContainers.forEach(container => {
        const chip = container.querySelector('.filter-chip');
        const dropdown = container.querySelector('.filter-chip-dropdown');

        if (chip && dropdown) {
            chip.addEventListener('click', (e) => {
                console.log('Filter chip clicked:', chip.dataset.filter); // Diagnóstico
                e.stopPropagation();
                const isCurrentlyOpen = dropdown.classList.contains('show');
                closeAllFilterDropdowns(dropdown); // Close others first
                if (!isCurrentlyOpen) {
                    dropdown.classList.add('show');
                    chip.classList.add('selected'); // Select chip when opening dropdown
                    console.log('Dropdown opened:', dropdown.id); // Diagnóstico
                } else {
                    console.log('Dropdown closed (was already open)'); // Diagnóstico
                }
                // If it was already open, closeAllFilterDropdowns already closed it.
            });
        } else {
            console.log('Missing chip or dropdown in container:', container); // Diagnóstico
        }
    });

    // Handle option selection within dropdowns (excluding session options, handled separately)
    document.querySelectorAll('.filter-chip-dropdown:not(#session-dropdown) .filter-chip-option').forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdown = option.closest('.filter-chip-dropdown');
            const chipContainer = dropdown.closest('.filter-chip-container');
            const chip = chipContainer?.querySelector('.filter-chip');
            const filterType = chip?.dataset.filter;
            const value = option.dataset.value;

            if (!dropdown || !chip || !filterType) return;

            // Determine if multi-select is enabled for this filter type
            const isMultiSelect = ['status', 'type', 'presence'].includes(filterType);
            
            // Special case for 'all' option - always single select
            if (value === 'all') {
                // If 'all' is selected, deselect all other options
                dropdown.querySelectorAll('.filter-chip-option').forEach(opt => {
                    if (opt.dataset.value !== 'all') {
                        opt.classList.remove('selected');
                    } else {
                        opt.classList.add('selected');
                    }
                });
            } else if (isMultiSelect) {
                // Multi-selection logic
                option.classList.toggle('selected');
                
                // If this isn't 'all', deselect the 'all' option
                const allOption = dropdown.querySelector('.filter-chip-option[data-value="all"]');
                if (allOption) {
                    allOption.classList.remove('selected');
                }
                
                // Check if any option is selected
                 const anySelected = dropdown.querySelector('.filter-chip-option.selected');
                if (!anySelected) {
                    // If no option is selected, select the 'all' option
                    if (allOption) allOption.classList.add('selected');
                }

                // Keep chip highlighted if any option is selected
                chip.classList.toggle('selected', !!dropdown.querySelector('.filter-chip-option.selected'));
            } else {
                // Single selection logic
                dropdown.querySelectorAll('.filter-chip-option').forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                 chip.classList.add('selected'); // Ensure chip stays selected
                closeAllFilterDropdowns(); // Close dropdown after single selection
            }

             // Determine where to apply filter
             if (filterType === 'presence') {
                 filterParticipants(); // Filter participants list
             } else {
                 applyFiltersAndRender(); // Filter admin events list
             }
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
         if (!e.target.closest('.filter-chip-container') && !e.target.closest('.filter-session-container') && !e.target.closest('.filter-chip-dropdown')) {
             closeAllFilterDropdowns();
         }
     });

     // Session chip listener (specific logic already attached in loadEventDetails)
     if (dayChip) {
         dayChip.addEventListener('click', (e) => {
             e.stopPropagation();
             const dropdown = document.getElementById('session-dropdown');
             const isCurrentlyOpen = dropdown.classList.contains('show');
             closeAllFilterDropdowns(dropdown); // Close others
             if (!isCurrentlyOpen) {
                 dropdown.classList.add('show');
                 dayChip.classList.add('selected');
             }
         });
     }


    // --- QR Code Modal Listeners ---
    closeQrModalBtn.addEventListener('click', hideQRCodeModal);
    copySvgBtn.addEventListener('click', copySVG);
    printQrBtn.addEventListener('click', printQRCode);
    qrCodeModal.addEventListener('click', (e) => { // Close on backdrop click
         if (e.target === qrCodeModal) {
             hideQRCodeModal();
         }
     });


    // --- Initial Load ---
     applyFiltersAndRender(); // Render initial list with default filters
     showView('admin-list'); // Show the initial view

}); // End DOMContentLoaded


// === QR Code Modal Functions ===
function showQRCodeModal(event) {
    if (!event || !event.sessions || event.sessions.length === 0) {
        console.error('Evento inválido ou sem sessões');
        return;
    }

    // Criar URL completa para o check-in
    const baseUrl = window.location.href.split('/').slice(0, -1).join('/');
    const checkinUrl = `${baseUrl}/checkin.html?eventId=${event.id}&sessionId=${event.sessions[0].id}`;

    // Salva a lista de eventos para que a página de check-in possa acessar
    try {
        localStorage.setItem('events', JSON.stringify(sampleAdminEvents));
    } catch (err) {
        console.error('Falha ao salvar eventos no localStorage:', err);
    }
    
    console.log('Gerando QR Code para URL:', checkinUrl);
    
    // Limpar container anterior
    const qrCodeDisplay = document.getElementById('qr-code-display');
    qrCodeDisplay.innerHTML = '';
    
    // Gerar QR Code
    new QRCode(qrCodeDisplay, {
        text: checkinUrl,
        width: 256,
        height: 256,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
    
    // Mostrar o modal
    document.getElementById('qr-code-modal').classList.remove('hidden');
    
    // Configurar botões
    setupQRCodeActions(checkinUrl, event.name);
}

function setupQRCodeActions(checkinUrl, eventName) {
    // Configurar botão de cópia
    const copyButton = document.getElementById('copy-qr-btn');
    copyButton.onclick = async function() {
        try {
            await navigator.clipboard.writeText(checkinUrl);
            alert('Link do QR Code copiado para a área de transferência!');
        } catch (err) {
            console.error('Erro ao copiar:', err);
            alert('Não foi possível copiar o link. Por favor, tente novamente.');
        }
    };
    
    // Configurar botão de impressão
    const printButton = document.getElementById('print-qr-btn');
    printButton.onclick = function() {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>QR Code - ${eventName}</title>
                <style>
                    body { 
                        margin: 0; 
                        display: flex; 
                        flex-direction: column; 
                        align-items: center; 
                        padding: 40px; 
                        font-family: Arial, sans-serif;
                    }
                    h1 { 
                        font-size: 24px; 
                        margin-bottom: 20px; 
                        color: #333;
                    }
                    .qr-container { 
                        padding: 20px; 
                        background: #fff; 
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1); 
                        border-radius: 8px;
                    }
                    .qr-code { 
                        width: 256px; 
                        height: 256px;
                    }
                    .info { 
                        margin-top: 20px; 
                        color: #666; 
                        font-size: 14px;
                        text-align: center;
                    }
                </style>
            </head>
            <body>
                <h1>QR Code - ${eventName}</h1>
                <div class="qr-container">
                    ${document.getElementById('qr-code-display').innerHTML}
                </div>
                <p class="info">
                    Escaneie este QR Code para registrar presença no evento.<br>
                    <small>${checkinUrl}</small>
                </p>
                <script>
                    window.onload = () => {
                        window.print();
                        window.close();
                    };
                </script>
            </body>
            </html>
        `);
    };
}

function hideQRCodeModal() {
    const modal = document.getElementById('qr-code-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.style.overflow = ''; // Restaura o scroll da página
}

function generateQRCodeSVG(url) { // Simulação visual
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("viewBox", "0 0 29 29");
    svg.setAttribute("fill", "none");
    svg.setAttribute("aria-label", `QR Code para: ${url}`); // Accessibility

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("fill-rule", "evenodd");
    path.setAttribute("clip-rule", "evenodd");
    // Simple visual pattern - NOT A REAL QR CODE
    path.setAttribute("d", "M0 0H9V1H1V9H0V0ZM28 0H19V1H27V9H28V0ZM0 28V19H1V27H9V28H0ZM28 28H19V27H27V19H28V28ZM3 3H7V7H3V3ZM22 3H26V7H22V3ZM3 22H7V26H3V22ZM13 16H16V13H13V10H10V13H7V10H4V13H10V16H13ZM19 13H16V16H19V13ZM22 19H25V22H22V19ZM19 19H10V22H13V25H16V22H19V19ZM22 10H25V13H22V10ZM19 7H13V4H10V7H7V10H10V7H13V10H16V7H19Z");
    path.setAttribute("fill", "black");

    svg.appendChild(path);
    return svg;
}

function copySVG() {
     const svgElement = document.querySelector('#qr-code-modal .qr-code-image svg');
     if (!svgElement) {
        console.error("SVG element not found for copying.");
        return;
    };

     // Serialize o SVG para string
     const serializer = new XMLSerializer();
     const svgString = serializer.serializeToString(svgElement);

     navigator.clipboard.writeText(svgString).then(() => {
         alert('Código SVG do QR Code copiado para a área de transferência.');
     }).catch(err => {
         console.error('Erro ao copiar SVG via Clipboard API:', err);
         // Fallback para textarea (menos seguro, pode falhar em alguns contextos)
         try {
            const textarea = document.createElement('textarea');
            textarea.value = svgString;
            textarea.style.position = 'fixed'; // Prevent scrolling
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            alert('Código SVG do QR Code copiado (Fallback).');
         } catch (fallbackErr) {
             console.error('Erro ao copiar SVG via fallback:', fallbackErr);
             alert('Não foi possível copiar o SVG automaticamente. Tente manualmente.');
         }
     });
 }

 function printQRCode() {
     const qrCodeImageContainer = document.querySelector('#qr-code-modal .qr-code-image');
     if (!qrCodeImageContainer) return;
     const qrCodeHTML = qrCodeImageContainer.innerHTML; // Get the SVG string

     const eventTitle = document.querySelector('#qr-code-modal .qr-code-header h3')?.textContent || 'QR Code de Presença';
     const currentEventName = document.getElementById('manage-event-title')?.textContent || ''; // Get name if on manage view

     const printWindow = window.open('', '_blank', 'height=600,width=800');

     printWindow.document.write(`
         <!DOCTYPE html>
         <html lang="pt-br">
         <head>
             <meta charset="UTF-8">
             <title>Imprimir QR Code - ${currentEventName}</title>
             <style>
                 @media print {
                    body { margin: 20mm; font-family: sans-serif; }
                    .print-container { text-align: center; }
                    h1 { font-size: 18pt; margin-bottom: 10mm; }
                    .qr-code { width: 80mm; height: 80mm; margin: 0 auto 10mm auto; }
                    .qr-code svg { width: 100%; height: 100%; }
                    p { font-size: 12pt; color: #555; }
                    @page { size: A4; margin: 20mm; }
                 }
                 /* Estilo para visualização antes de imprimir */
                 body { font-family: sans-serif; padding: 20px; }
                 .print-container { text-align: center; max-width: 210mm; margin: auto; border: 1px dashed #ccc; padding: 20px; }
                 h1 { font-size: 1.5em; margin-bottom: 20px; }
                  .qr-code { width: 200px; height: 200px; margin: 0 auto 20px auto; }
                 .qr-code svg { width: 100%; height: 100%; }
                 p { color: #555; }

             </style>
         </head>
         <body>
             <div class="print-container">
                 <h1>${currentEventName || eventTitle}</h1>
                 <div class="qr-code">${qrCodeHTML}</div>
                 <p>Escaneie este código para registrar sua presença.</p>
             </div>
             <script>
                 window.onload = function() {
                     // Pequeno delay para garantir que o SVG renderize
                     setTimeout(function() {
                         window.print();
                         window.setTimeout(function() { window.close(); }, 100); // Fecha após imprimir
                     }, 250);
                 };
             </script>
         </body>
         </html>
     `);
     printWindow.document.close(); // Necessário para FF
 }