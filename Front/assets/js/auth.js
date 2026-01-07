/* ============================================
   AgriSmart - Authentification
   Gestion de l'inscription et de la connexion
   ============================================ */

// Inscription
async function register() {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const role = document.getElementById('role').value;
    const name = document.getElementById('name').value;

    // Validation
    if (!username || !email || !password || !role || !name) {
        showAlert('Veuillez remplir tous les champs.', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showAlert('Les mots de passe ne correspondent pas.', 'error');
        return;
    }

    if (password.length < 6) {
        showAlert('Le mot de passe doit contenir au moins 6 caractères.', 'error');
        return;
    }

    try {
        // Créer les données du formulaire
        const formData = new FormData();
        formData.append('username', username);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('role', role);
        formData.append('name', name);

        const imageFile = document.getElementById('image').files[0];
        if (imageFile) {
            formData.append('image', imageFile);
        }

        const response = await apiRegister(formData);
        showAlert(response.message || 'Inscription réussie ! Votre compte sera activé par l\'administrateur.', 'success');

        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    } catch (error) {
        showAlert('Erreur lors de l\'inscription: ' + error.message, 'error');
    }
}

// Connexion
async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
        showAuthMessage('Veuillez remplir tous les champs.', 'error', 'Champs manquants');
        return;
    }

    try {
        // Appeler l'API d'authentification backend
        const response = await apiLogin(email, password);

        // Connexion réussie - l'utilisateur est retourné par le backend
        setCurrentUser(response.user);
        showAuthMessage('Connexion réussie ! Redirection en cours...', 'success', 'Bienvenue ' + response.user.name);

        setTimeout(() => {
            redirectByRole();
        }, 1500);
    } catch (error) {
        // Gérer les différents types d'erreurs avec des messages appropriés
        handleLoginError(error);
    }
}

// Gérer les erreurs de connexion avec des messages détaillés
function handleLoginError(error) {
    const message = error.message || 'Erreur lors de la connexion';

    // Détection des différents types d'erreurs
    if (message.includes('pas encore activé') || message.includes('pending')) {
        showAuthMessage(
            'Votre compte est en attente d\'approbation par l\'administrateur. Vous recevrez une notification une fois votre compte activé.',
            'warning',
            '⏳ Compte en attente'
        );
    } else if (message.includes('rejeté') || message.includes('rejected')) {
        showAuthMessage(
            'Votre demande d\'inscription a été rejetée. Veuillez contacter l\'administrateur pour plus d\'informations.',
            'error',
            '❌ Compte rejeté'
        );
    } else if (message.includes('suspendu') || message.includes('suspended')) {
        showAuthMessage(
            'Votre compte a été suspendu. Veuillez contacter l\'administrateur pour plus d\'informations.',
            'error',
            '🚫 Compte suspendu'
        );
    } else if (message.includes('incorrect') || message.includes('Email ou mot de passe')) {
        showAuthMessage(
            'Vérifiez votre email et mot de passe puis réessayez.',
            'error',
            '🔒 Identifiants incorrects'
        );
    } else {
        showAuthMessage(message, 'error', '❌ Erreur de connexion');
    }
}

// Afficher un message d'authentification stylisé
function showAuthMessage(message, type, title) {
    const messageDiv = document.getElementById('authMessage');
    if (!messageDiv) {
        // Fallback to showAlert if authMessage div doesn't exist
        showAlert(message, type);
        return;
    }

    const icons = {
        'success': '<i class="fa-solid fa-circle-check"></i>',
        'error': '<i class="fa-solid fa-circle-xmark"></i>',
        'warning': '<i class="fa-solid fa-triangle-exclamation"></i>',
        'info': '<i class="fa-solid fa-circle-info"></i>'
    };

    messageDiv.className = `auth-message ${type} show`;
    messageDiv.innerHTML = `
        <div class="icon">${icons[type] || ''}</div>
        <div class="title">${title || ''}</div>
        <div class="details">${message}</div>
    `;

    // Auto-hide after 10 seconds for non-error messages
    if (type === 'success') {
        setTimeout(() => {
            messageDiv.classList.remove('show');
        }, 5000);
    }
}

