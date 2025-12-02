
# Brief

Upgrade the Assignment 02 by adding the use of data coming from an external web API. For example, fetch contents (audio, images, video, text, metadata) from online archives, AI generated contents (chatGPT API), data (weather, realtime traffic data, environmental data).

The application **must** have those requirements:

- The webpage is responsive
- Use a web API (you choose which one best fists for your project) to load the data and display them in the webpage
- At least one multimedia file (for user feedback interactions, or content itself)
- Develop a navigation system that allows the user to navigate different sections with related content and functionalities

![Screenshot](img/Screenshot-01.png)
![Screenshot](img/Screenshot-02.png)

![Flow-Chart](img/Diagramma.png)

# Description
The Dark Path is a fantasy-themed memory game inspired by Magic: The Gathering and Gwent from The Witcher saga. After choosing a character and exploring their lore, players face a parchment board with ten random card pairs. Unlike standard memory games, the artwork is fetched dynamically from the Scryfall API, ensuring unique dark fantasy illustrations for every match.

# preLoadLore()
Parameters: None

Description: Asynchronously fetches the local lore.json file immediately upon page load. Parses the JSON data and stores it in the global loadedLoreData variable for instant access during character selection.

Return Value: Promise (resolves when data is loaded).

# fetchScryfallImages()
Parameters: None

Description: Initiates a loop of asynchronous HTTP requests to the Scryfall API (/cards/random). Uses a Set to ensure 10 unique card images are retrieved. Appends a custom timestamp parameter to the URL to bypass browser caching. Populates the cardList array with high-quality crop URLs.

Return Value: Promise (resolves when 10 unique images are ready).

# setupCharHoverEffects()
Parameters: None

Description: Selects all character images in the start screen. Attaches mouseenter listeners to find the corresponding lore in loadedLoreData and display it in the text box. Attaches mouseleave listeners to handle text styling.

Return Value: None.

# shuffleCards()
Parameters: None

Description: Creates a duplicated list of the 10 fetched API images (creating pairs). Randomly shuffles the resulting list (cardSet) using a randomization algorithm.

Return Value: None (updates the global cardSet array).

# startGame()
Parameters: None

Description: Clears the game board container (#pergamena). Iterates through grid rows and columns to: Pop one image URL from the shuffled cardSet. Create an image element initialized with the "Back" texture. Save the API image URL in the dataset.front attribute. Attach the selectCard() click handler. Add each card to the DOM.

Return Value: None.

# selectCard()
Parameters: None (this refers to the clicked card element)

Description: Plays the card flip sound. Prevents interaction if the board is locked or card is already flipped. Flips the card visually by applying CSS classes. Visual Logic: Sets the src attribute to the transparent PNG frame and the backgroundImage to the API artwork (from dataset.front). Schedules update() if two cards are selected.

Return Value: None.

# update()
Parameters: None

Description: Handles card comparison logic: Compares the style.backgroundImage of the two selected cards. If Match: Plays success sound, marks cards as matched, disables interaction, and adds to matchedCards. If No Match: Resets both cards by removing the backgroundImage and restoring the back-cover src. Calls checkVictory().

Return Value: None.

# checkVictory()
Parameters: None

Description: Checks if the matchedCards array length equals 20. If true, reveals the victory screen overlay.

Return Value: None.

Window & Event Handlers
Parameters: None

Description: DOMContentLoaded: Loads the background music (muted initially). Calls preLoadLore() to fetch text data. Calls setupCharHoverEffects() once data is ready.

window.onload: Handles the Character Selection: On click, fetches API images (showing a loading message), shuffles cards, and starts the game. Handles the Restart Button: Resets the board, fetches new images from the API, and restarts the game cycle.

Return Value: None.