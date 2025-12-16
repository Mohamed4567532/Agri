/* ============================================
   AgriSmart - Fonctionnalités Administrateur
   ============================================ */

// Initialisation de la page admin
async function initAdminPage() {
    if (!checkRole('admin')) return;

    await loadPendingUsers();
    await loadAllUsers();
    await loadAllProducts();
    await loadAllOrders();
    await loadComplaints();
    await loadAdminStats();
}

// Charger les utilisateurs en attente
async function loadPendingUsers() {
    try {
        const users = await apiGetUsers();
        const pending = users.filter(u => u.status === 'pending');

        const container = document.getElementById('pendingUsers');
        if (!container) return;

        if (pending.length === 0) {
            container.innerHTML = '<p>Aucun utilisateur en attente.</p>';
            return;
        }

        container.innerHTML = `
            <table>
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
                            <td>${user.role}</td>
                            <td>${formatDate(user.createdAt)}</td>
                            <td>
                                <button class="btn btn-primary btn-small" onclick="updateUserStatus('${user.id}', 'accepted')">Accepter</button>
                                <button class="btn btn-danger btn-small" onclick="updateUserStatus('${user.id}', 'rejected')">Rejeter</button>
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

// Charger tous les utilisateurs
async function loadAllUsers() {
    try {
        const users = await apiGetUsers();
        const roleFilter = document.getElementById('userRoleFilter')?.value || 'all';
        
        let filteredUsers = users;
        if (roleFilter !== 'all') {
            filteredUsers = users.filter(u => u.role === roleFilter);
        }

        const container = document.getElementById('allUsers');
        if (!container) return;

        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Rôle</th>
                        <th>Statut</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredUsers.map(user => `
                        <tr>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td>${user.role}</td>
                            <td>${user.status}</td>
                            <td>
                                ${user.status !== 'suspended' ? 
                                    `<button class="btn btn-danger btn-small" onclick="updateUserStatus('${user.id}', 'suspended')">Suspendre</button>` :
                                    `<button class="btn btn-primary btn-small" onclick="updateUserStatus('${user.id}', 'accepted')">Réactiver</button>`
                                }
                                <button class="btn btn-secondary btn-small" onclick="contactUser('${user.id}')">Contacter</button>
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

// Mettre à jour le statut d'un utilisateur
async function updateUserStatus(userId, status) {
    try {
        await apiUpdateUser(userId, { status });
        
        // Mettre à jour l'utilisateur actuel si c'est lui
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            const updatedUser = await apiGetUser(userId);
            setCurrentUser(updatedUser);
        }
        
        showAlert(`Statut de l'utilisateur mis à jour : ${status}`, 'success');
        await loadPendingUsers();
        await loadAllUsers();
    } catch (error) {
        showAlert('Erreur lors de la mise à jour: ' + error.message, 'error');
    }
}

// Charger tous les produits
async function loadAllProducts() {
    try {
        const products = await getAllProducts();
        const container = document.getElementById('allProducts');
        
        if (!container) return;

        if (products.length === 0) {
            container.innerHTML = '<p>Aucun produit.</p>';
            return;
        }

        const rows = await Promise.all(products.map(async product => {
            const farmer = await getUserById(product.farmerId);
            return `
                <tr>
                    <td>${product.title}</td>
                    <td>${product.category}</td>
                    <td>${formatPrice(product.price)}</td>
                    <td>${farmer ? farmer.name : 'Inconnu'}</td>
                    <td>${formatDate(product.createdAt)}</td>
                </tr>
            `;
        }));

        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Titre</th>
                        <th>Catégorie</th>
                        <th>Prix</th>
                        <th>Fermier</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows.join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
    }
}

// Charger toutes les commandes
async function loadAllOrders() {
    try {
        const orders = await apiGetOrders();
        const container = document.getElementById('allOrders');
        
        if (!container) return;

        if (orders.length === 0) {
            container.innerHTML = '<p>Aucune commande.</p>';
            return;
        }

        const rows = await Promise.all(orders.map(async order => {
            const consumer = await getUserById(order.consumerId);
            return `
                <tr>
                    <td>${order.title}</td>
                    <td>${consumer ? consumer.name : 'Inconnu'}</td>
                    <td>${formatPrice(order.price)}</td>
                    <td>${order.status}</td>
                    <td>${formatDate(order.createdAt)}</td>
                </tr>
            `;
        }));

        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Produit</th>
                        <th>Consommateur</th>
                        <th>Prix</th>
                        <th>Statut</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows.join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Erreur lors du chargement des commandes:', error);
    }
}

// Charger les plaintes
async function loadComplaints() {
    try {
        const complaints = await apiGetComplaints();
        const container = document.getElementById('complaintsList');
        
        if (!container) return;

        if (complaints.length === 0) {
            container.innerHTML = '<p>Aucune plainte.</p>';
            return;
        }

        const rows = await Promise.all(complaints.map(async complaint => {
            const consumer = await getUserById(complaint.consumerId);
            return `
                <tr>
                    <td>${complaint.orderId}</td>
                    <td>${consumer ? consumer.name : 'Inconnu'}</td>
                    <td>${complaint.complaint}</td>
                    <td>${complaint.status}</td>
                    <td>${formatDate(complaint.createdAt)}</td>
                    <td>
                        <button class="btn btn-primary btn-small" onclick="updateComplaintStatus('${complaint.id}', 'resolved')">Résoudre</button>
                    </td>
                </tr>
            `;
        }));

        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Commande ID</th>
                        <th>Consommateur</th>
                        <th>Plainte</th>
                        <th>Statut</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows.join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Erreur lors du chargement des plaintes:', error);
    }
}

// Mettre à jour le statut d'une plainte
async function updateComplaintStatus(complaintId, status) {
    try {
        await apiUpdateComplaint(complaintId, { status });
        showAlert('Statut de la plainte mis à jour.', 'success');
        await loadComplaints();
    } catch (error) {
        showAlert('Erreur lors de la mise à jour: ' + error.message, 'error');
    }
}

// Contacter un utilisateur
async function contactUser(userId) {
    const user = await getUserById(userId);
    if (!user) return;

    document.getElementById('adminContactUserId').value = userId;
    document.getElementById('adminContactUserName').textContent = user.name;
    showModal('adminContactModal');
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
        const newMessage = {
            fromId: getCurrentUser().id,
            toId: userId,
            subject,
            message,
            createdAt: new Date().toISOString()
        };

        await apiCreateMessage(newMessage);
        showAlert('Message envoyé avec succès !', 'success');
        closeModal('adminContactModal');
        document.getElementById('adminContactForm').reset();
    } catch (error) {
        showAlert('Erreur lors de l\'envoi: ' + error.message, 'error');
    }
}

