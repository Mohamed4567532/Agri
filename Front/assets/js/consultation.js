let selectedVet = null;

// Initialisation
document.addEventListener('DOMContentLoaded', async function() {
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
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
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
            vetsList.innerHTML = '<p>Aucun vétérinaire disponible pour le moment.</p>';
            return;
        }
        
        vetsList.innerHTML = vets.map(vet => `
            <div class="card">
                <h3>Dr. ${vet.name}</h3>
                <p><strong>Email:</strong> ${vet.email}</p>
                <p><strong>Spécialité:</strong> Vétérinaire agricole</p>
                <button class="btn btn-primary" onclick="selectVet('${vet._id || vet.id}', '${vet.name}')">
                    Consulter ce vétérinaire
                </button>
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
    document.getElementById('vetNameDisplay').textContent = `Dr. ${vetName}`;
    
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
            <div style="padding: 10px; border-bottom: 1px solid #eee;">
                <label style="display: flex; align-items: center; cursor: pointer;">
                    <input type="checkbox" name="sheepIds" value="${s._id || s.id}" style="margin-right: 10px;">
                    <div>
                        <strong>Mouton</strong> - ${s.weight}kg - ${s.price} TND
                        <br>
                        <small style="color: #666;">${s.description.substring(0, 50)}...</small>
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

function viewConsultation(id) {
    // TODO: Implement consultation details modal
    showAlert('Fonctionnalité en développement', 'info');
}

