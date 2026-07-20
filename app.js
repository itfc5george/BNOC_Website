document.addEventListener('DOMContentLoaded', () => {
    initAccordions();
    initJumpLinks();
    initActionCardModal();
    initQuizCarousel();
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

/**
 * 5. DYNAMIC SITE TEXT POPULATOR FROM JSON FILE
 */
async function populateSiteText() {
    try {
        // 1. Fetch the JSON file
        const response = await fetch('action_cards.json');
        if (!response.ok) throw new Error("Could not fetch action_cards.json");
        const data = await response.json();
        
        // 2. Select all card elements that have a data-section attribute
        const cards = document.querySelectorAll('.carousel-card-thumb[data-section]');
        
        // 3. Loop through each card and update its attributes + text elements
        cards.forEach(card => {
            const section = card.getAttribute('data-section'); // e.g., "expelled"
            
            // Check if this section exists in your JSON
            if (data[section]) {
                const cardData = data[section];
                
                // Update the HTML data attributes dynamically
                card.setAttribute('data-title', cardData.title);
                card.setAttribute('data-desc', cardData.description);
                
                // Update the visible text inside the span element
                const titleSpan = card.querySelector('span');
                if (titleSpan) {
                    titleSpan.textContent = cardData.title;
                }
            } else {
                console.warn(`Missing data in JSON for section: ${section}`);
            }
        });
        
    } catch (error) {
        console.error("Error loading text content:", error);
    }
}

/**
 * 6. QUIZ CAROUSEL INTERACTION AND RESPONSE
 */
function initQuizCarousel() {
    const carousel = document.getElementById("quizCarousel");
    const optionButtons = document.querySelectorAll(".quiz-option-btn");
    const revealBtn = document.getElementById("revealBtn");
    const resultDisplay = document.getElementById("resultDisplay");
    
    // Core Answers key matrix
    // const correctAnswers = ["B", "C", "B", "A", "A"];
    // Tracking user answers storage
    let userAnswers = [];

    // 1. Automatic Moving Mechanism on option button selection
    optionButtons.forEach(button => {
        button.addEventListener("click", (e) => {
            const card = e.target.closest(".quiz-card"); //This targets the specific question card the user is currently looking at.
            const questionIndex = parseInt(card.getAttribute("question-topic"));
            const chosenValue = e.target.getAttribute("data-value");
            // const chosenValue = e.target.textContent;
            

            // Clear previous selections on this card if any exist
            card.querySelectorAll(".quiz-option-btn").forEach(btn => btn.classList.remove("selected"));
            // Highlight chosen item state
            e.target.classList.add("selected");

            // Save choice configuration records
            userAnswers.push(chosenValue);

            // Compute automatic calculation displacement paths
            const nextCard = card.nextElementSibling;
            if (nextCard) {
                // Precise coordinate translation regardless of margins/paddings
                const scrollTarget = nextCard.offsetLeft - carousel.offsetLeft;
                
                // Allow micro-delay for user touch-feedback visualization before moving
                setTimeout(() => {
                    carousel.scrollTo({
                        left: scrollTarget,
                        behavior: "smooth"
                    });
                }, 250);
            }
            console.log(userAnswers); // Debugging: Log current user answers state
        });
    });

    // 2. Compute Score and Reveal Custom Layout Result
    revealBtn.addEventListener("click", () => {
        let finalScore = 0;

        // Compare answer profiles array keys
        for (let i = 0; i < correctAnswers.length; i++) {
            if (userAnswers[i] === correctAnswers[i]) {
                finalScore++;
            }
        }

        // Beautifully display results in the final slide UI frame 
        resultDisplay.innerHTML = `
            <span class="badge">EVALUATION COMPLETE</span>
            <h2>Your Final Score</h2>
            <div class="result-score">${finalScore}/5</div>
            <p style="color: #e2e8f0; font-size: 14px; text-align: center; margin-top: 16px;">
                ${finalScore === 5 ? 'Outstanding! Masterfully played.' : 'Good effort! Swipe back to review your selections.'}
            </p>
        `;

        // Hide or repurpose the action button after evaluation computation finishes
        revealBtn.textContent = "Restart Quiz";
        revealBtn.style.background = "#64748b"; // Neutral slate tone change
        
        // Setup simple refresh pattern if clicked again
        revealBtn.addEventListener("click", () => {
            window.location.reload();
        }, { once: true });
    });
}
;

/**
 * 7. Populate the quiz questions from the json. Choose a random 10 questions.
 */
async function populateQuizQuestions() {
    try {
        // 1. Fetch the JSON file
        const response = await fetch('quiz_questions.json');
        if (!response.ok) throw new Error("Could not fetch quiz_questions.json");
        const data = await response.json();
        
        // 2. Select all card elements that have a question-category attribute
        const cards = document.querySelectorAll('.carousel-card-thumb[question-category]');
        
        // 3. Loop through each card and update its attributes + text elements
        cards.forEach(card => {
            const question = card.getAttribute('question-category'); // e.g., "food"
            
            // Check if this question exists in your JSON
            if (data[question]) {
                const cardData = data[question];
                
                // Update the HTML data attributes dynamically
                card.setAttribute('data-question', cardData.question);
                card.setAttribute('data-A_Answer', cardData.A_Answer.answer);
                card.setAttribute('data-B_Answer', cardData.B_Answer.answer);
                card.setAttribute('data-C_Answer', cardData.C_Answer.answer);
                card.setAttribute('data-D_Answer', cardData.D_Answer.answer);
                
                // Update the visible text inside the span element
                // Update the main title first
                const questionH2 = card.querySelector('.card-question');
                if (questionH2) questionH2.textContent = cardData.question;

                // 1. Set the starting default font size
                let currentTitleSize = 2.0; // This represents 0.85rem
                questionH2.style.fontSize = `${currentTitleSize}rem`;
                
                // 2. The Auto-Fit Engine: 
                // If the text width (scrollHeight) is wider than the card width (clientHeight)...
                while (questionH2.scrollHeight > questionH2.clientHeight && currentTitleSize > 0.55) {
                    currentTitleSize -= 0.05; // Drop the font size by a tiny amount
                    questionH2.style.fontSize = `${currentTitleSize}rem`; //Applies the smaller size font
                }

                // 2. Loop through each option letter
                ['A', 'B', 'C', 'D'].forEach(letter => {
                    // Finds the button where class is 'quiz-option-btn' AND data-value matches the current letter
                    const button = card.querySelector(`.quiz-option-btn[data-value="${letter}"]`);
                    
                    if (button) {
                        // Convert 'A' to 'a' to match your cardData property names (e.g., 'a_question')
                        const propName = `${letter}_Answer`;
                        
                        // Update the button text while preserving the "A) ", "B) " prefix formatting
                        button.textContent = `${letter}) ${cardData[propName].answer}`;

                        // 2. Set the starting default font size
                        let currentSize = 0.85; // This represents 0.85rem
                        button.style.fontSize = `${currentSize}rem`;
                        
                        // 3. The Auto-Fit Engine: 
                        // If the text width (scrollHeight) is wider than the button width (clientWidth)...
                        while (button.scrollHeight > button.clientHeight && currentSize > 0.55) {
                            currentSize -= 0.05; // Drop the font size by a tiny amount
                            button.style.fontSize = `${currentSize}rem`;
                        }

                    }
                });

                // // Loop through each option letter to update the questions
                // ['A', 'B', 'C', 'D'].forEach(letter => {
                //     // Dynamically targets '.q-a', '.q-b', etc.
                //     const questionSpan = card.querySelector(`.q-${letter}`); 
                    
                //     if (questionSpan) {
                //         // Dynamically grabs cardData.a_question, cardData.b_question, etc.
                //         questionSpan.textContent = cardData[`${letter}_question`]; 
                //     }
                // });

            } else {
                console.warn(`Missing data in JSON for question: ${question}`);
            }
        });
        
    } catch (error) {
        console.error("Error loading text content:", error);
    }
};



// Run the function as soon as the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    populateSiteText();
    // initQuizCarousel();
    populateQuizQuestions();
});