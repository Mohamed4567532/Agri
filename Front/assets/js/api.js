/* ============================================
   AgriSmart - API Client
   Gestion des appels API vers JSON Server
   ============================================ */

const API_BASE_URL = 'http://localhost:3000/api';

// Obtenir les headers avec le rôle de l'utilisateur
function getHeaders() {
    const user = getCurrentUser();
    const headers = {
        'Content-Type': 'application/json'
    };

    if (user) {
        headers['X-User-Role'] = user.role;
        headers['X-User-Id'] = user.id;
        headers['X-User-Status'] = user.status;
    }

    return headers;
}

// Fonction générique pour les requêtes API
async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                ...getHeaders(),
                ...options.headers
            }
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Erreur serveur' }));
            throw new Error(error.message || `Erreur HTTP: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Erreur API:', error);
        throw error;
    }
}

// ============================================
// API Authentification
// ============================================
async function apiLogin(email, password) {
    return apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
}

async function apiRegister(userData) {
    const isFormData = userData instanceof FormData;
    const url = `${API_BASE_URL}/auth/register`;

    const options = {
        method: 'POST',
        body: isFormData ? userData : JSON.stringify(userData)
    };

    if (!isFormData) {
        options.headers = { 'Content-Type': 'application/json' };
    }

    try {
        const response = await fetch(url, options);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || data.error || `Erreur HTTP: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('Erreur API Register:', error);
        throw error;
    }
}

// ============================================
// API Utilisateurs
// ============================================
async function apiGetUsers() {
    return apiRequest('/users');
}

async function apiGetUser(id) {
    return apiRequest(`/users/${id}`);
}

async function apiCreateUser(userData) {
    return apiRequest('/users', {
        method: 'POST',
        body: JSON.stringify(userData)
    });
}

async function apiUpdateUser(id, userData) {
    const isFormData = userData instanceof FormData;
    const url = `${API_BASE_URL}/users/${id}`;

    const headers = getHeaders();
    if (isFormData) {
        delete headers['Content-Type'];
    }

    const options = {
        method: 'PATCH',
        headers: headers,
        body: isFormData ? userData : JSON.stringify(userData)
    };

    try {
        const response = await fetch(url, options);

        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            console.warn('Réponse non-JSON reçue (probablement HTML 404/500):', contentType);
            if (!response.ok) {
                // Si 404, c'est souvent car le backend n'a pas été redémarré avec la nouvelle route
                throw new Error(response.status === 404
                    ? `Erreur 404: Endpoint non trouvé. Redémarrez le serveur (npm start) pour appliquer les changements.`
                    : `Erreur HTTP: ${response.status}`);
            }
            data = { success: true };
        }

        if (!response.ok) {
            throw new Error(data.message || `Erreur HTTP: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('Erreur API Update User:', error);
        throw error;
    }
}

async function apiDeleteUser(id) {
    return apiRequest(`/users/${id}`, {
        method: 'DELETE'
    });
}

// ============================================
// API Produits
// ============================================
async function apiGetProducts() {
    return apiRequest('/products');
}

async function apiGetProduct(id) {
    return apiRequest(`/products/${id}`);
}

async function apiCreateProduct(productData) {
    const isFormData = productData instanceof FormData;

    const options = {
        method: 'POST'
    };

    if (isFormData) {
        options.body = productData;
    } else {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = JSON.stringify(productData);
    }

    const url = `${API_BASE_URL}/products`;
    console.log('🚀 POST', url);

    try {
        const token = localStorage.getItem('authToken');
        if (token && !isFormData) {
            options.headers = { ...options.headers, 'Authorization': `Bearer ${token}` };
        }

        const response = await fetch(url, options);
        console.log('📥 Status:', response.status);

        const data = await response.json();

        if (!response.ok) {
            const errorMsg = data.errors ? data.errors.join(', ') : data.message || `Erreur HTTP: ${response.status}`;
            throw new Error(errorMsg);
        }

        return data;
    } catch (error) {
        console.error('❌ Erreur API:', error);
        throw error;
    }
}

async function apiUpdateProduct(id, productData) {
    return apiRequest(`/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(productData)
    });
}

async function apiDeleteProduct(id) {
    return apiRequest(`/products/${id}`, {
        method: 'DELETE'
    });
}

// ============================================
// API Commandes
// ============================================
async function apiGetOrders() {
    return apiRequest('/orders');
}

async function apiCreateOrder(orderData) {
    return apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
    });
}

async function apiUpdateOrder(id, orderData) {
    return apiRequest(`/orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(orderData)
    });
}

// ============================================
// API Rapports Vétérinaires
// ============================================
async function apiGetVetReports() {
    return apiRequest('/vetReports');
}

async function apiCreateVetReport(reportData) {
    return apiRequest('/vetReports', {
        method: 'POST',
        body: JSON.stringify(reportData)
    });
}

async function apiUpdateVetReport(id, reportData) {
    return apiRequest(`/vetReports/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(reportData)
    });
}

// ============================================
// API Plaintes
// ============================================
async function apiGetComplaints() {
    return apiRequest('/complaints');
}

async function apiCreateComplaint(complaintData) {
    return apiRequest('/complaints', {
        method: 'POST',
        body: JSON.stringify(complaintData)
    });
}

async function apiUpdateComplaint(id, complaintData) {
    return apiRequest(`/complaints/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(complaintData)
    });
}

// ============================================
// API Messages
// ============================================
async function apiGetMessages() {
    return apiRequest('/messages');
}

async function apiGetMessagesByUser(userId) {
    const messages = await apiGetMessages();
    return messages.filter(m => m.toId === userId || m.fromId === userId);
}

async function apiCreateMessage(messageData) {
    return apiRequest('/messages', {
        method: 'POST',
        body: JSON.stringify(messageData)
    });
}

// ============================================
// API Rendez-vous
// ============================================
async function apiGetAppointments() {
    return apiRequest('/appointments');
}

async function apiCreateAppointment(appointmentData) {
    return apiRequest('/appointments', {
        method: 'POST',
        body: JSON.stringify(appointmentData)
    });
}

// ============================================
// Recherche et Filtres
// ============================================
async function apiSearchProducts(query) {
    const products = await apiGetProducts();
    if (!query) return products;

    const lowerQuery = query.toLowerCase();
    return products.filter(p =>
        p.title.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.category.toLowerCase().includes(lowerQuery)
    );
}

async function apiFilterProductsByCategory(category) {
    const products = await apiGetProducts();
    if (!category || category === 'all') return products;
    return products.filter(p => p.category === category);
}

