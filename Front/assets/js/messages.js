/* ============================================
   AgriSmart - Module Mes Messages
   Gestion complète des messages (reçus et envoyés)
   ============================================ */

let allMessages = [];
let currentTab = 'received';
let currentFilter = 'all';
let currentSearch = '';

// Initialisation
document.addEventListener('DOMContentLoaded', async function () {
    // Vérifier l'authentification
    const user = getCurrentUser();
    if (!user) {
        showAlert('Veuillez vous connecter', 'error');
        setTimeout(() => window.location.href = 'login.html', 2000);
        return;
    }

    // Mettre à jour le navbar
    updateNavbar();

    // Charger les messages
    await loadAllMessages();
    displayMessages();
});

// Charger tous les messages (reçus et envoyés)
async function loadAllMessages() {
    try {
        const user = getCurrentUser();
        if (!user || !user.id) {
            console.error('❌ Utilisateur non connecté');
            return;
        }

        const apiUrl = (typeof API_BASE_URL !== 'undefined' && API_BASE_URL) ? API_BASE_URL : 'http://localhost:3000/api';

        // Charger tous les messages (reçus et envoyés)
        const headers = typeof getHeaders === 'function' ? getHeaders() : {};
        const response = await fetch(`${apiUrl}/messages?userId=${user.id}`, {
            headers: headers
        });

        if (!response.ok) {
            throw new Error('Erreur lors du chargement des messages');
        }

        allMessages = await response.json();
        console.log(`✅ ${allMessages.length} messages chargés`);

        // Mettre à jour les badges
        updateBadges();

    } catch (error) {
        console.error('❌ Erreur lors du chargement des messages:', error);
        showAlert('Erreur lors du chargement des messages: ' + error.message, 'error');
    }
}

// Mettre à jour les badges
function updateBadges() {
    const user = getCurrentUser();
    if (!user || !user.id) return;

    const receivedMessages = allMessages.filter(m => {
        const receiverId = m.receiverId?._id || m.receiverId?.id || m.receiverId;
        return String(receiverId) === String(user.id);
    });

    const sentMessages = allMessages.filter(m => {
        const senderId = m.senderId?._id || m.senderId?.id || m.senderId;
        return String(senderId) === String(user.id);
    });

    const unreadCount = receivedMessages.filter(m => !m.isRead).length;

    const receivedBadge = document.getElementById('receivedBadge');
    const sentBadge = document.getElementById('sentBadge');

    if (receivedBadge) {
        if (unreadCount > 0) {
            receivedBadge.textContent = unreadCount;
            receivedBadge.style.display = 'inline-block';
        } else {
            receivedBadge.style.display = 'none';
        }
    }

    if (sentBadge) {
        if (sentMessages.length > 0) {
            sentBadge.textContent = sentMessages.length;
            sentBadge.style.display = 'inline-block';
        } else {
            sentBadge.style.display = 'none';
        }
    }
}

// Changer d'onglet
function switchTab(tab) {
    currentTab = tab;

    // Mettre à jour les boutons d'onglets
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    if (tab === 'received') {
        document.getElementById('tabReceived').classList.add('active');
    } else {
        document.getElementById('tabSent').classList.add('active');
    }

    displayMessages();
}

// Appliquer les filtres
function applyFilter() {
    currentFilter = document.getElementById('messageFilter').value;
    currentSearch = document.getElementById('messageSearch').value.toLowerCase();
    displayMessages();
}

