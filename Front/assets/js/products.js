/* ============================================
   AgriSmart - Gestion des Produits
   Fonctions communes pour les produits
   ============================================ */

// Obtenir tous les produits
async function getAllProducts() {
    try {
        return await apiGetProducts();
    } catch (error) {
        console.error('Erreur lors de la récupération des produits:', error);
        return [];
    }
}

// Obtenir un produit par ID
async function getProductById(id) {
    try {
        return await apiGetProduct(id);
    } catch (error) {
        console.error('Erreur lors de la récupération du produit:', error);
        return null;
    }
}

// Obtenir les produits d'un fermier
async function getProductsByFarmer(farmerId) {
    const products = await getAllProducts();
    return products.filter(p => p.farmerId === farmerId);
}

// Ajouter un produit
async function addProduct(formData) {
    try {
        return await apiCreateProduct(formData);
    } catch (error) {
        console.error('Erreur lors de l\'ajout du produit:', error);
        throw error;
    }
}

// Mettre à jour un produit
async function updateProduct(id, productData) {
    try {
        return await apiUpdateProduct(id, productData);
    } catch (error) {
        console.error('Erreur lors de la mise à jour du produit:', error);
        throw error;
    }
}

// Supprimer un produit
async function deleteProduct(id) {
    try {
        await apiDeleteProduct(id);
        return true;
    } catch (error) {
        console.error('Erreur lors de la suppression du produit:', error);
        return false;
    }
}

// Rechercher des produits
async function searchProducts(query) {
    return await apiSearchProducts(query);
}

// Filtrer les produits par catégorie
async function filterProductsByCategory(category) {
    return await apiFilterProductsByCategory(category);
}

// Obtenir toutes les catégories
async function getCategories() {
    const products = await getAllProducts();
    const categories = [...new Set(products.map(p => p.category))];
    return categories;
}

// Rendre un produit en HTML (carte)
async function renderProductCard(product) {
    const user = getCurrentUser();
    const farmer = await getUserById(product.farmerId);
    
    return `
        <div class="card">
            <img src="${product.image}" alt="${product.title}" class="card-img" onerror="this.src='https://via.placeholder.com/400x300?text=Produit'">
            <h3 class="card-title">${product.title}</h3>
            <p class="card-text">${product.description}</p>
            <div class="card-price">${formatPrice(product.price)}</div>
            <div style="margin-bottom: 0.5rem; color: var(--text-light); font-size: 0.9rem;">
                Catégorie: <strong>${product.category}</strong>
            </div>
            ${farmer ? `<div style="margin-bottom: 1rem; color: var(--text-light); font-size: 0.9rem;">
                Vendeur: <strong>${farmer.name}</strong>
            </div>` : ''}
            <a href="product-details.html?id=${product.id}" class="btn btn-primary btn-small">Voir détails</a>
        </div>
    `;
}

// Obtenir un utilisateur par ID
async function getUserById(id) {
    try {
        return await apiGetUser(id);
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
        return null;
    }
}

// Rendre la liste des produits
async function renderProducts(products, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (products.length === 0) {
        container.innerHTML = '<p class="text-center">Aucun produit trouvé.</p>';
        return;
    }

    const cards = await Promise.all(products.map(p => renderProductCard(p)));
    container.innerHTML = cards.join('');
}

// Initialiser la recherche et les filtres
function initProductFilters(containerId) {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            filterAndRenderProducts(containerId);
        });
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => {
            filterAndRenderProducts(containerId);
        });
    }

    // Remplir les options de catégorie
    (async () => {
        if (categoryFilter) {
            const categories = await getCategories();
            const currentValue = categoryFilter.value;
            categoryFilter.innerHTML = '<option value="all">Toutes les catégories</option>' +
                categories.map(cat => `<option value="${cat}">${cat.charAt(0).toUpperCase() + cat.slice(1)}</option>`).join('');
            categoryFilter.value = currentValue || 'all';
        }
    })();
}

// Filtrer et afficher les produits
async function filterAndRenderProducts(containerId) {
    const searchQuery = document.getElementById('searchInput')?.value || '';
    const category = document.getElementById('categoryFilter')?.value || 'all';

    let products;
    
    // Filtrer par catégorie
    products = await filterProductsByCategory(category);
    
    // Rechercher
    if (searchQuery) {
        products = await searchProducts(searchQuery);
        // Filtrer aussi par catégorie si nécessaire
        if (category !== 'all') {
            products = products.filter(p => p.category === category);
        }
    }

    await renderProducts(products, containerId);
}





