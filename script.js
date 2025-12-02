// ==========================================
// CONFIGURAZIONE E VARIABILI GLOBALI
// ==========================================

// Endpoint Scryfall per UNA carta casuale (uso questo per evitare doppioni)
const SCRYFALL_RANDOM_URL = "https://api.scryfall.com/cards/random?q=t%3Acreature+(art%3Ahorror+OR+art%3Adark)+-is%3Afunny";
const LORE_JSON_PATH = "lore.json";
// IMPORTANTE: Assicurati che il nome file sia corretto nella cartella img
const CARD_FRAME_PATH = "img/card-frame-front.png"; 

var cardList = []; 
var cardSet = [];  
var board = [];
var rows = 4;
var columns = 5;

var card1Selected = null;
var card2Selected = null;
var lockBoard = false;
var matchedCards = [];
var loadedLoreData = [];

// ==========================================
// 1. GESTIONE DATI (API & JSON)
// ==========================================

// Carica il testo della storia all'avvio
async function preLoadLore() {
    try {
        const response = await fetch(LORE_JSON_PATH);
        loadedLoreData = await response.json();
        console.log("Lore caricata:", loadedLoreData);
    } catch (error) {
        console.error("Errore caricamento Lore:", error);
    }
}

// Scarica 10 carte uniche
async function fetchScryfallImages() {
    let uniqueImages = new Set();
    let attempts = 0;
    console.log("Evocando carte dal Void...");

    // Tentiamo di riempire il set con 10 immagini diverse
    while (uniqueImages.size < 10 && attempts < 25) {
        attempts++;
        try {
            // Aggiungo un timestamp random per evitare che il browser usi la cache
            const response = await fetch(SCRYFALL_RANDOM_URL + "&anticache=" + Date.now() + Math.random());
            const data = await response.json();
            if (data.image_uris && data.image_uris.art_crop) {
                uniqueImages.add(data.image_uris.art_crop);
            }
        } catch (error) { 
            console.warn("Evocazione fallita, riprovo..."); 
        }
    }
    
    cardList = Array.from(uniqueImages);
    
    // Sicurezza: se internet va male, duplichiamo le carte trovate per arrivare a 10
    while (cardList.length < 10 && cardList.length > 0) { 
        cardList.push(cardList[0]); 
    }
    console.log("Carte pronte:", cardList);
}

// ==========================================
// 2. INTERFACCIA UTENTE (Lore & Hover)
// ==========================================

function setupCharHoverEffects() {
    const charImages = document.querySelectorAll("#char-selection img");
    const titleBox = document.getElementById("lore-title");
    const descBox = document.getElementById("lore-desc");

    charImages.forEach(img => {
        img.addEventListener("mouseenter", () => {
            const charName = img.getAttribute("data-name");
            const charData = loadedLoreData.find(entry => entry.name === charName);
            
            if (charData) {
                titleBox.innerText = charData.name;
                descBox.innerText = charData.lore;
                titleBox.style.color = "#ff3333"; 
                titleBox.style.textShadow = "0 0 10px rgba(255,0,0,0.5)";
            }
        });

        img.addEventListener("mouseleave", () => {
             titleBox.style.color = "#d4c8b4"; 
             titleBox.style.textShadow = "none";
        });
    });
}

// ==========================================
// 3. LOGICA DI GIOCO (Memory Game)
// ==========================================

function shuffleCards() {
    cardSet = cardList.concat(cardList);
    for (let i = 0; i < cardSet.length; i++) {
        let j = Math.floor(Math.random() * cardSet.length);
        [cardSet[i], cardSet[j]] = [cardSet[j], cardSet[i]];
    }
}

function startGame() {
    let pergamena = document.getElementById("pergamena");
    pergamena.innerHTML = ""; 
    board = [];

    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < columns; c++) {
            let cardImgUrl = cardSet.pop();
            row.push(cardImgUrl);

            let card = document.createElement("img");
            card.id = r + "-" + c;
            card.src = "img/BACK-card.png";
            card.dataset.front = cardImgUrl; // Salviamo l'URL di Magic nei dati
            card.classList.add("card");
            
            card.addEventListener("click", selectCard);
            pergamena.appendChild(card);
        }
        board.push(row);
    }
}

