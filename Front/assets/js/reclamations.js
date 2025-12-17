// Utiliser API_BASE_URL depuis api.js (déjà déclaré) ou définir si non disponible
// Ne pas redéclarer const pour éviter l'erreur "already declared"
const RECLAMATIONS_API_BASE_URL = (typeof API_BASE_URL !== 'undefined' && API_BASE_URL) 
    ? API_BASE_URL 
    : 'http://localhost:3000/api';

let allReclamations = [];

// Charger les réclamations de l'utilisateur
async function loadReclamations() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`${RECLAMATIONS_API_BASE_URL}/reclamations?userId=${currentUser.id}&role=${currentUser.role}`);
        if (!response.ok) throw new Error('Erreur lors du chargement');
        
        allReclamations = await response.json();
        displayReclamations();
    } catch (error) {
        console.error('Erreur:', error);
        const container = document.getElementById('reclamationsList');
        if (container) {
            container.innerHTML = `
                <div class="card">
                    <p style="color: #e74c3c;">Erreur lors du chargement des réclamations.</p>
                </div>
            `;
        }
    }
}

// Afficher les réclamations
function displayReclamations() {
    const container = document.getElementById('reclamationsList');
    if (!container) return;

    if (allReclamations.length === 0) {
        container.innerHTML = `
            <div class="card">
                <div style="text-align: center; padding: 2rem; color: #999;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📋</div>
                    <h3>Aucune réclamation</h3>
                    <p>Vous n'avez pas encore créé de réclamation.</p>
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = allReclamations.map(reclamation => {
        const statusLabels = {
            'en_attente': '⏳ En attente',
            'en_cours': '🔄 En cours',
            'resolue': '✅ Résolue',
            'fermee': '🔒 Fermée'
        };

        const typeLabels = {
            'technique': '🔧 Technique',
            'produit': '📦 Produit',
            'service': '🛎️ Service',
            'autre': '📝 Autre'
        };

        const date = new Date(reclamation.createdAt).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const priorityLabels = {
            'basse': { label: '🟢 Basse', class: 'priority-low' },
            'normale': { label: '🟡 Normale', class: 'priority-normal' },
            'haute': { label: '🟠 Haute', class: 'priority-high' },
            'urgente': { label: '🔴 Urgente', class: 'priority-urgent' }
        };

        const priority = priorityLabels[reclamation.priorite] || priorityLabels['normale'];

        return `
            <div class="reclamation-card ${reclamation.statut}">
                <div class="reclamation-header">
                    <div style="flex: 1;">
                        ${reclamation.numeroReference ? `
                            <div style="font-size: 0.75rem; color: #666; margin-bottom: 0.25rem;">
                                📋 Réf: <strong>${reclamation.numeroReference}</strong>
                            </div>
                        ` : ''}
                        <h3 class="reclamation-title">${reclamation.sujet}</h3>
                        <div class="reclamation-meta">
                            <span><strong>Type:</strong> ${typeLabels[reclamation.type] || reclamation.type}</span>
                            <span><strong>Statut:</strong> ${statusLabels[reclamation.statut] || reclamation.statut}</span>
                            <span class="${priority.class}"><strong>Priorité:</strong> ${priority.label}</span>
                            <span><strong>Date:</strong> ${date}</span>
                        </div>
                    </div>
                </div>
                <div class="reclamation-description">
                    ${reclamation.description}
                </div>
                ${reclamation.fichiers && reclamation.fichiers.length > 0 ? `
                    <div class="reclamation-fichiers" style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #eee;">
                        <strong>📎 Fichiers joints:</strong>
                        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem;">
                            ${reclamation.fichiers.map(fichier => `
                                <a href="${fichier.chemin}" target="_blank" style="display: inline-block; padding: 0.25rem 0.5rem; background: #f8f9fa; border-radius: 4px; text-decoration: none; color: #3498db; font-size: 0.85rem;">
                                    📄 ${fichier.nom || 'Fichier'}
                                </a>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                ${reclamation.reponse ? `
                    <div class="reclamation-reponse">
                        <h4>📩 Réponse de l'administrateur:</h4>
                        <p>${reclamation.reponse}</p>
                        ${reclamation.resolvedAt ? `
                            <p style="margin-top: 0.5rem; font-size: 0.85rem; color: #999;">
                                Résolu le ${new Date(reclamation.resolvedAt).toLocaleDateString('fr-FR')}
                            </p>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

// Ouvrir le modal de nouvelle réclamation
function openNewReclamationModal() {
    console.log('=== openNewReclamationModal appelée ===');
    try {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            console.warn('Utilisateur non connecté');
            alert('Veuillez vous connecter');
            window.location.href = 'login.html';
            return;
        }
        
        console.log('Utilisateur connecté:', currentUser);
        
        const modal = document.getElementById('newReclamationModal');
        console.log('Modal trouvé:', modal);
        
        if (!modal) {
            console.error('❌ Modal non trouvé dans le DOM');
            alert('Erreur: Le formulaire n\'a pas pu être chargé');
            return;
        }
        
        // Réinitialiser le formulaire
        const form = document.getElementById('newReclamationForm');
        if (form) {
            form.reset();
            console.log('✅ Formulaire réinitialisé');
        }
        
        // Ouvrir le modal - utiliser les deux méthodes pour être sûr
        modal.style.display = 'flex';
        modal.classList.add('active');
        console.log('✅ Modal ouvert - display:', modal.style.display, 'classList:', modal.classList.toString());
        
        // Vérifier visuellement
        setTimeout(() => {
            const isVisible = modal.style.display === 'flex' || modal.classList.contains('active');
            console.log('Vérification après 100ms - Modal visible:', isVisible);
            if (!isVisible) {
                console.error('❌ Le modal n\'est toujours pas visible!');
                // Forcer l'affichage
                modal.style.display = 'flex';
                modal.style.position = 'fixed';
                modal.style.top = '0';
                modal.style.left = '0';
                modal.style.width = '100%';
                modal.style.height = '100%';
                modal.style.zIndex = '2000';
            }
        }, 100);
        
        // Focus sur le premier champ
        const sujetInput = document.getElementById('reclamationSujet');
        if (sujetInput) {
            setTimeout(() => sujetInput.focus(), 200);
        }
    } catch (error) {
        console.error('❌ Erreur lors de l\'ouverture du modal:', error);
        alert('Erreur lors de l\'ouverture du formulaire: ' + error.message);
    }
}

// Fermer le modal
function closeNewReclamationModal() {
    const modal = document.getElementById('newReclamationModal');
    if (modal) {
        modal.classList.remove('active');
    }
    const form = document.getElementById('newReclamationForm');
    if (form) {
        form.reset();
    }
}

// Créer une nouvelle réclamation
async function createReclamation(e) {
    console.log('🚀 createReclamation appelée - Event:', e);
    
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    console.log('✅ preventDefault et stopPropagation exécutés');
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
        console.error('Utilisateur non connecté');
        window.location.href = 'login.html';
        return;
    }

    console.log('Utilisateur:', currentUser);

    // Récupérer les champs du formulaire
    const sujetInput = document.getElementById('reclamationSujet');
    const descriptionInput = document.getElementById('reclamationDescription');
    const typeInput = document.getElementById('reclamationType');

    console.log('📋 Vérification des champs:', {
        sujetInput: !!sujetInput,
        descriptionInput: !!descriptionInput,
        typeInput: !!typeInput
    });

    if (!sujetInput || !descriptionInput || !typeInput) {
        console.error('❌ Champs du formulaire non trouvés');
        alert('Erreur: Le formulaire n\'est pas correctement chargé. Veuillez rafraîchir la page.');
        return;
    }

    const sujet = sujetInput.value.trim();
    const description = descriptionInput.value.trim();
    const type = typeInput.value || 'autre';

    console.log('📝 Données du formulaire:', { 
        sujet, 
        description, 
        type, 
        userId: currentUser.id,
        sujetLength: sujet.length,
        descriptionLength: description.length
    });

    if (!sujet || !description) {
        const message = 'Veuillez remplir tous les champs obligatoires.';
        console.warn(message);
        if (typeof showAlert === 'function') {
            showAlert(message, 'error');
        } else {
            alert(message);
        }
        return;
    }

    // Désactiver le bouton pendant l'envoi
    let submitBtn = null;
    if (e && e.target) {
        const form = e.target.tagName === 'FORM' ? e.target : e.target.closest('form');
        if (form) {
            submitBtn = form.querySelector('button[type="submit"]');
        }
    } else {
        // Fallback: chercher le bouton directement
        const form = document.getElementById('newReclamationForm');
        if (form) {
            submitBtn = form.querySelector('button[type="submit"]');
        }
    }
    
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Envoi en cours...';
        console.log('✅ Bouton submit désactivé');
    } else {
        console.warn('⚠️ Bouton submit non trouvé');
    }

    try {
        // Vérifier que l'ID utilisateur existe et est valide
        if (!currentUser.id) {
            throw new Error('ID utilisateur manquant. Veuillez vous reconnecter.');
        }

        const requestData = {
            sujet: sujet.trim(),
            description: description.trim(),
            type: type || 'autre',
            createdBy: currentUser.id
        };

        // Validation finale avant envoi
        if (!requestData.sujet || !requestData.description || !requestData.createdBy) {
            throw new Error('Données incomplètes. Veuillez remplir tous les champs.');
        }

        console.log('📤 Envoi de la requête POST /api/reclamations:');
        console.log('   URL:', `${RECLAMATIONS_API_BASE_URL}/reclamations`);
        console.log('   Données:', requestData);
        console.log('   ID utilisateur type:', typeof requestData.createdBy);
        console.log('   ID utilisateur longueur:', requestData.createdBy?.length);

        const response = await fetch(`${RECLAMATIONS_API_BASE_URL}/reclamations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        console.log('📥 Réponse reçue:', response.status, response.statusText);

        // Vérifier si la réponse contient du JSON
        let responseData;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            try {
                responseData = await response.json();
                console.log('📋 Données de la réponse:', responseData);
            } catch (jsonError) {
                console.error('❌ Erreur lors du parsing JSON:', jsonError);
                throw new Error('Réponse invalide du serveur');
            }
        } else {
            const textResponse = await response.text();
            console.error('❌ Réponse non-JSON reçue:', textResponse);
            throw new Error('Le serveur a retourné une réponse invalide');
        }

        if (!response.ok) {
            const errorMsg = responseData.message || responseData.error || 'Erreur lors de la création';
            console.error('❌ Erreur du serveur:', errorMsg, responseData);
            throw new Error(errorMsg);
        }

        // Vérifier que la réclamation a bien été créée
        if (!responseData || !responseData._id) {
            console.error('❌ Réclamation créée mais ID manquant:', responseData);
            throw new Error('La réclamation a été créée mais n\'a pas pu être récupérée');
        }

        const successMessage = 'Réclamation créée avec succès !';
        console.log('✅', successMessage, 'ID:', responseData._id);
        
        if (typeof showAlert === 'function') {
            showAlert(successMessage + ' L\'administrateur sera notifié.', 'success');
        } else {
            alert(successMessage + ' L\'administrateur sera notifié.');
        }
        
        closeNewReclamationModal();
        await loadReclamations();
    } catch (error) {
        console.error('❌ Erreur complète lors de la création:', error);
        console.error('   Type:', error.name);
        console.error('   Message:', error.message);
        console.error('   Stack:', error.stack);
        
        let errorMessage = 'Erreur lors de la création de la réclamation: ';
        
        if (error.message) {
            errorMessage += error.message;
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
            errorMessage += 'Impossible de contacter le serveur. Vérifiez votre connexion.';
        } else {
            errorMessage += 'Erreur inconnue';
        }
        
        if (typeof showAlert === 'function') {
            showAlert(errorMessage, 'error');
        } else {
            alert(errorMessage);
        }
    } finally {
        // Réactiver le bouton
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Envoyer';
        }
    }
}

// Exposer les fonctions globalement
window.openNewReclamationModal = openNewReclamationModal;
window.closeNewReclamationModal = closeNewReclamationModal;
window.createReclamation = createReclamation; // Exposer pour l'onsubmit inline

// Initialisation quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReclamations);
} else {
    // DOM déjà chargé
    initReclamations();
}

function initReclamations() {
    console.log('Initialisation de la page réclamations...');
    
    // Vérifier l'authentification
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Charger les réclamations
    loadReclamations();

    // Gérer le formulaire - Essayer plusieurs fois pour s'assurer qu'il est attaché
    const attachFormListener = () => {
        const form = document.getElementById('newReclamationForm');
        if (form) {
            console.log('📋 Formulaire trouvé dans le DOM');
            
            // Retirer tous les anciens listeners
            const newForm = form.cloneNode(true);
            form.parentNode.replaceChild(newForm, form);
            
            // Ajouter le nouveau listener avec plusieurs méthodes
            const newFormElement = document.getElementById('newReclamationForm');
            
            // Méthode 1: addEventListener
            newFormElement.addEventListener('submit', function(e) {
                console.log('📤 Event submit détecté via addEventListener');
                createReclamation(e);
            }, true);
            
            // Méthode 2: onsubmit (backup)
            newFormElement.onsubmit = function(e) {
                console.log('📤 Event submit détecté via onsubmit');
                createReclamation(e);
                return false;
            };
            
            console.log('✅ Event listeners attachés au formulaire');
            
            // Test: vérifier que les champs existent
            const sujetInput = document.getElementById('reclamationSujet');
            const descriptionInput = document.getElementById('reclamationDescription');
            const typeInput = document.getElementById('reclamationType');
            
            if (sujetInput && descriptionInput && typeInput) {
                console.log('✅ Tous les champs du formulaire sont présents');
            } else {
                console.error('❌ Certains champs du formulaire sont manquants:', {
                    sujet: !!sujetInput,
                    description: !!descriptionInput,
                    type: !!typeInput
                });
            }
            
            // Ajouter aussi un listener sur le bouton submit directement
            const submitBtn = newFormElement.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.addEventListener('click', function(e) {
                    console.log('🖱️ Bouton submit cliqué directement');
                    e.preventDefault();
                    e.stopPropagation();
                    createReclamation(e);
                });
                console.log('✅ Listener ajouté au bouton submit');
            }
            
            return true;
        } else {
            console.warn('⚠️ Formulaire non trouvé, réessai dans 500ms...');
            return false;
        }
    };
    
    // Essayer immédiatement
    if (!attachFormListener()) {
        // Si le formulaire n'existe pas encore, réessayer après un délai
        setTimeout(() => {
            if (!attachFormListener()) {
                console.error('❌ Impossible de trouver le formulaire après délai');
            }
        }, 500);
    }

    // Ajouter event listener au bouton "Nouvelle Réclamation" (en plus de onclick)
    const newReclamationBtn = document.getElementById('newReclamationBtn');
    if (newReclamationBtn) {
        // S'assurer que le bouton est cliquable
        newReclamationBtn.style.cursor = 'pointer';
        newReclamationBtn.style.pointerEvents = 'auto';
        newReclamationBtn.disabled = false;
        
        // Ajouter aussi un event listener en backup
        newReclamationBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Bouton cliqué via event listener!');
            openNewReclamationModal();
        });
        console.log('✅ Bouton attaché et configuré');
    } else {
        console.error('❌ Bouton "Nouvelle Réclamation" non trouvé');
    }

    // Event listener pour le bouton Annuler
    const cancelBtn = document.getElementById('cancelReclamationBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function(e) {
            e.preventDefault();
            closeNewReclamationModal();
        });
    }

    // Event listener pour le bouton close
    const closeBtn = document.getElementById('closeReclamationModal');
    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            closeNewReclamationModal();
        });
    }

    // Fermer le modal en cliquant en dehors
    const modal = document.getElementById('newReclamationModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeNewReclamationModal();
            }
        });
    }
}