// Déconnexion
function logout() {
    setCurrentUser(null);
    window.location.href = 'index.html';
}

// Vérifier l'authentification et rediriger si nécessaire
function checkAuth() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Vérifier le rôle spécifique
function checkRole(requiredRole) {
    if (!checkAuth()) {
        return false;
    }

    const user = getCurrentUser();
    if (user.role !== requiredRole || user.status !== 'accepted') {
        alert('Accès non autorisé.');
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Mettre à jour la navigation selon l'état de connexion et le rôle
function updateNavbar() {
    const user = getCurrentUser();
    const navMenu = document.querySelector('.nav-menu');

    if (!navMenu) return;

    if (user) {
        // Utilisateur connecté
        let navLinks = `<li><a href="index.html">
            <span class="nav-icon"><svg viewBox="0 0 24 24" width="18" height="18">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <polyline points="9 22 9 12 15 12 15 22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg></span>
            Accueil
        </a></li>`;

        // Liens spécifiques pour agriculteurs
        if (user.role === 'farmer') {
            navLinks += `
                <li><a href="farmer.html">
                    <span class="nav-icon"><svg viewBox="0 0 24 24" width="18" height="18">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <path d="M16 10a4 4 0 0 1-8 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg></span>
                    Mes Produits
                </a></li>
                <li><a href="consultation.html">
                    <span class="nav-icon"><svg viewBox="0 0 24 24" width="18" height="18">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M2 17l10 5 10-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M2 12l10 5 10-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg></span>
                    Consultation Vétérinaire
                </a></li>
                <li><a href="statistiques.html">
                    <span class="nav-icon"><svg viewBox="0 0 24 24" width="18" height="18">
                        <line x1="18" y1="20" x2="18" y2="10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <line x1="12" y1="20" x2="12" y2="4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <line x1="6" y1="20" x2="6" y2="14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg></span>
                    Statistiques
                </a></li>
            `;
        }

        // Liens spécifiques pour vétérinaires
        if (user.role === 'vet') {
            navLinks += `
                <li><a href="veterinarian.html">
                    <span class="nav-icon"><svg viewBox="0 0 24 24" width="18" height="18">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M2 17l10 5 10-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M2 12l10 5 10-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg></span>
                    Mes Consultations
                </a></li>
            `;
        }

        // Liens spécifiques pour consommateurs
        if (user.role === 'consumer') {
            navLinks += `
                <li><a href="consumer.html">
                    <span class="nav-icon"><svg viewBox="0 0 24 24" width="18" height="18">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="12" cy="7" r="4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg></span>
                    Mon Espace
                </a></li>
            `;
        }

        // Liens spécifiques pour admin
        if (user.role === 'admin') {
            navLinks += `
                <li><a href="admin.html">
                    <span class="nav-icon"><svg viewBox="0 0 24 24" width="18" height="18">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg></span>
                    Administration
                </a></li>
            `;
        }

        // Lien vers les réclamations pour tous les utilisateurs
        navLinks += `
            <li><a href="reclamations.html">
                <span class="nav-icon"><svg viewBox="0 0 24 24" width="18" height="18">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <polyline points="22,6 12,13 2,6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg></span>
                Mes Réclamations
            </a></li>
        `;

        navLinks += `
            <li><a href="#" onclick="logout(); return false;">
                <span class="nav-icon"><svg viewBox="0 0 24 24" width="18" height="18">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <polyline points="16 17 21 12 16 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg></span>
                Déconnexion
            </a></li>
            <li>
                <a href="#" onclick="showUpdateProfileModal(); return false;" style="font-weight: 600; color: var(--primary-color); display: flex; align-items: center; gap: 8px; background: rgba(76, 175, 80, 0.1); border: 1px solid rgba(76, 175, 80, 0.3);" title="Changer la photo de profil">
                    ${user.image
                ? `<img src="http://localhost:3000${user.image}" alt="${user.name}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(76, 175, 80, 0.3);">`
                : `<span class="nav-icon"><svg viewBox="0 0 24 24" width="20" height="20">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="12" cy="7" r="4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg></span>`
            }
                    <span>${user.name}</span>
                </a>
            </li>
        `;

        navMenu.innerHTML = navLinks;
    } else {
        // Utilisateur non connecté
        navMenu.innerHTML = `
            <li><a href="index.html">
                <span class="nav-icon"><svg viewBox="0 0 24 24" width="18" height="18">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <polyline points="9 22 9 12 15 12 15 22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg></span>
                Accueil
            </a></li>
            <li><a href="login.html">
                <span class="nav-icon"><svg viewBox="0 0 24 24" width="18" height="18">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <polyline points="10 17 15 12 10 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <line x1="15" y1="12" x2="3" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg></span>
                Connexion
            </a></li>
            <li><a href="register.html">
                <span class="nav-icon"><svg viewBox="0 0 24 24" width="18" height="18">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="8.5" cy="7" r="4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <line x1="20" y1="8" x2="20" y2="14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <line x1="23" y1="11" x2="17" y2="11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg></span>
                Inscription
            </a></li>
        `;
    }
}

// Gestion de la mise à jour de photo de profil
function showUpdateProfileModal() {
    let modal = document.getElementById('updateProfileModal');
    if (!modal) {
        const modalHtml = `
            <div id="updateProfileModal" class="modal" style="display: none; align-items: center; justify-content: center;">
                <div class="modal-content" style="max-width: 400px; width: 90%; background: white; border-radius: 15px; padding: 0;">
                    <div class="modal-header" style="border-bottom: 1px solid #eee; padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center;">
                        <h3 style="margin: 0; color: #2c3e50;"><i class="fa-solid fa-camera"></i> Changer photo</h3>
                        <button class="close" onclick="closeUpdateProfileModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
                    </div>
                    <form id="updateProfileForm" style="padding: 1.5rem;">
                        <div class="form-group" style="margin-bottom: 1.5rem;">
                            <label style="display: block; margin-bottom: 0.5rem; color: #666;">Nouvelle photo de profil</label>
                            <input type="file" id="newProfileImage" class="form-control" accept="image/*" required style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 5px;">
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%; padding: 10px; border-radius: 8px; border: none; background: #27ae60; color: white; cursor: pointer;">Enregistrer</button>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        modal = document.getElementById('updateProfileModal');

        // Listeners
        document.getElementById('updateProfileForm').addEventListener('submit', handleUpdateProfile);

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeUpdateProfileModal();
        });
    }

    modal.style.display = 'flex';
    modal.classList.add('active');
}

function closeUpdateProfileModal() {
    const modal = document.getElementById('updateProfileModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
    }
}

async function handleUpdateProfile(e) {
    e.preventDefault();
    const fileInput = document.getElementById('newProfileImage');
    const file = fileInput.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
        const user = getCurrentUser();
        // Le backend attend PATCH avec multipart/form-data
        // et apiUpdateUser gère maintenant FormData
        const response = await apiUpdateUser(user.id, formData);

        if (response.success) {
            // Mettre à jour l'utilisateur local
            const updatedUser = response.user;
            // Préserver d'autres champs si nécessaire, mais ici on remplace tout l'objet user s'il est complet
            setCurrentUser(updatedUser);

            updateNavbar(); // Rafraîchir la navbar
            closeUpdateProfileModal();
            showAlert('Photo de profil mise à jour !', 'success');
        } else {
            showAlert('Erreur: ' + response.message, 'error');
        }
    } catch (error) {
        console.error(error);
        showAlert('Erreur lors de la mise à jour: ' + error.message, 'error');
    }
}

// Initialisation de la page d'authentification
document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();

    // Gérer le formulaire d'inscription
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            register();
        });
    }

    // Gérer le formulaire de connexion
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            login();
        });
    }
});