function selectCard() {
    var sound = document.getElementById("card-sound");
    sound.currentTime = 0;
    sound.play();

    if (lockBoard) return;
    if (!this.classList.contains("flipped")) {
        this.classList.add("flipped");
        
        // --- LOGICA CORNICE + SFONDO ---
        // 1. L'immagine in primo piano diventa la CORNICE PNG
        this.src = CARD_FRAME_PATH; 
        // 2. L'immagine di Magic diventa lo SFONDO CSS
        this.style.backgroundImage = `url('${this.dataset.front}')`;
        
        if (!card1Selected) {
            card1Selected = this;
        } else if (!card2Selected && this !== card1Selected) {
            card2Selected = this;
            lockBoard = true;
            setTimeout(update, 1000);
        }
    }
}

function update() {
    // Confrontiamo gli SFONDI (perché il src è uguale per tutti: la cornice)
    let img1 = card1Selected.style.backgroundImage;
    let img2 = card2Selected.style.backgroundImage;

    if (img1 !== img2) {
        // NON MATCH: Resetta
        card1Selected.src = "img/BACK-card.png";
        card1Selected.style.backgroundImage = "none"; // Via lo sfondo
        
        card2Selected.src = "img/BACK-card.png";
        card2Selected.style.backgroundImage = "none"; // Via lo sfondo
    } else {
        // MATCH!
        var correctSound = document.getElementById("correct-cards");
        correctSound.currentTime = 0; correctSound.play();

        card1Selected.classList.add("matched");
        card2Selected.classList.add("matched");
        
        // Blocca interazioni
        card1Selected.style.pointerEvents = "none";
        card2Selected.style.pointerEvents = "none";
        
        matchedCards.push(card1Selected, card2Selected);
        checkVictory();
    }
    
    card1Selected.classList.remove("flipped");
    card2Selected.classList.remove("flipped");
    card1Selected = null;
    card2Selected = null;
    lockBoard = false;
}

function checkVictory() {
    if (matchedCards.length === 20) { 
        document.getElementById("victory-screen").style.display = "flex";
    }
}

// ==========================================
// 4. INIZIALIZZAZIONE E RESTART
// ==========================================

window.addEventListener("DOMContentLoaded", () => {
    const audio = document.getElementById("bg-music");
    document.body.addEventListener("click", () => {
        audio.muted = false;
        audio.play().catch(err => console.log(err));
    }, { once: true });

    document.getElementById("restart-btn").style.display = "none";

    // Carica Lore -> Poi attiva Hover
    preLoadLore().then(() => {
        setupCharHoverEffects();
    });
});

window.onload = function() {
    var restartBtn = document.getElementById("restart-btn");
    var charSelection = document.getElementById("char-selection");
    var selectedChar = document.getElementById("selected-character");

    // SELEZIONE PERSONAGGIO (INIZIO)
    charSelection.querySelectorAll("img").forEach(img => {
        img.addEventListener("click", async function() {
            selectedChar.src = this.src;
            selectedChar.style.opacity = 1;
            charSelection.style.display = "none";
            document.body.style.backgroundColor = "#111";
            document.getElementById("click-sound").currentTime = 0;
            document.getElementById("click-sound").play();

            let pergamena = document.getElementById("pergamena");
            // Scritta con font Cinzel
            pergamena.innerHTML = '<h2 style="color:white; grid-column: 1 / -1; margin-top: 20%; font-family:Cinzel Decorative;">Opening the Dark Path...<br><span style="font-size:0.7em; font-family:MedievalSharp;">(Summoning cards from the Void)</span></h2>';

            await fetchScryfallImages();
            shuffleCards();
            startGame();
            document.getElementById("restart-btn").style.display = "block";
        });
    });

    // RESTART
    restartBtn.addEventListener("click", async function() {
        document.getElementById("victory-screen").style.display = "none";
        document.getElementById("click-sound").currentTime = 0;
        document.getElementById("click-sound").play();

        matchedCards = [];
        card1Selected = null;
        card2Selected = null;
        lockBoard = false;

        let pergamena = document.getElementById("pergamena");
        pergamena.innerHTML = '<h2 style="color:white; grid-column: 1 / -1; margin-top: 20%; font-family:Cinzel Decorative;">Refreshing the Nightmare...</h2>';
        
        await fetchScryfallImages();
        shuffleCards();
        startGame();
    });
};