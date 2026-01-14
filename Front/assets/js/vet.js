/* ============================================
   AgriSmart - Fonctionnalités Vétérinaire
   ============================================ */

// Variables pour les statistiques
let pendingCount = 0;
let completedCount = 0;
let messagesCount = 0;
let reclamationsCount = 0;

// Onglet actif
let currentTab = 'consultations';

// Filtre consultations actif
let currentFilter = 'pending';

// Cache des consultations
let allConsultations = [];

// Initialisation de la page vétérinaire
document.addEventListener('DOMContentLoaded', async function () {
    // Vérifier l'authentification
    const user = getCurrentUser();

    if (!user) {
        showAlert('Veuillez vous connecter', 'error');
        setTimeout(() => window.location.href = 'login.html', 2000);
        return;
    }

    if (user.role !== 'vet') {
        showAlert('Accès réservé aux vétérinaires', 'error');
        setTimeout(() => window.location.href = 'index.html', 2000);
        return;
    }

    if (user.status !== 'accepted') {
        showAlert('Votre compte n\'est pas encore activé', 'error');
        setTimeout(() => window.location.href = 'login.html', 2000);
        return;
    }

    // Initialiser l'indicateur de tab
    updateTabIndicator();

    // Charger les données en parallèle
    await Promise.all([
        loadAllConsultations(),
        loadVetMessages(),
        loadVetReclamations()
    ]);
    
    updateStatsDisplay(); // Mettre à jour les statistiques affichées

    // Event listeners
    const responseForm = document.getElementById('responseForm');
    if (responseForm) {
        responseForm.addEventListener('submit', submitResponse);
    }

    // Modal close
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', function () {
            this.closest('.modal').style.display = 'none';
        });
    });

    // Gestion du hash dans l'URL pour navigation directe
    if (window.location.hash) {
        const tab = window.location.hash.replace('#', '');
        if (['consultations', 'messages', 'reclamations'].includes(tab)) {
            switchVetTab(tab, false);
        } else if (tab === 'pending' || tab === 'completed') {
            // Rediriger vers consultations avec le bon filtre
            switchVetTab('consultations', false);
            filterConsultations(tab);
        }
    }
});

// Fonction pour basculer entre les onglets avec animation fluide
function switchVetTab(tabName, updateHash = true) {
    // Éviter les transitions inutiles
    if (tabName === currentTab) return;

    const tabs = document.querySelectorAll('.vet-tab');
    const panels = document.querySelectorAll('.vet-panel');
    const currentPanel = document.getElementById(`panel-${currentTab}`);
    const newPanel = document.getElementById(`panel-${tabName}`);

    if (!newPanel) return;

    // Mettre à jour les tabs actifs
    tabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
        }
    });

    // Animation de sortie du panel actuel
    if (currentPanel) {
        currentPanel.classList.add('exiting');
        currentPanel.classList.remove('active');
    }

    // Animation d'entrée du nouveau panel
    newPanel.classList.add('entering');
    
    // Après un court délai, activer le nouveau panel
    setTimeout(() => {
        panels.forEach(panel => {
            panel.classList.remove('exiting', 'entering');
        });
        newPanel.classList.add('active');
    }, 300);

    // Mettre à jour l'indicateur
    updateTabIndicator(tabName);

    // Mettre à jour l'onglet actif
    currentTab = tabName;

    // Mettre à jour l'URL sans recharger la page
    if (updateHash) {
        history.replaceState(null, null, `#${tabName}`);
    }
}

// Mettre à jour la position de l'indicateur de tab
function updateTabIndicator(tabName = 'pending') {
    const indicator = document.querySelector('.vet-tab-indicator');
    const activeTab = document.querySelector(`.vet-tab[data-tab="${tabName}"]`);
    
    if (indicator && activeTab) {
        const tabRect = activeTab.getBoundingClientRect();
        const containerRect = activeTab.parentElement.getBoundingClientRect();
        
        indicator.style.width = `${tabRect.width}px`;
        indicator.style.transform = `translateX(${tabRect.left - containerRect.left}px)`;
    }
}

// Exposer la fonction globalement
window.switchVetTab = switchVetTab;

