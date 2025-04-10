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

    // Animation des cartes dashboard avec décalage
    const cards = document.querySelectorAll('.dashboard-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
        }, 100 * (index + 1));
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
    }
}

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
            document.querySelector('[data-page="accueil"]')?.classList.add('active');
        } else if (currentPath === '/actualite' || currentPath.includes('/actualite')) {
            document.querySelector('[data-page="actualite"]')?.classList.add('active');
        } else if (currentPath === '/forum' || currentPath.includes('/forum')) {
            document.querySelector('[data-page="forum"]')?.classList.add('active');
        } else if (currentPath === '/objet' || currentPath.includes('/objet')) {
            document.querySelector('[data-page="objets"]')?.classList.add('active');
        } else if (currentPath === '/profil' || currentPath.includes('/profil')) {
            document.querySelector('[data-page="profil"]')?.classList.add('active');
        } else if (currentPath === '/dashboard' || currentPath.includes('/dashboard')) {
            document.querySelector('[data-page="accueil"]')?.classList.add('active');
        } 
    }
    
    // Appliquer l'état actif au chargement
    setActiveTab();
    
    // Ajouter des écouteurs d'événements pour les liens
    document.querySelectorAll('.nav-link').forEach(link => {
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
