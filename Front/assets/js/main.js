/* ============================================
   AgriSmart - JavaScript Principal
   Fonctions utilitaires communes
   ============================================ */

// Vérifier la connexion au serveur
async function checkServerConnection() {
    try {
        // Utiliser l'URL directement si API_BASE_URL n'est pas encore défini
        const apiUrl = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'http://localhost:3000/api';
        const response = await fetch(`${apiUrl}/users`);
        if (response.ok) {
            return true;
        }
        throw new Error('Serveur non disponible');
    } catch (error) {
        console.warn('Serveur non disponible:', error);
        // Ne pas bloquer l'application, juste avertir
        setTimeout(() => {
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-error';
            alertDiv.style.position = 'fixed';
            alertDiv.style.top = '80px';
            alertDiv.style.right = '20px';
            alertDiv.style.zIndex = '9999';
            alertDiv.style.maxWidth = '400px';
            alertDiv.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Le serveur n\'est pas disponible. <br>Démarrez-le avec: <code>npm start</code>';
            document.body.appendChild(alertDiv);
            setTimeout(() => alertDiv.remove(), 10000);
        }, 1000);
        return false;
    }
}

// Obtenir l'utilisateur actuel
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

// Définir l'utilisateur actuel
function setCurrentUser(user) {
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
        localStorage.removeItem('currentUser');
    }
}

// Vérifier si l'utilisateur est connecté
function isLoggedIn() {
    return getCurrentUser() !== null;
}

// Masquer Contact pour le rôle farmer (UI only)
function hideContactForFarmer() {
    const user = getCurrentUser();
    if (!user || user.role !== 'farmer') return;

    const selectors = [
        'a[href*="contact.html"]',
        'button[onclick*="contact.html"]'
    ];

    selectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => {
            const li = el.closest('li');
            if (li) {
                li.style.display = 'none';
            } else {
                el.style.display = 'none';
            }
        });
    });
}

// Vérifier le rôle de l'utilisateur
function hasRole(role) {
    const user = getCurrentUser();
    return user && user.role === role && user.status === 'accepted';
}

// Rediriger selon le rôle
function redirectByRole() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    if (user.status !== 'accepted') {
        alert('Votre compte n\'est pas encore approuvé par l\'administrateur.');
        window.location.href = 'login.html';
        return;
    }

    const rolePages = {
        'farmer': 'farmer.html',
        'consumer': 'consumer.html',
        'vet': 'veterinarian.html',
        'admin': 'admin.html'
    };

    if (rolePages[user.role]) {
        window.location.href = rolePages[user.role];
    }
}

// Gestion du menu hamburger
function initHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        // Fermer le menu quand on clique sur un lien
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });
    }
}

// Fonction pour créer et afficher un modal
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
        modal.style.visibility = 'hidden';
        modal.style.opacity = '0';
    }
}

// Initialiser les modals
function initModals() {
    // Fermer les modals en cliquant à l'extérieur
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });

    // Fermer les modals avec le bouton close
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
            }
        });
    });
}

// Afficher un message d'alerte
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;

    const container = document.querySelector('.container') || document.body;
    container.insertBefore(alertDiv, container.firstChild);

    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Formater le prix
function formatPrice(price) {
    return `${price} TND`;
}

// Formater la date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', async () => {
    await checkServerConnection();
    initHamburgerMenu();
    initModals();
    hideContactForFarmer();
});





