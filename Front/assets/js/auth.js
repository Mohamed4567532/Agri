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
        // Créer le nouvel utilisateur via l'API d'authentification
        const newUser = {
            username,
            email,
            password,
            role,
            name
        };

        const response = await apiRegister(newUser);
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
        showAlert('Veuillez remplir tous les champs.', 'error');
        return;
    }

    try {
        // Appeler l'API d'authentification backend
        const response = await apiLogin(email, password);
        
        // Connexion réussie - l'utilisateur est retourné par le backend
        setCurrentUser(response.user);
        showAlert(response.message || 'Connexion réussie !', 'success');
        
        setTimeout(() => {
            redirectByRole();
        }, 1000);
    } catch (error) {
        // Les erreurs de statut (pending, rejected, suspended) sont gérées par le backend
        showAlert(error.message || 'Erreur lors de la connexion', 'error');
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
        let navLinks = `<li><a href="index.html">Accueil</a></li>`;
        
        // Liens spécifiques pour agriculteurs
        if (user.role === 'farmer') {
            navLinks += `
                <li><a href="farmer.html">Mes Produits</a></li>
                <li><a href="consultation.html">Consultation Vétérinaire</a></li>
                <li><a href="statistiques.html">Statistiques</a></li>
            `;
        }
        
        // Liens spécifiques pour vétérinaires
        if (user.role === 'vet') {
            navLinks += `
                <li><a href="veterinarian.html">Mes Consultations</a></li>
            `;
        }
        
        // Liens spécifiques pour consommateurs
        if (user.role === 'consumer') {
            navLinks += `
                <li><a href="consumer.html">Mon Espace</a></li>
            `;
        }
        
        // Liens spécifiques pour admin
        if (user.role === 'admin') {
            navLinks += `
                <li><a href="admin.html">Administration</a></li>
            `;
        }
        
        navLinks += `
            <li><a href="contact.html">Contact</a></li>
            <li><a href="#" onclick="logout(); return false;">Déconnexion</a></li>
            <li><a href="#" style="font-weight: bold; color: var(--primary-color);">👤 ${user.name}</a></li>
        `;
        
        navMenu.innerHTML = navLinks;
    } else {
        // Utilisateur non connecté
        navMenu.innerHTML = `
            <li><a href="index.html">Accueil</a></li>
            <li><a href="contact.html">Contact</a></li>
            <li><a href="login.html">Connexion</a></li>
            <li><a href="register.html">Inscription</a></li>
        `;
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

