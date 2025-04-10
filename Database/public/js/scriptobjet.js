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