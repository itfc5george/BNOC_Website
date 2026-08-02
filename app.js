document.addEventListener('DOMContentLoaded', () => {
    initAccordions();
    initJumpLinks();
    initActionCardModal();
    initQuizCarousel();
});

// Define global variables
let questionsDisplayed = [];
let userAnswers = [];
let userAnswerPlayers = []; 
let finalCharacter = null;
let charactersData = null;
// let quizQuestionsData = null;


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
    const backBadge = document.querySelector('.card-back-badge');
    const quizResultCharacterImage = document.getElementById('quizResultCharacterImage');
    const backTitle = document.getElementById('modalBackTitle');
    const backDescription = document.getElementById('modalBackDescription');

    carouselCards.forEach(card => {
        card.addEventListener('click', () => {
            const title = card.getAttribute('data-title');
            const description = card.getAttribute('data-desc');
            const internalGraphic = card.querySelector('.card-thumb-mock');

            console.log("Card clicked:", title, description, internalGraphic.className);
            
            // Replicate background style patterns dynamically onto our overlay element
            cardFront.className = 'modal-face card-front ' + internalGraphic.className.split(' ')[1];
            
            if (internalGraphic.className === "card-thumb-mock quiz-result-card") {
                backBadge.style.display = "none"
                backTitle.textContent = "The character you are most like is";
                quizResultCharacterImage.src = `images_characters/test_character.png`; 
                quizResultCharacterImage.style.display = "block";
                backDescription.textContent = charactersData[finalCharacter].description;
            } else {
                // Populating content fields
                frontTitle.textContent = title;
                backTitle.textContent = title;
                backDescription.textContent = description;
            }
            
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
async function initQuizCarousel() {
    const carousel = document.getElementById("quizCarousel");
    const optionButtons = document.querySelectorAll(".quiz-option-btn");
    const revealBtn = document.getElementById("revealBtn");
    const resultDisplay = document.getElementById("resultDisplay");
    const chosenAnswersCharacters = []; //This is the array that will store the character names associated with the user's answers.
    const chosenAnswersCategories = []; //This is the array that will store the category of the chosen characters

    // const response = await fetch('quiz_questions.json');
    // if (!response.ok) throw new Error("Could not fetch quiz_questions.json");
    // quizQuestionsData = await response.json();

    // console.log("Quiz questions data loaded:", data[0][0]); // Debugging: Log the loaded quiz questions data
    try {
        // 1. Fetch the file
        const response = await fetch('quiz_questions.json');
        // 2. Check if the HTTP request was successful (status 200-299)
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseCharacters = await fetch('characters.json');
        if (!responseCharacters.ok) {
            throw new Error(`HTTP error! Status: ${responseCharacters.status}`);
        }
        // 3. Parse and store the JSON data in a const
        const quizQuestionsData = await response.json();
        charactersData = await responseCharacters.json();
        
        // Use your data here
        console.log(quizQuestionsData);
        console.log(quizQuestionsData.food.A_Answer); // Example: Log the first question of the first topic

        // 1. Automatic Moving Mechanism on option button selection
        optionButtons.forEach(button => {
            button.addEventListener("click", (e) => {
                const card = e.target.closest(".quiz-card"); //This targets the specific question card the user is currently looking at.
                const questionIndex = parseInt(card.getAttribute("question-topic"));
                const chosenValue = e.target.getAttribute("data-value");            
                

                // Clear previous selections on this card if any exist
                card.querySelectorAll(".quiz-option-btn").forEach(btn => btn.classList.remove("selected"));
                // Highlight chosen item state
                e.target.classList.add("selected");

                // Save choice configuration records
                if (userAnswers.length <= 3) { // needs to be one less than the total number of questions
                    userAnswers.push(chosenValue); //adds A,B,C,D to the userAnswers array
                }
                
                // When the right amount of questions answered, calculate the most like player
                if (userAnswers.length === 4) {
                    console.log("All questions answered. Ready to reveal results.");
                    for (let i = 0; i < userAnswers.length; i++) {    
                        const answerId = userAnswers[i] + "_Answer"; // e.g., "A_Answer"              
                        console.log("The user answered " + Object.entries(questionsDisplayed)[i][1]);
                        const question_id = Object.entries(questionsDisplayed)[i][1]; //store the id (subject) of the question for that card placement
                        console.log("The question info is " + quizQuestionsData[question_id][answerId].player);
                        chosenAnswersCharacters.push(
                            {
                                name: quizQuestionsData[question_id][answerId].player,
                                category: charactersData[quizQuestionsData[question_id][answerId].player].category
                            }
                        ); //store the character name and category associated with the user's answer
                        console.log("Chosen Characters Array:", chosenAnswersCharacters);

                        //NOW FIND THE MOST FREQUENT CATEGORY
                        // Step 1: Count occurrences of each category
                        // Creates: { Fruit: 3, Vegetable: 2 }
                        const categoryCounts = chosenAnswersCharacters.reduce((tallyObject, currentItem) => {
                            const categoryName = currentItem.category;
                            
                            // Look up current count (or default to 0), then add 1
                            tallyObject[categoryName] = (tallyObject[categoryName] || 0) + 1;
                            
                            return tallyObject;
                        }, {});

                        // Step 2: Find the category with the highest count and get JUST the string name
                        // Object.entries creates pairs like: [['Fruit', 3], ['Vegetable', 2]]
                        const mostFrequentCategory = Object.entries(categoryCounts).reduce(
                            (championPair, inspectPair) => {
                                const currentCount = inspectPair[1];
                                const highestCountSoFar = championPair[1];

                                // If current count is higher, it becomes the new champion pair
                                return currentCount > highestCountSoFar ? inspectPair : championPair;
                            },
                            ['', 0] // Initial starting pair: [categoryName, count]
                        )[0]; // <-- Grab index 0 of the winning pair to get ONLY the category string!

                        console.log(mostFrequentCategory);
                        
                        //create a new array only with the most frequent category
                        const filteredChosenAnswersCharacters = chosenAnswersCharacters.filter(item => item.category === mostFrequentCategory);
                        console.log(filteredChosenAnswersCharacters);

                        //Pick random character from the filtered array 
                        const randomIndex = Math.floor(Math.random() * filteredChosenAnswersCharacters.length);
                        finalCharacter = filteredChosenAnswersCharacters[randomIndex].name;
                        console.log("Final Character: " + finalCharacter);

                    }    

                }    


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

            });
        });

    } catch (error) {
        console.error("Failed to load JSON file:", error);
    }
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

                // Update the questionsDisplayed array to append the new question
                questionsDisplayed.push(question);
                
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

            } else {
                console.warn(`Missing data in JSON for question: ${question}`);
            }
        });

        console.log(questionsDisplayed); // Debugging: Show the array of questions that have been loaded
        
    } catch (error) {
        console.error("Error loading text content:", error);
    }
};



// Run the function as soon as the DOM is ready
document.addEventListener("DOMContentLoaded", async () => {
    populateSiteText();
    populateQuizQuestions();
    // initQuizCarousel();
});