 let isGuestMode = false;
        
        // Fonction pour afficher les pages
        function showPage(pageId) {
            // Masquer toutes les pages
            document.querySelectorAll('.page').forEach(page => {
                page.style.display = "none";
                page.classList.remove('active');
            });
            
            // Afficher la page demandée immédiatement
            const targetPage = document.getElementById(pageId);
            targetPage.style.display = "block";
            
            // Ajouter la classe active (pour les animations éventuelles)
            setTimeout(() => {
                targetPage.classList.add('active');
            }, 10);
        }
        
        function guestAccess() {
            isGuestMode = true;
            showPage('dashboard');
            
            // Ajouter des écouteurs d'événements pour les liens du dashboard
            document.querySelectorAll('.dashboard-link').forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    showPopup();
                });
            });
        }
        
        function showPopup() {
            if (document.getElementById('free-tour-popup')) {
                document.getElementById('free-tour-popup').classList.add('active');
            }
        }
        
        function closePopup() {
            if (document.getElementById('free-tour-popup')) {
                document.getElementById('free-tour-popup').classList.remove('active');
            }
        }
        
        function closePopupAndRedirect(pageId) {
            closePopup();
            showPage(pageId);
        }
        
        // Exécuter immédiatement au chargement de la page
        document.addEventListener('DOMContentLoaded', function() {
            // S'assurer que le dashboard est visible immédiatement
            document.getElementById('dashboard').style.display = "block";
            document.getElementById('dashboard').classList.add('active');
            
            // Préparer les liens du dashboard pour le mode visiteur
            document.querySelectorAll('.dashboard-link').forEach(link => {
                link.addEventListener('click', function(e) {
                    if (isGuestMode) {
                        e.preventDefault();
                        showPopup();
                    }
                });
            });
        });
        
        // Fonction pour naviguer entre les sections du dashboard
        function showDashboardSection(sectionId) {
            // Masquer toutes les sections du dashboard
            document.querySelectorAll('.dashboard-section').forEach(section => {
                section.style.display = 'none';
            });
            
            // Afficher la section demandée
            document.getElementById(sectionId).style.display = 'block';
            
            // Désactiver tous les liens de navigation
            document.querySelectorAll('.nav-links a').forEach(link => {
                link.classList.remove('active');
            });
            
            // Activer le lien correspondant à la section
            const activeLink = document.querySelector(`.nav-links a[onclick="showDashboardSection('${sectionId}')"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            };
        };
        
        document.addEventListener('DOMContentLoaded', function() {
            // Récupère le chemin de l'URL actuelle
            const currentPath = window.location.pathname;
            
            // Fonction pour définir l'onglet actif
            function setActiveTab() {
                // Enlève d'abord la classe active de tous les liens
                document.querySelectorAll('.nav-links a').forEach(link => {
                    link.classList.remove('active');
                });
                
                // Détermination de la page active basée sur le chemin d'URL
                if (currentPath === '/' || currentPath === '/') {
                    document.querySelector('[data-page="accueil"]').classList.add('active');
                } else if (currentPath === '/actualite' || currentPath.includes('/actualite')) {
                    document.querySelector('[data-page="actualite"]').classList.add('active');
                } else if (currentPath === '/objet' || currentPath.includes('/objet')) {
                    document.querySelector('[data-page="objets"]').classList.add('active');
                } else if (currentPath === '/profil' || currentPath.includes('/profil')) {
                    document.querySelector('[data-page="profil"]').classList.add('active');
                }else if (currentPath === '/dashboard' || currentPath.includes('/dashboard')) {
                    document.querySelector('[data-page="accueil"]').classList.add('active');
                } 
            }
            
            // Appliquer l'état actif au chargement
            setActiveTab();
            
            // Optionnel: ajouter des écouteurs d'événements pour les liens si vous utilisez AJAX
            document.querySelectorAll('.dashboard-link').forEach(link => {
                link.addEventListener('click', function() {
                    // Permet de gérer l'état actif lors des clics, même sans rechargement de page
                    setTimeout(setActiveTab, 100);
                });
            });
        });

        // Modal de déconnexion
document.addEventListener('DOMContentLoaded', function() {
    // Éléments de la modal
    const logoutButton = document.getElementById('logoutButton');
    const logoutModal = document.getElementById('logoutModal');
    const confirmLogout = document.getElementById('confirmLogout');
    const cancelLogout = document.getElementById('cancelLogout');

    // Si le bouton existe (c'est-à-dire si l'utilisateur est connecté)
    if (logoutButton) {
        // Afficher la modal quand on clique sur le bouton de déconnexion
        logoutButton.addEventListener('click', function() {
            logoutModal.style.display = 'flex';
        });

        // Confirmer la déconnexion
        confirmLogout.addEventListener('click', function() {
            // Rediriger vers la page de déconnexion
            window.location.href = '/users/logout';
        });

        // Annuler la déconnexion
        cancelLogout.addEventListener('click', function() {
            logoutModal.style.display = 'none';
        });

        // Fermer la modal en cliquant à l'extérieur
        window.addEventListener('click', function(event) {
            if (event.target === logoutModal) {
                logoutModal.style.display = 'none';
            }
        });
    }
});

/*---- javascript pour les objets lignes 162 à 322 ----*/
const objets = [
    {
        id: 1,
        titre: "Séchoir à cheveux Dyson",
        categorie: "Électronique",
        description: "Séchoir à cheveux haut de gamme avec technologie ionique",
        image: "https://placehold.co/600x400/e0e0e0/9c8861?text=Séchoir+Dyson",
        statut: "disponible"
    },
    {
        id: 2,
        titre: "Oreiller ergonomique",
        categorie: "Literie",
        description: "Oreiller à mémoire de forme pour un confort optimal",
        image: "https://placehold.co/600x400/e0e0e0/9c8861?text=Oreiller",
        statut: "disponible"
    },
    {
        id: 3,
        titre: "Machine à café Nespresso",
        categorie: "Cuisine",
        description: "Machine à café avec sélection de capsules premium",
        image: "https://placehold.co/600x400/e0e0e0/9c8861?text=Nespresso",
        statut: "réservé"
    },
    {
        id: 4,
        titre: "Fer à repasser",
        categorie: "Électroménager",
        description: "Fer à repasser à vapeur avec système anti-calcaire",
        image: "https://placehold.co/600x400/e0e0e0/9c8861?text=Fer+à+repasser",
        statut: "disponible"
    },
    {
        id: 5,
        titre: "Adaptateur universel",
        categorie: "Électronique",
        description: "Adaptateur pour prises internationales avec ports USB",
        image: "https://placehold.co/600x400/e0e0e0/9c8861?text=Adaptateur",
        statut: "indisponible"
    },
    {
        id: 6,
        titre: "Peignoir de luxe",
        categorie: "Textile",
        description: "Peignoir en coton égyptien ultra-doux",
        image: "https://placehold.co/600x400/e0e0e0/9c8861?text=Peignoir",
        statut: "disponible"
    }
];

// Fonction pour vérifier si l'utilisateur est connecté
function estConnecte() {
    // Cette fonction devrait vérifier si l'utilisateur est connecté
    // Pour l'exemple, nous retournons toujours false
    return false;
}

// Fonction pour afficher les objets
function afficherObjets(listeObjets) {
    const conteneur = document.getElementById('objects-list');
    conteneur.innerHTML = '';
    
    if (listeObjets.length === 0) {
        conteneur.innerHTML = '<p>Aucun objet ne correspond à votre recherche.</p>';
        return;
    }
    
    const connecte = estConnecte();
    
    listeObjets.forEach(objet => {
        let statutClass = '';
        switch(objet.statut) {
            case 'disponible':
                statutClass = 'status-available';
                break;
            case 'réservé':
                statutClass = 'status-reserved';
                break;
            case 'indisponible':
                statutClass = 'status-unavailable';
                break;
        }
        
        const html = `
            <div class="object-item ${!connecte ? 'blurred-content' : ''}">
                <img src="${objet.image}" alt="${objet.titre}" class="object-image">
                <div class="object-content">
                    <span class="object-category">${objet.categorie}</span>
                    <h3 class="object-title">${objet.titre}</h3>
                    <p class="object-description">${objet.description}</p>
                    <div class="object-footer">
                        <span class="object-status ${statutClass}">${objet.statut.charAt(0).toUpperCase() + objet.statut.slice(1)}</span>
                        <a href="#" class="object-details-btn" data-id="${objet.id}">Détails</a>
                    </div>
                </div>
            </div>
        `;
        
        conteneur.innerHTML += html;
    });
    
    // Ajouter des écouteurs d'événements pour les boutons de détails
    document.querySelectorAll('.object-details-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (!connecte) {
                alert('Veuillez vous connecter pour voir les détails de cet objet.');
                return;
            }
            
            const id = this.getAttribute('data-id');
            // Ici, vous pourriez rediriger vers une page de détails ou afficher un modal
            alert(`Affichage des détails de l'objet ID: ${id}`);
        });
    });
}

// Fonction de recherche
function rechercherObjets(terme) {
    if (!terme) {
        return objets;
    }
    
    terme = terme.toLowerCase();
    
    return objets.filter(objet => 
        objet.titre.toLowerCase().includes(terme) || 
        objet.description.toLowerCase().includes(terme) ||
        objet.categorie.toLowerCase().includes(terme)
    );
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    // Afficher tous les objets au chargement
    afficherObjets(objets);
    
    // Écouteur d'événement pour la recherche
    document.getElementById('search-button').addEventListener('click', function() {
        const terme = document.getElementById('search-input').value;
        const resultats = rechercherObjets(terme);
        afficherObjets(resultats);
    });
    
    // Écouteur d'événement pour la recherche en temps réel (optionnel)
    document.getElementById('search-input').addEventListener('input', function() {
        const terme = this.value;
        const resultats = rechercherObjets(terme);
        afficherObjets(resultats);
    });
    
    // Afficher un message si l'utilisateur n'est pas connecté
    if (!estConnecte()) {
        document.querySelector('.login-required-message').style.display = 'block';
    } else {
        document.querySelector('.login-required-message').style.display = 'none';
    }
});
        