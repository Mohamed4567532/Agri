let selectedVet = null;

// Initialisation
document.addEventListener('DOMContentLoaded', async function () {
    await checkAuth();
    const user = getCurrentUser();

    if (!user || user.role !== 'farmer') {
        showAlert('Accès réservé aux agriculteurs', 'error');
        setTimeout(() => window.location.href = 'index.html', 2000);
        return;
    }

    await loadVets();
    await loadConsultations();

    // Event listeners
    document.getElementById('consultationForm').addEventListener('submit', submitConsultation);

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

    // Fermer le modal de détails en cliquant en dehors
    const detailsModal = document.getElementById('consultationDetailsModal');
    if (detailsModal) {
        detailsModal.addEventListener('click', function (e) {
            if (e.target === detailsModal) {
                closeConsultationDetails();
            }
        });
    }
});

// Charger la liste des vétérinaires
async function loadVets() {
    try {
        const response = await fetch(`http://localhost:3000/api/users`, {
            headers: getHeaders()
        });

        if (!response.ok) throw new Error('Erreur lors du chargement des vétérinaires');

        const data = await response.json();
        // L'API retourne { success: true, users: [...] }
        const users = data.users || data;
        const vets = users.filter(u => u.role === 'vet' && u.status === 'accepted');

        const vetsList = document.getElementById('vetsList');

        if (vets.length === 0) {
            vetsList.innerHTML = `
                <div style="text-align: center; padding: 3rem; background: white; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
                    <div style="font-size: 4rem; margin-bottom: 1rem; color: #ccc;">
                        <i class="fa-solid fa-user-doctor"></i>
                    </div>
                    <h3 style="color: #1a252f; margin-bottom: 0.5rem;">Aucun vétérinaire disponible</h3>
                    <p style="color: #666;">Aucun vétérinaire n'est actuellement disponible pour le moment.</p>
                </div>
            `;
            return;
        }

        vetsList.innerHTML = vets.map(vet => `
            <div class="card" style="background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%); border-radius: 16px; padding: 2rem; box-shadow: 0 4px 18px rgba(0,0,0,0.08); border: 1px solid rgba(0,0,0,0.04); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden;" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 24px rgba(0,0,0,0.12)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 18px rgba(0,0,0,0.08)'">
                <div style="position: absolute; top: 0; right: 0; width: 100px; height: 100px; background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(102, 187, 106, 0.05) 100%); border-radius: 0 0 0 100px; z-index: 0;"></div>
                <div style="position: relative; z-index: 1;">
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                        <div style="width: 70px; height: 70px; border-radius: 50%; background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3); flex-shrink: 0;">
                            <i class="fa-solid fa-user-doctor" style="font-size: 2rem; color: white;"></i>
                        </div>
                        <div style="flex: 1;">
                            <h3 style="margin: 0 0 0.25rem 0; color: #1a252f; font-size: 1.5rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem;">
                                <span>Dr. ${vet.name}</span>
                                <span style="font-size: 0.75rem; padding: 0.25rem 0.75rem; background: rgba(76, 175, 80, 0.1); color: #4CAF50; border-radius: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Disponible</span>
                            </h3>
                            <p style="margin: 0; color: #666; font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem;">
                                <i class="fa-solid fa-certificate" style="color: #4CAF50;"></i>
                                Vétérinaire agricole certifié
                            </p>
                        </div>
                    </div>
                    
                    <div style="background: rgba(0,0,0,0.02); border-radius: 12px; padding: 1rem; margin-bottom: 1.5rem;">
                        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
                            <i class="fa-solid fa-envelope" style="color: #42A5F5; width: 20px; text-align: center;"></i>
                            <div>
                                <div style="font-size: 0.75rem; color: #999; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.25rem;">Email</div>
                                <div style="color: #1a252f; font-weight: 500;">${vet.email}</div>
                            </div>
                        </div>
                        ${vet.phone ? `
                            <div style="display: flex; align-items: center; gap: 0.75rem;">
                                <i class="fa-solid fa-phone" style="color: #4CAF50; width: 20px; text-align: center;"></i>
                                <div>
                                    <div style="font-size: 0.75rem; color: #999; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.25rem;">Téléphone</div>
                                    <div style="color: #1a252f; font-weight: 500;">${vet.phone}</div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    
                    <button class="btn btn-primary" onclick="selectVet('${vet._id || vet.id}', '${vet.name}')" style="width: 100%; padding: 0.875rem 1.5rem; border-radius: 12px; font-weight: 600; background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%); border: none; color: white; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; gap: 0.5rem; box-shadow: 0 4px 12px rgba(76, 175, 80, 0.25);" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(76, 175, 80, 0.35)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(76, 175, 80, 0.25)'">
                        <i class="fa-solid fa-stethoscope"></i>
                        Consulter ce vétérinaire
                    </button>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Erreur:', error);
        showAlert('Erreur lors du chargement des vétérinaires', 'error');
    }
}

// Sélectionner un vétérinaire
async function selectVet(vetId, vetName) {
    selectedVet = { id: vetId, name: vetName };

    document.getElementById('selectedVetId').value = vetId;
    const vetNameDisplay = document.getElementById('vetNameDisplay');
    const vetNameText = document.getElementById('vetNameText');
    if (vetNameText) {
        vetNameText.textContent = `Dr. ${vetName}`;
    } else if (vetNameDisplay) {
        vetNameDisplay.innerHTML = `<i class="fa-solid fa-check-circle" style="color: #4CAF50;"></i> Dr. ${vetName}`;
    }

    // Charger les moutons du fermier
    await loadFarmerSheep();

    // Ouvrir le modal
    document.getElementById('consultationModal').style.display = 'block';
}

// Charger les moutons du fermier
async function loadFarmerSheep() {
    try {
        const user = getCurrentUser();
        const response = await fetch(`http://localhost:3000/api/products`, {
            headers: getHeaders()
        });

        if (!response.ok) throw new Error('Erreur lors du chargement des moutons');

        const data = await response.json();
        // L'API peut retourner directement un tableau ou { products: [...] }
        const products = Array.isArray(data) ? data : (data.products || []);

        // Filtrer les moutons appartenant au fermier connecté
        const sheep = products.filter(p => {
            if (p.type !== 'mouton') return false;
            // farmerId peut être un objet populé ou juste un ID
            const farmerId = p.farmerId?._id || p.farmerId;
            return farmerId === user.id || farmerId?.toString() === user.id;
        });

        const sheepSelection = document.getElementById('sheepSelection');

        if (sheep.length === 0) {
            sheepSelection.innerHTML = '<p style="color: #e74c3c;">Vous n\'avez aucun mouton enregistré. Veuillez d\'abord ajouter des moutons.</p>';
            return;
        }

        sheepSelection.innerHTML = sheep.map(s => `
            <div style="padding: 1rem; border-bottom: 1px solid #e0e0e0; border-radius: 8px; margin-bottom: 0.5rem; background: white; transition: all 0.2s ease;" onmouseover="this.style.background='#f8f9fa'; this.style.borderColor='#4CAF50'" onmouseout="this.style.background='white'; this.style.borderColor='#e0e0e0'">
                <label style="display: flex; align-items: center; cursor: pointer; gap: 1rem;">
                    <input type="checkbox" name="sheepIds" value="${s._id || s.id}" style="width: 20px; height: 20px; cursor: pointer; accent-color: #4CAF50;">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                            <i class="fa-solid fa-sheep" style="color: #4CAF50; font-size: 1.2rem;"></i>
                            <strong style="color: #1a252f; font-size: 1rem;">Mouton</strong>
                        </div>
                        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <i class="fa-solid fa-weight" style="color: #42A5F5; font-size: 0.9rem;"></i>
                                <span style="color: #666; font-weight: 500;">${s.weight} kg</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <i class="fa-solid fa-money-bill-wave" style="color: #4CAF50; font-size: 0.9rem;"></i>
                                <span style="color: #1a252f; font-weight: 600;">${s.price} TND</span>
                            </div>
                        </div>
                        <br>
                        <small style="color: #666; display: block; margin-top: 0.5rem;">${s.description.substring(0, 50)}...</small>
                    </div>
                </label>
            </div>
        `).join('');

    } catch (error) {
        console.error('Erreur:', error);
        showAlert('Erreur lors du chargement de vos moutons', 'error');
    }
}

// Soumettre une consultation
async function submitConsultation(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    const user = getCurrentUser();
    formData.append('farmerId', user.id);

    // Récupérer les moutons sélectionnés
    const selectedSheep = Array.from(form.querySelectorAll('input[name="sheepIds"]:checked'))
        .map(cb => cb.value);

    if (selectedSheep.length === 0) {
        showAlert('Veuillez sélectionner au moins un mouton', 'error');
        return;
    }

    // Supprimer les anciens sheepIds et ajouter les nouveaux
    formData.delete('sheepIds');
    selectedSheep.forEach(id => formData.append('sheepIds', id));

    try {
        const response = await fetch(`http://localhost:3000/api/consultations`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.errors ? data.errors.join(', ') : data.message);
        }

        showAlert('Consultation envoyée avec succès !', 'success');
        form.reset();
        document.getElementById('consultationModal').style.display = 'none';
        await loadConsultations();

    } catch (error) {
        console.error('Erreur:', error);
        showAlert('Erreur: ' + error.message, 'error');
    }
}

