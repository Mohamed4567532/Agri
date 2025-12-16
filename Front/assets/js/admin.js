/* ============================================
   AgriSmart - Fonctionnalités Administrateur
   ============================================ */

// Initialisation de la page admin
document.addEventListener('DOMContentLoaded', async function() {
    // Vérifier l'authentification
    const user = getCurrentUser();
    
    if (!user) {
        showAlert('Veuillez vous connecter', 'error');
        setTimeout(() => window.location.href = 'login.html', 2000);
        return;
    }
    
    if (user.role !== 'admin') {
        showAlert('Accès réservé aux administrateurs', 'error');
        setTimeout(() => window.location.href = 'index.html', 2000);
        return;
    }

    await loadAdminStats();
    await loadMarketStatistics();
    await loadPendingUsers();
    await loadAcceptedUsers();
    await loadAllUsers();
    
    // Event listeners
    const userRoleFilter = document.getElementById('userRoleFilter');
    if (userRoleFilter) {
        userRoleFilter.addEventListener('change', loadAllUsers);
    }

    const adminContactForm = document.getElementById('adminContactForm');
    if (adminContactForm) {
        adminContactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            sendAdminMessage();
        });
    }

    // Modal close
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
});

// Récupérer tous les utilisateurs depuis l'API
async function fetchAllUsers() {
    try {
        const response = await fetch('http://localhost:3000/api/users');
        const data = await response.json();
        
        if (data.success && data.users) {
            return data.users;
        }
        return [];
    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        return [];
    }
}

// Charger les statistiques admin
async function loadAdminStats() {
    try {
        const users = await fetchAllUsers();
        
        const statsContainer = document.getElementById('adminStats');
        if (!statsContainer) return;

        const pendingCount = users.filter(u => u.status === 'pending').length;
        const acceptedCount = users.filter(u => u.status === 'accepted').length;
        const rejectedCount = users.filter(u => u.status === 'rejected').length;
        
        const farmerCount = users.filter(u => u.role === 'farmer').length;
        const consumerCount = users.filter(u => u.role === 'consumer').length;
        const vetCount = users.filter(u => u.role === 'vet').length;

        statsContainer.innerHTML = `
            <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                <div class="stat-card" style="background: linear-gradient(135deg, #3498db, #2980b9); color: white; padding: 1.5rem; border-radius: 10px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: bold;">${users.length}</div>
                    <div>Total Utilisateurs</div>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, #f39c12, #e67e22); color: white; padding: 1.5rem; border-radius: 10px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: bold;">${pendingCount}</div>
                    <div>En Attente</div>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, #27ae60, #2ecc71); color: white; padding: 1.5rem; border-radius: 10px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: bold;">${acceptedCount}</div>
                    <div>Acceptés</div>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, #e74c3c, #c0392b); color: white; padding: 1.5rem; border-radius: 10px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: bold;">${rejectedCount}</div>
                    <div>Rejetés</div>
                </div>
            </div>
            <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
                <div class="stat-card" style="background: #f8f9fa; padding: 1rem; border-radius: 10px; text-align: center; border: 2px solid #27ae60;">
                    <div style="font-size: 1.5rem; font-weight: bold; color: #27ae60;">🌾 ${farmerCount}</div>
                    <div>Agriculteurs</div>
                </div>
                <div class="stat-card" style="background: #f8f9fa; padding: 1rem; border-radius: 10px; text-align: center; border: 2px solid #3498db;">
                    <div style="font-size: 1.5rem; font-weight: bold; color: #3498db;">🛒 ${consumerCount}</div>
                    <div>Consommateurs</div>
                </div>
                <div class="stat-card" style="background: #f8f9fa; padding: 1rem; border-radius: 10px; text-align: center; border: 2px solid #9b59b6;">
                    <div style="font-size: 1.5rem; font-weight: bold; color: #9b59b6;">🩺 ${vetCount}</div>
                    <div>Vétérinaires</div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
    }
}

// Charger les utilisateurs en attente
async function loadPendingUsers() {
    try {
        const users = await fetchAllUsers();
        const pending = users.filter(u => u.status === 'pending');

        const container = document.getElementById('pendingUsers');
        if (!container) return;

        if (pending.length === 0) {
            container.innerHTML = '<p style="color: #27ae60;">✅ Aucun utilisateur en attente d\'approbation.</p>';
            return;
        }

        container.innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Rôle</th>
                        <th>Date d'inscription</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${pending.map(user => `
                        <tr>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td><span class="badge badge-${getRoleBadgeClass(user.role)}">${getRoleLabel(user.role)}</span></td>
                            <td>${formatDate(user.createdAt)}</td>
                            <td>
                                <button class="btn btn-success btn-sm" onclick="updateUserStatus('${user._id}', 'accepted')">✅ Accepter</button>
                                <button class="btn btn-danger btn-sm" onclick="updateUserStatus('${user._id}', 'rejected')">❌ Rejeter</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs en attente:', error);
        const container = document.getElementById('pendingUsers');
        if (container) container.innerHTML = '<p>Erreur lors du chargement.</p>';
    }
}

