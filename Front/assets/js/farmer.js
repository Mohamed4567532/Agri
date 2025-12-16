let editingProductId = null;

// Initialisation
document.addEventListener('DOMContentLoaded', async function() {
    await checkAuth();
    const user = getCurrentUser();
    
    if (!user || user.role !== 'farmer') {
        showAlert('Accès réservé aux fermiers', 'error');
        setTimeout(() => window.location.href = 'index.html', 2000);
        return;
    }
    
    await initFarmerPage();
    
    // Event listeners
    document.getElementById('productForm').addEventListener('submit', addProductForm);
    
    // Modal close
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
});

async function initFarmerPage() {
    await loadFarmerProducts();
    await loadFarmerMessages();
}

// Charger les produits du fermier
async function loadFarmerProducts() {
    try {
        const user = getCurrentUser();
        const response = await fetch(`http://localhost:3000/api/products`, {
            headers: getHeaders()
        });
        
        if (!response.ok) throw new Error('Erreur lors du chargement des produits');
        
        const products = await response.json();
        const farmerProducts = products.filter(p => p.farmerId._id === user.id || p.farmerId.id === user.id);
        
        const productsList = document.getElementById('productsList');
        
        if (farmerProducts.length === 0) {
            productsList.innerHTML = '<p>Vous n\'avez aucun produit. Cliquez sur "Ajouter un produit" pour commencer.</p>';
            return;
        }
        
        productsList.innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Photo</th>
                        <th>Type</th>
                        <th>Détails</th>
                        <th>Description</th>
                        <th>Statut</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${farmerProducts.map(p => `
                        <tr>
                            <td>
                                <div class="product-thumbnail">
                                    <img src="${p.image ? (p.image.startsWith('/') ? 'http://localhost:3000' + p.image : p.image) : 'https://via.placeholder.com/50x50?text=' + (p.type === 'mouton' ? '🐑' : '🫒')}" 
                                         alt="${p.type}" 
                                         onerror="this.src='https://via.placeholder.com/50x50?text=${p.type === 'mouton' ? '🐑' : '🫒'}'">
                                </div>
                            </td>
                            <td><span class="badge badge-${p.type === 'mouton' ? 'warning' : 'success'}">${p.type === 'mouton' ? 'Mouton' : 'Huile'}</span></td>
                            <td>${formatProductDetails(p)}</td>
                            <td>${p.description.substring(0, 50)}...</td>
                            <td><span class="badge badge-${p.status === 'disponible' ? 'success' : 'danger'}">${p.status}</span></td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="editProduct('${p._id || p.id}')">Modifier</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteProduct('${p._id || p.id}')">Supprimer</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
    } catch (error) {
        console.error('Erreur:', error);
        showAlert('Erreur lors du chargement des produits', 'error');
    }
}

function formatProductDetails(product) {
    if (product.type === 'mouton') {
        return `
            <strong>Prix:</strong> ${product.price} TND<br>
            <strong>Poids:</strong> ${product.weight} kg<br>
            ${product.hasMedicalCertificate ? '✅ Certificat médical' : '❌ Sans certificat'}
        `;
    } else if (product.type === 'huile') {
        return `
            <strong>Type:</strong> ${product.oilType}<br>
            <strong>Quantité:</strong> ${product.quantity} L
        `;
    }
    return 'N/A';
}

// Toggle des champs selon le type de produit
function toggleProductFields() {
    const type = document.getElementById('productType').value;
    const sheepFields = document.getElementById('sheepFields');
    const oilFields = document.getElementById('oilFields');
    
    if (type === 'mouton') {
        sheepFields.style.display = 'block';
        oilFields.style.display = 'none';
        
        // Rendre les champs mouton requis
        document.getElementById('sheepPrice').required = true;
        document.getElementById('sheepWeight').required = true;
        
        // Retirer required des champs huile
        document.getElementById('oilType').required = false;
        document.getElementById('oilQuantity').required = false;
        
    } else if (type === 'huile') {
        sheepFields.style.display = 'none';
        oilFields.style.display = 'block';
        
        // Rendre les champs huile requis
        document.getElementById('oilType').required = true;
        document.getElementById('oilQuantity').required = true;
        
        // Retirer required des champs mouton
        document.getElementById('sheepPrice').required = false;
        document.getElementById('sheepWeight').required = false;
        
    } else {
        sheepFields.style.display = 'none';
        oilFields.style.display = 'none';
        
        // Retirer tous les required
        document.getElementById('sheepPrice').required = false;
        document.getElementById('sheepWeight').required = false;
        document.getElementById('oilType').required = false;
        document.getElementById('oilQuantity').required = false;
    }
}

// Toggle du champ certificat médical
function toggleCertificateUpload() {
    const hasCertificate = document.getElementById('hasCertificate').checked;
    const certificateUploadDiv = document.getElementById('certificateUploadDiv');
    
    if (hasCertificate) {
        certificateUploadDiv.style.display = 'block';
        document.getElementById('certificatePDF').required = true;
    } else {
        certificateUploadDiv.style.display = 'none';
        document.getElementById('certificatePDF').required = false;
    }
}

// Ajouter/modifier un produit
async function addProductForm(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    const user = getCurrentUser();
    if (!user || !user.id) {
        showAlert('Erreur: Utilisateur non connecté', 'error');
        return;
    }

    formData.append('farmerId', user.id);

    try {
        let response;
        
        if (editingProductId) {
            response = await fetch(`http://localhost:3000/api/products/${editingProductId}`, {
                method: 'PUT',
                body: formData
            });
            editingProductId = null;
        } else {
            response = await fetch(`http://localhost:3000/api/products`, {
                method: 'POST',
                body: formData
            });
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.errors ? data.errors.join(', ') : data.message);
        }
        
        showAlert(editingProductId ? 'Produit modifié avec succès !' : 'Produit ajouté avec succès !', 'success');
        form.reset();
        closeModal('productModal');
        await loadFarmerProducts();
        
    } catch (error) {
        console.error('Erreur:', error);
        showAlert('Erreur: ' + error.message, 'error');
    }
}

