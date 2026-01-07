/* ============================================
   AgriSmart - Fonctionnalités Consommateur
   ============================================ */

// URL de l'API
const CONSUMER_API_BASE_URL = (typeof API_BASE_URL !== 'undefined' && API_BASE_URL)
    ? API_BASE_URL
    : 'http://localhost:3000/api';

// Initialisation de la page consommateur
async function initConsumerPage() {
    if (!checkRole('consumer')) return;

    await loadConsumerProducts();
    await loadConsumerMessages(); // Charger les messages reçus
    initProductFilters('productsContainer');
}

// Charger les produits pour le consommateur
async function loadConsumerProducts() {
    await loadAnimalsForConsumer();
}

// Charger tous les animaux (moutons) des fermiers acceptés
async function loadAnimalsForConsumer() {
    try {
        const container = document.getElementById('productsContainer');
        if (!container) return;

        // Récupérer uniquement les moutons disponibles
        const response = await fetch(`${CONSUMER_API_BASE_URL}/products?type=mouton&status=disponible`);
        if (!response.ok) throw new Error('Erreur lors du chargement des animaux');

        const animals = await response.json();

        console.log('🐑 Animaux chargés:', animals.length);

        if (animals.length === 0) {
            container.innerHTML = `
                <div class="card" style="text-align: center; padding: 2rem;">
                    <p style="color: #666;">Aucun animal disponible pour le moment.</p>
                </div>
            `;
            return;
        }

        // Afficher les animaux avec les informations du fermier
        container.innerHTML = animals.map(animal => {
            const farmer = animal.farmerId || {};
            const imageUrl = animal.image
                ? (animal.image.startsWith('/') ? `http://localhost:3000${animal.image}` : animal.image)
                : 'https://via.placeholder.com/400x300?text=🐑';

            return `
                <div class="card" style="margin-bottom: 1.5rem;">
                    <img src="${imageUrl}" 
                         alt="Mouton" 
                         class="card-img" 
                         style="height: 250px; object-fit: cover;"
                         onerror="this.src='https://via.placeholder.com/400x300?text=🐑'">
                    <div style="padding: 1rem;">
                        <h3 class="card-title"><i class="fa-solid fa-cow"></i> Mouton</h3>
                        <div style="margin-bottom: 0.5rem;">
                            <strong>Prix:</strong> ${formatPrice(animal.price)} TND
                        </div>
                        <div style="margin-bottom: 0.5rem;">
                            <strong>Poids:</strong> ${animal.weight} kg
                        </div>
                        ${animal.hasMedicalCertificate ? `
                            <div style="margin-bottom: 0.5rem; color: #27ae60;">
                                <i class="fa-solid fa-file-medical"></i> Certificat médical disponible
                            </div>
                        ` : ''}
                        <div style="margin-bottom: 0.5rem; color: #666; font-size: 0.9rem;">
                            <strong>Description:</strong> ${animal.description.substring(0, 100)}${animal.description.length > 100 ? '...' : ''}
                        </div>
                        <div style="margin-bottom: 1rem; padding: 0.75rem; background: #f8f9fa; border-radius: 8px;">
                            <strong>Fermier:</strong> ${farmer.name || 'Non spécifié'}<br>
                            <small style="color: #666;">${farmer.email || ''}</small>
                        </div>
                        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                            <button class="btn btn-primary" 
                                    onclick="contactFarmerForAnimal('${animal._id}', '${farmer._id || farmer.id}', '${farmer.name || 'Fermier'}')"
                                    style="flex: 1; min-width: 120px;">
                                💬 Contacter le fermier
                            </button>
                            <button class="btn btn-secondary" 
                                    onclick="viewAnimalDetails('${animal._id}')"
                                    style="flex: 1; min-width: 120px;">
                                <i class="fa-solid fa-eye"></i> Voir détails
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('❌ Erreur lors du chargement des animaux:', error);
        const container = document.getElementById('productsContainer');
        if (container) {
            container.innerHTML = `
                <div class="card" style="text-align: center; padding: 2rem; color: #e74c3c;">
                    <p>Erreur lors du chargement des animaux: ${error.message}</p>
                </div>
            `;
        }
    }
}

// Contacter le fermier pour un animal spécifique
async function contactFarmerForAnimal(animalId, farmerId, farmerName) {
    const animal = await getProductById(animalId);
    if (!animal) {
        showAlert('Animal introuvable.', 'error');
        return;
    }

    document.getElementById('contactFarmerId').value = farmerId;
    document.getElementById('contactFarmerName').textContent = farmerName;
    document.getElementById('contactAnimalId').value = animalId;
    document.getElementById('contactAnimalInfo').textContent = `Mouton - ${formatPrice(animal.price)} TND - ${animal.weight} kg`;

    // Pré-remplir le sujet avec des informations sur l'animal
    const subjectInput = document.getElementById('messageSubject');
    if (subjectInput) {
        subjectInput.value = `Demande d'information - Mouton ${animal.weight}kg`;
    }

    showModal('contactFarmerModal');
}

// Voir les détails d'un animal
async function viewAnimalDetails(animalId) {
    const animal = await getProductById(animalId);
    if (!animal) {
        showAlert('Animal introuvable.', 'error');
        return;
    }

    const farmer = animal.farmerId || {};
    const imageUrl = animal.image
        ? (animal.image.startsWith('/') ? `http://localhost:3000${animal.image}` : animal.image)
        : 'https://via.placeholder.com/800x400?text=🐑';

    const modalContent = `
        <div class="modal-content" style="max-width: 800px;">
            <div class="modal-header">
                <h2><i class="fa-solid fa-cow"></i> Détails de l'animal</h2>
                <button class="close" onclick="closeModal('animalDetailsModal')">&times;</button>
            </div>
            <div style="padding: 1.5rem;">
                <img src="${imageUrl}" 
                     alt="Mouton" 
                     style="width: 100%; height: 400px; object-fit: cover; border-radius: 8px; margin-bottom: 1.5rem;"
                     onerror="this.src='https://via.placeholder.com/800x400?text=🐑'">
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
                    <div>
                        <strong>Prix:</strong> ${formatPrice(animal.price)} TND
                    </div>
                    <div>
                        <strong>Poids:</strong> ${animal.weight} kg
                    </div>
                    <div>
                        <strong>Statut:</strong> 
                        <span class="badge badge-${animal.status === 'disponible' ? 'success' : 'danger'}">
                            ${animal.status}
                        </span>
                    </div>
                    ${animal.hasMedicalCertificate ? `
                        <div>
                            <strong>Certificat médical:</strong> 
                            <span style="color: #27ae60;"><i class="fa-solid fa-check"></i> Disponible</span>
                            ${animal.medicalCertificatePDF ? `
                                <a href="http://localhost:3000${animal.medicalCertificatePDF}" 
                                   target="_blank" 
                                   class="btn btn-sm btn-secondary" 
                                   style="margin-left: 0.5rem;">
                                    📄 Voir le certificat
                                </a>
                            ` : ''}
                        </div>
                    ` : `
                        <div>
                            <strong>Certificat médical:</strong> 
                            <span style="color: #e74c3c;"><i class="fa-solid fa-xmark"></i> Non disponible</span>
                        </div>
                    `}
                </div>
                <div style="margin-bottom: 1.5rem; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                    <strong>Description:</strong>
                    <p style="margin-top: 0.5rem;">${animal.description}</p>
                </div>
                <div style="margin-bottom: 1.5rem; padding: 1rem; background: #e8f5e9; border-radius: 8px;">
                    <strong>Informations du fermier:</strong>
                    <p style="margin-top: 0.5rem; margin-bottom: 0;">
                        <strong>Nom:</strong> ${farmer.name || 'Non spécifié'}<br>
                        <strong>Email:</strong> ${farmer.email || 'Non spécifié'}<br>
                        <strong>Username:</strong> ${farmer.username || 'Non spécifié'}
                    </p>
                </div>
                <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                    <button class="btn btn-primary" 
                            onclick="contactFarmerForAnimal('${animal._id}', '${farmer._id || farmer.id}', '${farmer.name || 'Fermier'}'); closeModal('animalDetailsModal');"
                            style="flex: 1;">
                        <i class="fa-solid fa-comments"></i> Contacter le fermier
                    </button>
                    <button class="btn btn-secondary" 
                            onclick="closeModal('animalDetailsModal')"
                            style="flex: 1;">
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    `;

    // Créer ou mettre à jour le modal
    let modal = document.getElementById('animalDetailsModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'animalDetailsModal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    modal.innerHTML = modalContent;
    showModal('animalDetailsModal');
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
    const animalId = document.getElementById('contactAnimalId')?.value;

    if (!subject || !message) {
        showAlert('Veuillez remplir tous les champs.', 'error');
        return;
    }

    try {
        const currentUser = getCurrentUser();
        const newMessage = {
            senderId: currentUser.id,
            receiverId: farmerId,
            subject,
            message,
            productId: animalId || null
        };

        // Utiliser l'API directement
        const response = await fetch(`${CONSUMER_API_BASE_URL}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newMessage)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erreur lors de l\'envoi');
        }

        showAlert('Message envoyé avec succès ! Le fermier vous répondra bientôt.', 'success');
        closeModal('contactFarmerModal');
        const form = document.getElementById('contactFarmerForm');
        if (form) form.reset();

        // Réinitialiser les champs cachés
        if (document.getElementById('contactAnimalId')) {
            document.getElementById('contactAnimalId').value = '';
        }
    } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error);
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
    document.getElementById('vetOpinionProductTitle').textContent = product.title || product.type || 'Produit';

    // Charger la liste des vétérinaires
    await loadVetsForOpinion();

    showModal('vetOpinionModal');
}

// Charger la liste des vétérinaires pour le modal d'avis
async function loadVetsForOpinion() {
    try {
        const response = await fetch(`${CONSUMER_API_BASE_URL}/users`, {
            headers: getHeaders()
        });

        if (!response.ok) throw new Error('Erreur lors du chargement des vétérinaires');

        const data = await response.json();
        const users = data.users || data;
        const vets = users.filter(u => u.role === 'vet' && u.status === 'accepted');

        const vetSelect = document.getElementById('vetOpinionVetId');
        if (!vetSelect) return;

        if (vets.length === 0) {
            vetSelect.innerHTML = '<option value="">Aucun vétérinaire disponible</option>';
            return;
        }

        vetSelect.innerHTML = '<option value="">-- Sélectionner un vétérinaire --</option>' +
            vets.map(vet => `
                <option value="${vet._id || vet.id}">Dr. ${vet.name} (${vet.email})</option>
            `).join('');

        console.log(`✅ ${vets.length} vétérinaire(s) chargé(s)`);
    } catch (error) {
        console.error('Erreur lors du chargement des vétérinaires:', error);
        const vetSelect = document.getElementById('vetOpinionVetId');
        if (vetSelect) {
            vetSelect.innerHTML = '<option value="">Erreur lors du chargement</option>';
        }
    }
}

// Soumettre la demande d'avis vétérinaire (envoie un message au vétérinaire)
async function submitVetOpinionRequest() {
    const productId = document.getElementById('vetOpinionProductId').value;
    const question = document.getElementById('vetQuestion').value;
    const vetId = document.getElementById('vetOpinionVetId')?.value;

    if (!question) {
        showAlert('Veuillez poser votre question.', 'error');
        return;
    }

    if (!vetId) {
        showAlert('Veuillez sélectionner un vétérinaire.', 'error');
        return;
    }

    try {
        const currentUser = getCurrentUser();
        const product = await getProductById(productId);

        // Créer un message pour le vétérinaire
        const subject = `Question sur ${product?.type || 'un produit'}`;
        const message = `Question du consommateur: ${question}\n\nProduit concerné: ${product?.type || 'N/A'}\nID Produit: ${productId}`;

        const newMessage = {
            senderId: currentUser.id,
            receiverId: vetId,
            subject: subject,
            message: message,
            productId: productId || null
        };

        console.log('📤 Envoi d\'un message au vétérinaire:', newMessage);

        const response = await fetch(`${CONSUMER_API_BASE_URL}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newMessage)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erreur lors de l\'envoi');
        }

        const savedMessage = await response.json();
        console.log('✅ Message envoyé au vétérinaire:', savedMessage._id);

        showAlert('Message envoyé au vétérinaire avec succès ! Il vous répondra bientôt.', 'success');
        closeModal('vetOpinionModal');
        document.getElementById('vetOpinionForm').reset();
    } catch (error) {
        console.error('Erreur lors de l\'envoi du message au vétérinaire:', error);
        showAlert('Erreur lors de l\'envoi: ' + error.message, 'error');
    }
}

// Charger les messages reçus par le consommateur
async function loadConsumerMessages() {
    try {
        const user = getCurrentUser();
        if (!user || !user.id) {
            console.error('❌ Utilisateur non connecté');
            return;
        }

        console.log('📥 Chargement des messages pour le consommateur:', user.id);

        // Utiliser le paramètre type=received pour ne récupérer que les messages reçus
        const response = await fetch(`${CONSUMER_API_BASE_URL}/messages?userId=${user.id}&type=received`, {
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

        const consumerMessagesContainer = document.getElementById('consumerMessages');
        if (!consumerMessagesContainer) {
            console.warn('⚠️ Élément consumerMessages non trouvé dans le HTML');
            return;
        }

        if (receivedMessages.length === 0) {
            consumerMessagesContainer.innerHTML = '<p>Aucun message reçu.</p>';
            return;
        }

        consumerMessagesContainer.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 1rem;">
                ${receivedMessages.map(m => {
            const senderName = m.senderId?.name || m.senderId?.username || 'Inconnu';
            const senderRole = m.senderId?.role || 'N/A';
            const hasProduct = m.productId ? true : false;
            return `
                        <div style="background: white; border-radius: 12px; padding: 1.25rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-left: 4px solid ${m.isRead ? '#90A4AE' : '#4CAF50'}; transition: all 0.2s ease;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.12)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.08)'">
                            <div style="display: flex; justify-content: space-between; align-items: start; gap: 1rem; margin-bottom: 0.75rem;">
                                <div style="flex: 1;">
                                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                        <i class="fa-solid fa-user" style="color: #42A5F5;"></i>
                                        <strong style="color: #1a252f;">${senderName}</strong>
                                        <span style="font-size: 0.85rem; color: #666; padding: 0.25rem 0.75rem; background: rgba(66, 165, 245, 0.1); border-radius: 12px;">${senderRole}</span>
                                        ${!m.isRead ? '<span style="font-size: 0.7rem; padding: 0.2rem 0.5rem; background: #4CAF50; color: white; border-radius: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Nouveau</span>' : ''}
                                    </div>
                                    <h4 style="margin: 0 0 0.5rem 0; color: #1a252f; font-size: 1.1rem;">${m.subject}</h4>
                                    ${hasProduct ? `
                                        <div style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.75rem; background: rgba(76, 175, 80, 0.1); border-radius: 8px; margin-bottom: 0.5rem;">
                                            <i class="fa-solid fa-box" style="color: #4CAF50; font-size: 0.9rem;"></i>
                                            <span style="font-size: 0.85rem; color: #4CAF50; font-weight: 600;">Produit: ${m.productId?.type || 'N/A'} - ${m.productId?.price ? formatPrice(m.productId.price) + ' TND' : 'N/A'}</span>
                                        </div>
                                    ` : ''}
                                    <div style="display: flex; align-items: center; gap: 0.5rem; color: #666; font-size: 0.9rem;">
                                        <i class="fa-solid fa-calendar-days" style="font-size: 0.8rem;"></i>
                                        ${formatDate(m.createdAt)}
                                    </div>
                                </div>
                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <span style="font-size: 1.5rem; color: ${m.isRead ? '#90A4AE' : '#4CAF50'};">
                                        ${m.isRead ? '<i class="fa-solid fa-check-double" title="Lu"></i>' : '<i class="fa-solid fa-envelope" title="Non lu"></i>'}
                                    </span>
                                    <button class="btn btn-sm btn-primary" onclick="viewConsumerMessage('${m._id}')" style="padding: 0.5rem 1rem; border-radius: 8px; background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%); border: none; color: white; cursor: pointer; font-weight: 600; transition: all 0.2s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                                        <i class="fa-solid fa-eye"></i> Voir
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
        }).join('')}
            </div>
        `;

    } catch (error) {
        console.error('❌ Erreur lors du chargement des messages:', error);
        const consumerMessagesContainer = document.getElementById('consumerMessages');
        if (consumerMessagesContainer) {
            consumerMessagesContainer.innerHTML = '<p style="color: red;">Erreur lors du chargement des messages.</p>';
        }
    }
}

// Voir les détails d'un message reçu
async function viewConsumerMessage(messageId) {
    try {
        console.log('📧 Affichage du message:', messageId);

        const response = await fetch(`${CONSUMER_API_BASE_URL}/messages/${messageId}`, {
            headers: getHeaders()
        });

        if (!response.ok) {
            throw new Error('Message non trouvé');
        }

        const message = await response.json();
        console.log('✅ Message récupéré:', message);

        // Afficher les détails dans le modal
        const messageDetailsDiv = document.getElementById('consumerMessageDetails');
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
            <div style="background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem; border: 1px solid rgba(0,0,0,0.05);">
                <h3 style="margin-top: 0; margin-bottom: 1rem; color: #1a252f; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fa-solid fa-envelope" style="color: #4CAF50;"></i>
                    ${message.subject}
                </h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                    <div>
                        <div style="font-size: 0.75rem; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.25rem;">De</div>
                        <div style="color: #1a252f; font-weight: 600; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fa-solid fa-user" style="color: #42A5F5;"></i>
                            ${messageSenderName} <span style="font-size: 0.85rem; color: #666; font-weight: 400;">(${messageSenderRole})</span>
                        </div>
                    </div>
                    <div>
                        <div style="font-size: 0.75rem; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.25rem;">Email</div>
                        <div style="color: #1a252f; font-weight: 500; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fa-solid fa-envelope" style="color: #42A5F5; font-size: 0.9rem;"></i>
                            ${messageSenderEmail}
                        </div>
                    </div>
                    <div>
                        <div style="font-size: 0.75rem; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.25rem;">Date</div>
                        <div style="color: #1a252f; font-weight: 500; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fa-solid fa-calendar-days" style="color: #42A5F5; font-size: 0.9rem;"></i>
                            ${formatDate(message.createdAt)}
                        </div>
                    </div>
                </div>
                ${productInfo}
            </div>
            <div style="background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #e0e0e0; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <h4 style="margin-top: 0; margin-bottom: 1rem; color: #1a252f; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fa-solid fa-message" style="color: #4CAF50;"></i>
                    Message
                </h4>
                <p style="white-space: pre-wrap; color: #555; line-height: 1.7; margin: 0;">${message.message}</p>
            </div>
        `;

        // Stocker l'ID du message et de l'expéditeur pour la réponse
        document.getElementById('consumerReplyMessageId').value = messageId;
        document.getElementById('consumerReplySenderId').value = message.senderId._id || message.senderId.id || message.senderId;
        document.getElementById('consumerReplySubject').value = `Re: ${message.subject}`;
        document.getElementById('consumerReplyContent').value = '';

        // Marquer le message comme lu
        if (!message.isRead) {
            try {
                await fetch(`${CONSUMER_API_BASE_URL}/messages/${messageId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        ...getHeaders()
                    },
                    body: JSON.stringify({ isRead: true })
                });
                console.log('✅ Message marqué comme lu');
                // Recharger la liste des messages
                await loadConsumerMessages();
            } catch (error) {
                console.error('Erreur lors du marquage comme lu:', error);
            }
        }

        // Afficher le modal
        const modal = document.getElementById('consumerMessageModal');
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

// Répondre à un message (pour le consommateur)
async function replyToConsumerMessage(e) {
    e.preventDefault();

    const messageId = document.getElementById('consumerReplyMessageId').value;
    const senderId = document.getElementById('consumerReplySenderId').value;
    const subject = document.getElementById('consumerReplySubject').value.trim();
    const message = document.getElementById('consumerReplyContent').value.trim();

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
        const apiUrl = (typeof CONSUMER_API_BASE_URL !== 'undefined' && CONSUMER_API_BASE_URL) ? CONSUMER_API_BASE_URL : 'http://localhost:3000/api';
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
        const modal = document.getElementById('consumerMessageModal');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('active');
        }

        // Réinitialiser le formulaire
        document.getElementById('consumerReplyMessageForm').reset();

        // Recharger les messages
        await loadConsumerMessages();

    } catch (error) {
        console.error('❌ Erreur lors de l\'envoi de la réponse:', error);
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
    try {
        const user = getCurrentUser();
        if (!user) {
            console.warn('⚠️ Utilisateur non connecté');
            return;
        }

        const container = document.getElementById('ordersList');
        if (!container) return;

        // Vérifier si l'API orders existe
        try {
            const orders = await apiGetOrders();
            const consumerOrders = orders.filter(o => o.consumerId === user.id);

            if (consumerOrders.length === 0) {
                container.innerHTML = '<p>Aucune commande pour le moment.</p>';
                return;
            }

            container.innerHTML = `
                <table class="table">
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
                                <td>${order.title || 'N/A'}</td>
                                <td>${formatPrice(order.price)}</td>
                                <td>${order.status || 'N/A'}</td>
                                <td>${formatDate(order.createdAt)}</td>
                                <td>
                                    <button class="btn btn-danger btn-small" onclick="openComplaintModal('${order.id}')">Porter plainte</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } catch (error) {
            // Si l'API orders n'existe pas, afficher un message
            console.warn('⚠️ API orders non disponible:', error.message);
            container.innerHTML = '<p style="color: #666;">La fonctionnalité de commandes n\'est pas encore disponible.</p>';
        }
    } catch (error) {
        console.error('❌ Erreur lors du chargement des commandes:', error);
        const container = document.getElementById('ordersList');
        if (container) {
            container.innerHTML = '<p style="color: red;">Erreur lors du chargement des commandes.</p>';
        }
    }
}

// Ouvrir le modal de plainte
function openComplaintModal(orderId) {
    document.getElementById('complaintOrderId').value = orderId;
    showModal('complaintModal');
}

// Exposer les fonctions globalement
window.loadAnimalsForConsumer = loadAnimalsForConsumer;
window.contactFarmerForAnimal = contactFarmerForAnimal;
window.viewAnimalDetails = viewAnimalDetails;
window.viewConsumerMessage = viewConsumerMessage;
window.loadConsumerMessages = loadConsumerMessages;
window.replyToConsumerMessage = replyToConsumerMessage;

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