// Charger les utilisateurs acceptés
async function loadAcceptedUsers() {
    try {
        const users = await fetchAllUsers();
        const accepted = users.filter(u => u.status === 'accepted' && u.role !== 'admin');

        const container = document.getElementById('acceptedUsers');
        if (!container) return;

        if (accepted.length === 0) {
            container.innerHTML = '<p>Aucun utilisateur accepté pour le moment.</p>';
            return;
        }

        container.innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Rôle</th>
                        <th>Date d'inscription</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${accepted.map(user => `
                        <tr>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td><span class="badge badge-${getRoleBadgeClass(user.role)}">${getRoleLabel(user.role)}</span></td>
                            <td>${formatDate(user.createdAt)}</td>
                            <td>
                                <button class="btn btn-warning btn-sm" onclick="updateUserStatus('${user._id}', 'suspended')">⏸️ Suspendre</button>
                                <button class="btn btn-danger btn-sm" onclick="updateUserStatus('${user._id}', 'rejected')">❌ Rejeter</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs acceptés:', error);
    }
}

// Charger tous les utilisateurs
async function loadAllUsers() {
    try {
        const users = await fetchAllUsers();
        const roleFilter = document.getElementById('userRoleFilter')?.value || 'all';
        const statusFilter = document.getElementById('userStatusFilter')?.value || 'all';
        
        let filteredUsers = users.filter(u => u.role !== 'admin'); // Exclure les admins de la liste
        
        if (roleFilter !== 'all') {
            filteredUsers = filteredUsers.filter(u => u.role === roleFilter);
        }
        
        if (statusFilter !== 'all') {
            filteredUsers = filteredUsers.filter(u => u.status === statusFilter);
        }

        const container = document.getElementById('allUsers');
        if (!container) return;

        if (filteredUsers.length === 0) {
            container.innerHTML = '<p>Aucun utilisateur trouvé.</p>';
            return;
        }

        container.innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Rôle</th>
                        <th>Statut</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredUsers.map(user => `
                        <tr>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td><span class="badge badge-${getRoleBadgeClass(user.role)}">${getRoleLabel(user.role)}</span></td>
                            <td><span class="badge badge-${getStatusBadgeClass(user.status)}">${getStatusLabel(user.status)}</span></td>
                            <td>${formatDate(user.createdAt)}</td>
                            <td>
                                ${getActionButtons(user)}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
    }
}

// Générer les boutons d'action selon le statut
function getActionButtons(user) {
    let buttons = '';
    
    switch(user.status) {
        case 'pending':
            buttons = `
                <button class="btn btn-success btn-sm" onclick="updateUserStatus('${user._id}', 'accepted')">✅ Accepter</button>
                <button class="btn btn-danger btn-sm" onclick="updateUserStatus('${user._id}', 'rejected')">❌ Rejeter</button>
            `;
            break;
        case 'accepted':
            buttons = `
                <button class="btn btn-warning btn-sm" onclick="updateUserStatus('${user._id}', 'suspended')">⏸️ Suspendre</button>
            `;
            break;
        case 'rejected':
        case 'suspended':
            buttons = `
                <button class="btn btn-success btn-sm" onclick="updateUserStatus('${user._id}', 'accepted')">✅ Réactiver</button>
            `;
            break;
    }
    
    buttons += `<button class="btn btn-danger btn-sm" onclick="deleteUser('${user._id}')" style="margin-left: 5px;">🗑️</button>`;
    
    return buttons;
}

// Mettre à jour le statut d'un utilisateur
async function updateUserStatus(userId, status) {
    const statusLabels = {
        'accepted': 'accepter',
        'rejected': 'rejeter',
        'suspended': 'suspendre',
        'pending': 'mettre en attente'
    };
    
    if (!confirm(`Êtes-vous sûr de vouloir ${statusLabels[status]} cet utilisateur ?`)) {
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert(`Utilisateur ${statusLabels[status]} avec succès !`, 'success');
            await loadAdminStats();
            await loadPendingUsers();
            await loadAcceptedUsers();
            await loadAllUsers();
        } else {
            showAlert('Erreur: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showAlert('Erreur lors de la mise à jour: ' + error.message, 'error');
    }
}

// Supprimer un utilisateur
async function deleteUser(userId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement cet utilisateur ?')) {
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('Utilisateur supprimé avec succès !', 'success');
            await loadAdminStats();
            await loadPendingUsers();
            await loadAcceptedUsers();
            await loadAllUsers();
        } else {
            showAlert('Erreur: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showAlert('Erreur lors de la suppression: ' + error.message, 'error');
    }
}

// Labels et badges
function getRoleLabel(role) {
    const labels = {
        'farmer': 'Agriculteur',
        'consumer': 'Consommateur',
        'vet': 'Vétérinaire',
        'admin': 'Administrateur'
    };
    return labels[role] || role;
}

function getRoleBadgeClass(role) {
    const classes = {
        'farmer': 'success',
        'consumer': 'info',
        'vet': 'purple',
        'admin': 'danger'
    };
    return classes[role] || 'secondary';
}

function getStatusLabel(status) {
    const labels = {
        'pending': 'En attente',
        'accepted': 'Accepté',
        'rejected': 'Rejeté',
        'suspended': 'Suspendu'
    };
    return labels[status] || status;
}

function getStatusBadgeClass(status) {
    const classes = {
        'pending': 'warning',
        'accepted': 'success',
        'rejected': 'danger',
        'suspended': 'secondary'
    };
    return classes[status] || 'secondary';
}

// Contacter un utilisateur (modal)
async function contactUser(userId) {
    try {
        const response = await fetch(`http://localhost:3000/api/users/${userId}`);
        const data = await response.json();
        
        if (data.success && data.user) {
            document.getElementById('adminContactUserId').value = userId;
            document.getElementById('adminContactUserName').textContent = data.user.name;
            document.getElementById('adminContactModal').style.display = 'block';
        }
    } catch (error) {
        showAlert('Erreur: ' + error.message, 'error');
    }
}

// Envoyer un message depuis l'admin
async function sendAdminMessage() {
    const userId = document.getElementById('adminContactUserId').value;
    const subject = document.getElementById('adminMessageSubject').value;
    const message = document.getElementById('adminMessageContent').value;

    if (!subject || !message) {
        showAlert('Veuillez remplir tous les champs.', 'error');
        return;
    }

    try {
        const currentUser = getCurrentUser();
        const newMessage = {
            fromId: currentUser.id,
            toId: userId,
            subject,
            message,
            createdAt: new Date().toISOString()
        };

        const response = await fetch('http://localhost:3000/api/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newMessage)
        });

        showAlert('Message envoyé avec succès !', 'success');
        document.getElementById('adminContactModal').style.display = 'none';
        document.getElementById('adminContactForm').reset();
    } catch (error) {
        showAlert('Erreur lors de l\'envoi: ' + error.message, 'error');
    }
}

