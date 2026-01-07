let editingProductId = null;

// Initialisation
document.addEventListener('DOMContentLoaded', async function () {
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

    // Event listener pour le formulaire de réponse
    const replyForm = document.getElementById('replyMessageForm');
    if (replyForm) {
        replyForm.addEventListener('submit', function (e) {
            e.preventDefault();
            replyToMessage(e);
        });
    }

    // Modal close
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', function () {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
                modal.classList.remove('active');
            }
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
                                <button class="btn btn-sm btn-primary" onclick="editProduct('${p._id || p.id}')" style="padding: 8px; display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; background: #3498db; border: none; border-radius: 6px; color: white; cursor: pointer; transition: all 0.2s ease;" onmouseover="this.style.background='#2980b9'; this.style.transform='scale(1.1)'" onmouseout="this.style.background='#3498db'; this.style.transform='scale(1)'" title="Modifier le produit">
                                    <i class="fa-solid fa-pen-to-square" style="font-size: 16px;"></i>
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="deleteProduct('${p._id || p.id}')" style="margin-left: 5px; padding: 8px; display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; background: #e74c3c; border: none; border-radius: 6px; color: white; cursor: pointer; transition: all 0.2s ease;" onmouseover="this.style.background='#c0392b'; this.style.transform='scale(1.1)'" onmouseout="this.style.background='#e74c3c'; this.style.transform='scale(1)'" title="Supprimer le produit">
                                    <i class="fa-solid fa-trash" style="font-size: 16px; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));"></i>
                                </button>
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
            ${product.hasMedicalCertificate ? '<i class="fa-solid fa-file-medical"></i> Certificat médical' : '<i class="fa-solid fa-xmark"></i> Sans certificat'}
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
        if (!user || !user.id) {
            console.error('❌ Utilisateur non connecté');
            return;
        }

        console.log('📥 Chargement des messages pour le fermier:', user.id);

        // Utiliser le paramètre type=received pour ne récupérer que les messages reçus
        const response = await fetch(`${API_BASE_URL}/messages?userId=${user.id}&type=received`, {
            headers: getHeaders()
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Erreur réponse:', errorText);
            throw new Error('Erreur lors du chargement des messages');
        }

        const messages = await response.json();
        console.log(`✅ ${messages.length} messages reçus trouvés`);

        // Filtrer pour s'assurer que ce sont bien des messages reçus (double vérification)
        const receivedMessages = messages.filter(m => {
            if (!m.receiverId) return false;
            const receiverId = m.receiverId._id || m.receiverId.id || m.receiverId;
            const userId = user.id;
            return String(receiverId) === String(userId);
        });

        console.log(`✅ ${receivedMessages.length} messages reçus après filtrage`);

        const farmerMessages = document.getElementById('farmerMessages');
        if (!farmerMessages) {
            console.warn('⚠️ Élément farmerMessages non trouvé');
            return;
        }

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
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${receivedMessages.map(m => {
            const senderName = m.senderId?.name || m.senderId?.username || 'Inconnu';
            const senderRole = m.senderId?.role || 'N/A';
            return `
                        <tr>
                            <td>${senderName} (${senderRole})</td>
                            <td>${m.subject}</td>
                            <td>${formatDate(m.createdAt)}</td>
                            <td>${m.isRead ? '<i class="fa-solid fa-check-double"></i> Lu' : '<i class="fa-solid fa-envelope"></i> Non lu'}</td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="viewFarmerMessage('${m._id}')">Voir & Répondre</button>
                            </td>
                        </tr>
                    `;
        }).join('')}
                </tbody>
            </table>
        `;

    } catch (error) {
        console.error('❌ Erreur lors du chargement des messages:', error);
        const farmerMessages = document.getElementById('farmerMessages');
        if (farmerMessages) {
            farmerMessages.innerHTML = '<p style="color: red;">Erreur lors du chargement des messages.</p>';
        }
    }
}

// Voir les détails d'un message et permettre de répondre
async function viewFarmerMessage(messageId) {
    try {
        console.log('📧 Affichage du message:', messageId);

        const apiUrl = (typeof API_BASE_URL !== 'undefined' && API_BASE_URL) ? API_BASE_URL : 'http://localhost:3000/api';
        const response = await fetch(`${apiUrl}/messages/${messageId}`, {
            headers: getHeaders()
        });

        if (!response.ok) {
            throw new Error('Message non trouvé');
        }

        const message = await response.json();
        console.log('✅ Message récupéré:', message);

        // Afficher les détails dans le modal
        const messageDetailsDiv = document.getElementById('messageDetails');
        const messageSenderName = message.senderId?.name || message.senderId?.username || 'Inconnu';
        const messageSenderEmail = message.senderId?.email || 'N/A';
        const messageSenderRole = message.senderId?.role || 'N/A';
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
                        <div style="color: #4CAF50; font-weight: 700;">${message.productId.price ? formatPrice(message.productId.price) + ' TND' : 'N/A'}</div>
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

        messageDetailsDiv.innerHTML = `
            <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <h3 style="margin-top: 0;">${message.subject}</h3>
                <p><strong>De:</strong> ${messageSenderName} (${messageSenderRole})</p>
                <p><strong>Email:</strong> ${messageSenderEmail}</p>
                <p><strong>Date:</strong> ${formatDate(message.createdAt)}</p>
                ${productInfo}
            </div>
            <div style="background: white; padding: 1rem; border-radius: 8px; border: 1px solid #ddd; margin-bottom: 1rem;">
                <h4 style="margin-top: 0;">Message:</h4>
                <p style="white-space: pre-wrap;">${message.message}</p>
            </div>
        `;

        // Stocker l'ID du message et de l'expéditeur pour la réponse
        document.getElementById('replyMessageId').value = messageId;
        document.getElementById('replySenderId').value = message.senderId._id || message.senderId.id || message.senderId;
        document.getElementById('replySubject').value = `Re: ${message.subject}`;
        document.getElementById('replyContent').value = '';

        // Marquer le message comme lu
        if (!message.isRead) {
            try {
                await fetch(`${apiUrl}/messages/${messageId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        ...getHeaders()
                    },
                    body: JSON.stringify({ isRead: true })
                });
                console.log('✅ Message marqué comme lu');
                // Recharger la liste des messages
                await loadFarmerMessages();
            } catch (error) {
                console.error('Erreur lors du marquage comme lu:', error);
            }
        }

        // Afficher le modal
        const modal = document.getElementById('messageModal');
        if (modal) {
            modal.style.display = 'flex';
            modal.style.visibility = 'visible';
            modal.style.opacity = '1';
            modal.classList.add('active');
        }

    } catch (error) {
        console.error('❌ Erreur lors de l\'affichage du message:', error);
        showAlert('Erreur: ' + error.message, 'error');
    }
}

