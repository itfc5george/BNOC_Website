document.addEventListener('DOMContentLoaded', () => {
    initAccordions();
    initJumpLinks();
    initActionCardModal();
});

/**
 * 1. ACCORDION LOGIC ENGINE (Primary and Nested Elements)
 * Dynamically computes scrollHeight values instead of setting arbitrary max-height strings.
 * This guarantees smooth rendering updates across varying mobile browser performance limitations.
 */
function initAccordions() {
    // Root level section collapsible items
    const mainTriggers = document.querySelectorAll('.accordion-trigger');
    
    mainTriggers.forEach(trigger => {
        trigger.addEventListener('click', function() {
            const parentItem = this.parentElement;
            const contentPanel = this.nextElementSibling;
            const isExpanding = !parentItem.classList.contains('active');
            
            // Toggle active tracking indicators for CSS transformations
            parentItem.classList.toggle('active');
            this.setAttribute('aria-expanded', isExpanding);
            
            if (isExpanding) {
                contentPanel.style.maxHeight = contentPanel.scrollHeight + "px";
            } else {
                contentPanel.style.maxHeight = "0px";
            }
        });
    });

    // Sub-collapsible nested accordion modules (Set Up, Categories, FAQ structures)
    const nestedTriggers = document.querySelectorAll('.nested-trigger');
    
    nestedTriggers.forEach(trigger => {
        trigger.addEventListener('click', function() {
            const parentItem = this.parentElement;
            const contentPanel = this.nextElementSibling;
            const mainAccordionContent = this.closest('.accordion-content');
            const isExpanding = !parentItem.classList.contains('active');
            
            parentItem.classList.toggle('active');
            
            if (isExpanding) {
                contentPanel.style.maxHeight = contentPanel.scrollHeight + "px";
                // CRITICAL FIX FOR NESTED ELEMENTS: Update parent container height bounds so text cuts do not happen
                if (mainAccordionContent) {
                    mainAccordionContent.style.maxHeight = (mainAccordionContent.scrollHeight + contentPanel.scrollHeight) + "px";
                }
            } else {
                const heightBeingRemoved = contentPanel.scrollHeight;
                contentPanel.style.maxHeight = "0px";
                if (mainAccordionContent) {
                    mainAccordionContent.style.maxHeight = (mainAccordionContent.scrollHeight - heightBeingRemoved) + "px";
                }
            }
        });
    });
}

/**
 * 2. NAV JUMP-LINKS INTERACTION SCRIPTS
 * Intercepts default anchors, finds target panels, forces them open, 
 * updates parent containers, and executes elegant smooth window scrolling.
 */
function initJumpLinks() {
    const jumpButtons = document.querySelectorAll('.jump-link-btn');
    
    jumpButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const trigger = targetSection.querySelector('.accordion-trigger');
                const contentPanel = targetSection.querySelector('.accordion-content');
                
                // Force open target element if currently collapsed
                if (!targetSection.classList.contains('active')) {
                    targetSection.classList.add('active');
                    trigger.setAttribute('aria-expanded', 'true');
                    contentPanel.style.maxHeight = contentPanel.scrollHeight + "px";
                }
                
                // Native smooth scrolling directly into viewport bounds
                // Added brief delay to ensure DOM styling metrics are completed smoothly
                setTimeout(() => {
                    const headerOffset = 76; // Offset handling for the sticky banner blocking path
                    const elementPosition = targetSection.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }, 100);
            }
        });
    });
}

/**
 * 3. 3D FLIP MODAL CONTROLLER FOR ACTION CARDS
 * Manages extraction of card context attributes and coordinates dynamic 3D asset rendering.
 */
function initActionCardModal() {
    const carouselCards = document.querySelectorAll('.carousel-card-thumb');
    const modal = document.getElementById('cardModal');
    const flipObject = document.getElementById('modalFlipObject');
    const closeBtn = document.getElementById('closeModalBtn');
    
    // Target fields matching structural templates inside modal layers
    const cardFront = document.getElementById('modalCardFront');
    const frontTitle = document.getElementById('modalFrontTitle');
    const backTitle = document.getElementById('modalBackTitle');
    const backDescription = document.getElementById('modalBackDescription');

    carouselCards.forEach(card => {
        card.addEventListener('click', () => {
            const title = card.getAttribute('data-title');
            const description = card.getAttribute('data-desc');
            const internalGraphic = card.querySelector('.card-thumb-mock');
            
            // Replicate background style patterns dynamically onto our overlay element
            cardFront.className = 'modal-face card-front ' + internalGraphic.className.split(' ')[1];
            
            // Populating content fields
            frontTitle.textContent = title;
            backTitle.textContent = title;
            backDescription.textContent = description;
            
            // Launch transition sequence
            modal.classList.add('open');
        });
    });

    // Close process reversing animation vectors cleanly
    const closeModal = () => {
        modal.classList.remove('open');
    };

    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevents bubbling events on mobile architectures
        closeModal();
    });
    
    // Close modal if user clicks background overlay veil outside card bounds
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

/**
 * 4. PLACEHOLDER BURGER NAVIGATION TRIGGER
 */
function toggleBurgerMenu() {
    alert("BNOC Menu Features: Settings, Deck Builder, and Online Lobby links are unlocked in full deployment builds!");
}