// Mettre à jour l'affichage des statistiques (badges dans les onglets)
function updateStatsDisplay() {
    const pendingEl = document.getElementById('pendingCount');
    const completedEl = document.getElementById('completedCount');
    const messagesEl = document.getElementById('messagesCount');
    const reclamationsEl = document.getElementById('reclamationsCount');
    const totalConsultationsEl = document.getElementById('totalConsultationsCount');
    
    // Total consultations en attente pour le badge principal
    if (totalConsultationsEl) {
        totalConsultationsEl.textContent = pendingCount;
        totalConsultationsEl.classList.remove('pulse');
        void totalConsultationsEl.offsetWidth;
        totalConsultationsEl.classList.add('pulse');
        totalConsultationsEl.style.display = pendingCount > 0 ? 'flex' : 'none';
    }

    if (pendingEl) {
        pendingEl.textContent = pendingCount;
        // Animation de pulsation si le nombre change
        pendingEl.classList.remove('pulse');
        void pendingEl.offsetWidth; // Force reflow
        pendingEl.classList.add('pulse');
        // Masquer le badge si 0
        pendingEl.style.display = pendingCount > 0 ? 'flex' : 'none';
    }
    if (completedEl) {
        completedEl.textContent = completedCount;
        completedEl.classList.remove('pulse');
        void completedEl.offsetWidth;
        completedEl.classList.add('pulse');
        completedEl.style.display = completedCount > 0 ? 'flex' : 'none';
    }
    if (messagesEl) {
        messagesEl.textContent = messagesCount;
        messagesEl.classList.remove('pulse');
        void messagesEl.offsetWidth;
        messagesEl.classList.add('pulse');
        messagesEl.style.display = messagesCount > 0 ? 'flex' : 'none';
    }
    if (reclamationsEl) {
        reclamationsEl.textContent = reclamationsCount;
        reclamationsEl.classList.remove('pulse');
        void reclamationsEl.offsetWidth;
        reclamationsEl.classList.add('pulse');
        reclamationsEl.style.display = reclamationsCount > 0 ? 'flex' : 'none';
    }
}

