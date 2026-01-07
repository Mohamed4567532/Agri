/* ============================================
   AgriSmart - Fonctionnalités Vétérinaire
   ============================================ */

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

// Charger les consultations en attente
async function loadPendingConsultations() {
    try {
        const user = getCurrentUser();
        const response = await fetch(`http://localhost:3000/api/consultations?vetId=${user.id}`);

        if (!response.ok) throw new Error('Erreur lors du chargement');

        const consultations = await response.json();
        const pending = consultations.filter(c => c.status === 'en_attente' || c.status === 'en_cours');

        const container = document.getElementById('pendingConsultations');
        if (!container) return;

        if (pending.length === 0) {
            container.innerHTML = '<p>Aucune consultation en attente.</p>';
            return;
        }

        container.innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Agriculteur</th>
                        <th>Moutons</th>
                        <th>Description</th>
                        <th>Vidéo</th>
                        <th>Statut</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${pending.map(c => `
                        <tr>
                            <td>${formatDate(c.createdAt)}</td>
                            <td>${c.farmerId?.name || 'Inconnu'}</td>
                            <td>${c.sheepIds?.length || 0} mouton(s)</td>
                            <td>${c.description.substring(0, 50)}...</td>
                            <td>${c.video ? '<a href="http://localhost:3000' + c.video + '" target="_blank"><i class="fa-solid fa-video"></i> Voir</a>' : 'Aucune'}</td>
                            <td><span class="badge badge-${c.status === 'en_attente' ? 'warning' : 'info'}">${getStatusLabel(c.status)}</span></td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="openConsultation('${c._id}')">Répondre</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Erreur:', error);
        const container = document.getElementById('pendingConsultations');
        if (container) container.innerHTML = '<p>Erreur lors du chargement des consultations.</p>';
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

        const container = document.getElementById('completedConsultations');
        if (!container) return;

        if (completed.length === 0) {
            container.innerHTML = '<p>Aucune consultation traitée pour le moment.</p>';
            return;
        }

        container.innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Agriculteur</th>
                        <th>Moutons</th>
                        <th>Ma Réponse</th>
                        <th>Date Réponse</th>
                        <th>Statut</th>
                    </tr>
                </thead>
                <tbody>
                    ${completed.map(c => `
                        <tr>
                            <td>${formatDate(c.createdAt)}</td>
                            <td>${c.farmerId?.name || 'Inconnu'}</td>
                            <td>${c.sheepIds?.length || 0} mouton(s)</td>
                            <td>${c.vetResponse ? c.vetResponse.substring(0, 50) + '...' : 'N/A'}</td>
                            <td>${c.responseDate ? formatDate(c.responseDate) : 'N/A'}</td>
                            <td><span class="badge badge-${c.status === 'terminée' ? 'success' : 'danger'}">${getStatusLabel(c.status)}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Erreur:', error);
        const container = document.getElementById('completedConsultations');
        if (container) container.innerHTML = '<p>Erreur lors du chargement des consultations.</p>';
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

        const vetMessagesContainer = document.getElementById('vetMessages');
        if (!vetMessagesContainer) {
            console.warn('⚠️ Élément vetMessages non trouvé dans le HTML');
            return;
        }

        if (receivedMessages.length === 0) {
            vetMessagesContainer.innerHTML = '<p>Aucun message reçu.</p>';
            return;
        }

        vetMessagesContainer.innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>De</th>
                        <th>Sujet</th>
                        <th>Date</th>
                        <th>Statut</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${receivedMessages.map(m => {
            const senderName = m.senderId?.name || m.senderId?.username || 'Inconnu';
            const senderRole = m.senderId?.role || 'N/A';
            return `
                        <tr>
                            <td>${senderName} (${senderRole})</td>
                            <td>${m.subject}</td>
                            <td>${formatDate(m.createdAt)}</td>
                            <td>${m.isRead ? '<i class="fa-solid fa-check-double"></i> Lu' : '<i class="fa-solid fa-envelope"></i> Non lu'}</td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="viewVetMessage('${m._id}')">Voir</button>
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
            vetMessagesContainer.innerHTML = '<p style="color: red;">Erreur lors du chargement des messages.</p>';
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