// ============================================
// GESTION DES STATISTIQUES DU MARCHÉ
// ============================================

let marketStatistics = [];

// Charger les statistiques du marché
async function loadMarketStatistics() {
    try {
        const response = await fetch('http://localhost:3000/api/statistics');
        marketStatistics = await response.json();
        
        displayAllStatistics();
        
    } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
        const container = document.getElementById('statsManagementGrid');
        if (container) {
            container.innerHTML = '<p style="color: #e74c3c;">Erreur lors du chargement des statistiques</p>';
        }
    }
}

// Afficher toutes les statistiques dynamiquement
function displayAllStatistics() {
    const container = document.getElementById('statsManagementGrid');
    if (!container) return;
    
    if (marketStatistics.length === 0) {
        container.innerHTML = '<p style="color: #999;">Aucune statistique. Cliquez sur "Ajouter une nouvelle catégorie" pour commencer.</p>';
        return;
    }
    
    container.innerHTML = marketStatistics.map(stat => `
        <div class="stat-card-admin" style="background: ${hexToRgba(stat.color || '#3498db', 0.1)}; padding: 1.5rem; border-radius: 10px; border-left: 4px solid ${stat.color || '#3498db'};">
            <h3 style="color: ${stat.color || '#3498db'}; margin-bottom: 1rem;">
                ${stat.displayName || stat.category}
            </h3>
            <div class="stat-summary">
                ${stat.parts && stat.parts.length > 0 ? stat.parts.map(part => `
                    <div class="stat-summary-item">
                        <span class="stat-color-dot" style="background: ${part.color}"></span>
                        <span>${part.label}: <strong>${part.percentage}%</strong></span>
                    </div>
                `).join('') : '<p style="color: #999;">Aucune donnée</p>'}
            </div>
            <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                <button class="btn btn-primary btn-sm" onclick="openStatModal('${stat.category}')">✏️ Modifier</button>
                <button class="btn btn-danger btn-sm" onclick="deleteStat('${stat._id}', '${stat.displayName || stat.category}')">🗑️ Supprimer</button>
            </div>
        </div>
    `).join('');
}