// Charger les consultations en attente
async function loadPendingConsultations() {
    try {
        const user = getCurrentUser();
        const userId = user?.id || user?._id;
        if (!userId) {
            console.error('ID utilisateur non trouvé');
            return;
        }
        const response = await fetch(`http://localhost:3000/api/consultations?vetId=${userId}`);

        if (!response.ok) throw new Error('Erreur lors du chargement');

        const consultations = await response.json();
        const pending = consultations.filter(c => c.status === 'en_attente' || c.status === 'en_cours');

        // Mettre à jour le compteur
        pendingCount = pending.length;

        const container = document.getElementById('pendingConsultations');
        if (!container) return;

        if (pending.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem 2rem; background: linear-gradient(135deg, rgba(5, 150, 105, 0.06) 0%, rgba(16, 185, 129, 0.04) 100%); border-radius: 20px; border: 2px dashed rgba(5, 150, 105, 0.25);">
                    <i class="fa-solid fa-clipboard-check" style="font-size: 3.5rem; color: #059669; margin-bottom: 1rem; opacity: 0.7;"></i>
                    <p style="color: #1a252f; font-size: 1.15rem; margin: 0; font-weight: 600;">Aucune consultation en attente</p>
                    <p style="color: #666; font-size: 0.95rem; margin-top: 0.5rem;">Vous êtes à jour ! 🎉</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th><i class="fa-solid fa-calendar"></i> Date</th>
                        <th><i class="fa-solid fa-user"></i> Agriculteur</th>
                        <th><i class="fa-solid fa-paw"></i> Moutons</th>
                        <th><i class="fa-solid fa-file-lines"></i> Description</th>
                        <th><i class="fa-solid fa-video"></i> Vidéo</th>
                        <th><i class="fa-solid fa-circle-info"></i> Statut</th>
                        <th><i class="fa-solid fa-gear"></i> Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${pending.map(c => `
                        <tr>
                            <td>${formatDate(c.createdAt)}</td>
                            <td>
                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <i class="fa-solid fa-user-tie" style="color: #059669;"></i>
                                    ${c.farmerId?.name || 'Inconnu'}
                                </div>
                            </td>
                            <td>
                                <span style="background: linear-gradient(135deg, rgba(5, 150, 105, 0.12) 0%, rgba(16, 185, 129, 0.08) 100%); padding: 0.4rem 0.9rem; border-radius: 20px; font-weight: 600; color: #059669;">
                                    ${c.sheepIds?.length || 0} mouton(s)
                                </span>
                            </td>
                            <td>${c.description.substring(0, 50)}...</td>
                            <td>${c.video ? `<button onclick="openVideoModal('http://localhost:3000${c.video}')" style="color: #059669; background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 0.3rem; font-weight: 500; font-size: inherit;"><i class="fa-solid fa-play-circle"></i> Voir</button>` : '<span style="color: #999;">Aucune</span>'}</td>
                            <td><span class="badge badge-${c.status === 'en_attente' ? 'warning' : 'info'}">${getStatusLabel(c.status)}</span></td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="openConsultation('${c._id}')" style="display: flex; align-items: center; gap: 0.3rem;">
                                    <i class="fa-solid fa-reply"></i> Répondre
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Erreur:', error);
        const container = document.getElementById('pendingConsultations');
        if (container) container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #e74c3c;">
                <i class="fa-solid fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
                <p>Erreur lors du chargement des consultations.</p>
            </div>
        `;
    }
}

// Charger les consultations terminées
async function loadCompletedConsultations() {
    try {
        const user = getCurrentUser();
        const userId = user?.id || user?._id;
        if (!userId) {
            console.error('ID utilisateur non trouvé');
            return;
        }
        const response = await fetch(`http://localhost:3000/api/consultations?vetId=${userId}`);

        if (!response.ok) throw new Error('Erreur lors du chargement');

        const consultations = await response.json();
        const completed = consultations.filter(c => c.status === 'terminée' || c.status === 'annulée');

        // Mettre à jour le compteur
        completedCount = completed.length;

        const container = document.getElementById('completedConsultations');
        if (!container) return;

        if (completed.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem 2rem; background: linear-gradient(135deg, rgba(5, 150, 105, 0.06) 0%, rgba(52, 211, 153, 0.04) 100%); border-radius: 20px; border: 2px dashed rgba(5, 150, 105, 0.25);">
                    <i class="fa-solid fa-folder-open" style="font-size: 3.5rem; color: #059669; margin-bottom: 1rem; opacity: 0.7;"></i>
                    <p style="color: #1a252f; font-size: 1.15rem; margin: 0; font-weight: 600;">Aucune consultation traitée pour le moment</p>
                    <p style="color: #666; font-size: 0.95rem; margin-top: 0.5rem;">L'historique apparaîtra ici</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th><i class="fa-solid fa-calendar"></i> Date</th>
                        <th><i class="fa-solid fa-user"></i> Agriculteur</th>
                        <th><i class="fa-solid fa-paw"></i> Moutons</th>
                        <th><i class="fa-solid fa-comment-medical"></i> Ma Réponse</th>
                        <th><i class="fa-solid fa-calendar-check"></i> Date Réponse</th>
                        <th><i class="fa-solid fa-circle-info"></i> Statut</th>
                    </tr>
                </thead>
                <tbody>
                    ${completed.map(c => `
                        <tr>
                            <td>${formatDate(c.createdAt)}</td>
                            <td>
                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <i class="fa-solid fa-user-tie" style="color: #059669;"></i>
                                    ${c.farmerId?.name || 'Inconnu'}
                                </div>
                            </td>
                            <td>
                                <span style="background: linear-gradient(135deg, rgba(5, 150, 105, 0.12) 0%, rgba(52, 211, 153, 0.08) 100%); padding: 0.4rem 0.9rem; border-radius: 20px; font-weight: 600; color: #059669;">
                                    ${c.sheepIds?.length || 0} mouton(s)
                                </span>
                            </td>
                            <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${c.vetResponse ? c.vetResponse.substring(0, 50) + '...' : '<span style="color: #999;">N/A</span>'}</td>
                            <td>${c.responseDate ? formatDate(c.responseDate) : '<span style="color: #999;">N/A</span>'}</td>
                            <td><span class="badge badge-${c.status === 'terminée' ? 'success' : 'danger'}">${getStatusLabel(c.status)}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Erreur:', error);
        const container = document.getElementById('completedConsultations');
        if (container) container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #e74c3c;">
                <i class="fa-solid fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
                <p>Erreur lors du chargement des consultations.</p>
            </div>
        `;
    }
}

// Stocker les consultations pour accès rapide
let consultationsCache = [];

// Ouvrir une consultation pour répondre
async function openConsultation(id) {
    try {
        const response = await fetch(`http://localhost:3000/api/consultations/${id}`);
        if (!response.ok) throw new Error('Consultation non trouvée');

        const consultation = await response.json();

        document.getElementById('consultationId').value = id;
        document.getElementById('vetResponse').value = consultation.vetResponse || '';
        document.getElementById('consultationStatus').value = consultation.status === 'terminée' ? 'terminée' : 'en_cours';

        // Afficher les détails
        const detailsDiv = document.getElementById('consultationDetails');
        detailsDiv.innerHTML = `
            <p><strong>Agriculteur:</strong> ${consultation.farmerId?.name || 'Inconnu'}</p>
            <p><strong>Date:</strong> ${formatDate(consultation.createdAt)}</p>
            <p><strong>Moutons concernés:</strong> ${consultation.sheepIds?.length || 0}</p>
            <p><strong>Description du problème:</strong></p>
            <p style="background: white; padding: 10px; border-radius: 5px;">${consultation.description}</p>
            ${consultation.video ? `<p><strong>Vidéo:</strong> <button onclick="openVideoModal('http://localhost:3000${consultation.video}')" style="background: none; border: none; color: #059669; cursor: pointer; font-size: inherit; display: inline-flex; align-items: center; gap: 0.3rem;"><i class="fa-solid fa-video"></i> Voir la vidéo</button></p>` : ''}
        `;

        document.getElementById('consultationModal').style.display = 'block';
    } catch (error) {
        console.error('Erreur:', error);
        showAlert('Erreur: ' + error.message, 'error');
    }
}

// Soumettre la réponse
async function submitResponse(e) {
    e.preventDefault();

    const id = document.getElementById('consultationId').value;
    const vetResponse = document.getElementById('vetResponse').value;
    const status = document.getElementById('consultationStatus').value;

    if (!vetResponse.trim()) {
        showAlert('Veuillez entrer une réponse', 'error');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/consultations/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                vetResponse: vetResponse.trim(),
                status: status
            })
        });

        if (!response.ok) throw new Error('Erreur lors de la mise à jour');

        showAlert('Réponse envoyée avec succès !', 'success');
        document.getElementById('consultationModal').style.display = 'none';

        await loadPendingConsultations();
        await loadCompletedConsultations();
        updateStatsDisplay(); // Mettre à jour les statistiques
    } catch (error) {
        console.error('Erreur:', error);
        showAlert('Erreur: ' + error.message, 'error');
    }
}

// Labels de statut
function getStatusLabel(status) {
    const labels = {
        'en_attente': 'En attente',
        'en_cours': 'En cours',
        'terminée': 'Terminée',
        'annulée': 'Annulée'
    };
    return labels[status] || status;
}

// Charger les messages du vétérinaire
async function loadVetMessages() {
    try {
        const user = getCurrentUser();
        const userId = user?.id || user?._id;
        if (!user || !userId) {
            console.error('❌ Utilisateur non connecté');
            return;
        }

        console.log('📥 Chargement des messages pour le vétérinaire:', userId);

        // Utiliser le paramètre type=received pour ne récupérer que les messages reçus
        const apiUrl = (typeof API_BASE_URL !== 'undefined' && API_BASE_URL) ? API_BASE_URL : 'http://localhost:3000/api';
        const response = await fetch(`${apiUrl}/messages?userId=${userId}&type=received`, {
            headers: getHeaders()
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Erreur réponse:', errorText);
            throw new Error('Erreur lors du chargement des messages');
        }

        const messages = await response.json();
        console.log(`✅ ${messages.length} messages reçus trouvés`);

        // Filtrer pour s'assurer que ce sont bien des messages reçus (double vérification)
        const receivedMessages = messages.filter(m => {
            if (!m.receiverId) return false;
            const receiverId = m.receiverId._id || m.receiverId.id || m.receiverId;
            const currentUserId = user.id || user._id;
            return String(receiverId) === String(currentUserId);
        });

        console.log(`✅ ${receivedMessages.length} messages reçus après filtrage`);

        // Mettre à jour le compteur
        messagesCount = receivedMessages.length;

        const vetMessagesContainer = document.getElementById('vetMessages');
        if (!vetMessagesContainer) {
            console.warn('⚠️ Élément vetMessages non trouvé dans le HTML');
            return;
        }

        if (receivedMessages.length === 0) {
            vetMessagesContainer.innerHTML = `
                <div style="text-align: center; padding: 3rem 2rem; background: linear-gradient(135deg, rgba(99, 102, 241, 0.06) 0%, rgba(139, 92, 246, 0.04) 100%); border-radius: 20px; border: 2px dashed rgba(99, 102, 241, 0.25);">
                    <i class="fa-solid fa-inbox" style="font-size: 3.5rem; color: #6366f1; margin-bottom: 1rem; opacity: 0.7;"></i>
                    <p style="color: #1a252f; font-size: 1.15rem; margin: 0; font-weight: 600;">Aucun message reçu</p>
                    <p style="color: #666; font-size: 0.95rem; margin-top: 0.5rem;">Votre boîte de réception est vide</p>
                </div>
            `;
            return;
        }

        vetMessagesContainer.innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th><i class="fa-solid fa-user"></i> De</th>
                        <th><i class="fa-solid fa-tag"></i> Sujet</th>
                        <th><i class="fa-solid fa-calendar"></i> Date</th>
                        <th><i class="fa-solid fa-circle-info"></i> Statut</th>
                        <th><i class="fa-solid fa-gear"></i> Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${receivedMessages.map(m => {
            const senderName = m.senderId?.name || m.senderId?.username || 'Inconnu';
            const senderRole = m.senderId?.role || 'N/A';
            const roleLabel = senderRole === 'farmer' ? 'Agriculteur' : senderRole === 'consumer' ? 'Consommateur' : senderRole;
            return `
                        <tr style="${!m.isRead ? 'background: rgba(99, 102, 241, 0.05);' : ''}">
                            <td>
                                <div style="display: flex; align-items: center; gap: 0.6rem;">
                                    <i class="fa-solid fa-${senderRole === 'farmer' ? 'tractor' : 'user'}" style="color: #6366f1;"></i>
                                    <div>
                                        <strong style="color: #1a252f;">${senderName}</strong>
                                        <div style="font-size: 0.8rem; color: #888;">${roleLabel}</div>
                                    </div>
                                </div>
                            </td>
                            <td style="font-weight: ${!m.isRead ? '600' : '400'}; color: #1a252f;">${m.subject}</td>
                            <td>${formatDate(m.createdAt)}</td>
                            <td>${m.isRead 
                                ? '<span style="color: #059669;"><i class="fa-solid fa-check-double"></i> Lu</span>' 
                                : '<span style="color: #f59e0b; font-weight: 600;"><i class="fa-solid fa-envelope"></i> Non lu</span>'}</td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="viewVetMessage('${m._id}')" style="display: flex; align-items: center; gap: 0.4rem;">
                                    <i class="fa-solid fa-eye"></i> Voir
                                </button>
                            </td>
                        </tr>
                    `;
        }).join('')}
                </tbody>
            </table>
        `;

    } catch (error) {
        console.error('❌ Erreur lors du chargement des messages:', error);
        const vetMessagesContainer = document.getElementById('vetMessages');
        if (vetMessagesContainer) {
            vetMessagesContainer.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #e74c3c;">
                    <i class="fa-solid fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
                    <p>Erreur lors du chargement des messages.</p>
                </div>
            `;
        }
    }
}

// Voir un message détaillé
async function viewVetMessage(messageId) {
    try {
        const apiUrl = (typeof API_BASE_URL !== 'undefined' && API_BASE_URL) ? API_BASE_URL : 'http://localhost:3000/api';
        const response = await fetch(`${apiUrl}/messages/${messageId}`, {
            headers: getHeaders()
        });

        if (!response.ok) throw new Error('Message non trouvé');

        const message = await response.json();

        // Afficher le message dans un modal ou une alerte
        const messageText = `
            De: ${message.senderId?.name || 'Inconnu'} (${message.senderId?.role || 'N/A'})
            Sujet: ${message.subject}
            Date: ${formatDate(message.createdAt)}
            
            Message:
            ${message.message}
        `;

        alert(messageText);

        // Marquer comme lu
        if (!message.isRead) {
            const apiUrl = (typeof API_BASE_URL !== 'undefined' && API_BASE_URL) ? API_BASE_URL : 'http://localhost:3000/api';
            await fetch(`${apiUrl}/messages/${messageId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...getHeaders()
                },
                body: JSON.stringify({ isRead: true })
            });
            await loadVetMessages(); // Recharger la liste
        }

    } catch (error) {
        console.error('Erreur:', error);
        showAlert('Erreur: ' + error.message, 'error');
    }
}

// Charger les réclamations du vétérinaire
async function loadVetReclamations() {
    try {
        const user = getCurrentUser();
        const userId = user?.id || user?._id;
        if (!user || !userId) {
            console.error('❌ Utilisateur non connecté');
            return;
        }

        console.log('📥 Chargement des réclamations pour le vétérinaire:', userId);

        const apiUrl = (typeof API_BASE_URL !== 'undefined' && API_BASE_URL) ? API_BASE_URL : 'http://localhost:3000/api';
        const response = await fetch(`${apiUrl}/reclamations?userId=${userId}&role=${user.role}`);

        if (!response.ok) {
            throw new Error('Erreur lors du chargement des réclamations');
        }

        const reclamations = await response.json();
        console.log(`✅ ${reclamations.length} réclamations trouvées`);

        // Mettre à jour le compteur
        reclamationsCount = reclamations.length;

        const container = document.getElementById('vetReclamations');
        if (!container) {
            console.warn('⚠️ Élément vetReclamations non trouvé dans le HTML');
            return;
        }

        if (reclamations.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem 2rem; background: linear-gradient(135deg, rgba(239, 68, 68, 0.06) 0%, rgba(248, 113, 113, 0.04) 100%); border-radius: 20px; border: 2px dashed rgba(239, 68, 68, 0.25);">
                    <i class="fa-solid fa-clipboard-list" style="font-size: 3.5rem; color: #ef4444; margin-bottom: 1rem; opacity: 0.7;"></i>
                    <p style="color: #1a252f; font-size: 1.15rem; margin: 0; font-weight: 600;">Aucune réclamation</p>
                    <p style="color: #666; font-size: 0.95rem; margin-top: 0.5rem;">Vous n'avez pas encore créé de réclamation</p>
                </div>
            `;
            return;
        }

        const statusLabels = {
            'en_attente': 'En attente',
            'en_cours': 'En cours',
            'resolue': 'Résolue',
            'fermee': 'Fermée'
        };

        const statusColors = {
            'en_attente': '#f59e0b',
            'en_cours': '#3b82f6',
            'resolue': '#10b981',
            'fermee': '#6b7280'
        };

        container.innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th><i class="fa-solid fa-hashtag"></i> Référence</th>
                        <th><i class="fa-solid fa-tag"></i> Sujet</th>
                        <th><i class="fa-solid fa-calendar"></i> Date</th>
                        <th><i class="fa-solid fa-circle-info"></i> Statut</th>
                        <th><i class="fa-solid fa-reply"></i> Réponse</th>
                    </tr>
                </thead>
                <tbody>
                    ${reclamations.map(r => `
                        <tr>
                            <td style="font-weight: 600; color: #667eea;">${r.numeroReference || 'N/A'}</td>
                            <td style="font-weight: 500;">${r.sujet}</td>
                            <td>${formatDate(r.createdAt)}</td>
                            <td>
                                <span style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.8rem; background: ${statusColors[r.statut]}15; color: ${statusColors[r.statut]}; border-radius: 8px; font-weight: 600; font-size: 0.85rem;">
                                    ${statusLabels[r.statut] || r.statut}
                                </span>
                            </td>
                            <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                ${r.reponse 
                                    ? `<span style="color: #059669;"><i class="fa-solid fa-check"></i> ${r.reponse.substring(0, 40)}...</span>` 
                                    : '<span style="color: #999;">En attente</span>'}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

    } catch (error) {
        console.error('❌ Erreur lors du chargement des réclamations:', error);
        const container = document.getElementById('vetReclamations');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #e74c3c;">
                    <i class="fa-solid fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
                    <p>Erreur lors du chargement des réclamations.</p>
                </div>
            `;
        }
    }
}

// Ouvrir le modal de nouvelle réclamation pour le vétérinaire
function openNewReclamationModalVet() {
    // Vérifier si le modal existe, sinon le créer
    let modal = document.getElementById('newReclamationModalVet');
    if (!modal) {
        const modalHtml = `
            <div id="newReclamationModalVet" class="modal" style="display: none;">
                <div class="modal-content" style="max-width: 600px; border-radius: 24px; overflow: hidden;">
                    <div class="modal-header" style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 1.5rem 2rem; margin: -1.5rem -1.5rem 1.5rem -1.5rem;">
                        <h2 style="margin: 0; display: flex; align-items: center; gap: 0.75rem;">
                            <i class="fa-solid fa-file-circle-plus"></i>
                            Nouvelle Réclamation
                        </h2>
                        <button class="close" onclick="closeNewReclamationModalVet()" style="color: white; background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
                    </div>
                    <form id="newReclamationFormVet" onsubmit="submitVetReclamation(event)">
                        <div class="form-group" style="margin-bottom: 1.25rem;">
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #1a252f;">
                                <i class="fa-solid fa-heading" style="color: #059669;"></i> Sujet
                            </label>
                            <input type="text" id="vetReclamationSujet" required class="form-control" 
                                placeholder="Décrivez brièvement votre problème..."
                                style="width: 100%; padding: 0.85rem; border: 2px solid #e0e0e0; border-radius: 12px;">
                        </div>
                        <div class="form-group" style="margin-bottom: 1.25rem;">
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #1a252f;">
                                <i class="fa-solid fa-list" style="color: #059669;"></i> Type
                            </label>
                            <select id="vetReclamationType" class="form-control" 
                                style="width: 100%; padding: 0.85rem; border: 2px solid #e0e0e0; border-radius: 12px;">
                                <option value="technique">Technique</option>
                                <option value="service">Service</option>
                                <option value="produit">Produit</option>
                                <option value="autre">Autre</option>
                            </select>
                        </div>
                        <div class="form-group" style="margin-bottom: 1.5rem;">
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #1a252f;">
                                <i class="fa-solid fa-align-left" style="color: #059669;"></i> Description
                            </label>
                            <textarea id="vetReclamationDescription" required class="form-control" rows="4"
                                placeholder="Décrivez votre problème en détail..."
                                style="width: 100%; padding: 0.85rem; border: 2px solid #e0e0e0; border-radius: 12px; resize: vertical;"></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary" 
                            style="width: 100%; padding: 1rem; background: linear-gradient(135deg, #059669 0%, #10b981 100%); border: none; border-radius: 12px; color: white; font-weight: 600; cursor: pointer;">
                            <i class="fa-solid fa-paper-plane"></i> Envoyer la réclamation
                        </button>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        modal = document.getElementById('newReclamationModalVet');
        
        // Fermer au clic extérieur
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeNewReclamationModalVet();
        });
    }
    
    // Réinitialiser le formulaire
    document.getElementById('newReclamationFormVet').reset();
    modal.style.display = 'flex';
}

function closeNewReclamationModalVet() {
    const modal = document.getElementById('newReclamationModalVet');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Soumettre une nouvelle réclamation
async function submitVetReclamation(e) {
    e.preventDefault();
    
    const user = getCurrentUser();
    const userId = user?.id || user?._id;
    if (!user || !userId) {
        showAlert('Veuillez vous connecter', 'error');
        return;
    }

    const sujet = document.getElementById('vetReclamationSujet').value.trim();
    const type = document.getElementById('vetReclamationType').value;
    const description = document.getElementById('vetReclamationDescription').value.trim();

    if (!sujet || !description) {
        showAlert('Veuillez remplir tous les champs', 'error');
        return;
    }

    try {
        const apiUrl = (typeof API_BASE_URL !== 'undefined' && API_BASE_URL) ? API_BASE_URL : 'http://localhost:3000/api';
        const response = await fetch(`${apiUrl}/reclamations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sujet,
                type,
                description,
                createdBy: userId
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erreur lors de la création');
        }

        showAlert('Réclamation envoyée avec succès !', 'success');
        closeNewReclamationModalVet();
        await loadVetReclamations();
        updateStatsDisplay();

    } catch (error) {
        console.error('Erreur:', error);
        showAlert('Erreur: ' + error.message, 'error');
    }
}

// Ouvrir une vidéo dans un modal
function openVideoModal(videoUrl) {
    // Créer le modal s'il n'existe pas
    let modal = document.getElementById('videoModal');
    if (!modal) {
        const modalHtml = `
            <div id="videoModal" class="modal" style="display: none; z-index: 10000;">
                <div class="video-modal-content" style="position: relative; max-width: 900px; width: 95%; background: #000; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 80px rgba(0,0,0,0.5);">
                    <div class="video-modal-header" style="position: absolute; top: 0; left: 0; right: 0; z-index: 10; display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; background: linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%);">
                        <h3 style="margin: 0; color: white; font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fa-solid fa-video"></i>
                            Vidéo de consultation
                        </h3>
                        <button onclick="closeVideoModal()" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;" onmouseover="this.style.background='rgba(239,68,68,0.8)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                    <video id="videoPlayer" controls style="width: 100%; max-height: 80vh; display: block;">
                        Votre navigateur ne supporte pas la lecture vidéo.
                    </video>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        modal = document.getElementById('videoModal');
        
        // Fermer au clic extérieur
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeVideoModal();
        });
        
        // Fermer avec Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                closeVideoModal();
            }
        });
    }
    
    // Configurer et afficher la vidéo
    const videoPlayer = document.getElementById('videoPlayer');
    videoPlayer.src = videoUrl;
    modal.style.display = 'flex';
    videoPlayer.play().catch(() => {}); // Auto-play si possible
}

// Fermer le modal vidéo
function closeVideoModal() {
    const modal = document.getElementById('videoModal');
    const videoPlayer = document.getElementById('videoPlayer');
    
    if (modal) {
        modal.style.display = 'none';
    }
    if (videoPlayer) {
        videoPlayer.pause();
        videoPlayer.src = ''; // Libérer la ressource
    }
}


// Charger toutes les consultations
async function loadAllConsultations() {
    try {
        const user = getCurrentUser();
        
        // Vérifier que l'utilisateur et son ID existent
        if (!user || (!user.id && !user._id)) {
            console.error('Utilisateur non trouvé ou ID manquant');
            return;
        }
        
        const userId = user.id || user._id;
        const response = await fetch(`http://localhost:3000/api/consultations?vetId=${userId}`);

        if (!response.ok) throw new Error('Erreur lors du chargement');

        allConsultations = await response.json();
        
        // Compter les consultations
        const pending = allConsultations.filter(c => c.status === 'en_attente' || c.status === 'en_cours');
        const completed = allConsultations.filter(c => c.status === 'terminée' || c.status === 'annulée');
        
        pendingCount = pending.length;
        completedCount = completed.length;
        
        // Afficher selon le filtre actuel
        displayConsultations(currentFilter);
        
    } catch (error) {
        console.error('Erreur:', error);
        const container = document.getElementById('consultationsList');
        if (container) container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #e74c3c;">
                <i class="fa-solid fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
                <p>Erreur lors du chargement des consultations.</p>
            </div>
        `;
    }
}

// Filtrer les consultations (En attente / Traitées)
function filterConsultations(filter) {
    currentFilter = filter;
    
    // Mettre à jour les boutons de filtre (utilisation des classes CSS)
    document.querySelectorAll('.filter-btn').forEach(btn => {
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    displayConsultations(filter);
}

// Afficher les consultations filtrées
function displayConsultations(filter) {
    const container = document.getElementById('consultationsList');
    if (!container) return;
    
    let consultations;
    if (filter === 'pending') {
        consultations = allConsultations.filter(c => c.status === 'en_attente' || c.status === 'en_cours');
    } else {
        consultations = allConsultations.filter(c => c.status === 'terminée' || c.status === 'annulée');
    }
    
    if (consultations.length === 0) {
        const emptyMessage = filter === 'pending' 
            ? { icon: 'fa-clipboard-check', title: 'Aucune consultation en attente', subtitle: 'Vous êtes à jour ! 🎉' }
            : { icon: 'fa-folder-open', title: 'Aucune consultation traitée', subtitle: "L'historique apparaîtra ici" };
        
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid ${emptyMessage.icon}"></i>
                <p class="empty-title">${emptyMessage.title}</p>
                <p class="empty-subtitle">${emptyMessage.subtitle}</p>
            </div>
        `;
        return;
    }
    
    const isPending = filter === 'pending';
    
    container.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th><i class="fa-solid fa-calendar"></i> Date</th>
                    <th><i class="fa-solid fa-user"></i> Agriculteur</th>
                    <th><i class="fa-solid fa-paw"></i> Moutons</th>
                    <th><i class="fa-solid fa-file-lines"></i> Description</th>
                    <th><i class="fa-solid fa-video"></i> Vidéo</th>
                    <th><i class="fa-solid fa-circle-info"></i> Statut</th>
                    ${isPending ? '<th><i class="fa-solid fa-gear"></i> Actions</th>' : '<th><i class="fa-solid fa-comment-medical"></i> Réponse</th>'}
                </tr>
            </thead>
            <tbody>
                ${consultations.map(c => `
                    <tr>
                        <td>${formatDate(c.createdAt)}</td>
                        <td>
                            <div class="cell-farmer">
                                <i class="fa-solid fa-user-tie"></i>
                                ${c.farmerId?.name || 'Inconnu'}
                            </div>
                        </td>
                        <td>
                            <span class="cell-sheep-count">
                                ${c.sheepIds?.length || 0} mouton(s)
                            </span>
                        </td>
                        <td>${c.description.substring(0, 50)}...</td>
                        <td>${c.video ? `<button class="btn-video" onclick="openVideoModal('http://localhost:3000${c.video}')"><i class="fa-solid fa-play-circle"></i> Voir</button>` : '<span class="text-muted">Aucune</span>'}</td>
                        <td><span class="badge badge-${c.status === 'en_attente' ? 'warning' : c.status === 'en_cours' ? 'info' : c.status === 'terminée' ? 'success' : 'danger'}">${getStatusLabel(c.status)}</span></td>
                        ${isPending 
                            ? `<td>
                                <button class="btn btn-sm btn-primary btn-respond" onclick="openConsultation('${c._id}')">
                                    <i class="fa-solid fa-reply"></i> Répondre
                                </button>
                            </td>`
                            : `<td class="cell-response">${c.vetResponse ? c.vetResponse.substring(0, 50) + '...' : '<span class="text-muted">N/A</span>'}</td>`
                        }
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Exposer les fonctions globalement
window.openConsultation = openConsultation;
window.filterConsultations = filterConsultations;
window.loadAllConsultations = loadAllConsultations;
window.viewVetMessage = viewVetMessage;
window.loadVetMessages = loadVetMessages;
window.loadVetReclamations = loadVetReclamations;
window.openNewReclamationModalVet = openNewReclamationModalVet;
window.closeNewReclamationModalVet = closeNewReclamationModalVet;
window.submitVetReclamation = submitVetReclamation;
window.openVideoModal = openVideoModal;
window.closeVideoModal = closeVideoModal;