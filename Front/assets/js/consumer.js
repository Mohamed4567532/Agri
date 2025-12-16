/* ============================================
   AgriSmart - Fonctionnalités Consommateur
   ============================================ */

// Initialisation de la page consommateur
async function initConsumerPage() {
    if (!checkRole('consumer')) return;

    await loadConsumerProducts();
    initProductFilters('productsContainer');
}

// Charger les produits pour le consommateur
async function loadConsumerProducts() {
    await filterAndRenderProducts('productsContainer');
}

// Acheter un produit
async function buyProduct(productId) {
    try {
        const product = await getProductById(productId);
        if (!product) {
            showAlert('Produit introuvable.', 'error');
            return;
        }

        const user = getCurrentUser();
        const order = {
            productId: product.id,
            consumerId: user.id,
            farmerId: product.farmerId,
            title: product.title,
            price: product.price,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        await apiCreateOrder(order);
        showAlert('Commande passée avec succès !', 'success');
    } catch (error) {
        showAlert('Erreur lors de la commande: ' + error.message, 'error');
    }
}

// Contacter le fermier
async function contactFarmer(farmerId) {
    const farmer = await getUserById(farmerId);
    if (!farmer) {
        showAlert('Fermier introuvable.', 'error');
        return;
    }

    document.getElementById('contactFarmerId').value = farmerId;
    document.getElementById('contactFarmerName').textContent = farmer.name;
    showModal('contactFarmerModal');
}

// Envoyer un message au fermier
async function sendMessageToFarmer() {
    const farmerId = document.getElementById('contactFarmerId').value;
    const subject = document.getElementById('messageSubject').value;
    const message = document.getElementById('messageContent').value;

    if (!subject || !message) {
        showAlert('Veuillez remplir tous les champs.', 'error');
        return;
    }

    try {
        const newMessage = {
            fromId: getCurrentUser().id,
            toId: farmerId,
            subject,
            message,
            createdAt: new Date().toISOString()
        };

        await apiCreateMessage(newMessage);
        showAlert('Message envoyé avec succès !', 'success');
        closeModal('contactFarmerModal');
        document.getElementById('contactFarmerForm').reset();
    } catch (error) {
        showAlert('Erreur lors de l\'envoi: ' + error.message, 'error');
    }
}

// Demander l'avis d'un vétérinaire sur un produit
async function requestVetOpinion(productId) {
    const product = await getProductById(productId);
    if (!product) {
        showAlert('Produit introuvable.', 'error');
        return;
    }

    document.getElementById('vetOpinionProductId').value = productId;
    document.getElementById('vetOpinionProductTitle').textContent = product.title;
    showModal('vetOpinionModal');
}

// Soumettre la demande d'avis vétérinaire
async function submitVetOpinionRequest() {
    const productId = document.getElementById('vetOpinionProductId').value;
    const question = document.getElementById('vetQuestion').value;

    if (!question) {
        showAlert('Veuillez poser votre question.', 'error');
        return;
    }

    try {
        const newReport = {
            productId,
            consumerId: getCurrentUser().id,
            question,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        await apiCreateVetReport(newReport);
        showAlert('Demande d\'avis envoyée au vétérinaire !', 'success');
        closeModal('vetOpinionModal');
        document.getElementById('vetOpinionForm').reset();
    } catch (error) {
        showAlert('Erreur lors de l\'envoi: ' + error.message, 'error');
    }
}

// Faire une plainte
async function makeComplaint() {
    const orderId = document.getElementById('complaintOrderId').value;
    const complaintText = document.getElementById('complaintText').value;

    if (!orderId || !complaintText) {
        showAlert('Veuillez remplir tous les champs.', 'error');
        return;
    }

    try {
        const newComplaint = {
            orderId,
            consumerId: getCurrentUser().id,
            complaint: complaintText,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        await apiCreateComplaint(newComplaint);
        showAlert('Plainte enregistrée avec succès !', 'success');
        closeModal('complaintModal');
        document.getElementById('complaintForm').reset();
    } catch (error) {
        showAlert('Erreur lors de l\'enregistrement: ' + error.message, 'error');
    }
}

// Charger les commandes du consommateur
async function loadConsumerOrders() {
    const user = getCurrentUser();
    const orders = await apiGetOrders();
    const consumerOrders = orders.filter(o => o.consumerId === user.id);

    const container = document.getElementById('ordersList');
    if (!container) return;

    if (consumerOrders.length === 0) {
        container.innerHTML = '<p>Aucune commande pour le moment.</p>';
        return;
    }

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Produit</th>
                    <th>Prix</th>
                    <th>Statut</th>
                    <th>Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${consumerOrders.map(order => `
                    <tr>
                        <td>${order.title}</td>
                        <td>${formatPrice(order.price)}</td>
                        <td>${order.status}</td>
                        <td>${formatDate(order.createdAt)}</td>
                        <td>
                            <button class="btn btn-danger btn-small" onclick="openComplaintModal('${order.id}')">Porter plainte</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Ouvrir le modal de plainte
function openComplaintModal(orderId) {
    document.getElementById('complaintOrderId').value = orderId;
    showModal('complaintModal');
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    initConsumerPage();
    
    const contactFarmerForm = document.getElementById('contactFarmerForm');
    if (contactFarmerForm) {
        contactFarmerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            sendMessageToFarmer();
        });
    }

    const vetOpinionForm = document.getElementById('vetOpinionForm');
    if (vetOpinionForm) {
        vetOpinionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            submitVetOpinionRequest();
        });
    }

    const complaintForm = document.getElementById('complaintForm');
    if (complaintForm) {
        complaintForm.addEventListener('submit', (e) => {
            e.preventDefault();
            makeComplaint();
        });
    }
});





