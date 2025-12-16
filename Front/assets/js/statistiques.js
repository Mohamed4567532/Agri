let charts = {};

// Initialisation
document.addEventListener('DOMContentLoaded', async function() {
    await checkAuth();
    
    // Vérifier que l'utilisateur est un agriculteur
    const user = getCurrentUser();
    if (!user || user.role !== 'farmer') {
        showAlert('⚠️ Cette page est réservée aux agriculteurs', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }
    
    await loadStatistics();
});

// Charger les statistiques
async function loadStatistics() {
    try {
        const response = await fetch(`http://localhost:3000/api/statistics`);
        
        if (!response.ok) throw new Error('Erreur lors du chargement des statistiques');
        
        const statistics = await response.json();
        
        // Créer les graphiques pour chaque catégorie
        const categories = ['fruits', 'légumes', 'viande', 'huile'];
        
        categories.forEach(category => {
            const stat = statistics.find(s => s.category === category);
            
            if (stat && stat.parts && stat.parts.length > 0) {
                createChart(category, stat.parts);
            } else {
                // Données par défaut si aucune statistique
                createChart(category, getDefaultData(category));
            }
        });
        
    } catch (error) {
        console.error('Erreur:', error);
        showAlert('Erreur lors du chargement des statistiques', 'error');
        
        // Charger des données par défaut en cas d'erreur
        const categories = ['fruits', 'légumes', 'viande', 'huile'];
        categories.forEach(category => {
            createChart(category, getDefaultData(category));
        });
    }
}

// Créer un graphique en camembert
function createChart(category, data) {
    const canvasId = `${category}Chart`;
    const ctx = document.getElementById(canvasId);
    
    if (!ctx) {
        console.error(`Canvas ${canvasId} non trouvé`);
        return;
    }
    
    // Détruire le graphique existant s'il existe
    if (charts[category]) {
        charts[category].destroy();
    }
    
    const labels = data.map(d => d.label);
    const values = data.map(d => d.percentage);
    const colors = data.map(d => d.color || getRandomColor());
    
    charts[category] = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += context.parsed + '%';
                            return label;
                        }
                    }
                }
            }
        }
    });
}

// Données par défaut pour chaque catégorie
function getDefaultData(category) {
    const defaultData = {
        'fruits': [
            { label: 'Agrumes', percentage: 30, color: '#e74c3c' },
            { label: 'Dattes', percentage: 25, color: '#3498db' },
            { label: 'Grenades', percentage: 20, color: '#2ecc71' },
            { label: 'Autres', percentage: 25, color: '#f39c12' }
        ],
        'légumes': [
            { label: 'Tomates', percentage: 35, color: '#e74c3c' },
            { label: 'Pommes de terre', percentage: 25, color: '#3498db' },
            { label: 'Oignons', percentage: 20, color: '#2ecc71' },
            { label: 'Autres', percentage: 20, color: '#f39c12' }
        ],
        'viande': [
            { label: 'Mouton', percentage: 40, color: '#e74c3c' },
            { label: 'Bœuf', percentage: 30, color: '#3498db' },
            { label: 'Volaille', percentage: 25, color: '#2ecc71' },
            { label: 'Autres', percentage: 5, color: '#f39c12' }
        ],
        'huile': [
            { label: 'Chemlali', percentage: 35, color: '#e74c3c' },
            { label: 'Chetoui', percentage: 30, color: '#3498db' },
            { label: 'Oueslati', percentage: 20, color: '#2ecc71' },
            { label: 'Extra Vierge', percentage: 15, color: '#f39c12' }
        ]
    };
    
    return defaultData[category] || [];
}

// Générer une couleur aléatoire
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