// Afficher les messages
function displayMessages() {
    const user = getCurrentUser();
    if (!user || !user.id) return;

    const container = document.getElementById('messagesList');
    if (!container) return;

    // Filtrer selon l'onglet actif
    let filteredMessages = [];
    if (currentTab === 'received') {
        filteredMessages = allMessages.filter(m => {
            const receiverId = m.receiverId?._id || m.receiverId?.id || m.receiverId;
            return String(receiverId) === String(user.id);
        });
    } else {
        filteredMessages = allMessages.filter(m => {
            const senderId = m.senderId?._id || m.senderId?.id || m.senderId;
            return String(senderId) === String(user.id);
        });
    }

    // Appliquer les filtres
    if (currentFilter === 'unread') {
        filteredMessages = filteredMessages.filter(m => !m.isRead);
    } else if (currentFilter === 'read') {
        filteredMessages = filteredMessages.filter(m => m.isRead);
    } else if (currentFilter === 'withProduct') {
        filteredMessages = filteredMessages.filter(m => m.productId);
    }

    // Appliquer la recherche
    if (currentSearch) {
        filteredMessages = filteredMessages.filter(m => {
            const subject = (m.subject || '').toLowerCase();
            const message = (m.message || '').toLowerCase();
            const senderName = (m.senderId?.name || m.senderId?.username || '').toLowerCase();
            const receiverName = (m.receiverId?.name || m.receiverId?.username || '').toLowerCase();
            return subject.includes(currentSearch) || 
                   message.includes(currentSearch) || 
                   senderName.includes(currentSearch) || 
                   receiverName.includes(currentSearch);
        });
    }

    // Trier par date (plus récents en premier)
    filteredMessages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (filteredMessages.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon"><i class="fa-solid fa-envelope-open"></i></div>
                <h3>Aucun message</h3>
                <p>${currentTab === 'received' ? 'Vous n\'avez reçu aucun message.' : 'Vous n\'avez envoyé aucun message.'}</p>
            </div>
        `;
        return;
    }

    // Utiliser formatPrice si disponible, sinon formater manuellement
    const formatPriceFunc = typeof formatPrice === 'function' ? formatPrice : (price) => `${price} TND`;

    container.innerHTML = filteredMessages.map(message => {
        const user = getCurrentUser();
        const isReceived = currentTab === 'received';
        const otherUser = isReceived ? message.senderId : message.receiverId;
        const otherUserName = otherUser?.name || otherUser?.username || 'Inconnu';
        const otherUserRole = otherUser?.role || 'N/A';
        const otherUserEmail = otherUser?.email || 'N/A';

        const date = new Date(message.createdAt).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const hasProduct = message.productId ? true : false;
        const isUnread = !message.isRead && isReceived;

        return `
            <div class="message-card ${isUnread ? 'unread' : 'read'}" onclick="viewMessage('${message._id}')" style="cursor: pointer;">
                <div class="message-card-header">
                    <div class="message-card-info">
                        <h3 class="message-card-title">
                            <i class="fa-solid fa-envelope${isUnread ? '' : '-open'}" style="color: ${isUnread ? '#4CAF50' : '#90A4AE'};"></i>
                            ${message.subject}
                            ${isUnread ? '<span style="font-size: 0.7rem; padding: 0.2rem 0.5rem; background: #4CAF50; color: white; border-radius: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-left: 0.5rem;">Nouveau</span>' : ''}
                        </h3>
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem;">
                            <i class="fa-solid fa-user" style="color: #42A5F5;"></i>
                            <strong style="color: #1a252f;">${isReceived ? 'De' : 'À'}: ${otherUserName}</strong>
                            <span style="font-size: 0.85rem; color: #666; padding: 0.25rem 0.75rem; background: rgba(66, 165, 245, 0.1); border-radius: 12px;">${otherUserRole}</span>
                        </div>
                        ${hasProduct ? `
                            <div class="product-badge">
                                <i class="fa-solid fa-box"></i>
                                Produit: ${message.productId?.type || 'N/A'} - ${message.productId?.price ? formatPriceFunc(message.productId.price) : 'N/A'}
                            </div>
                        ` : ''}
                        <div class="message-card-meta">
                            <span><i class="fa-solid fa-calendar-days"></i> ${date}</span>
                            <span><i class="fa-solid fa-envelope"></i> ${otherUserEmail}</span>
                        </div>
                    </div>
                    <div class="message-card-actions">
                        ${isReceived && !message.isRead ? `
                            <span style="font-size: 1.5rem; color: #4CAF50;" title="Non lu">
                                <i class="fa-solid fa-circle"></i>
                            </span>
                        ` : ''}
                        <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); viewMessage('${message._id}')" style="padding: 0.5rem 1rem; border-radius: 8px; background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%); border: none; color: white; cursor: pointer; font-weight: 600;">
                            <i class="fa-solid fa-eye"></i> Voir
                        </button>
                    </div>
                </div>
                <div class="message-preview">
                    ${message.message.length > 150 ? message.message.substring(0, 150) + '...' : message.message}
                </div>
            </div>
        `;
    }).join('');
}

// Voir les détails d'un message
async function viewMessage(messageId) {
    try {
        const apiUrl = (typeof API_BASE_URL !== 'undefined' && API_BASE_URL) ? API_BASE_URL : 'http://localhost:3000/api';
        const headers = typeof getHeaders === 'function' ? getHeaders() : {};
        const response = await fetch(`${apiUrl}/messages/${messageId}`, {
            headers: headers
        });

        if (!response.ok) {
            throw new Error('Message non trouvé');
        }

        const message = await response.json();
        const user = getCurrentUser();
        const isReceived = currentTab === 'received';
        const otherUser = isReceived ? message.senderId : message.receiverId;
        const otherUserName = otherUser?.name || otherUser?.username || 'Inconnu';
        const otherUserRole = otherUser?.role || 'N/A';
        const otherUserEmail = otherUser?.email || 'N/A';

        const date = new Date(message.createdAt).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Utiliser formatPrice si disponible, sinon formater manuellement
        const formatPriceFunc = typeof formatPrice === 'function' ? formatPrice : (price) => `${price} TND`;

        const productInfo = message.productId ?
            `<div style="background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(102, 187, 106, 0.05) 100%); padding: 1rem; border-radius: 12px; border-left: 4px solid #4CAF50; margin-top: 1rem;">
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                    <i class="fa-solid fa-box" style="color: #4CAF50; font-size: 1.2rem;"></i>
                    <strong style="color: #1a252f; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px;">Produit concerné</strong>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.75rem; margin-top: 0.75rem;">
                    <div>
                        <div style="font-size: 0.75rem; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.25rem;">Type</div>
                        <div style="color: #1a252f; font-weight: 600;">${message.productId.type || 'N/A'}</div>
                    </div>
                    <div>
                        <div style="font-size: 0.75rem; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.25rem;">Prix</div>
                        <div style="color: #4CAF50; font-weight: 700;">${message.productId.price ? formatPriceFunc(message.productId.price) : 'N/A'}</div>
                    </div>
                    ${message.productId.weight ? `
                        <div>
                            <div style="font-size: 0.75rem; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.25rem;">Poids</div>
                            <div style="color: #1a252f; font-weight: 600;">${message.productId.weight} kg</div>
                        </div>
                    ` : ''}
                </div>
            </div>` :
            '';

        const content = document.getElementById('messageDetailsContent');
        content.innerHTML = `
            <div style="background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem; border: 1px solid rgba(0,0,0,0.05);">
                <h3 style="margin-top: 0; margin-bottom: 1rem; color: #1a252f; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fa-solid fa-envelope" style="color: #4CAF50;"></i>
                    ${message.subject}
                </h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                    <div>
                        <div style="font-size: 0.75rem; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.25rem;">${isReceived ? 'De' : 'À'}</div>
                        <div style="color: #1a252f; font-weight: 600; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fa-solid fa-user" style="color: #42A5F5;"></i>
                            ${otherUserName} <span style="font-size: 0.85rem; color: #666; font-weight: 400;">(${otherUserRole})</span>
                        </div>
                    </div>
                    <div>
                        <div style="font-size: 0.75rem; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.25rem;">Email</div>
                        <div style="color: #1a252f; font-weight: 500; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fa-solid fa-envelope" style="color: #42A5F5; font-size: 0.9rem;"></i>
                            ${otherUserEmail}
                        </div>
                    </div>
                    <div>
                        <div style="font-size: 0.75rem; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.25rem;">Date</div>
                        <div style="color: #1a252f; font-weight: 500; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fa-solid fa-calendar-days" style="color: #42A5F5; font-size: 0.9rem;"></i>
                            ${date}
                        </div>
                    </div>
                </div>
                ${productInfo}
            </div>
            <div style="background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #e0e0e0; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <h4 style="margin-top: 0; margin-bottom: 1rem; color: #1a252f; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fa-solid fa-message" style="color: #4CAF50;"></i>
                    Message
                </h4>
                <p style="white-space: pre-wrap; color: #555; line-height: 1.7; margin: 0;">${message.message}</p>
            </div>
        `;

        // Marquer comme lu si c'est un message reçu
        if (isReceived && !message.isRead) {
            try {
                const headers = typeof getHeaders === 'function' ? getHeaders() : {};
                await fetch(`${apiUrl}/messages/${messageId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        ...headers
                    },
                    body: JSON.stringify({ isRead: true })
                });
                // Recharger les messages
                await loadAllMessages();
                displayMessages();
            } catch (error) {
                console.error('Erreur lors du marquage comme lu:', error);
            }
        }

        // Afficher le modal
        document.getElementById('messageDetailsModal').style.display = 'flex';

    } catch (error) {
        console.error('❌ Erreur lors de l\'affichage du message:', error);
        showAlert('Erreur: ' + error.message, 'error');
    }
}

// Fermer le modal
function closeMessageModal() {
    document.getElementById('messageDetailsModal').style.display = 'none';
}

// Exposer les fonctions globalement
window.switchTab = switchTab;
window.applyFilter = applyFilter;
window.viewMessage = viewMessage;
window.closeMessageModal = closeMessageModal;