// Ouvrir le modal d'ajout
function openAddProductModal() {
    editingProductId = null;
    document.getElementById('productForm').reset();
    document.getElementById('productModal').querySelector('h2').textContent = 'Ajouter un produit';
    toggleProductFields(); // Reset fields
    document.getElementById('productModal').style.display = 'block';
}

// Modifier un produit
async function editProduct(id) {
    try {
        const response = await fetch(`http://localhost:3000/api/products/${id}`, {
            headers: getHeaders()
        });
        
        if (!response.ok) throw new Error('Produit non trouvé');
        
        const product = await response.json();
        
        editingProductId = id;
        
        // Remplir le formulaire
        document.getElementById('productType').value = product.type;
        toggleProductFields();
        
        if (product.type === 'mouton') {
            document.getElementById('sheepPrice').value = product.price;
            document.getElementById('sheepWeight').value = product.weight;
            document.getElementById('hasCertificate').checked = product.hasMedicalCertificate;
            toggleCertificateUpload();
        } else if (product.type === 'huile') {
            document.getElementById('oilType').value = product.oilType;
            document.getElementById('oilQuantity').value = product.quantity;
        }
        
        document.getElementById('productDescription').value = product.description;
        
        document.getElementById('productModal').querySelector('h2').textContent = 'Modifier le produit';
        document.getElementById('productModal').style.display = 'block';
        
    } catch (error) {
        console.error('Erreur:', error);
        showAlert('Erreur: ' + error.message, 'error');
    }
}

// Supprimer un produit
async function deleteProduct(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;
    
    try {
        const response = await fetch(`http://localhost:3000/api/products/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        
        if (!response.ok) throw new Error('Erreur lors de la suppression');
        
        showAlert('Produit supprimé avec succès !', 'success');
        await loadFarmerProducts();
        
    } catch (error) {
        console.error('Erreur:', error);
        showAlert('Erreur: ' + error.message, 'error');
    }
}

// Charger les messages du fermier
async function loadFarmerMessages() {
    try {
        const user = getCurrentUser();
        const response = await fetch(`http://localhost:3000/api/messages?userId=${user.id}`, {
            headers: getHeaders()
        });
        
        if (!response.ok) throw new Error('Erreur lors du chargement des messages');
        
        const messages = await response.json();
        const receivedMessages = messages.filter(m => m.receiverId._id === user.id || m.receiverId.id === user.id);
        
        const farmerMessages = document.getElementById('farmerMessages');
        
        if (receivedMessages.length === 0) {
            farmerMessages.innerHTML = '<p>Aucun message reçu.</p>';
            return;
        }
        
        farmerMessages.innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>De</th>
                        <th>Sujet</th>
                        <th>Date</th>
                        <th>Statut</th>
                    </tr>
                </thead>
                <tbody>
                    ${receivedMessages.map(m => `
                        <tr>
                            <td>${m.senderId.name}</td>
                            <td>${m.subject}</td>
                            <td>${formatDate(m.createdAt)}</td>
                            <td>${m.isRead ? '✅' : '📩'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
    } catch (error) {
        console.error('Erreur:', error);
        // Pas d'alerte pour les messages, c'est secondaire
    }
}

// Fonctions utilitaires
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Exposer les fonctions globalement
window.toggleProductFields = toggleProductFields;
window.toggleCertificateUpload = toggleCertificateUpload;
window.openAddProductModal = openAddProductModal;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