// Convertir hex en rgba
function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Ouvrir le modal de modification des statistiques
function openStatModal(category) {
    const stat = marketStatistics.find(s => s.category === category);
    
    document.getElementById('statCategory').value = category;
    document.getElementById('statId').value = stat ? stat._id : '';
    document.getElementById('statCategoryTitle').textContent = getCategoryLabel(category);
    
    const container = document.getElementById('statPartsContainer');
    container.innerHTML = '';
    
    if (stat && stat.parts) {
        stat.parts.forEach((part, index) => {
            addStatPartToForm(part.label, part.percentage, part.color, index);
        });
    } else {
        // Ajouter une partie vide par défaut
        addStatPartToForm('', 0, '#3498db', 0);
    }
    
    document.getElementById('statModal').style.display = 'block';
}

// Fermer le modal
function closeStatModal() {
    document.getElementById('statModal').style.display = 'none';
}

// Ajouter une partie au formulaire
function addStatPart() {
    const container = document.getElementById('statPartsContainer');
    const index = container.children.length;
    addStatPartToForm('', 0, getRandomColor(), index);
}

// Ajouter une partie avec des valeurs
function addStatPartToForm(label, percentage, color, index) {
    const container = document.getElementById('statPartsContainer');
    
    const partDiv = document.createElement('div');
    partDiv.className = 'stat-part';
    partDiv.innerHTML = `
        <button type="button" class="remove-btn" onclick="removeStatPart(this)">✕</button>
        <div class="stat-part-row">
            <div class="form-group" style="margin-bottom: 0;">
                <label>Nom</label>
                <input type="text" class="form-control part-label" value="${label}" placeholder="Ex: Agrumes" required>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
                <label>Pourcentage</label>
                <input type="number" class="form-control part-percentage" value="${percentage}" min="0" max="100" required oninput="updateTotalPercentage()">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
                <label>Couleur</label>
                <input type="color" class="form-control part-color" value="${color}" style="height: 38px; padding: 2px;">
            </div>
        </div>
    `;
    
    container.appendChild(partDiv);
    updateTotalPercentage();
}

