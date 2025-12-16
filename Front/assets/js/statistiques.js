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
    const container = document.getElementById('statsContainer');
    
    try {
        const response = await fetch('http://localhost:3000/api/statistics');
        
        if (!response.ok) throw new Error('Erreur lors du chargement des statistiques');
        
        const statistics = await response.json();
        
        if (!statistics || statistics.length === 0) {
            container.innerHTML = `
                <div class="no-stats">
                    <div class="icon">📊</div>
                    <h3>Aucune statistique disponible</h3>
                    <p>Les statistiques du marché seront bientôt disponibles.</p>
                </div>
            `;
            return;
        }
        
        // Créer les cartes pour chaque statistique
        container.innerHTML = statistics.map(stat => `
            <div class="stat-card" style="border-top: 4px solid ${stat.color || '#3498db'};">
                <h3 style="color: ${stat.color || '#3498db'};">
                    ${stat.displayName || stat.category}
                </h3>
                <canvas id="chart_${stat.category}"></canvas>
            </div>
        `).join('');
        
        // Créer les graphiques
        statistics.forEach(stat => {
            if (stat.parts && stat.parts.length > 0) {
                createChart(stat.category, stat.parts);
            }
        });
        
    } catch (error) {
        console.error('Erreur:', error);
        container.innerHTML = `
            <div class="no-stats">
                <div class="icon">⚠️</div>
                <h3>Erreur de chargement</h3>
                <p>Impossible de charger les statistiques. Veuillez réessayer plus tard.</p>
            </div>
        `;
    }
}

// Créer un graphique en camembert
function createChart(category, data) {
    const canvasId = `chart_${category}`;
    const ctx = document.getElementById(canvasId);
    
    if (!ctx) {
        console.error(`Canvas ${canvasId} non trouvé`);
        return;
    }
    
    // Détruire le graphique existant s'il existe
    if (charts[canvasId]) {
        charts[canvasId].destroy();
    }
    
    const labels = data.map(d => d.label);
    const values = data.map(d => d.percentage);
    const colors = data.map(d => d.color || getRandomColor());
    
    charts[canvasId] = new Chart(ctx, {
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

// Générer une couleur aléatoire
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
