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
            }
        }
        
        // Au chargement de la page, s'assurer que la section d'accueil est visible et son lien actif
        document.addEventListener('DOMContentLoaded', function() {
            // Vérifier si nous sommes sur la page index avec les sections dashboard
            if (document.getElementById('welcome-section')) {
                showDashboardSection('welcome-section');
                
                // Activer manuellement le premier lien (Accueil)
                const firstLink = document.querySelector('.nav-links a[onclick="showDashboardSection(\'welcome-section\')"]');
                if (firstLink) {
                    firstLink.classList.add('active');
                }
            }
        });
        
        /*document.addEventListener('DOMContentLoaded', function() {
            // Sélectionner tous les liens de navigation
            const navLinks = document.querySelectorAll('.nav-links a');
            
            // Déterminer la page actuelle basée sur l'URL
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            
            // Ajouter la classe active au lien correspondant à la page actuelle
            navLinks.forEach(link => {
                const linkHref = link.getAttribute('href');
                
                // Si le href du lien correspond à la page actuelle
                if (linkHref === currentPage) {
                    link.classList.add('active');
                }
                
                // Ajouter un écouteur d'événement pour le clic
                link.addEventListener('click', function() {
                    // Retirer la classe active de tous les liens
                    navLinks.forEach(l => l.classList.remove('active'));
                    
                    // Ajouter la classe active au lien cliqué
                    this.classList.add('active');
                });
            });
        });*/

        // Fonction pour marquer l'onglet actif
function setActiveTab() {
    // Récupérer le chemin de l'URL actuelle
    const currentPath = window.location.pathname;
    
    // Sélectionner tous les liens de navigation
    const navLinks = document.querySelectorAll('.nav-links .dashboard-link');
    
    // Parcourir tous les liens
    navLinks.forEach(link => {
        // Retirer la classe active de tous les liens
        link.classList.remove('active');
        
        // Si le href du lien correspond au chemin actuel ou si nous sommes sur la page d'accueil
        if ((currentPath === '/' && link.getAttribute('data-page') === 'accueil') || 
            (link.getAttribute('href') === currentPath)) {
            link.classList.add('active');
        }
        
        if ((currentPath === '/actualite' && link.getAttribute('data-page') === 'actualite') || 
            (link.getAttribute('href') === currentPath)) {
            link.classList.add('active');
        }

        if ((currentPath === '/objet' && link.getAttribute('data-page') === 'objets') || 
        (link.getAttribute('href') === currentPath)) {
        link.classList.add('active');
        }

        if ((currentPath === '/profil' && link.getAttribute('data-page') === 'profil') || 
            (link.getAttribute('href') === currentPath)) {
            link.classList.add('active');
        }

        if ((currentPath === '/users/dashboard' && link.getAttribute('data-page') === 'dashboard') || 
            (link.getAttribute('href') === currentPath)) {
            link.classList.add('active');
        }
    });
}

// Exécuter la fonction au chargement de la page
document.addEventListener('DOMContentLoaded', setActiveTab);
