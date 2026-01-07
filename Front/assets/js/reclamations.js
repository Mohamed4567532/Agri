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
            <div class="reclamation-card" style="text-align: center; padding: 3rem;">
                <div style="font-size: 4rem; margin-bottom: 1rem; color: #ccc;"><i class="fa-solid fa-clipboard-list"></i></div>
                <h3 style="color: #1a252f; margin-bottom: 0.5rem;">Aucune réclamation</h3>
                <p style="color: #666;">Vous n'avez pas encore créé de réclamation.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = allReclamations.map(reclamation => {
        const statusLabels = {
            'en_attente': 'En attente',
            'en_cours': 'En cours',
            'resolue': 'Résolue',
            'fermee': 'Fermée'
        };

        const typeLabels = {
            'technique': 'Technique',
            'produit': 'Produit',
            'service': 'Service',
            'autre': 'Autre'
        };

        const date = new Date(reclamation.createdAt).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const priorityLabels = {
            'basse': { label: 'Basse', class: 'low' },
            'normale': { label: 'Normale', class: 'normal' },
            'haute': { label: 'Haute', class: 'high' },
            'urgente': { label: 'Urgente', class: 'urgent' }
        };

        const priority = priorityLabels[reclamation.priorite] || priorityLabels['normale'];

        const statusIcons = {
            'en_attente': '⏳',
            'en_cours': '🔄',
            'resolue': '✅',
            'fermee': '🔒'
        };

        const typeIcons = {
            'technique': '🔧',
            'produit': '📦',
            'service': '🛎️',
            'autre': '📝'
        };

        return `
            <div class="reclamation-card ${reclamation.statut}">
                <div class="reclamation-header">
                    <div style="flex: 1;">
                        ${reclamation.numeroReference ? `
                            <div style="font-size: 0.75rem; color: #999; margin-bottom: 0.5rem; letter-spacing: 0.5px; display: flex; align-items: center; gap: 0.25rem;">
                                <i class="fa-solid fa-hashtag" style="font-size: 0.7rem;"></i>
                                <strong style="color: #666;">${reclamation.numeroReference}</strong>
                            </div>
                        ` : ''}
                        <h3 class="reclamation-title" style="display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fa-solid fa-file-lines" style="color: #4CAF50; font-size: 1.2rem;"></i>
                            ${reclamation.sujet}
                        </h3>
                        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.75rem;">
                            <span class="badge-modern badge-status ${reclamation.statut}" style="display: inline-flex; align-items: center; gap: 0.35rem;">
                                ${statusIcons[reclamation.statut] || ''}
                                ${statusLabels[reclamation.statut] || reclamation.statut}
                            </span>
                            <span class="badge-modern badge-priority ${priority.class}" style="display: inline-flex; align-items: center; gap: 0.35rem;">
                                <i class="fa-solid fa-flag" style="font-size: 0.7rem;"></i>
                                ${priority.label}
                            </span>
                            <span class="badge-modern badge-type" style="display: inline-flex; align-items: center; gap: 0.35rem;">
                                ${typeIcons[reclamation.type] || '📋'}
                                ${typeLabels[reclamation.type] || reclamation.type}
                            </span>
                        </div>
                        <div class="reclamation-meta" style="margin-top: 1rem;">
                            <span style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.75rem; background: rgba(0,0,0,0.03); border-radius: 8px;">
                                <i class="fa-solid fa-calendar-days" style="color: #666;"></i>
                                ${date}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="reclamation-description" style="margin-top: 1.25rem; padding-top: 1.25rem; border-top: 1px solid rgba(0,0,0,0.08);">
                    <div style="display: flex; align-items: start; gap: 0.75rem;">
                        <i class="fa-solid fa-align-left" style="color: #999; margin-top: 0.25rem; font-size: 0.9rem;"></i>
                        <div style="flex: 1; color: #555; line-height: 1.7;">${reclamation.description}</div>
                    </div>
                </div>
                ${reclamation.fichiers && reclamation.fichiers.length > 0 ? `
                    <div class="reclamation-fichiers" style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(0,0,0,0.08);">
                        <strong style="color: #1a252f; font-size: 0.875rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fa-solid fa-paperclip" style="color: #42A5F5;"></i>
                            Fichiers joints (${reclamation.fichiers.length})
                        </strong>
                        <div style="display: flex; flex-wrap: wrap; gap: 0.75rem;">
                            ${reclamation.fichiers.map(fichier => `
                                <a href="${fichier.chemin}" target="_blank" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1rem; background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%); border: 1px solid rgba(66, 165, 245, 0.2); border-radius: 10px; text-decoration: none; color: #42A5F5; font-size: 0.875rem; font-weight: 500; transition: all 0.2s ease; box-shadow: 0 2px 6px rgba(0,0,0,0.05);" onmouseover="this.style.background='linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)'; this.style.borderColor='#4CAF50'; this.style.color='#4CAF50'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(76, 175, 80, 0.15)'" onmouseout="this.style.background='linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)'; this.style.borderColor='rgba(66, 165, 245, 0.2)'; this.style.color='#42A5F5'; this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 6px rgba(0,0,0,0.05)'">
                                    <i class="fa-solid fa-file" style="font-size: 1rem;"></i>
                                    <span>${fichier.nom || 'Fichier'}</span>
                                    <i class="fa-solid fa-external-link" style="font-size: 0.7rem; opacity: 0.7;"></i>
                                </a>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                ${reclamation.reponse ? `
                    <div class="reclamation-reponse" style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 2px solid #66BB6A;">
                        <h4 style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; color: #4CAF50;">
                            <i class="fa-solid fa-user-shield" style="font-size: 1.1rem;"></i>
                            Réponse de l'administrateur
                        </h4>
                        <div style="display: flex; align-items: start; gap: 0.75rem;">
                            <i class="fa-solid fa-message" style="color: #66BB6A; margin-top: 0.25rem;"></i>
                            <p style="flex: 1; margin: 0; color: #555; line-height: 1.7;">${reclamation.reponse}</p>
                        </div>
                        ${reclamation.resolvedAt ? `
                            <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(102, 187, 106, 0.2); display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: #999;">
                                <i class="fa-solid fa-check-circle" style="color: #66BB6A;"></i>
                                <span>Résolu le ${new Date(reclamation.resolvedAt).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}</span>
                            </div>
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
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
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
    console.log('🔒 ========== FERMETURE DU MODAL ==========');
    const modal = document.getElementById('newReclamationModal');

    if (!modal) {
        console.error('❌ Modal non trouvé lors de la fermeture');
        return;
    }

    console.log('📋 État avant fermeture:', {
        display: modal.style.display,
        visibility: modal.style.visibility,
        opacity: modal.style.opacity,
        hasActiveClass: modal.classList.contains('active')
    });

    // Méthode 1: Retirer la classe active
    modal.classList.remove('active');

    // Méthode 2: Masquer le modal de manière explicite avec tous les styles
    modal.style.display = 'none';
    modal.style.visibility = 'hidden';
    modal.style.opacity = '0';
    modal.style.pointerEvents = 'none';
    modal.style.zIndex = '-1';

    // Méthode 3: Forcer la fermeture en retirant tous les styles inline problématiques
    const problematicStyles = ['position', 'top', 'left', 'width', 'height', 'backgroundColor'];
    problematicStyles.forEach(prop => {
        modal.style[prop] = '';
    });

    console.log('📋 État après fermeture:', {
        display: modal.style.display,
        visibility: modal.style.visibility,
        opacity: modal.style.opacity,
        hasActiveClass: modal.classList.contains('active')
    });

    // Vérifier que le modal est bien fermé
    setTimeout(() => {
        const isStillVisible = window.getComputedStyle(modal).display !== 'none' ||
            modal.classList.contains('active');
        if (isStillVisible) {
            console.error('❌ Le modal est toujours visible! Forçage de la fermeture...');
            // Forcer la fermeture de manière plus agressive
            modal.remove();
            // Recréer le modal depuis le HTML si nécessaire
            console.warn('⚠️ Modal supprimé du DOM. Rechargez la page si nécessaire.');
        } else {
            console.log('✅ Modal fermé avec succès');
        }
    }, 100);

    // Réinitialiser le formulaire
    const form = document.getElementById('newReclamationForm');
    if (form) {
        form.reset();
        console.log('✅ Formulaire réinitialisé');
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

// Fonction de fermeture d'urgence (si tout le reste échoue)
window.forceCloseReclamationModal = function () {
    console.log('🚨 FERMETURE FORCÉE DU MODAL');
    const modal = document.getElementById('newReclamationModal');
    if (modal) {
        modal.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;';
        modal.classList.remove('active');
        // Attendre un peu puis réinitialiser
        setTimeout(() => {
            modal.removeAttribute('style');
            modal.style.display = 'none';
        }, 100);
    }
    console.log('✅ Fermeture forcée effectuée');
};
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
            newFormElement.addEventListener('submit', function (e) {
                console.log('📤 Event submit détecté via addEventListener');
                createReclamation(e);
            }, true);

            // Méthode 2: onsubmit (backup)
            newFormElement.onsubmit = function (e) {
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
                submitBtn.addEventListener('click', function (e) {
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
        newReclamationBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Bouton cliqué via event listener!');
            openNewReclamationModal();
        });
        console.log('✅ Bouton attaché et configuré');
    } else {
        console.error('❌ Bouton "Nouvelle Réclamation" non trouvé');
    }

    // Event listener pour le bouton Annuler - avec plusieurs méthodes
    const cancelBtn = document.getElementById('cancelReclamationBtn');
    if (cancelBtn) {
        // Méthode 1: addEventListener
        cancelBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🖱️ Bouton Annuler cliqué (addEventListener)');
            closeNewReclamationModal();
        }, true);

        // Méthode 2: onclick direct (backup)
        cancelBtn.onclick = function (e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🖱️ Bouton Annuler cliqué (onclick)');
            closeNewReclamationModal();
            return false;
        };

        console.log('✅ Event listeners ajoutés au bouton Annuler');
    } else {
        console.error('❌ Bouton Annuler non trouvé');
    }

    // Event listener pour le bouton close (X) - avec plusieurs méthodes
    const closeBtn = document.getElementById('closeReclamationModal');
    if (closeBtn) {
        // Méthode 1: addEventListener
        closeBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🖱️ Bouton X cliqué (addEventListener)');
            closeNewReclamationModal();
        }, true);

        // Méthode 2: onclick direct (backup)
        closeBtn.onclick = function (e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🖱️ Bouton X cliqué (onclick)');
            closeNewReclamationModal();
            return false;
        };

        console.log('✅ Event listeners ajoutés au bouton X');
    } else {
        console.error('❌ Bouton X non trouvé');
    }

    // Fermer le modal en cliquant en dehors
    const modal = document.getElementById('newReclamationModal');
    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                console.log('🖱️ Clic en dehors du modal détecté');
                closeNewReclamationModal();
            }
        });
        console.log('✅ Event listener ajouté pour fermer en cliquant en dehors');
    }

    // Ajouter aussi la touche Escape pour fermer
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('newReclamationModal');
            if (modal && (modal.style.display === 'flex' || modal.classList.contains('active'))) {
                console.log('⌨️ Touche Escape pressée');
                closeNewReclamationModal();
            }
        }
    });
}
