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

// Exposer les fonctions globalement
window.updateUserStatus = updateUserStatus;
window.deleteUser = deleteUser;
window.contactUser = contactUser;