// Répondre à un message
async function replyToMessage(e) {
    e.preventDefault();

    const messageId = document.getElementById('replyMessageId').value;
    const senderId = document.getElementById('replySenderId').value;
    const subject = document.getElementById('replySubject').value.trim();
    const message = document.getElementById('replyContent').value.trim();

    if (!subject || !message) {
        showAlert('Veuillez remplir tous les champs.', 'error');
        return;
    }

    try {
        const currentUser = getCurrentUser();
        if (!currentUser || !currentUser.id) {
            showAlert('Vous devez être connecté pour répondre.', 'error');
            return;
        }

        // Récupérer le message original pour obtenir le productId si disponible
        const apiUrl = (typeof API_BASE_URL !== 'undefined' && API_BASE_URL) ? API_BASE_URL : 'http://localhost:3000/api';
        const originalMessageResponse = await fetch(`${apiUrl}/messages/${messageId}`, {
            headers: getHeaders()
        });

        let productId = null;
        if (originalMessageResponse.ok) {
            const originalMessage = await originalMessageResponse.json();
            productId = originalMessage.productId?._id || originalMessage.productId?.id || originalMessage.productId || null;
        }

        const newMessage = {
            senderId: currentUser.id,
            receiverId: senderId,
            subject: subject,
            message: message,
            productId: productId
        };

        console.log('📤 Envoi de la réponse:', newMessage);

        const response = await fetch(`${apiUrl}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getHeaders()
            },
            body: JSON.stringify(newMessage)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erreur lors de l\'envoi');
        }

        const savedMessage = await response.json();
        console.log('✅ Réponse envoyée avec succès:', savedMessage._id);

        showAlert('Réponse envoyée avec succès !', 'success');

        // Fermer le modal
        const modal = document.getElementById('messageModal');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('active');
        }

        // Réinitialiser le formulaire
        document.getElementById('replyMessageForm').reset();

    } catch (error) {
        console.error('❌ Erreur lors de l\'envoi de la réponse:', error);
        showAlert('Erreur lors de l\'envoi: ' + error.message, 'error');
    }
}

// Exposer les fonctions globalement
window.viewFarmerMessage = viewFarmerMessage;
window.replyToMessage = replyToMessage;

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