// Mettre à jour l'affichage du total des pourcentages
function updateTotalPercentage() {
    const partElements = document.querySelectorAll('.stat-part');
    let total = 0;
    
    partElements.forEach(partEl => {
        const percentage = parseInt(partEl.querySelector('.part-percentage').value) || 0;
        total += percentage;
    });
    
    const display = document.getElementById('totalPercentageDisplay');
    if (display) {
        if (total === 100) {
            display.style.background = '#d4edda';
            display.style.color = '#155724';
            display.textContent = `✅ Total: ${total}%`;
        } else if (total > 100) {
            display.style.background = '#f8d7da';
            display.style.color = '#721c24';
            display.textContent = `❌ Total: ${total}% (trop élevé!)`;
        } else {
            display.style.background = '#fff3cd';
            display.style.color = '#856404';
            display.textContent = `⚠️ Total: ${total}% (il manque ${100 - total}%)`;
        }
    }
}

// Supprimer une partie
function removeStatPart(btn) {
    const container = document.getElementById('statPartsContainer');
    if (container.children.length > 1) {
        btn.closest('.stat-part').remove();
        updateTotalPercentage();
    } else {
        showModalMessage('⚠️ Vous devez avoir au moins une partie', 'error');
    }
}

// Afficher un message dans le modal
function showModalMessage(message, type) {
    let msgDiv = document.getElementById('statModalMessage');
    if (!msgDiv) {
        msgDiv = document.createElement('div');
        msgDiv.id = 'statModalMessage';
        const form = document.getElementById('statForm');
        form.insertBefore(msgDiv, form.firstChild);
    }
    
    const colors = {
        'error': { bg: '#f8d7da', text: '#721c24', border: '#f5c6cb' },
        'warning': { bg: '#fff3cd', text: '#856404', border: '#ffeeba' },
        'success': { bg: '#d4edda', text: '#155724', border: '#c3e6cb' }
    };
    
    const style = colors[type] || colors.warning;
    
    msgDiv.style.cssText = `
        padding: 12px;
        margin-bottom: 15px;
        border-radius: 8px;
        background: ${style.bg};
        color: ${style.text};
        border: 1px solid ${style.border};
        text-align: center;
        font-weight: 500;
    `;
    msgDiv.textContent = message;
    
    // Auto-hide après 5 secondes
    setTimeout(() => {
        if (msgDiv) msgDiv.style.display = 'none';
    }, 5000);
}

// Sauvegarder les statistiques
async function saveStatistics(e) {
    e.preventDefault();
    
    const category = document.getElementById('statCategory').value;
    const statId = document.getElementById('statId').value;
    
    // Récupérer les infos de la statistique existante
    const existingStat = marketStatistics.find(s => s.category === category);
    
    // Collecter les parties
    const parts = [];
    const partElements = document.querySelectorAll('#statPartsContainer .stat-part');
    
    let totalPercentage = 0;
    
    partElements.forEach(partEl => {
        const label = partEl.querySelector('.part-label').value.trim();
        const percentage = parseInt(partEl.querySelector('.part-percentage').value) || 0;
        const color = partEl.querySelector('.part-color').value;
        
        if (label) {
            parts.push({ label, percentage, color });
            totalPercentage += percentage;
        }
    });
    
    if (parts.length === 0) {
        showModalMessage('⚠️ Ajoutez au moins une partie avec un nom', 'error');
        return;
    }
    
    if (totalPercentage !== 100) {
        showModalMessage(`⚠️ Le total des pourcentages doit être 100% (actuellement: ${totalPercentage}%)`, 'warning');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:3000/api/statistics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                category,
                displayName: existingStat?.displayName || category,
                icon: existingStat?.icon || '📊',
                color: existingStat?.color || '#3498db',
                parts
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erreur lors de la sauvegarde');
        }
        
        showAlert('Statistiques mises à jour avec succès !', 'success');
        closeStatModal();
        await loadMarketStatistics();
        
    } catch (error) {
        console.error('Erreur:', error);
        showModalMessage('❌ ' + error.message, 'error');
    }
}