// Charger les statistiques admin
async function loadAdminStats() {
    try {
        const users = await apiGetUsers();
        const products = await getAllProducts();
        const orders = await apiGetOrders();
        const complaints = await apiGetComplaints();

        const statsContainer = document.getElementById('adminStats');
        if (!statsContainer) return;

        const roleCounts = {};
        users.forEach(u => {
            roleCounts[u.role] = (roleCounts[u.role] || 0) + 1;
        });

        statsContainer.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${users.length}</div>
                    <div class="stat-label">Total Utilisateurs</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${products.length}</div>
                    <div class="stat-label">Total Produits</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${orders.length}</div>
                    <div class="stat-label">Total Commandes</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${complaints.length}</div>
                    <div class="stat-label">Plaintes</div>
                </div>
            </div>
            <div class="chart-container">
                <h3 class="chart-title">Utilisateurs par rôle</h3>
                <div class="bar-chart">
                    ${Object.keys(roleCounts).map(role => {
                        const count = roleCounts[role];
                        const maxCount = Math.max(...Object.values(roleCounts), 1);
                        const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                        return `
                            <div class="bar" style="height: ${height}%">
                                <span class="bar-value">${count}</span>
                                <span class="bar-label">${role}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
    }
}

// Filtrer les utilisateurs par rôle
async function filterUsersByRole() {
    await loadAllUsers();
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    initAdminPage();
    
    const userRoleFilter = document.getElementById('userRoleFilter');
    if (userRoleFilter) {
        userRoleFilter.addEventListener('change', filterUsersByRole);
    }

    const adminContactForm = document.getElementById('adminContactForm');
    if (adminContactForm) {
        adminContactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            sendAdminMessage();
        });
    }
});

