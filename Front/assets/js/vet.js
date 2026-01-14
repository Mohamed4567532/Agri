/* ============================================
   AgriSmart - Fonctionnalités Vétérinaire
   ============================================ */

// Variables pour les statistiques
let pendingCount = 0;
let completedCount = 0;
let messagesCount = 0;

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

    await loadPendingConsultations();
    await loadCompletedConsultations();
    await loadVetMessages(); // Charger les messages
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
});

// Mettre à jour l'affichage des statistiques
function updateStatsDisplay() {
    const pendingEl = document.getElementById('pendingCount');
    const completedEl = document.getElementById('completedCount');
    const messagesEl = document.getElementById('messagesCount');

    if (pendingEl) {
        pendingEl.textContent = pendingCount;
        pendingEl.style.animation = 'pulse 0.3s ease';
    }
    if (completedEl) {
        completedEl.textContent = completedCount;
        completedEl.style.animation = 'pulse 0.3s ease';
    }
    if (messagesEl) {
        messagesEl.textContent = messagesCount;
        messagesEl.style.animation = 'pulse 0.3s ease';
    }
}

// Charger les consultations en attente
async function loadPendingConsultations() {
    try {
        const user = getCurrentUser();
        const response = await fetch(`http://localhost:3000/api/consultations?vetId=${user.id}`);

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
                            <td>${c.video ? `<a href="http://localhost:3000${c.video}" target="_blank" style="color: #059669; text-decoration: none; display: flex; align-items: center; gap: 0.3rem; font-weight: 500;"><i class="fa-solid fa-play-circle"></i> Voir</a>` : '<span style="color: #999;">Aucune</span>'}</td>
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
        const response = await fetch(`http://localhost:3000/api/consultations?vetId=${user.id}`);

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
            ${consultation.video ? `<p><strong>Vidéo:</strong> <a href="http://localhost:3000${consultation.video}" target="_blank"><i class="fa-solid fa-video"></i> Voir la vidéo</a></p>` : ''}
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
        if (!user || !user.id) {
            console.error('❌ Utilisateur non connecté');
            return;
        }

        console.log('📥 Chargement des messages pour le vétérinaire:', user.id);

        // Utiliser le paramètre type=received pour ne récupérer que les messages reçus
        const apiUrl = (typeof API_BASE_URL !== 'undefined' && API_BASE_URL) ? API_BASE_URL : 'http://localhost:3000/api';
        const response = await fetch(`${apiUrl}/messages?userId=${user.id}&type=received`, {
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
            const userId = user.id;
            return String(receiverId) === String(userId);
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

// Exposer les fonctions globalement
window.openConsultation = openConsultation;
window.viewVetMessage = viewVetMessage;
window.loadVetMessages = loadVetMessages;