// Labels des catégories
function getCategoryLabel(category) {
    const labels = {
        'fruits': '🍎 Fruits',
        'légumes': '🥬 Légumes',
        'viande': '🥩 Viande',
        'huile': '🫒 Huile d\'Olive'
    };
    return labels[category] || category;
}

// Couleur aléatoire
function getRandomColor() {
    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#34495e'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Event listener pour le formulaire de statistiques
document.addEventListener('DOMContentLoaded', function() {
    const statForm = document.getElementById('statForm');
    if (statForm) {
        statForm.addEventListener('submit', saveStatistics);
    }
});

// ============================================
// NOUVELLE STATISTIQUE
// ============================================

// Ouvrir le modal de nouvelle statistique
function openNewStatModal() {
    document.getElementById('newStatCategory').value = '';
    document.getElementById('newStatDisplayName').value = '';
    document.getElementById('newStatColor').value = '#3498db';
    
    const container = document.getElementById('newStatPartsContainer');
    container.innerHTML = '';
    
    // Ajouter quelques parties vides par défaut
    addNewStatPartToForm('', 25, '#e74c3c');
    addNewStatPartToForm('', 25, '#3498db');
    addNewStatPartToForm('', 25, '#2ecc71');
    addNewStatPartToForm('', 25, '#f39c12');
    
    document.getElementById('newStatModal').style.display = 'block';
}

// Fermer le modal
function closeNewStatModal() {
    document.getElementById('newStatModal').style.display = 'none';
}

// Ajouter une partie au nouveau formulaire
function addNewStatPart() {
    addNewStatPartToForm('', 0, getRandomColor());
}

// Ajouter une partie avec des valeurs au nouveau formulaire
function addNewStatPartToForm(label, percentage, color) {
    const container = document.getElementById('newStatPartsContainer');
    
    const partDiv = document.createElement('div');
    partDiv.className = 'stat-part';
    partDiv.innerHTML = `
        <button type="button" class="remove-btn" onclick="removeNewStatPart(this)">✕</button>
        <div class="stat-part-row">
            <div class="form-group" style="margin-bottom: 0;">
                <label>Nom</label>
                <input type="text" class="form-control new-part-label" value="${label}" placeholder="Ex: Blé" required>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
                <label>Pourcentage</label>
                <input type="number" class="form-control new-part-percentage" value="${percentage}" min="0" max="100" required oninput="updateNewTotalPercentage()">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
                <label>Couleur</label>
                <input type="color" class="form-control new-part-color" value="${color}" style="height: 38px; padding: 2px;">
            </div>
        </div>
    `;
    
    container.appendChild(partDiv);
    updateNewTotalPercentage();
}

// Supprimer une partie du nouveau formulaire
function removeNewStatPart(btn) {
    const container = document.getElementById('newStatPartsContainer');
    if (container.children.length > 1) {
        btn.closest('.stat-part').remove();
        updateNewTotalPercentage();
    } else {
        showModalMessage('⚠️ Vous devez avoir au moins une partie', 'error');
    }
}

// Mettre à jour le total du nouveau formulaire
function updateNewTotalPercentage() {
    const partElements = document.querySelectorAll('#newStatPartsContainer .stat-part');
    let total = 0;
    
    partElements.forEach(partEl => {
        const percentage = parseInt(partEl.querySelector('.new-part-percentage').value) || 0;
        total += percentage;
    });
    
    const display = document.getElementById('newTotalPercentageDisplay');
    if (display) {
        if (total === 100) {
            display.style.background = '#d4edda';
            display.style.color = '#155724';
            display.textContent = `✅ Total: ${total}%`;
        } else if (total > 100) {
            display.style.background = '#f8d7da';
            display.style.color = '#721c24';
            display.textContent = `❌ Total: ${total}% (trop élevé!)`;
        } else {
            display.style.background = '#fff3cd';
            display.style.color = '#856404';
            display.textContent = `⚠️ Total: ${total}% (il manque ${100 - total}%)`;
        }
    }
}

// Sauvegarder la nouvelle statistique
async function saveNewStatistic(e) {
    e.preventDefault();
    
    const category = document.getElementById('newStatCategory').value.toLowerCase().trim();
    const displayName = document.getElementById('newStatDisplayName').value.trim();
    const color = document.getElementById('newStatColor').value;
    
    // Vérifier si la catégorie existe déjà
    if (marketStatistics.some(s => s.category === category)) {
        alert('Cette catégorie existe déjà !');
        return;
    }
    
    // Collecter les parties
    const parts = [];
    const partElements = document.querySelectorAll('#newStatPartsContainer .stat-part');
    let totalPercentage = 0;
    
    partElements.forEach(partEl => {
        const label = partEl.querySelector('.new-part-label').value.trim();
        const percentage = parseInt(partEl.querySelector('.new-part-percentage').value) || 0;
        const partColor = partEl.querySelector('.new-part-color').value;
        
        if (label) {
            parts.push({ label, percentage, color: partColor });
            totalPercentage += percentage;
        }
    });
    
    if (parts.length === 0) {
        alert('Ajoutez au moins une partie avec un nom');
        return;
    }
    
    if (totalPercentage !== 100) {
        alert(`Le total des pourcentages doit être 100% (actuellement: ${totalPercentage}%)`);
        return;
    }
    
    try {
        const response = await fetch('http://localhost:3000/api/statistics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                category,
                displayName,
                icon: '📊',
                color,
                parts
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erreur lors de la création');
        }
        
        showAlert('✅ Nouvelle catégorie créée avec succès !', 'success');
        closeNewStatModal();
        await loadMarketStatistics();
        
    } catch (error) {
        console.error('Erreur:', error);
        showAlert('❌ Erreur: ' + error.message, 'error');
    }
}

// Supprimer une statistique
async function deleteStat(statId, statName) {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${statName}" ?`)) {
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:3000/api/statistics/${statId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Erreur lors de la suppression');
        
        showAlert('✅ Catégorie supprimée avec succès !', 'success');
        await loadMarketStatistics();
        
    } catch (error) {
        console.error('Erreur:', error);
        showAlert('❌ Erreur: ' + error.message, 'error');
    }
}

// Event listener pour le formulaire de nouvelle statistique
document.addEventListener('DOMContentLoaded', function() {
    const newStatForm = document.getElementById('newStatForm');
    if (newStatForm) {
        newStatForm.addEventListener('submit', saveNewStatistic);
    }
});

// Exposer les fonctions globalement
window.updateUserStatus = updateUserStatus;
window.deleteUser = deleteUser;
window.contactUser = contactUser;
window.openStatModal = openStatModal;
window.closeStatModal = closeStatModal;
window.addStatPart = addStatPart;
window.removeStatPart = removeStatPart;
window.updateTotalPercentage = updateTotalPercentage;
window.openNewStatModal = openNewStatModal;
window.closeNewStatModal = closeNewStatModal;
window.addNewStatPart = addNewStatPart;
window.removeNewStatPart = removeNewStatPart;
window.updateNewTotalPercentage = updateNewTotalPercentage;
window.deleteStat = deleteStat;
