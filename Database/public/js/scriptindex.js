let isGuestMode = false;
        
function showPage(pageId) {
    // Masquer toutes les pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Attendre un peu avant d'afficher la nouvelle page pour l'effet de transition
    setTimeout(() => {
        document.getElementById(pageId).classList.add('active');
    }, 300);
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
    document.getElementById('free-tour-popup').classList.add('active');
}

function closePopup() {
    document.getElementById('free-tour-popup').classList.remove('active');
}

function closePopupAndRedirect(pageId) {
    closePopup();
    showPage(pageId);
}

// Ajouter l'événement après le chargement du DOM
document.addEventListener('DOMContentLoaded', function() {
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