// Charger les consultations du fermier
async function loadConsultations() {
    try {
        const user = getCurrentUser();
        const response = await fetch(`http://localhost:3000/api/consultations?farmerId=${user.id}`, {
            headers: getHeaders()
        });

        if (!response.ok) throw new Error('Erreur lors du chargement des consultations');

        const data = await response.json();
        // L'API peut retourner directement un tableau ou { consultations: [...] }
        const consultations = Array.isArray(data) ? data : (data.consultations || []);

        const consultationsList = document.getElementById('consultationsList');

        if (consultations.length === 0) {
            consultationsList.innerHTML = '<p>Aucune consultation pour le moment.</p>';
            return;
        }

        consultationsList.innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Vétérinaire</th>
                        <th>Moutons</th>
                        <th>Statut</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${consultations.map(c => `
                        <tr>
                            <td>${formatDate(c.createdAt)}</td>
                            <td>Dr. ${c.vetId.name}</td>
                            <td>${c.sheepIds.length} mouton(s)</td>
                            <td><span class="badge badge-${getStatusColor(c.status)}">${getStatusLabel(c.status)}</span></td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="viewConsultation('${c._id || c.id}')">Voir détails</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

    } catch (error) {
        console.error('Erreur:', error);
        showAlert('Erreur lors du chargement des consultations', 'error');
    }
}

function getStatusLabel(status) {
    const labels = {
        'en_attente': 'En attente',
        'en_cours': 'En cours',
        'terminée': 'Terminée',
        'annulée': 'Annulée'
    };
    return labels[status] || status;
}

function getStatusColor(status) {
    const colors = {
        'en_attente': 'warning',
        'en_cours': 'info',
        'terminée': 'success',
        'annulée': 'danger'
    };
    return colors[status] || 'secondary';
}

// Afficher les détails d'une consultation
async function viewConsultation(id) {
    try {
        const response = await fetch(`http://localhost:3000/api/consultations/${id}`, {
            headers: getHeaders()
        });

        if (!response.ok) {
            throw new Error('Erreur lors du chargement des détails');
        }

        const consultation = await response.json();

        // Afficher le modal avec les détails
        const modal = document.getElementById('consultationDetailsModal');
        const content = document.getElementById('consultationDetailsContent');

        if (!modal || !content) {
            showAlert('Erreur: Le modal de détails n\'existe pas', 'error');
            return;
        }

        // Formater la date
        const createdDate = new Date(consultation.createdAt).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const responseDate = consultation.responseDate ?
            new Date(consultation.responseDate).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }) : 'Non disponible';

        // Construire le HTML des détails
        content.innerHTML = `
            <div style="margin-bottom: 2rem;">
                <h3 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 0.5rem; margin-bottom: 1rem;">
                    Informations Générales
                </h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                    <div>
                        <strong>Date de création:</strong><br>
                        <span style="color: #666;">${createdDate}</span>
                    </div>
                    <div>
                        <strong>Statut:</strong><br>
                        <span class="badge badge-${getStatusColor(consultation.status)}">${getStatusLabel(consultation.status)}</span>
                    </div>
                </div>
                <div style="margin-bottom: 1rem;">
                    <strong>Vétérinaire:</strong><br>
                    <span style="color: #666;">Dr. ${consultation.vetId?.name || 'Non spécifié'}</span><br>
                    <small style="color: #999;">${consultation.vetId?.email || ''}</small>
                </div>
            </div>

            <div style="margin-bottom: 2rem;">
                <h3 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 0.5rem; margin-bottom: 1rem;">
                    Moutons Consultés
                </h3>
                <div style="display: grid; gap: 1rem;">
                    ${consultation.sheepIds && consultation.sheepIds.length > 0 ?
                consultation.sheepIds.map(sheep => `
                            <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; border-left: 4px solid #27ae60;">
                                <div style="display: flex; gap: 1rem; align-items: start;">
                                    ${sheep.image ? `
                                        <img src="http://localhost:3000${sheep.image}" 
                                             alt="Mouton" 
                                             style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
                                    ` : ''}
                                    <div style="flex: 1;">
                                        <strong>Mouton</strong><br>
                                        <span style="color: #666;">Poids: ${sheep.weight}kg</span><br>
                                        <span style="color: #666;">Prix: ${sheep.price} TND</span><br>
                                        ${sheep.description ? `
                                            <p style="margin-top: 0.5rem; color: #555; font-size: 0.9rem;">
                                                ${sheep.description}
                                            </p>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                        `).join('')
                : '<p style="color: #999;">Aucun mouton spécifié</p>'
            }
                </div>
            </div>

            <div style="margin-bottom: 2rem;">
                <h3 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 0.5rem; margin-bottom: 1rem;">
                    Description du Problème
                </h3>
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; border-left: 4px solid #3498db;">
                    <p style="color: #555; line-height: 1.6; margin: 0;">
                        ${consultation.description || 'Aucune description'}
                    </p>
                </div>
            </div>

            ${consultation.video ? `
                <div style="margin-bottom: 2rem;">
                    <h3 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 0.5rem; margin-bottom: 1rem;">
                        Vidéo
                    </h3>
                    <video controls style="width: 100%; max-height: 400px; border-radius: 8px; background: #000;">
                        <source src="http://localhost:3000${consultation.video}" type="video/mp4">
                        Votre navigateur ne supporte pas la lecture de vidéos.
                    </video>
                </div>
            ` : ''}

            ${consultation.vetResponse ? `
                <div style="margin-bottom: 2rem;">
                    <h3 style="color: #27ae60; border-bottom: 2px solid #27ae60; padding-bottom: 0.5rem; margin-bottom: 1rem;">
                        <i class="fa-solid fa-user-doctor"></i> Diagnostic du Vétérinaire
                    </h3>
                    <div style="background: #d4edda; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #27ae60;">
                        <p style="color: #155724; line-height: 1.6; margin: 0 0 1rem 0; white-space: pre-wrap;">
                            ${consultation.vetResponse}
                        </p>
                        <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #c3e6cb;">
                            <small style="color: #155724;">
                                <strong>Date de réponse:</strong> ${responseDate}
                            </small>
                        </div>
                    </div>
                </div>
            ` : `
                <div style="margin-bottom: 2rem;">
                    <h3 style="color: #f39c12; border-bottom: 2px solid #f39c12; padding-bottom: 0.5rem; margin-bottom: 1rem;">
                        <i class="fa-solid fa-user-doctor"></i> Diagnostic du Vétérinaire
                    </h3>
                    <div style="background: #fff3cd; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #f39c12;">
                        <p style="color: #856404; margin: 0;">
                            <i class="fa-solid fa-hourglass-half"></i> Le vétérinaire n'a pas encore fourni de diagnostic pour cette consultation.
                        </p>
                    </div>
                </div>
            `}
        `;

        // Afficher le modal
        modal.style.display = 'flex';
        modal.classList.add('active');

    } catch (error) {
        console.error('Erreur:', error);
        showAlert('Erreur lors du chargement des détails: ' + error.message, 'error');
    }
}

// Fermer le modal de détails
function closeConsultationDetails() {
    const modal = document.getElementById('consultationDetailsModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
    }
}

// Exposer la fonction globalement
window.viewConsultation = viewConsultation;
window.closeConsultationDetails = closeConsultationDetails;

