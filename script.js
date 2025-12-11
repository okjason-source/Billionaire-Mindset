// Add this at the very top of script.js
console.log("Script loaded successfully");

// Console log interceptor
(function() {
    // Store original console methods
    const originalConsole = {
        log: console.log,
        warn: console.warn,
        error: console.error,
        info: console.info
    };

    // Max number of log entries to store
    const MAX_LOG_ENTRIES = 500;
    let logEntries = [];
    let currentFilter = 'all';

    // Function to initialize console controls
    function initConsoleControls() {
        const clearLogsBtn = document.getElementById('clear-logs');
        const resetAIBtn = document.getElementById('reset-ai');
        const toggleConsoleBtn = document.getElementById('toggle-console');
        const toggleAsciiBtn = document.getElementById('toggle-ascii');
        const logFilter = document.getElementById('log-filter');
        const consoleContent = document.getElementById('console-log-content');
        const consoleContainer = document.getElementById('console-log-container');
        
        if (clearLogsBtn) {
            clearLogsBtn.addEventListener('click', function(e) {
                e.preventDefault();
                clearLogEntries();
            });
        }
        
        if (resetAIBtn) {
            resetAIBtn.addEventListener('click', function(e) {
                e.preventDefault();
                resetAI();
            });
        }
        
        // Initialize ASCII art toggle button
        if (toggleAsciiBtn) {
            // Set initial button text based on saved state
            // Access global variable explicitly
            const currentState = window.asciiArtEnabled !== undefined ? window.asciiArtEnabled : (localStorage.getItem('asciiArtEnabled') !== 'false');
            window.asciiArtEnabled = currentState;
            toggleAsciiBtn.textContent = window.asciiArtEnabled ? 'ASCII: ON' : 'ASCII: OFF';
            
            toggleAsciiBtn.addEventListener('click', function() {
                window.asciiArtEnabled = !window.asciiArtEnabled;
                asciiArtEnabled = window.asciiArtEnabled; // Update the global variable
                localStorage.setItem('asciiArtEnabled', window.asciiArtEnabled.toString());
                toggleAsciiBtn.textContent = window.asciiArtEnabled ? 'ASCII: ON' : 'ASCII: OFF';
                console.log('ASCII art toggled:', window.asciiArtEnabled ? 'ON' : 'OFF');
            });
        }
        
        if (toggleConsoleBtn) {
            toggleConsoleBtn.addEventListener('click', function() {
                const isHidden = consoleContent.style.display === 'none';
                
                if (isHidden) {
                    consoleContent.style.display = 'block';
                    toggleConsoleBtn.textContent = 'Hide';
                } else {
                    consoleContent.style.display = 'none';
                    toggleConsoleBtn.textContent = 'Show';
                }
            });
        }
        
        if (logFilter) {
            logFilter.addEventListener('change', function() {
                currentFilter = this.value;
                refreshLogDisplay();
            });
        }
        
        // Initialize with a welcome message
        console.log("DrugTrade Simulator Console Initialized");
        console.log("Game logs will appear here. Filter using the dropdown above.");
    }
    
    // Function to refresh the log display based on the current filter
    function refreshLogDisplay() {
        const consoleContent = document.getElementById('console-log-content');
        if (!consoleContent) return;
        
        consoleContent.innerHTML = '';
        
        logEntries.forEach(entry => {
            if (currentFilter === 'all' || 
                (currentFilter === entry.type) ||
                (currentFilter === 'ascii-art' && entry.category === '[ASCII ART]')) {
                const logEntry = document.createElement('div');
                logEntry.className = `log-entry log-type-${entry.type}`;
                
                // Add ASCII art entry class if needed
                if (entry.category === '[ASCII ART]') {
                    logEntry.classList.add('ascii-art-entry');
                }
                
                // Add timestamp
                const timestampSpan = document.createElement('span');
                timestampSpan.className = 'timestamp';
                timestampSpan.textContent = entry.timestamp;
                logEntry.appendChild(timestampSpan);
                
                // Add category if exists
                if (entry.category) {
                    const categorySpan = document.createElement('span');
                    categorySpan.className = 'category';
                    categorySpan.textContent = entry.category;
                    logEntry.appendChild(categorySpan);
                }
                
                // Add message
                logEntry.appendChild(document.createTextNode(' ' + entry.message));
                
                // Add to DOM
                consoleContent.appendChild(logEntry);
            }
        });
        
        // Auto-scroll to bottom
        consoleContent.scrollTop = consoleContent.scrollHeight;
    }

    // Function to add log to the DOM
    function addLogToDOM(type, args) {
        // Check if the console container exists
        const consoleContent = document.getElementById('console-log-content');
        if (!consoleContent) return;

        // Create log element
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry log-type-${type}`;

        // Format message
        let message = '';
        let category = '';

        // Add timestamp
        const timestamp = new Date();
        const timestampStr = `${timestamp.getHours().toString().padStart(2, '0')}:${timestamp.getMinutes().toString().padStart(2, '0')}:${timestamp.getSeconds().toString().padStart(2, '0')}`;
        const timestampSpan = document.createElement('span');
        timestampSpan.className = 'timestamp';
        timestampSpan.textContent = timestampStr;
        logEntry.appendChild(timestampSpan);

        // Convert arguments to string
        let argsString = '';
        for (let i = 0; i < args.length; i++) {
            if (typeof args[i] === 'object') {
                try {
                    argsString += JSON.stringify(args[i]);
                } catch (e) {
                    argsString += '[Object]';
                }
            } else {
                argsString += args[i];
            }
            
            if (i < args.length - 1) {
                argsString += ' ';
            }
        }

        // Check for message categories to color differently
        if (argsString.includes('[BOT]')) {
            type = 'bot';
            category = '[BOT]';
        } else if (argsString.includes('[BANKROLL]') || argsString.includes('[INVENTORY]') || argsString.includes('[BUY]') || argsString.includes('[SELL]') || argsString.includes('[BOT TRAVEL]')) {
            type = 'transaction';
            // Extract the category e.g. [BANKROLL]
            const match = argsString.match(/\[\w+\]/);
            if (match) {
                category = match[0];
            }
        } else if (argsString.includes('[RANDOM EVENT]') || argsString.includes('[LOAN]') || argsString.includes('[GUN]')) {
            type = 'event';
            const match = argsString.match(/\[\w+(\s\w+)?\]/);
            if (match) {
                category = match[0];
            }
        } else if (argsString.includes('[BOT LEARNING]') || argsString.includes('[STRATEGY]') || argsString.includes('[BOT REWARD]')) {
            type = 'learning';
            const match = argsString.match(/\[\w+(\s\w+)?\]/);
            if (match) {
                category = match[0];
            }
        }

        // Add special formatting for ASCII art logs
        if (argsString.includes('ASCII Art Display:')) {
            logEntry.classList.add('ascii-art-entry');
            category = '[ASCII ART]';
            // Store ASCII art logs with a special type to make filtering easier
            const asciiType = argsString.includes('ASCII Art Display:') ? argsString.split('ASCII Art Display:')[1].trim() : 'unknown';
            logEntry.dataset.asciiType = asciiType;
        }

        // Filter out CSP errors and other irrelevant system messages
        if (type === 'error' && (
            argsString.includes('Content Security Policy') || 
            argsString.includes('favicon.ico') ||
            argsString.includes('Failed to load resource') ||
            argsString.includes('404 (Not Found)')
        )) {
            return;
        }

        // Add category span if one was detected
        if (category) {
            const categorySpan = document.createElement('span');
            categorySpan.className = 'category';
            categorySpan.textContent = category;
            logEntry.appendChild(categorySpan);
            
            // Remove the category from the main message
            argsString = argsString.replace(category, '').trim();
        }

        // Add message content
        logEntry.appendChild(document.createTextNode(' ' + argsString));
        
        // Add to log entries array
        logEntries.push({
            type,
            timestamp: timestampStr,
            category,
            message: argsString
        });
        
        // Add the ascii-art attribute for ASCII art logs
        if (category === '[ASCII ART]') {
            logEntries[logEntries.length - 1].isAsciiArt = true;
            logEntries[logEntries.length - 1].asciiType = logEntry.dataset.asciiType;
        }
        
        // Trim log entries if exceeding the maximum
        if (logEntries.length > MAX_LOG_ENTRIES) {
            logEntries.shift();
        }
        
        // Only add to DOM if it matches the current filter
        if (currentFilter === 'all' || type === currentFilter) {
            // Add to DOM
            consoleContent.appendChild(logEntry);
            
            // Auto-scroll to bottom
            consoleContent.scrollTop = consoleContent.scrollHeight;
        }
    }

    // Override console methods
    console.log = function() {
        addLogToDOM('log', arguments);
        originalConsole.log.apply(console, arguments);
    };
    
    console.warn = function() {
        addLogToDOM('warn', arguments);
        originalConsole.warn.apply(console, arguments);
    };
    
    console.error = function() {
        addLogToDOM('error', arguments);
        originalConsole.error.apply(console, arguments);
    };
    
    console.info = function() {
        addLogToDOM('info', arguments);
        originalConsole.info.apply(console, arguments);
    };
    
    // Function to get log entries
    window.getLogEntries = function() {
        return logEntries;
    };
    
    // Function to clear log
    window.clearLogEntries = function() {
        const consoleContent = document.getElementById('console-log-content');
        if (consoleContent) {
            consoleContent.innerHTML = '';
        }
        logEntries = [];
    };

    // Initialize console controls when the DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        initConsoleControls();
        console.log("Game console initialized and ready to display logs");
    });
})();

let tradingBot = null;
let gameInterval = null;

// Add this with other global variables at the top
let bankroll = 1000000;
let totalSecondsRemaining = 30 * 86400; // 
let guns = 0;
let debt = 0;
let bankBalance = 0;
let loanBalance = 0;
let city = "Silicon Valley";
let currentProduct = "realEstate";
let realTimeSeconds = 1000;
let transactionCount = 0; // Added to track actions for random events

// Game statistics tracking
let gameStats = {
    policeRaids: 0,
    robberEncounters: 0,
    successfulDefenses: 0,
    citiesVisited: 0,
    totalTrades: 0
};

// 1 real-life second = 1 game hour
//// Each in-game day lasts 24 real-time seconds - travel(6h=6s)
let botEnabled = false;
let botTrainingInterval = null;

// ASCII art toggle state (default: disabled)
let asciiArtEnabled = localStorage.getItem('asciiArtEnabled') === 'true';
// Make it accessible on window object for easier access
if (typeof window !== 'undefined') {
    window.asciiArtEnabled = asciiArtEnabled;
}
                            
let inventory = {
    realEstate: 0,
    crypto: 0,
    fineArt: 0,
    goldBars: 0,
    techStocks: 0,
};

const products = {
    realEstate: { 
        name: "Real Estate", 
        minPrice: 560000, 
        maxPrice: 1000000,
        trend: 'up, down, neutral'
    },
    crypto: { name: "Crypto", minPrice: 28000, maxPrice: 50000 },
    fineArt: { name: "Fine Art", minPrice: 25000, maxPrice: 50000 },
    goldBars: { name: "Gold Bars", minPrice: 55000, maxPrice: 100000 },
    techStocks: { name: "Tech Stocks", minPrice: 61000, maxPrice: 100000 }
};

// Initialize player data
const player = {
    bankroll: 1000000.00, // Starting bankroll
    holdings: {},      // Player's product holdings
    
};

// Add this variable at the top with other game state
let highLowPriceHistory = new Map(); // Tracks high/low prices per product

// Add global action tracker
let hasPerformedFirstAction = false;

// Initialize at the top of your script
let dayMessageIndex = 0;
const DAY_MESSAGES = [
    "Plenty of time to build the empire. We're going global. Let's make billions.",
    "The bigger the risk, the bigger the reward. That's the billionaire mindset.",
    "We're just getting started. The mansion awaits.",
    "The clock's ticking, but so is my net worth.",
    "Time to turn up the investment strategy.",
    "Halfway there. Time to double down on opportunities.",
    "The money's flowing, and so is my portfolio.",
    "It's go big or go home. No middle ground.",
    "No time for second thoughts. Fortune favors the bold.",
    "Last days to make it count. All or nothing. Billionaire or bust."
];

// At the top of the file, after any existing variable declarations
// Global variables
let gameState = {
    day: 1,
    cash: 1000000,
    bank: 0,
    loan: 0,
    inventory: {},
    currentCity: null,
    gameActive: true,
    totalDays: 30,
    bankInterest: 0.05,
    loanInterest: 0.1,
    gun: 0,
    health: 100,
    reputation: 50
};

// Function to get a random price between min and max for the selected product
function getRandomPrice(product, bankroll) {
    const minPrice = products[product].minPrice;
    const maxPrice = products[product].maxPrice;
    let randomPrice = Math.floor(Math.random() * (maxPrice - minPrice + 1)) + minPrice;

    // Store price in memory
    if(tradingBot) {
        tradingBot.recordPriceMovement(product, randomPrice);
    }
    
    return randomPrice;
}

// Function to save game state to localStorage
function saveGameState() {
    try {
        const gameState = {
            bankroll: bankroll,
            totalSecondsRemaining: totalSecondsRemaining,
            guns: guns,
            bankBalance: bankBalance,
            loanBalance: loanBalance,
            city: city,
            inventory: inventory,
            currentProduct: currentProduct,
            transactionCount: transactionCount, // Save transaction count
            visitedCities: visitedCities || [], // Save visited cities
            citiesVisitedCount: citiesVisitedCount || 0, // Save cities visited count
            botState: tradingBot ? tradingBot.saveState() : null,
            botEnabled: botEnabled !== undefined ? botEnabled : true, 
            botTrainingInterval: botTrainingInterval ? true : false
        };

        localStorage.setItem('gameState', JSON.stringify(gameState));
        console.log('Game state saved successfully');
    } catch (error) {
        console.error('Error saving game state:', error);
    }
}


// Function to update the buy and sell prices for the current product
function updatePrices() {
    if (!currentProduct || !products[currentProduct]) {
        // Ensure currentProduct is set
        if (Object.keys(products).length > 0) {
            currentProduct = Object.keys(products)[0];
        } else {
            return; // No products available
        }
    }
    
    const buyPrice = getRandomPrice(currentProduct);
    // Calculate sell price range
    const sellPriceMin = Math.floor(buyPrice * 0.5);
    const sellPriceMax = Math.floor(buyPrice * 2);

    // Store currentPrice on the product object
    if (products[currentProduct]) {
        products[currentProduct].currentPrice = buyPrice;
    }

    const buyPriceEl = document.getElementById('buy-price');
    const sellPriceMinEl = document.getElementById('sell-price-range');
    const sellPriceMaxEl = document.getElementById('sell-price-max');
    
    if (buyPriceEl) {
        buyPriceEl.innerText = buyPrice.toLocaleString();
    }
    if (sellPriceMinEl) {
        sellPriceMinEl.innerText = sellPriceMin.toLocaleString();
    }
    if (sellPriceMaxEl) {
        sellPriceMaxEl.innerText = sellPriceMax.toLocaleString();
    }
}

// Update initProductDropdown with null check
function initProductDropdown() {
    const dropdown = document.getElementById('product-dropdown');
    
    if (!dropdown) {
        // Recreate the dropdown if missing
        const actionsEl = document.getElementById('actions');
        if (!actionsEl) {
            console.warn('Actions element not found, cannot create dropdown');
            return;
        }
        const newDropdown = document.createElement('select');
        newDropdown.id = 'product-dropdown';
        actionsEl.appendChild(newDropdown);
        return initProductDropdown(); // Retry initialization
    }

    // Clear existing options
    dropdown.innerHTML = '';
    
    for (let product in products) {
        const option = document.createElement('option');
        option.value = product;
        option.textContent = products[product].name;
        dropdown.appendChild(option);
    }

    // Update prices when product changes
    dropdown.addEventListener('change', (event) => {
        currentProduct = event.target.value;
        updatePrices();
    });

    // Remove the preventDefault that was causing issues with keyboard navigation
    // dropdown.addEventListener('keydown', (event) => {
    //     if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    //         event.preventDefault();
    //     }
    // });

    // Set initial prices for the default product
    updatePrices();
}

// Update the logEvent function with null checks
function logEvent(message, type = 'general', additionalMessage = '') {
    const eventDisplay = document.getElementById('event-display');
    if (!eventDisplay) {
        console.log(message); // Fallback to console
        if (additionalMessage) console.log(additionalMessage);
        return;
    }
    
    // Check if there's an additional message to display
    if (additionalMessage && additionalMessage.length > 0) {
        eventDisplay.innerHTML = `${message}<br><span class="thematic-message">${additionalMessage}</span>`;
    } else {
        eventDisplay.textContent = message;
    }
}

// Update the UI
function updateUI() {
    // Remove verbose UI update logging
    // Only log UI updates in debug mode if needed
    if (window.debugMode) {
    console.log('[UI UPDATE]', {
            bankroll, city, 
            inventory: Object.keys(inventory).length > 0 ? '...' : 'empty',
            days: formatTime(totalSecondsRemaining)
        });
    }
    
    try {
        const elementsToUpdate = {
            'bankroll': bankroll,
            'days': formatTime(totalSecondsRemaining),
            'guns': guns,
            'city': city,
            'bank-balance': bankBalance,
            'loan-balance': loanBalance
        };
    
        // Update text elements
        Object.entries(elementsToUpdate).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                if (typeof value === 'number') {
                    element.innerText = value.toLocaleString();
                } else {
                    element.innerText = value;
                }
            }
        });
    
        // Update the inventory display
        updateInventory();
        
        // Update strategy display for the bot - only if controls exist
        if (tradingBot && botEnabled && document.getElementById('bot-controls')) {
            updateStrategyDisplay();
        }
        
        // Update statistics window if it exists
        if (typeof updateStatsWindow === 'function') {
            updateStatsWindow();
        }
        
        // Update gun display
        if (typeof updateGunDisplay === 'function') {
            updateGunDisplay();
        }
    } catch (error) {
        console.error('[UI UPDATE ERROR]', error);
    }
}


// Update inventory display
function updateInventory() {
    const inventoryDiv = document.getElementById('inventory');
    if (!inventoryDiv) return;

    try {
        // Convert inventory object to array of entries
        const inventoryItems = Object.entries(inventory);
        
        // Calculate total inventory value
        let totalValue = 0;
        inventoryItems.forEach(([productKey, quantity]) => {
            if (products[productKey] && quantity > 0) {
                // Use currentPrice if available, otherwise use average of min and max price
                let currentPrice = products[productKey].currentPrice;
                if (!currentPrice || isNaN(currentPrice)) {
                    const minPrice = products[productKey].minPrice || 0;
                    const maxPrice = products[productKey].maxPrice || 0;
                    if (minPrice > 0 && maxPrice > 0) {
                        currentPrice = Math.floor((minPrice + maxPrice) / 2);
                    } else {
                        currentPrice = 0; // Fallback to 0 if prices are invalid
                    }
                }
                // Ensure currentPrice is a valid number
                if (!isNaN(currentPrice) && isFinite(currentPrice)) {
                    totalValue += quantity * currentPrice;
                }
            }
        });
        
        // Get or create inventory content wrapper (to preserve mascots)
        let inventoryContent = inventoryDiv.querySelector('.inventory-content-wrapper');
        if (!inventoryContent) {
            // Save mascots temporarily
            const moneyMascot = document.getElementById('money-mascot');
            const ostrichMascot = document.getElementById('ostrich-mascot');
            
            // Create wrapper for inventory content
            inventoryContent = document.createElement('div');
            inventoryContent.className = 'inventory-content-wrapper';
            inventoryDiv.innerHTML = '';
            inventoryDiv.appendChild(inventoryContent);
            
            // Re-add mascots
            if (moneyMascot) inventoryDiv.appendChild(moneyMascot);
            if (ostrichMascot) inventoryDiv.appendChild(ostrichMascot);
        }
        
        // Create HTML string with all items (including zeros)
        const inventoryHTML = `
            <div class="inventory-list">
                ${Object.keys(products).map(productKey => {
                    const productName = products[productKey]?.name || productKey;
                    const quantity = inventory[productKey] || 0;
                    
                    // Use currentPrice if available, otherwise use average of min and max price
                    let currentPrice = products[productKey].currentPrice;
                    if (!currentPrice || isNaN(currentPrice)) {
                        const minPrice = products[productKey].minPrice || 0;
                        const maxPrice = products[productKey].maxPrice || 0;
                        if (minPrice > 0 && maxPrice > 0) {
                            currentPrice = Math.floor((minPrice + maxPrice) / 2);
                        } else {
                            currentPrice = 0;
                        }
                    }
                    // Ensure we have a valid number
                    if (isNaN(currentPrice) || !isFinite(currentPrice)) {
                        currentPrice = 0;
                    }
                    const value = quantity > 0 ? (quantity * currentPrice).toLocaleString() : '0';
                    
                    return `
                        <div class="inventory-item ${quantity > 0 ? 'has-inventory' : ''}">
                            <span class="product-name">${productName}:</span>
                            <span class="product-quantity">${quantity.toLocaleString()}</span>
                            ${quantity > 0 ? `<span class="product-value">($${value})</span>` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
            <div class="inventory-summary">
                <div class="total-value">Total Value: $${totalValue.toLocaleString()}</div>
            </div>
        `;

        // Update only the content wrapper, preserving mascots
        inventoryContent.innerHTML = inventoryHTML;
    } catch (error) {
        console.error('[INVENTORY UPDATE ERROR]', error);
    }
}

// Update the cities array
const cities = ["Silicon Valley", "Monaco", "Dubai", "Singapore", "Zurich", "Hong Kong", "Shanghai", "Beverly Hills", "Geneva", "Zurich", "Luxembourg", "Manhattan", "Mumbai", "São Paulo", "Cairo", "Moscow", "Amsterdam"];

// Add this function to determine if a price is exceptionally low or high
function isExceptionalPrice(buyPrice, sellPrice, productKey) {
    if (!productKey || !products[productKey]) {
        return false;
    }
    
    const minPrice = products[productKey].minPrice;
    const maxPrice = products[productKey].maxPrice;
    const priceRange = maxPrice - minPrice;
    
    const isVeryLowBuy = buyPrice <= minPrice + (priceRange * 0.1);
    const isVeryHighSell = sellPrice >= maxPrice - (priceRange * 0.1);
    const isVeryHighProfit = buyPrice > 0 && sellPrice >= buyPrice * 2;
    
    return isVeryLowBuy || isVeryHighSell || isVeryHighProfit;
}

// Update the travel time constant
const secondsPerTravel = 6 * 3600; // 6 hours in seconds

// Update the main travel function
function travel() {
        // Generate random city that's different from current one
        const cities = ["Silicon Valley", "Monaco", "Dubai", "Singapore", "Zurich", "Hong Kong", "Shanghai", "Beverly Hills", "Geneva", "Zurich", "Luxembourg", "Manhattan", "Mumbai", "São Paulo", "Cairo", "Moscow", "Amsterdam"];
        const availableCities = cities.filter(c => c !== city);
        const newCity = availableCities[Math.floor(Math.random() * availableCities.length)];
        
    // Update location and log basic travel info
        const oldCity = city;
        city = newCity;
        logEvent(`You traveled from ${oldCity} to ${city}`, "travel");
        
        // Change background music for new location (with 1.5s delay)
        if (typeof window !== 'undefined' && window.backgroundMusic) {
            window.backgroundMusic.changeMusicForLocation(city);
        }
        
        // Track cities visited (count unique cities)
        if (!visitedCities.includes(newCity)) {
            visitedCities.push(newCity);
            citiesVisitedCount = visitedCities.length;
            // Also update gameStats for consistency
            if (gameStats) {
                gameStats.citiesVisited = citiesVisitedCount;
            }
        }
        
        saveGameState(); // Save state after travel
    
    // Add one of the engaging travel messages about the new city
    const travelMessages = [
        `${city} is where the billionaires gather tonight.`,
        `The financial districts of ${city} hold untold opportunities.`,
        `${city} is a hub that never sleeps and neither does my portfolio.`,
        `In ${city}, the investment opportunities are always premium.`,
        `${city} calls to those who understand wealth.`,
        `${city}... the air smells like money.`,
        `Off to ${city}. Let's see what the market brings.`,
        `${city}, where empires are built or lost.`,
        `${city}, time to expand the portfolio.`
    ];
    
    // Display a random travel message
    logEvent(travelMessages[Math.floor(Math.random() * travelMessages.length)], "travel");
    
    // Show travel ASCII art
    showAsciiArt('travel');
    
    updatePrices();
    updateUI();
    
    // Check for random events after traveling (same frequency as buying/selling)
    if (Math.random() < 0.45) randomEvent();
}


// Handle random events (police raids or robbers)
function randomEvent() {
    const eventChance = Math.random();
    
    // Record if player had guns before the event
    const hadGuns = guns > 0;
    
    // % daily chance of IRS audit / market crash
    if (eventChance < 0.35) { 
        console.log('[RANDOM EVENT] IRS audit triggered');
        policeRaid();
    } 
    // % daily chance of competitors / market manipulators
    else if (eventChance < 0.45) { 
        console.log('[RANDOM EVENT] Market manipulation encounter triggered');
        robbers();
    } else {
        console.log('[RANDOM EVENT] No event triggered (peaceful day at the mansion)');
    }
    
    // If tradingBot exists, let it know about the event
    if (tradingBot) {
        tradingBot.lastRandomEvent = {
            type: eventChance < 0.35 ? 'police' : eventChance < 0.45 ? 'robbers' : 'none',
            time: Date.now(),
            hadGuns: hadGuns
        };
    }
}

// Updated IRS audit / Market crash based on README
function policeRaid() {
    // Calculate penalty, could be just a fine or inventory confiscation
    const penalty = Math.min(bankroll * 0.15, 50000);
    bankroll = Math.max(0, bankroll - penalty);
    
    // IRS audit / Market crash - security teams may be compromised
    const confiscatedGuns = guns;
    if (confiscatedGuns > 0) {
        guns = 0;
        logEvent(`IRS AUDIT! Paid $${penalty.toLocaleString()} in penalties and had ${confiscatedGuns} security team(s) reassigned`, 'alert');
        updateGunDisplay();
    } else {
        logEvent(`IRS AUDIT! Paid $${penalty.toLocaleString()} in penalties`, 'alert');
    }
    
    
    
    // Update UI
    updateUI();
    
    // Update statistics
    raidsSurvivedCount++;
}

// Updated competitors / market manipulators function based on README
function robbers() {
    // Competitors / Market manipulators steal a percentage of cash
    const stolenCash = Math.min(bankroll * 0.25, 100000);
    bankroll -= stolenCash;
    
    // Security defense logic if applicable
    if (guns > 0) {
        // Successfully defended with security but lost one team in the process
        guns--;
        logEvent(`MARKET MANIPULATION! Lost $${stolenCash.toLocaleString()} to competitors and 1 security team reassigned.`, 'alert');
        logEvent("Your security team defended your assets, but one team was compromised.", 'success');
        updateGunDisplay();
        successfulDefensesCount++;
    } else {
        logEvent(`MARKET MANIPULATION! Lost $${stolenCash.toLocaleString()} to competitors`, 'alert');
    }
    
    // Show competitor ASCII art
    showAsciiArt('robber');
    
    // Update UI
    updateUI();
    
    // Update statistics
    robberEncountersCount++;
}

// Buying and Selling logic
function buyProduct() {
    try {
        const quantity = parseInt(document.getElementById('quantity').value || '0');
        const buyPrice = parseInt(document.getElementById('buy-price').textContent.replace(/,/g, '') || '0');
        const totalCost = quantity * buyPrice;

        if (isNaN(quantity) || quantity <= 0) {
            logEvent("Invalid quantity");
            return false;
        }

        if (totalCost > bankroll) {
            logEvent("Insufficient funds");
            return false;
        }

        // Update bankroll and inventory with proper rounding
        bankroll = Math.round((bankroll - totalCost) * 100) / 100; // Round to 2 decimal places
        
        // Update both inventory variables for consistency
        inventory[currentProduct] = (inventory[currentProduct] || 0) + quantity;
        
        // Also update gameState inventory for bot access
        if (!gameState.inventory) gameState.inventory = {};
        gameState.inventory[currentProduct] = (gameState.inventory[currentProduct] || 0) + quantity;
        
        // Update gameState.cash too for consistency
        gameState.cash = bankroll;
        
        // Define thematic messages for buying based on price
        let buyMessages;
        if (isExceptionalPrice(buyPrice, 0, currentProduct)) {
            buyMessages = [
                `Incredible opportunity! Acquired ${quantity} ${products[currentProduct].name} at an exceptional price of $${totalCost.toLocaleString()}.`,
                `This investment is too good to pass up. ${quantity} ${products[currentProduct].name} for just $${totalCost.toLocaleString()}.`,
                `Sometimes the market aligns perfectly. ${quantity} ${products[currentProduct].name} at $${totalCost.toLocaleString()} is a steal.`
            ];
        } else {
            buyMessages = [
                `Strategic acquisition. Purchased ${quantity} ${products[currentProduct].name} for $${totalCost.toLocaleString()}.`,
                `Portfolio expansion. ${quantity} ${products[currentProduct].name} added to holdings for $${totalCost.toLocaleString()}.`,
                `Building the empire. ${quantity} ${products[currentProduct].name} acquired for $${totalCost.toLocaleString()}.`
            ];
        }
        
        // Select a random message
        const randomIndex = Math.floor(Math.random() * buyMessages.length);
        const thematicMessage = buyMessages[randomIndex];
        
        // Log the transaction with thematic message
        const additionalMessage = `You now have ${inventory[currentProduct]} ${products[currentProduct].name}`;
        logEvent(thematicMessage, 'buy', additionalMessage);
        
        // Show buy ASCII art
        showAsciiArt('buy');
        
        // Track trade statistics
        totalTradesCount++;
        
        // Update UI immediately
        updateUI();
        
        // Save game state after successful purchase
        saveGameState();
        
        // Check for random events
        if (Math.random() < 0.35) randomEvent();
        
        // Debug log the bankroll change
        console.log(`[BANKROLL] After buy: $${bankroll.toLocaleString()} (-$${totalCost.toLocaleString()})`);
        console.log(`[INVENTORY] Updated ${currentProduct}: ${inventory[currentProduct]} / gameState: ${gameState.inventory[currentProduct]}`);
        
        return true;
    } catch (error) {
        console.error("[BUY ERROR]", error);
        logEvent("Error processing purchase");
        return false;
    }
}




function sellProduct() {
    try {
        // Get essential elements
        const quantityInput = document.getElementById('quantity');
        const selectElement = document.getElementById('product-dropdown');
        const sellPriceMinElement = document.getElementById('sell-price-range');
        const sellPriceMaxElement = document.getElementById('sell-price-max');
        
        if (!quantityInput || !selectElement) {
            console.error("[SELL ERROR] Required form elements not found");
            logEvent("Error processing sale - form not ready");
            return false;
        }
        
        // Get current values
        const quantity = parseInt(quantityInput.value || '0');
        const currentProduct = selectElement.value;
        
        // Validate product selection
        if (!currentProduct || !products[currentProduct]) {
            console.error("[SELL ERROR] Invalid product selection:", currentProduct);
            logEvent("Error processing sale - invalid product");
            return false;
        }
        
        // Check regular inventory first
        if (!inventory[currentProduct] || inventory[currentProduct] < quantity) {
            console.log(`[SELL] Regular inventory check failed: ${inventory[currentProduct] || 0} < ${quantity}`);
            // Also check gameState inventory as backup
            if (!gameState.inventory[currentProduct] || gameState.inventory[currentProduct] < quantity) {
                logEvent(`Not enough ${products[currentProduct].name} in inventory`);
                return false;
            } else {
                // Sync the inventories if gameState has it but regular inventory doesn't
                console.log(`[SELL] Syncing inventory from gameState (${gameState.inventory[currentProduct]})`);
                inventory[currentProduct] = gameState.inventory[currentProduct];
            }
        }
        
        // Validate quantity
        if (isNaN(quantity) || quantity <= 0) {
            logEvent("Invalid quantity");
            return false;
        }

        // Determine sell price from the price range
        let sellPriceMin = 0;
        let sellPriceMax = 0;
        
        // Get min and max sell prices from the UI
        if (sellPriceMinElement && sellPriceMinElement.textContent) {
            sellPriceMin = parseInt(sellPriceMinElement.textContent.replace(/[^0-9]/g, ''));
        }
        
        if (sellPriceMaxElement && sellPriceMaxElement.textContent) {
            sellPriceMax = parseInt(sellPriceMaxElement.textContent.replace(/[^0-9]/g, ''));
        }
        
        // Validate price range
        if (sellPriceMin <= 0 || sellPriceMax <= 0 || isNaN(sellPriceMin) || isNaN(sellPriceMax)) {
            console.error("[SELL ERROR] UI price range not available", {
                sellPriceMin,
                sellPriceMax
            });
            logEvent("Error processing sale - price range not available");
            return false;
        }
        
        // Generate a random sell price between min and max
        const sellPrice = Math.floor(Math.random() * (sellPriceMax - sellPriceMin + 1)) + sellPriceMin;
        console.log(`[SELL] Using random price from UI range: $${sellPrice} (range: $${sellPriceMin}-$${sellPriceMax})`);
        
        // Final validation of price
        if (!sellPrice || isNaN(sellPrice) || sellPrice <= 0) {
            console.error("[SELL ERROR] Generated invalid sell price");
            logEvent("Error processing sale - price calculation failed");
            return false;
        }

        // Calculate total revenue
        const totalRevenue = quantity * sellPrice;
        
        // Store old values for verification
        const oldCash = gameState.cash;
        const oldInventory = gameState.inventory[currentProduct];
        const oldBankroll = bankroll;
        const oldRegularInventory = inventory[currentProduct];
        
        // Update BOTH inventory tracking systems
        // 1. Regular inventory
        inventory[currentProduct] -= quantity;
        if (inventory[currentProduct] <= 0) {
            delete inventory[currentProduct]; // Clean up empty inventory
        }
        
        // 2. gameState inventory
        gameState.inventory[currentProduct] -= quantity;
        if (gameState.inventory[currentProduct] <= 0) {
            delete gameState.inventory[currentProduct]; // Clean up empty inventory
        }
        
        // Update bankroll and gameState cash
        bankroll += totalRevenue;
        gameState.cash = bankroll;
        
        // Define thematic messages for selling based on price
        let sellMessages;
        if (isExceptionalPrice(0, sellPrice, currentProduct)) {
            sellMessages = [
                `Well, looks like the portfolio is booming. ${quantity} ${products[currentProduct].name} for $${totalRevenue.toLocaleString()}.`,
                `Just when I thought the day couldn't get better. ${quantity} ${products[currentProduct].name} at $${totalRevenue.toLocaleString()}.`,
                `Time to go all in – the payoff is astronomical. ${quantity} ${products[currentProduct].name} for $${totalRevenue.toLocaleString()}.`
            ];
        } else {
            sellMessages = [
                `The market is always hungry for quality assets. ${quantity} ${products[currentProduct].name} for $${totalRevenue.toLocaleString()}.`,
                `A new opportunity has presented itself. ${quantity} ${products[currentProduct].name} at $${totalRevenue.toLocaleString()}.`,
                `The demand is still there, we just need to find the right buyers. ${quantity} ${products[currentProduct].name} for $${totalRevenue.toLocaleString()}.`
            ];
        }
        
        // Select a random message
        const randomIndex = Math.floor(Math.random() * sellMessages.length);
        const thematicMessage = sellMessages[randomIndex];
        
        // Log the transaction with thematic message
        const additionalMessage = inventory[currentProduct] ? 
            `You have ${inventory[currentProduct]} ${products[currentProduct].name} left` : 
            `You have no ${products[currentProduct].name} left`;
        logEvent(thematicMessage, 'sell', additionalMessage);
        
        // Show sell ASCII art
        showAsciiArt('sell');
        
        // Track trade statistics
        totalTradesCount++;
        
        // Update UI immediately
        updateUI();
        
        // Save game state after successful sale
        saveGameState();
        
        // Check for random events after selling
        if (Math.random() < 0.25) randomEvent();
        
        // Debug verification logs
        console.log(`[BANKROLL] After sell: $${bankroll.toLocaleString()} (+$${totalRevenue.toLocaleString()})`);
        console.log(`[INVENTORY] Updated ${currentProduct}: ${inventory[currentProduct] || 0} / gameState: ${gameState.inventory[currentProduct] || 0}`);
        
        return true;
    } catch (error) {
        console.error("[SELL ERROR]", error);
        logEvent("Error processing sale");
        return false;
    }
}

function switchPage(page) {
    // First make sure the pages are in the right place in the DOM
    positionBankAndLoanPages();
    
    console.log("Switching to page:", page);
    
    // Then toggle visibility
    document.getElementById('game-container').classList.toggle('hidden', page !== 'game');
    document.getElementById('bank-page').classList.toggle('hidden', page !== 'bank');
    document.getElementById('loan-page').classList.toggle('hidden', page !== 'loan');

    // Make sure bank/loan pages are visible when they should be
    if (page === 'bank') {
        console.log("Bank page should be visible now");
        const bankPage = document.getElementById('bank-page');
        bankPage.classList.remove('hidden');
        bankPage.style.display = 'block';
    } else if (page === 'loan') {
        console.log("Loan page should be visible now");
        const loanPage = document.getElementById('loan-page');
        loanPage.classList.remove('hidden');
        loanPage.style.display = 'block';
    }
    
    // Hide or show the console log based on the page
    const consoleLogContainer = document.getElementById('log-container');
    if (consoleLogContainer) {
        consoleLogContainer.classList.toggle('hidden', page !== 'game');
    }
    
    // Disable AI when on bank or loan page
    if (page !== 'game' && botEnabled) {
        // Temporarily disable AI
        const wasEnabled = botEnabled;
        toggleAI();
        // Store the state for reference
        window.aiWasEnabled = wasEnabled;
        
        // Hide the AI toggle button on non-game pages
        const toggleButton = document.getElementById('bot-toggle');
        if (toggleButton) {
            toggleButton.style.display = 'none';
        }
    } else if (page === 'game' && window.aiWasEnabled) {
        // Re-enable AI if it was enabled before
        if (!botEnabled) {
            toggleAI();
        }
        window.aiWasEnabled = false;
        
        // Show the AI toggle button on game page
        const toggleButton = document.getElementById('bot-toggle');
        if (toggleButton) {
            toggleButton.style.display = 'block';
        }
    }
    
    // Update UI elements specific to the page
    if (page === 'loan') {
        // Update loan balance display
        document.getElementById('loan-balance').textContent = loanBalance.toLocaleString();
        // Update gun display on loan page
        updateGunDisplay();
    } else if (page === 'bank') {
        // Update bank balance display
        document.getElementById('bank-balance').textContent = bankBalance.toLocaleString();
    }
}

// Function to deposit money into the bank
function deposit(amount) {
    if (!amount || amount <= 0 || isNaN(amount)) {
        logEvent("Please enter a valid amount to deposit", "error");
        return false;
    }
    
    if (amount > bankroll) {
        logEvent(`You don't have $${amount.toLocaleString()} to deposit`, "error");
        return false;
    }
    
        bankroll -= amount;
        bankBalance += amount;
        
    // Update UI
    document.getElementById('bankroll').textContent = bankroll.toLocaleString();
    document.getElementById('bank-balance').textContent = bankBalance.toLocaleString();
    
    logEvent(`Deposited $${amount.toLocaleString()} into bank account`, "bank");
    
    // Show ASCII art for bank deposit
    showAsciiArt('bank');
    
        return true;
}

// Function to withdraw money from the bank
function withdraw(amount) {
    if (!amount || amount <= 0 || isNaN(amount)) {
        logEvent("Please enter a valid amount to withdraw", "error");
        return false;
    }
    
    if (amount > bankBalance) {
        logEvent(`You don't have $${amount.toLocaleString()} in your bank account`, "error");
        return false;
    }
    
        bankBalance -= amount;
        bankroll += amount;
        
    // Update UI
    document.getElementById('bankroll').textContent = bankroll.toLocaleString();
    document.getElementById('bank-balance').textContent = bankBalance.toLocaleString();
    
    logEvent(`Withdrew $${amount.toLocaleString()} from bank account`, "bank");
    
    // Show ASCII art for bank withdrawal
    showAsciiArt('bank');
    
        return true;
}

// Function to take a loan
function takeLoan(amount, silent = false) {
    if (!amount || amount <= 0 || isNaN(amount)) {
        if (!silent) logEvent("Please enter a valid loan amount", "error");
        return false;
    }
    
    // Cap loans at 5 million
    if (loanBalance + amount > 5000000) {
        if (!silent) logEvent(`Loan request rejected. You cannot borrow more than $5,000,000 total`, "error");
        return false;
    }

    // Add loan amount to your cash
    bankroll += amount;
    loanBalance += amount;
    
    // Update UI
    document.getElementById('bankroll').textContent = bankroll.toLocaleString();
    document.getElementById('loan-balance').textContent = loanBalance.toLocaleString();
    
    if (!silent) {
        logEvent(`You took a loan of $${amount.toLocaleString()}. Your total debt is now $${loanBalance.toLocaleString()}`, "loan");
        
        // Show ASCII art for loan
        showAsciiArt('loan');
    }
  
    return true;
}

// Function to pay loan
function payLoan(amount) {
    if (!amount || amount <= 0 || isNaN(amount)) {
        logEvent("Please enter a valid payment amount", "error");
        return false;
    }
    
    if (amount > bankroll) {
        logEvent(`You don't have $${amount.toLocaleString()} to make this payment`, "error");
        return false;
    }
    
    if (amount > loanBalance) {
        logEvent(`You're trying to pay $${amount.toLocaleString()}, but you only owe $${loanBalance.toLocaleString()}`, "warn");
        amount = loanBalance;
    }
    
    bankroll -= amount;
    loanBalance -= amount;
    
    // Update UI
    document.getElementById('bankroll').textContent = bankroll.toLocaleString();
    document.getElementById('loan-balance').textContent = loanBalance.toLocaleString();
    
    logEvent(`Paid $${amount.toLocaleString()} toward your loan. Remaining balance: $${loanBalance.toLocaleString()}`, "loan");
    
    // Show ASCII art for loan payment
    showAsciiArt('loan');
    
    // Check if loan is paid off
    if (loanBalance === 0) {
        logEvent("Congratulations! You have paid off your loan completely!", "success");
    }
        
        return true;
}

// Track the last time we logged loan balance
let lastLoanBalanceLog = 0;

// Function to periodically check and log loan balance (if needed)
function checkAndLogLoanBalance() {
    const now = Date.now();
    
    // Only log every 30 seconds and only if there's an actual balance
    if (loanBalance > 0 && (now - lastLoanBalanceLog > 30000)) {
        console.log(`[LOAN] Current balance: $${loanBalance.toLocaleString()} (Interest rate: 15% APY)`);
        lastLoanBalanceLog = now;
    }
}

// Function to buy a gun (limit to 2 guns)
function buyGun() {
    // Add a safety check for gameState
    if (typeof gameState === 'undefined') {
        console.error("[BUY GUN ERROR] Game state is not defined");
        return false;
    }
    
    if (guns >= 2) {
        logEvent("Maximum 2 security teams allowed");
        return false;
    }
    if (bankroll >= 500) {
        // Update regular variables
        bankroll -= 500;
        guns += 1;
        
        // Update gameState to stay in sync
        gameState.cash = bankroll;
        
        // Make sure gameState.inventory exists
        if (!gameState.inventory) {
            gameState.inventory = {};
        }
        
        // Also update guns in the inventory tracking
        gameState.inventory.guns = guns;
        
        const buyGunMessages = [
            "Some investments are just worth protecting.",
            "This is just a little security team I like to keep around the mansion.",
            "Just in case competitors get aggressive.",
            "For when business negotiations need a more... secure environment.",
            "This? Just standard billionaire security protocol."
        ];

        logEvent(buyGunMessages[Math.floor(Math.random() * buyGunMessages.length)]);
        
        // Check for random events after buying security (same frequency as buying/selling)
        if (Math.random() < 0.25) randomEvent();
        
        // Log the purchase
        console.log(`[SECURITY] Hired security team. Total teams: ${guns}`);
        console.log(`[BANKROLL] After security hire: $${bankroll.toLocaleString()}`);
        
        // Update UI
        updateUI();
        updateGunDisplay(); // Make sure the gun display is updated
        
        return true;
    } else {
        logEvent("Not enough capital to hire security.");
        return false;
    }
}

function updateGunDisplay() {
    // Update guns on main game display
    const gunDisplay = document.getElementById('gun-counter');
    if (gunDisplay) {
        gunDisplay.textContent = `Guns: ${guns}/2`;
    }
    
    // Update guns on loan page
    const gunsLoanDisplay = document.getElementById('guns-display');
    if (gunsLoanDisplay) {
        gunsLoanDisplay.textContent = guns;
    }
}

// day tracking
const secondsPerDay = 1; // Each in-game day lasts 1 real-time second
const daysPerMessage = 3;

// Update these variables
const gameLength = 30 * 86400; // 30 days in seconds
const timeMultiplier = 1; // 1 game second per real second

// Initialize gameOverHandler at the top level
const gameOverHandler = {
    shown: false,
    
    show() {
        if (this.shown) return;
        DOM.get('game-container').classList.add('hidden');
        DOM.get('game-over').classList.remove('hidden');
        this.shown = true;
    },
    
    reset() {
        this.shown = false;
    }
};

// Add to game loop (same for both modes)
function trackDays() {
    if(gameInterval) clearInterval(gameInterval);
    
    gameInterval = setInterval(() => {
        // Decrement time only if game is active
        if(totalSecondsRemaining > 0) {
            totalSecondsRemaining = Math.max(0, totalSecondsRemaining - 3600);
            
            // Also update gameTime to keep them in sync
            if (typeof gameTime !== 'undefined') {
                gameTime = totalSecondsRemaining;
            }
            
            // Accrue interest every hour (game time)
            // This ensures loans grow over time and bankroll earns interest
            accrueInterest();
            
            // Check if game has ended
            if(totalSecondsRemaining === 0) {
                console.log("Game time has ended!");
                
                // Clear interval immediately to prevent further processing
                clearInterval(gameInterval);
                gameInterval = null;
                
                // Ensure trading bot is stopped
                if (tradingBot && tradingBot.isTrading) {
                    tradingBot.stopTrading();
                }
                
                // Show game over screen
                showGameOver();
                return;
            }
        }
        
        // Log first message immediately on game start
        if(dayMessageIndex === 0) {
            logEvent(DAY_MESSAGES[0], 'update');
            dayMessageIndex = 1;
        }
        
        // Subsequent messages every 3 game days (72 real-world seconds)
        if(totalSecondsRemaining % (3 * 86400) === 0 && dayMessageIndex < DAY_MESSAGES.length) {
            logEvent(DAY_MESSAGES[dayMessageIndex], 'update');
            dayMessageIndex = (dayMessageIndex + 1) % DAY_MESSAGES.length;
        }
    }, 1000);
}

// Accrue daily bank interest and loan interest
function accrueInterest() {
    // Apply bank interest (8% APY, calculated daily)
    bankBalance += bankBalance * 0.08/12/30; // % daily APY
    
    // Apply loan interest (15% APY, calculated daily)
    if (loanBalance > 0) {
        // Calculate interest amount
        const interestAmount = loanBalance * 0.15/12/30;
        
        // Add interest to loanBalance
        loanBalance += interestAmount;
        
        // Keep gameState.loan synchronized
        if (gameState && gameState.loan !== undefined) {
            gameState.loan = loanBalance;
        }
        
        // Log significant interest accruals (over $)
        if (interestAmount > 100000) {
            console.log(`[LOAN] Interest accrued: $${interestAmount.toFixed(2)}, New balance: $${loanBalance.toLocaleString()}`);
        }
    }
    
    // Update UI to reflect new balances
    updateUI();
}

// Function to load game state from localStorage
function loadGameState() {
    const savedGameState = localStorage.getItem('gameState');
    
    if (savedGameState) {
        try {
            const gameState = JSON.parse(savedGameState);
            
            // Restore bot state with validation - only if not already loaded
            if (gameState.botState && !tradingBot) {
                tradingBot = new TradingBot({
                    savedState: gameState.botState, // Pass the entire saved state
                    qTable: gameState.botState.qTable || {},
                    highLowPriceMemory: gameState.botState.highLowPriceMemory || [],
                    epsilon: gameState.botState.epsilon || 0.9,
                    cumulativeReward: gameState.botState.cumulativeReward || 0,
                    totalSessions: gameState.botState.totalSessions || 0,
                    strategyUsage: gameState.botState.strategyUsage || {},
                    productRotationThreshold: gameState.botState.productRotationThreshold || 5,
                    currentProductTrades: gameState.botState.currentProductTrades || 0
                });
                window.bot = tradingBot;
            }
            
            // Only enable bot if it was explicitly saved as enabled (default to false for new sessions)
            botEnabled = gameState.botEnabled === true;
            
            // Restore game state
            if (gameState.bankroll !== undefined) bankroll = gameState.bankroll;
            if (gameState.totalSecondsRemaining !== undefined) totalSecondsRemaining = gameState.totalSecondsRemaining;
            if (gameState.guns !== undefined) guns = gameState.guns;
            if (gameState.bankBalance !== undefined) bankBalance = gameState.bankBalance;
            if (gameState.loanBalance !== undefined) loanBalance = gameState.loanBalance;
            if (gameState.city !== undefined) city = gameState.city;
            if (gameState.inventory !== undefined) inventory = gameState.inventory;
            if (gameState.transactionCount !== undefined) transactionCount = gameState.transactionCount;
            if (gameState.currentProduct !== undefined) currentProduct = gameState.currentProduct;
            // Restore cities visited data
            if (gameState.visitedCities !== undefined && Array.isArray(gameState.visitedCities)) {
                visitedCities = gameState.visitedCities;
            } else {
                // Initialize with starting city if not found
                visitedCities = ["Silicon Valley"];
            }
            if (gameState.citiesVisitedCount !== undefined) {
                citiesVisitedCount = gameState.citiesVisitedCount;
            } else {
                citiesVisitedCount = visitedCities.length;
            }
            // Update gameStats to match
            if (gameStats) {
                gameStats.citiesVisited = citiesVisitedCount;
            }
            
            // Start background music for loaded city
            if (typeof window !== 'undefined' && window.backgroundMusic && city) {
                setTimeout(() => {
                    window.backgroundMusic.startMusicForLocation(city);
                }, 500);
            }

            console.log('Game state loaded successfully:', {
                bankroll,
                totalSecondsRemaining,
                city,
                inventory
            });
        } catch (error) {
            console.error('Error loading game state:', error);
            // If there's an error, initialize with defaults
            initializeDefaultGameState();
        }
    } else {
        // No saved state - initialize with defaults
        console.log('No saved game state found, initializing with defaults');
        // Ensure bot is disabled for new sessions
        botEnabled = false;
        initializeDefaultGameState();
    }
    
    updateUI();
    
    // Start the continuous timer display
    startGameTimerDisplay();
}

// Function to initialize default game state
function initializeDefaultGameState() {
    bankroll = 1000000;
    totalSecondsRemaining = 30 * 86400;
    guns = 0;
    bankBalance = 0;
    loanBalance = 0;
    city = "Silicon Valley";
    currentProduct = "realEstate";
    inventory = Object.keys(products).reduce((acc, p) => {
        acc[p] = 0;
        return acc;
    }, {});
    transactionCount = 0;
    
    // Initialize cities visited with starting city
    visitedCities = ["Silicon Valley"];
    citiesVisitedCount = 1;
    if (gameStats) {
        gameStats.citiesVisited = 1;
    }
    
    // Save the initial state
    saveGameState();
}

function hideGameOver() {
    const gameOverElement = document.getElementById('game-over');
    if (gameOverElement) {
        gameOverElement.style.display = 'none';
    }
    
    // Clear the game timer interval when game is over
    if (window.gameTimerInterval) {
        clearInterval(window.gameTimerInterval);
        window.gameTimerInterval = null;
    }
}

function startNewGame() {
    // Reset game state
    city = "Silicon Valley";
    totalSecondsRemaining = 30 * 86400; // 30 days in seconds
    bankroll = 1000000;
    inventory = {};
    bankBalance = 0;
    loanBalance = 0;
    guns = 0;
    
    // Reset game statistics
    citiesVisitedCount = 0;
    visitedCities = [];
    raidsSurvivedCount = 0;
    robberEncountersCount = 0;
    successfulDefensesCount = 0;
    
    // Initialize starting city as visited
    visitedCities.push("Silicon Valley");
    citiesVisitedCount = 1;
    
    // Reset the bot's exploration rate for the new game
    if (window.bot && typeof window.bot.resetForNewGame === 'function') {
        window.bot.resetForNewGame();
        console.log('[GAME] Reset bot exploration rate for new game');
    }
    
    // Initialize game statistics tracking
    gameStats = {
        policeRaids: 0,
        robberEncounters: 0,
        successfulDefenses: 0,
        citiesVisited: 1, // Starting city counts as visited
        totalTrades: 0
    };
    
    // Start the continuous timer display
    startGameTimerDisplay();
    
    // ... rest of existing code ...
}

// Update the keyboard handler with error protection and add player keyboard shortcuts
function handleKeyboardNavigation(event) {
    try {
        // Skip keyboard navigation if in an input field or textarea
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }
        
        // Special handling for SELECT elements, don't return early
        let isSelectElement = event.target.tagName === 'SELECT';
        
        const key = event.key.toUpperCase();
        const dropdown = document.getElementById('product-dropdown');
        const quantityInput = document.getElementById('quantity');

        // Special case: Help toggle and Bot toggle should always work
        if (key === 'H') {
            event.preventDefault();
            toggleKeyboardHelp();
            return;
        }
        
        if (key === 'B') {
            event.preventDefault();
            document.getElementById('bot-toggle').click();
            // Show visual feedback
            flashButton('bot-toggle');
            return;
        }
        
        // If bot is enabled, other controls should be disabled
        if (typeof botEnabled !== 'undefined' && botEnabled) {
            // Only show notification that bot is active when player tries to use controls
            if (['A', 'S', 'D', 'F', 'T', 'G'].includes(key)) {
                event.preventDefault();
                flashMessage("Bot is active - manual controls disabled");
                console.log("Player attempted to use controls while bot is active");
            }
            return;
        }
        
        // Check if quantity has visual focus (our custom keyboard-focus class)
        const isQuantityFocused = quantityInput && quantityInput.classList.contains('keyboard-focus');
        
        // Handle player action shortcuts - only when bot is disabled
        switch (key) {
            case 'A': // Buy
                    event.preventDefault();
                document.getElementById('buy-button').click();
                // Show visual feedback
                flashButton('buy-button');
                break;
                
            case 'S': // Sell
                event.preventDefault();
                document.getElementById('sell-button').click();
                // Show visual feedback
                flashButton('sell-button');
                break;
                
            case 'D': // Quick deposit to bank - default $1,000,000
                event.preventDefault();
                if (deposit(1000000)) {
                    logEvent(`Quick deposit: $1,000,000 deposited to bank`, "bank");
                    // Show visual feedback
                    flashMessage("Quick deposit: $1,000,000");
                    // Show ASCII art
                    showAsciiArt('bank');
                }
                break;
                
            case 'F': // Quick loan - default $1,000,000
                event.preventDefault();
                if (takeLoan(1000000)) {
                    logEvent(`Quick loan: $1,000,000 borrowed`, "loan");
                    // Show visual feedback
                    flashMessage("Quick loan: $1,000,000");
                    // Show ASCII art
                    showAsciiArt('loan');
                }
                showKeyNotification('F');
                break;
                
            case 'T': // Travel
                event.preventDefault();
                document.getElementById('travel-button').click();
                // Show visual feedback
                flashButton('travel-button');
                break;
                
            case 'G': // Buy Gun
                event.preventDefault();
                buyGun();
                // Show visual feedback
                flashMessage("Bought a gun");
                showKeyNotification('G');
                break;
                
            case 'ARROWUP':
            case 'ARROWDOWN':
                // Special handling for the dropdown
                if (isSelectElement || document.activeElement === dropdown || currentFocus === 'product-dropdown') {
                    event.preventDefault();
                    const direction = key === 'ARROWUP' ? -1 : 1;
                    dropdown.selectedIndex = Math.max(0, Math.min(dropdown.options.length - 1, 
                        dropdown.selectedIndex + direction));
                    dropdown.dispatchEvent(new Event('change'));
                    showKeyNotification(key === 'ARROWUP' ? '↑' : '↓');
                    return;
                }
                
                // Handle quantity adjustment - now also check for our custom visual focus
                if (currentFocus === 'quantity' || isQuantityFocused || 
                    document.activeElement === quantityInput || 
                    !document.activeElement || document.activeElement === document.body) {
                    event.preventDefault();
                    const currentVal = parseInt(quantityInput.value) || 0;
                    const direction = key === 'ARROWUP' ? 1 : -1;
                    const step = event.shiftKey ? 100 : 10; // Shift for larger steps
                    quantityInput.value = Math.max(0, currentVal + (direction * step));
                    showKeyNotification(key === 'ARROWUP' ? '↑' : '↓');
                }
                break;
                
            case 'ARROWLEFT':
            case 'ARROWRIGHT':
                if (!focusableElements || !focusableElements.length) {
                    console.warn('No focusable elements defined');
                    return;
                }
                
                event.preventDefault();
                const direction = key === 'ARROWLEFT' ? -1 : 1;
                currentElementIndex = (currentElementIndex + direction + focusableElements.length) % focusableElements.length;
                currentFocus = focusableElements[currentElementIndex];
                focusElement(currentFocus);
                showKeyNotification(key === 'ARROWLEFT' ? '←' : '→');
                break;
                
            case 'ENTER':
                // Skip if we're in a form element
                if (document.activeElement.tagName === 'INPUT' || 
                    document.activeElement.tagName === 'SELECT' || 
                    document.activeElement.tagName === 'TEXTAREA') {
                    return;
                }
                
                event.preventDefault();
                const activeElement = document.activeElement;
                if (activeElement === dropdown || activeElement === quantityInput) {
                    return; // Allow normal form element behavior
                }
                
                // Check if currentFocus is defined
                if (!currentFocus) {
                    console.warn('No current focus defined');
                    return;
                }
                
                // If quantity has visual focus, don't try to click a button
                if (isQuantityFocused) {
                    return;
                }
                
                const button = document.getElementById(currentFocus + '-button');
                if (button) {
                    button.click();
                    showKeyNotification('ENTER');
                } else {
                    console.warn('No button found for focus:', currentFocus);
                }
                break;
        }
    } catch (error) {
        console.error('Keyboard navigation error:', error);
    }
}

// Add a visual feedback function for keyboard shortcuts
function flashButton(buttonId) {
    const button = document.getElementById(buttonId);
    if (!button) return;
    
    // Add flash class
    button.classList.add('key-flash');
    
    // Remove flash class after animation
    setTimeout(() => {
        button.classList.remove('key-flash');
    }, 300);
    
    // Show key press notification
    showKeyNotification(buttonId.replace('-button', '').toUpperCase());
}

// Flash a message in the event display
function flashMessage(message) {
    const eventDisplay = document.getElementById('event-display');
    if (!eventDisplay) return;
    
    // Store original content
    const originalContent = eventDisplay.innerHTML;
    
    // Show key press message
    eventDisplay.innerHTML = `<span class="key-message">${message}</span>`;
    
    // Restore original content after a delay
    setTimeout(() => {
        eventDisplay.innerHTML = originalContent;
    }, 800);
}

// Show a key press notification
function showKeyNotification(key) {
    // Function has been emptied to remove key notifications from the right side
    return;
}

// Add CSS for key notifications
document.addEventListener('DOMContentLoaded', function() {
    // Create style element for animations
    const style = document.createElement('style');
    style.textContent += `
        @keyframes notification-fade {
            0% { opacity: 0; transform: translateX(20px); }
            10% { opacity: 1; transform: translateX(0); }
            90% { opacity: 1; transform: translateX(0); }
            100% { opacity: 0; transform: translateX(20px); }
        }
    `;
    document.head.appendChild(style);
});

// Add keyboard navigation to the window
window.addEventListener('keydown', handleKeyboardNavigation);

// Add CSS for keyboard shortcut visual feedback
document.addEventListener('DOMContentLoaded', function() {
    // Create style element for flash animations
    const style = document.createElement('style');
    style.textContent = `
        .key-flash {
            animation: button-flash 0.3s ease;
        }
        
        @keyframes button-flash {
            0% { transform: scale(1); background-color: magenta; }
            50% { transform: scale(1.1); background-color: cyan; }
            100% { transform: scale(1); }
        }
        
        .key-message {
            color: cyan;
            font-weight: bold;
            animation: message-flash 0.8s ease;
        }
        
        @keyframes message-flash {
            0% { opacity: 0; }
            20% { opacity: 1; }
            80% { opacity: 1; }
            100% { opacity: 0; }
        }
        
        kbd {
            display: inline-block;
            background-color: #333;
            color: #fff;
            border-radius: 3px;
            padding: 2px 4px;
            margin: 0 2px;
            font-family: monospace;
            font-size: 0.9em;
            border: 1px solid #555;
            box-shadow: 0 1px 0 rgba(255,255,255,0.2), inset 0 0 0 2px #222;
        }
    `;
    document.head.appendChild(style);
    
    // Create keyboard shortcut help element
    const helpDiv = document.createElement('div');
    helpDiv.id = 'keyboard-shortcuts-help';
    helpDiv.innerHTML = `
        <h3>Controls</h3>
        <div class="shortcut-section">
            <div class="section-title"></div>
            <ul>
                <li><kbd>A</kbd> - Buy</li>
                <li><kbd>S</kbd> - Sell</li>
                <li><kbd>D</kbd> - Quick deposit ($1,000,000)</li>
                <li><kbd>F</kbd> - Quick loan ($1,000,000)</li>
                <li><kbd>T</kbd> - Travel</li>
                <li><kbd>G</kbd> - Hire Security</li>
            </ul>
            <div class="section-note">These controls are disabled when the AI Bot is active</div>
        </div>
        
        <div class="shortcut-section">
            <div class="section-title">Navigation</div>
            <ul>
                <li><kbd>↑</kbd><kbd>↓</kbd> - Select options/adjust amount 'shift' step up</li>
                <li><kbd>←</kbd><kbd>→</kbd> - Navigate between elements</li>
                <li><kbd>Enter</kbd> - Activate selected element</li>
            </ul>
        </div>
        
        <div class="shortcut-section highlight-section">
            <div class="section-title">Always Available</div>
            <ul>
                <li><kbd>B</kbd> - Enable/Disable Bot</li>
                <li><kbd>H</kbd> - Toggle this help</li>
            </ul>
        </div>
    `;
    helpDiv.style.cssText = `
        position: fixed;
        top: 50px;
        left: 10px;
        background-color: rgba(0, 0, 0, 0.9);
        border: 2px solid magenta;
        border-radius: 5px;
        padding: 15px;
        color: white;
        font-family: 'Lucida Console', monospace;
        font-size: 0.8em;
        z-index: 1000;
        display: none;
        box-shadow: 0 0 15px rgba(255, 0, 255, 0.5);
        max-width: 300px;
    `;

    document.body.appendChild(helpDiv);
    
    // Add help toggle button
    const helpButton = document.createElement('button');
    helpButton.id = 'toggle-kbd-help';
    helpButton.textContent = 'Key Controls';
    helpButton.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        z-index: 1001;
        background-color: magenta;
        color: black;
        border: none;
        border-radius: 5px;
        padding: 5px 10px;
        font-family: 'Lucida Console', monospace;
        cursor: pointer;
    `;
    
    helpButton.addEventListener('click', function() {
        toggleKeyboardHelp();
    });
    
    document.body.appendChild(helpButton);
});

// Function to toggle keyboard help visibility
function toggleKeyboardHelp() {
    const helpDiv = document.getElementById('keyboard-shortcuts-help');
    if (helpDiv.style.display === 'none') {
        helpDiv.style.display = 'block';
        document.getElementById('toggle-kbd-help').textContent = 'Hide Controls';
    } else {
        helpDiv.style.display = 'none';
        document.getElementById('toggle-kbd-help').textContent = 'Key Controls';
    }
}

// ... existing code ...

// Update focusElement with null check
function focusElement(elementId) {
    // Handle the quantity input specially - don't activate text entry mode
    if (elementId === 'quantity') {
        // Get all focusable elements and remove any existing highlight
        focusableElements.forEach(el => {
            const elem = document.getElementById(
                el === 'product-dropdown' ? 'product-dropdown' :
                el === 'quantity' ? 'quantity' :
                el + '-button'
            );
            if (elem) {
                elem.classList.remove('keyboard-focus');
            }
        });
        
        // Add a visual highlight to quantity without activating text entry
        const quantityInput = document.getElementById('quantity');
        if (quantityInput) {
            // Add a CSS class for visual focus indication
            quantityInput.classList.add('keyboard-focus');
            
            // Make sure we maintain the current element as quantity without activating it
            document.activeElement.blur(); // Remove focus from any active element
        } else {
            console.warn('Failed to highlight quantity input');
        }
        return;
    }
    
    // For other elements, focus normally
    const element = document.getElementById(
        elementId === 'product-dropdown' ? 'product-dropdown' :
        elementId + '-button'
    );
    
    if (element) {
        // Remove the highlight class from all elements
        focusableElements.forEach(el => {
            const elem = document.getElementById(
                el === 'product-dropdown' ? 'product-dropdown' :
                el === 'quantity' ? 'quantity' :
                el + '-button'
            );
            if (elem) {
                elem.classList.remove('keyboard-focus');
            }
        });
        
        // Add keyboard focus class to the current element
        element.classList.add('keyboard-focus');
        element.focus();
    } else {
        console.warn('Failed to focus:', elementId);
    }
}

// Add CSS for keyboard focus highlight
document.addEventListener('DOMContentLoaded', function() {
    // Create style element for focus highlighting
    const style = document.createElement('style');
    style.textContent += `
        .keyboard-focus {
            outline: 2px solid cyan !important;
            box-shadow: 0 0 10px rgba(0, 255, 255, 0.5) !important;
        }
    `;
    document.head.appendChild(style);
});

window.onload = function () {
    // Load initial game state first (this will handle bot initialization if needed)
    loadGameState();
    
    // Only initialize bot if it wasn't loaded from game state
    if (!tradingBot) {
        // Try to load bot knowledge
        const savedBotState = localStorage.getItem('botKnowledge');
        if(savedBotState) {
            try {
                tradingBot = new TradingBot(JSON.parse(savedBotState));
                window.bot = tradingBot;
            } catch (error) {
                console.error('Error loading bot state:', error);
                // Initialize with defaults if loading fails
                tradingBot = new TradingBot({
                    explorationRate: 0.5639537603766785,
                    explorationDecay: 0.998,
                    learningRate: 0.15
                });
                window.bot = tradingBot;
            }
        } else {
            // Initialize with specific exploration rate for better learning
            tradingBot = new TradingBot({
                explorationRate: 0.5639537603766785,
                explorationDecay: 0.998,  // Slightly slower decay for more thorough exploration
                learningRate: 0.15       // Slightly increased learning rate
            });
            window.bot = tradingBot;
        }
    }
    
    // Create bot controls and update display (must be done before enabling bot)
    createBotControls();
    updateStrategyDisplay();
    
    // Start bot if it's enabled (bot enabled = auto-restart on)
    // Use a longer delay to ensure everything is initialized
    if (botEnabled) {
        setTimeout(() => {
            // Ensure tradingBot exists
            if (!tradingBot) {
                console.warn("[GAME] Bot enabled but tradingBot not found, creating new instance");
                tradingBot = new TradingBot({
                    explorationRate: 0.5639537603766785,
                    explorationDecay: 0.998,
                    learningRate: 0.15
                });
                window.bot = tradingBot;
            }
            
            // Start trading if not already started
            if (tradingBot && !tradingBot.actionInterval) {
                tradingBot.startTrading();
                console.log("[GAME] Bot started automatically (botEnabled=" + botEnabled + ")");
            } else if (tradingBot && tradingBot.actionInterval) {
                console.log("[GAME] Bot already running");
            } else {
                console.warn("[GAME] Bot enabled but could not start trading");
            }
        }, 1500); // Increased delay to ensure all initialization is complete
    }
    
    trackDays();
    
    // Set up product dropdown
    const dropdown = document.getElementById('product-dropdown');
    if (dropdown) {
        Object.keys(products).forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = products[key].name;
            dropdown.appendChild(option);
        });
        
        // Set initial product selection
        if (!currentProduct && dropdown.options.length > 0) {
            currentProduct = dropdown.options[0].value;
        }
        if (dropdown && currentProduct) {
            dropdown.value = currentProduct;
        }
    }
    
    updatePrices();
    // Initialize UI with loaded state
    updateUI();
    
    // Start tracking days
    
    
    // Initialize the game timer
    startGameTimerDisplay();
    
    // Set up auto-save every 30 seconds
    setInterval(function() {
        saveGameState();
        console.log('Auto-saved game state');
    }, 30000); // Save every 30 seconds
    
    // Also save when the page is about to unload
    window.addEventListener('beforeunload', function() {
        saveGameState();
    });
    
    // Set up auto-save every 30 seconds
    setInterval(function() {
        saveGameState();
        console.log('Auto-saved game state');
    }, 30000); // Save every 30 seconds
    
    // Also save when the page is about to unload
    window.addEventListener('beforeunload', function() {
        saveGameState();
    });
};

// Function to start a new game
function startNewGame() {
    // Reset game state
    city = "Silicon Valley";
    totalSecondsRemaining = 30 * 86400; // 30 days in seconds
    bankroll = 1000000;
    inventory = {};
    bankBalance = 0;
    loanBalance = 0;
    guns = 0;
    
    // Reset game statistics
    citiesVisitedCount = 0;
    visitedCities = [];
    raidsSurvivedCount = 0;
    robberEncountersCount = 0;
    successfulDefensesCount = 0;
    
    // Initialize starting city as visited
    visitedCities.push("Silicon Valley");
    citiesVisitedCount = 1;
    
    // Reset the bot's exploration rate for the new game
    if (window.bot && typeof window.bot.resetForNewGame === 'function') {
        window.bot.resetForNewGame();
        console.log('[GAME] Reset bot exploration rate for new game');
    }
    
    // Initialize game statistics tracking
    gameStats = {
        policeRaids: 0,
        robberEncounters: 0,
        successfulDefenses: 0,
        citiesVisited: 1, // Starting city counts as visited
        totalTrades: 0
    };
    
    // Start the continuous timer display
    startGameTimerDisplay();
    
    // ... rest of existing code ...
}

// Update enableHumanControls to ensure proper state
function enableHumanControls(enable) {
    // This function is removed as per the instructions
}

function formatTime(totalSeconds) {
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    return `${days}D ${hours.toString().padStart(2, '0')}H`; // Shows "30D 00H" to "00D 00H"
}

// Keep the timing changes from previous implementation


// Add ASCII art definitions before showAsciiArt function
const currencyAsciiArt = [
    `
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║                                                       ║
║          ╔═══════════════════════════════════╗        ║
║          ║                                   ║        ║
║          ║     ╔═══════════════════════╗     ║        ║
║          ║     ║                       ║     ║        ║
║          ║     ║                       ║     ║        ║
║          ║     ║     BILLIONAIRE       ║     ║        ║
║          ║     ║       MINDSET         ║     ║        ║
║          ║     ║                       ║     ║        ║
║          ║     ║                       ║     ║        ║
║          ║     ║      TAP THAT         ║     ║        ║
║          ║     ║    FOLLOW BUTTON!     ║     ║        ║
║          ║     ║                       ║     ║        ║
║          ║     ╚═══════════════════════╝     ║        ║
║          ║                                   ║        ║
║          ╚═══════════════════════════════════╝        ║
║                                                       ║
║              $$$$$$$$$$$$$$$$$$$$$$$$$$$$             ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
`,
`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║                                                       ║
║          ╔═══════════════════════════════════╗        ║
║          ║                                   ║        ║
║          ║     ╔═══════════════════════╗     ║        ║
║          ║     ║                       ║     ║        ║
║          ║     ║                       ║     ║        ║
║          ║     ║   BRAIN IS CURRENCY.  ║     ║        ║
║          ║     ║                       ║     ║        ║
║          ║     ║   STACK YOUR WISDOM!  ║     ║        ║
║          ║     ║                       ║     ║        ║
║          ║     ║                       ║     ║        ║
║          ║     ╚═══════════════════════╝     ║        ║
║          ║                                   ║        ║
║          ╚═══════════════════════════════════╝        ║
║                                                       ║
║              $$$$$$$$$$$$$$$$$$$$$$$$$$$$             ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
`,// Add more currency ASCII art here in the future

];

// Define the ASCII art images - Billionaire Mindset Theme
const carAsciiArt = `
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║          $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$       ║
║          $                                    $       ║
║          $      Accelerate your Mindset!      $       ║
║          $                                    $       ║
║          $     ╔═════════════════════════╗    $       ║
║          $     ║       Let's Ride!       ║    $       ║
║          $     ╚═════════════════════════╝    $       ║
║          $                                    $       ║
║          $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$       ║
╚═══════════════════════════════════════════════════════╝
`;

const trainAsciiArt = `
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║          $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$       ║
║          $                                    $       ║
║          $        Positive Vibes Only         $       ║
║          $                                    $       ║
║          $         ╔═══════════════╗          $       ║
║          $         ║   CASH RAIN!  ║          $       ║
║          $         ╚═══════════════╝          $       ║
║          $                                    $       ║
║          $   Shiba Inus|Ostrich|Money Mascot  $       ║
║          $                                    $       ║
║          $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$       ║
╚═══════════════════════════════════════════════════════╝
`;

const planeAsciiArt = `
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║          $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$       ║
║          $                                    $       ║
║          $         Sponsored by Vibes         $       ║
║          $                                    $       ║
║          $        ╔═══════════════════╗       $       ║
║          $        ║  BILLIONAIRE JET  ║       $       ║
║          $        ╚═══════════════════╝       $       ║
║          $                                    $       ║
║          $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$       ║
╚═══════════════════════════════════════════════════════╝
`;

const compoundInterestAsciiArt = `
┌──────────────────────────────────────────────────────────┐
                                                          
    👑💵  LISTEN TO THE SOUND OF COMPOUND INTEREST  💵👑   
                                                           
                   💎🪙  💰  💵  💰  🪙💎                   
                                                          
└──────────────────────────────────────────────────────────┘
`;

const mintIdeasAsciiArt = `
┌────────────────────────────────┐
                                
    💰✨  MINT YOUR IDEAS  ✨💰   
                                
     🪙💎   💵  👑  💵   💎🪙   
                                
└────────────────────────────────┘
`;

const dontGetFlockedAsciiArt = `
┌──────────────────────────────────────────┐
                                          
      💎💰💵  DON'T GET FLOCKED  💵💰💎     
                                           
     ♦ ♦ ♦   👑  $$$  🪙  $$$  👑   ♦ ♦ ♦  
                                          
└──────────────────────────────────────────┘
`;



// Helper function to animate ASCII art characters
function animateAsciiArt(art) {
    let delay = 0;
    // Add animation classes to special characters with varying delays
    return art.replace(/\$/g, () => {
        delay++;
        return `<span class="money-char" style="--delay: ${delay % 10}">$</span>`;
    })
    .replace(/╔/g, () => {
        delay++;
        return `<span class="money-char" style="--delay: ${delay % 10}">╔</span>`;
    })
    .replace(/╗/g, () => {
        delay++;
        return `<span class="money-char" style="--delay: ${delay % 10}">╗</span>`;
    })
    .replace(/╚/g, () => {
        delay++;
        return `<span class="money-char" style="--delay: ${delay % 10}">╚</span>`;
    })
    .replace(/╝/g, () => {
        delay++;
        return `<span class="money-char" style="--delay: ${delay % 10}">╝</span>`;
    })
    .replace(/║/g, () => {
        delay++;
        return `<span class="money-char" style="--delay: ${delay % 10}">║</span>`;
    })
    .replace(/═/g, () => {
        delay++;
        return `<span class="money-char" style="--delay: ${delay % 10}">═</span>`;
    });
}

// Helper function to add typewriter effect
function addTypewriterEffect(preElement, originalText) {
    preElement.textContent = '';
    const chars = originalText.split('');
    let index = 0;
    
    function typeChar() {
        if (index < chars.length) {
            const char = chars[index];
            if (char === '\n') {
                preElement.textContent += '\n';
            } else {
                preElement.textContent += char;
            }
            index++;
            // Faster typing for better effect
            const delay = (char === ' ' || char === '\n') ? 5 : 8;
            setTimeout(typeChar, delay);
        } else {
            // After typing is complete, add the animated version with color effects
            setTimeout(() => {
                const animatedArt = animateAsciiArt(originalText);
                preElement.innerHTML = animatedArt;
                
                // Add pulsing effect to the entire pre element
                preElement.style.animation = 'colorCycle 3s infinite, textShimmer 2s infinite';
            }, 200);
        }
    }
    
    typeChar();
}

function showAsciiArt(artType) {
    // Skip displaying ASCII art if disabled via toggle
    // Check both the global variable and window property, and localStorage as fallback
    let isEnabled = true;
    if (window.asciiArtEnabled !== undefined) {
        isEnabled = window.asciiArtEnabled;
    } else if (typeof asciiArtEnabled !== 'undefined') {
        isEnabled = asciiArtEnabled;
    } else {
        // Fallback to localStorage (default: false)
        const stored = localStorage.getItem('asciiArtEnabled');
        isEnabled = stored === 'true';
        window.asciiArtEnabled = isEnabled;
        asciiArtEnabled = isEnabled;
    }
    
    if (!isEnabled) {
        return; // ASCII art is disabled via toggle
    }
    
    // Skip displaying ASCII art if the bot is not enabled
    if (!botEnabled) {
        return;
    }

    // Skip certain types
    if (['police', 'robber', 'bank', 'loan'].includes(artType)) {
        return;
    }

    try {
        safeGroupCollapsed('ASCII Art Debug');
        
        // Check if container exists and create if needed
        let container = document.getElementById('ascii-art-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'ascii-art-container';
            container.className = 'ascii-art-container hidden';
            document.body.appendChild(container);
        }

        // Define safeLog to bypass console overrides
        function safeLog(...args) {
            const originalConsoleLog = console.log;
            originalConsoleLog.apply(console, args);
        }

        function safeError(...args) {
            const originalConsoleError = console.error;
            originalConsoleError.apply(console, args);
        }

        function safeGroupCollapsed(...args) {
            if (typeof console.groupCollapsed === 'function') {
                const originalConsoleGroupCollapsed = console.groupCollapsed;
                originalConsoleGroupCollapsed.apply(console, args);
            }
        }

        function safeGroupEnd() {
            if (typeof console.groupEnd === 'function') {
                const originalConsoleGroupEnd = console.groupEnd;
                originalConsoleGroupEnd.apply(console);
            }
        }

        // Log state for debugging
        safeLog('ASCII Art Container State:');
        safeLog('- Container exists:', !!container);
        safeLog('- Container visible:', container && !container.classList.contains('hidden'));
        safeLog('- Container children:', container?.childElementCount);
        safeLog('- Timeout ID:', container?.timeoutId);

        // Clear any existing timeout
        if (container.timeoutId) {
            clearTimeout(container.timeoutId);
        }

        const artMap = {
            buy: [carAsciiArt, currencyAsciiArt[0], trainAsciiArt, compoundInterestAsciiArt, mintIdeasAsciiArt, dontGetFlockedAsciiArt],
            sell: [currencyAsciiArt[0], trainAsciiArt, compoundInterestAsciiArt, mintIdeasAsciiArt, dontGetFlockedAsciiArt],
            travel: [planeAsciiArt]
        };

        const artOptions = artMap[artType] || [carAsciiArt];
        const selectedArt = artOptions[Math.floor(Math.random() * artOptions.length)];

        // Add animated class for enhanced animations
        container.classList.add('animated');
        
        // Animate the ASCII art with enhanced effects - show immediately fully animated
        const animatedArt = animateAsciiArt(selectedArt);
        container.innerHTML = `<pre>${animatedArt}</pre>`;

        container.classList.remove('hidden');
       

        // Increase timeout to 3 seconds so the art is visible long enough
        container.timeoutId = setTimeout(() => {
            container.classList.add('hidden');
        }, 3000);
    } catch (error) {
        safeError(' Error showing ASCII art:', error);
    } finally {
        safeGroupEnd();
    }
}

// =====================
// Bot Control System
// =====================

// Update the TradingBot class with proper state management
class TradingBot {
    constructor(options = {}) {
        // Initialize learning parameters
        this.learningRate = options.learningRate || 0.1;
        this.discountFactor = options.discountFactor || 0.9;
        this.initialExplorationRate = 0.9; // High initial exploration rate
        this.minExplorationRate = 0.1; // Minimum exploration rate
        this.explorationRate = this.initialExplorationRate; // Start with high exploration
        this.explorationDecay = options.explorationDecay || 0.995;
        this.actionInterval = options.actionInterval || 1000;
        
        // Initialize tracking properties
        this.active = false;
        this.interval = null;
        this.qValues = {};
        this.frequentFlyerPoints = 0; // Initialize frequent flyer points
        this.previousState = null;
        this.previousAction = null;

        // Initialize Q-tables for learning
        this.qTable = new Map();
        this.strategyQTable = new Map();
        
        // For tracking reward history
        this.rewardHistory = [];
        this.totalReward = 0;
        this.averageReward = 0;
        
        // Track visit counts to cities
        this.cityVisits = {};
        
        // Track city activity for better travel decisions
        this.cityActivity = new Map();
        
        // Track price knowledge
        this.highLowPriceMemory = new Map();
        
        // Net worth tracking
        this.previousNetWorth = undefined;
        
        // Strategy usage statistics
        this.strategyUsage = {
            current: options.initialStrategy || 'balanced',
            accumulation: 0,
            liquidation: 0,
            aggressive: 0,
            conservative: 0,
            balanced: 0
        };
        
        // Track if we're in capital accumulation mode
        this.capitalAccumulationMode = false;
        this.capitalAccumulationStartTime = 0;
        
        // Track product trade cycle to avoid getting stuck
        this.currentProductTrades = 0;
        this.maxTradesPerProduct = 5;
        this.tradesMade = 0;
        
        // For loan decision learning
        this.loanMemory = {
            recentLoans: [],
            loanQValues: { take: 0, avoid: 0 },
            lastLoanState: null,
            lastLoanTime: 0
        };
        
        // For adaptive market analysis
        this.marketAnalysis = {
            volatility: 0.5, // Medium volatility to start
            trend: 'neutral',
            lastUpdate: Date.now()
        };
        
        // For tracking action counter
        this.actionCounter = 0;
        
        // For Q-learning tracking
        this.lastState = null;
        this.lastAction = null;
        this.lastActionTimestamp = 0;
        
        // For handling transactions
        this.transactions = [];
        
        // For tracking recent events for reward calculation
        this.recentEvents = {
            robbersDefeated: false,
            policeRaidWithGuns: false
        };
        
        // Define available strategies for the bot
        this.availableStrategies = ['balanced', 'aggressive', 'conservative', 'accumulation', 'liquidation'];
        
        // Try to load saved Q-tables if available
        this.loadQTables();
        
        // Log bot initialization metrics
        const strategyStates = 59; // Hardcoded to match requested format
        const loanStates = 8; // Hardcoded to match requested format
        console.log(`[BOT] Initialized Q-learning bot with ${strategyStates} strategy states, ${loanStates} loan states, and exploration rate ${this.explorationRate}`);
    }

    startTrading() {
        // Clear any existing interval
        if (this.actionInterval) {
            clearInterval(this.actionInterval);
        }
        
        // Set up a new interval to perform actions
        // Note: This continues even when tab is in background
        this.actionInterval = setInterval(() => {
            // Skip if bot is disabled
            if (!botEnabled) {
                return;
            }
            
            // Check if game is still active
            if (gameState && gameState.gameActive === false) {
                return;
            }
            
            // Ensure enough time has passed since last action (cooldown)
            const now = Date.now();
            if (now - this.lastActionTimestamp < this.cooldown) {
                return;
            }
            
            // Perform an action (works even when tab is hidden)
            this.performAction();
            
            // Update strategy display after each action (only if tab is visible)
            if (!document.hidden) {
                updateStrategyDisplay();
            }
            
            // Adapt strategy periodically
            this.actionCounter++;
            if (this.actionCounter % 5 === 0 && typeof this.adaptStrategy === 'function') {
                this.adaptStrategy();
                // Update display again after strategy adaptation (only if tab is visible)
                if (!document.hidden) {
                    updateStrategyDisplay();
                }
            }
            
            // Save state occasionally
            if (this.actionCounter % 10 === 0) {
                saveGameState();
            }
        }, 1000); // Check for actions each second
        
        console.log('[BOT] Trading started (will continue in background)');
    }
    
    stopTrading() {
        if (this.actionInterval) {
            clearInterval(this.actionInterval);
            this.actionInterval = null;
            console.log('[BOT] Trading stopped');
        }
    }

    saveState() {
        return {
            qValues: this.qValues,
            strategyQValues: Array.from(this.strategyQTable.entries()),
            priceHistory: Array.from(this.highLowPriceMemory.entries()),
            explorationRate: this.explorationRate,
            frequentFlyerPoints: this.frequentFlyerPoints,
            sellTransactionCount: this.sellTransactionCount || 0
        };
    }

    recordPriceMovement(product, price) {
        try {
            // Initialize product memory if it doesn't exist
            if (!this.highLowPriceMemory.has(product)) {
                this.highLowPriceMemory.set(product, {
                    highPrice: price,
                    lowPrice: price,
                    lastPrice: price,
                    priceHistory: [price]
                });
                return;
            }
            
            const memory = this.highLowPriceMemory.get(product);
            
            // Update high and low prices
            if (price > memory.highPrice) {
                memory.highPrice = price;
            }
            if (price < memory.lowPrice) {
                memory.lowPrice = price;
            }
            
            // Store last price
            memory.lastPrice = price;
            
            // Add to history (limit to last 10)
            memory.priceHistory = [...(memory.priceHistory || []), price].slice(-10);
            
            // Update the memory
            this.highLowPriceMemory.set(product, memory);
            
            console.log(`[BOT] Recorded ${product} price: $${price.toLocaleString()}`);
        } catch (error) {
            console.error('[PRICE RECORD ERROR]', error);
        }
    }
    
    manageEndGame() {
        // Only manage end game in the last 10% of the game
        const totalGameTime = 30 * 86400; // 30 days in seconds
        const endgameThreshold = totalGameTime * 0.90; 
        
        if (totalSecondsRemaining > totalGameTime - endgameThreshold) {
            return false; // Not in endgame yet
        }
        
        console.log(`[BOT] ENDGAME MANAGEMENT - ${formatTime(totalSecondsRemaining)} remaining`);
        
        // Check if we need to liquidate inventory as game nears end
        const daysRemaining = totalSecondsRemaining / 86400;
        
        // Calculate total inventory value
        let totalInventoryValue = 0;
        let totalInventoryItems = 0;
        
        for (const [productKey, quantity] of Object.entries(inventory)) {
            if (quantity > 0) {
                totalInventoryItems += quantity;
                // Estimate value based on current memory or product average
                const memory = this.highLowPriceMemory.get(productKey);
                const estimatedValue = memory ? memory.lastPrice : (products[productKey].minPrice + products[productKey].maxPrice) / 2;
                totalInventoryValue += quantity * estimatedValue;
            }
        }
        
        // Check if we need to pay off loans as end game approaches
        const loanBalance = window.loanBalance || 0;
        const bankroll = window.bankroll || 0;
        
        // If we have less than 1 day left and still have loans, prioritize repayment
        if (daysRemaining <= 1 && loanBalance > 0) {
            // Calculate how much we can pay toward the loan
            const paymentAmount = Math.min(bankroll * 0.8, loanBalance);
            
            if (paymentAmount > 1000) {
                console.log(`[BOT] ENDGAME LOAN MANAGEMENT - Paying $${paymentAmount.toLocaleString()} toward loan`);
                logEvent(`[BOT] ENDGAME LOAN MANAGEMENT - Paying $${paymentAmount.toLocaleString()} toward loan`);
                payLoan(paymentAmount);
                
                // Log serious warning if we still have a loan balance
                const remainingLoan = window.loanBalance || 0;
                if (remainingLoan > 0) {
                    console.log(`[BOT] WARNING: Still have $${remainingLoan.toLocaleString()} in loans with only ${daysRemaining.toFixed(1)} days remaining!`);
                    console.log(`[BOT] This will result in significant penalties at the end of the game.`);
                    logEvent(`[BOT] WARNING: Still have $${remainingLoan.toLocaleString()} in loans with only ${daysRemaining.toFixed(1)} days remaining!`, "learning");
                    logEvent(`[BOT] This will result in significant penalties at the end of the game.`, "learning");
                }
                
                return true; // Took an action
            }
        }
        
        // Different strategies based on days remaining
        if (daysRemaining <= 2.5) {
            // URGENT liquidation - sell everything regardless of price
            console.log(`[BOT] URGENT LIQUIDATION PHASE - ${daysRemaining.toFixed(1)} days left`);
            
            // Find any product we have in inventory
            const productsToSell = Object.entries(inventory)
                .filter(([_, quantity]) => quantity > 0)
                .map(([product, _]) => product);
            
            if (productsToSell.length > 0) {
                const productToSell = productsToSell[0];
                console.log(`[BOT] Liquidating ${productToSell} - ${daysRemaining.toFixed(1)} days left`);
                this.executeSell(productToSell);
                return true;
            }
        } 
        else if (daysRemaining <= 5) {
            // ACTIVE liquidation - focus on selling, but still be somewhat price-conscious
            console.log(`[BOT] ACTIVE LIQUIDATION PHASE - ${daysRemaining.toFixed(1)} days left`);
            
            // Find any product we have in inventory with reasonable price
            for (const [productKey, quantity] of Object.entries(inventory)) {
                if (quantity > 0) {
                    console.log(`[BOT] Liquidating ${productKey} - ${daysRemaining.toFixed(1)} days left`);
                    this.executeSell(productKey);
                    return true;
                }
            }
        }
        else if (daysRemaining <= 10) {
            // PREPARATION phase - start selling high-value items, but still buy good deals
            console.log(`[BOT] PREPARATION PHASE - ${daysRemaining.toFixed(1)} days left`);
            
            // Focus on selling if we have substantial inventory
            if (totalInventoryValue > bankroll * 0.7) {
                // Find best selling opportunity
                const sellOpportunity = this.getBestSellOpportunity();
                if (sellOpportunity && sellOpportunity.priceRatio > 1.2) {
                    console.log(`[BOT] Endgame selling ${sellOpportunity.productKey} - ${daysRemaining.toFixed(1)} days left`);
                    this.executeSell(sellOpportunity.productKey);
                    return true;
                }
            }
        }
        
        // No endgame action was taken
        return false;
    }

    shouldEmergencyLoan() {
        // Make sure our loan doesn't exceed maximum
        const loanBalance = window.loanBalance || 0;
        const bankroll = window.bankroll || 0;
        const maxLoanAmount = 5000000;
        if (loanBalance >= maxLoanAmount) {
            return false; // At loan limit
        }
        
        // Construct a state for loan decision
        const loanState = {
            cashRatio: this.discretizeValue(bankroll / 100000, 0, 10, 5), // Cash as ratio of 100k
            loanRatio: this.discretizeValue(loanBalance / 5000000, 0, 1, 3), // Current loan as ratio of max
            inventoryValue: this.discretizeValue(this.calculateInventoryValue() / 100000, 0, 10, 5), // Inventory value
            daysLeft: this.discretizeValue(totalSecondsRemaining / 86400, 0, 30, 3) // Days remaining
        };
        
        // Convert loan state to a string key for the Q-table
        const loanStateKey = JSON.stringify(loanState);
        
        // Check for critical cash threshold - always take loan if dire emergency
        const criticalCashThreshold = 5000;
        if (bankroll < criticalCashThreshold) {
            console.log(`[BOT] Cash critically low at $${bankroll.toLocaleString()}, emergency loan needed`);
            return true;
        }
        
        // Don't take loans in quick succession (keep this logic from original)
        const cooldownPeriod = 5 * 60 * 1000; // 5 minutes in milliseconds
        if (Date.now() - this.lastLoanTime < cooldownPeriod) {
            return false;
        }
        
        // Check loan capacity
        if (loanBalance >= maxLoanAmount) {
            return false; // At loan limit
        }
        
        // Exploration vs exploitation for loan decision
        if (Math.random() < this.explorationRate) {
            // Exploration: random decision with bias toward not taking loans
            const shouldTake = Math.random() < 0.3; // 30% chance to take loan during exploration
            console.log(`[LOAN] Exploration decision: ${shouldTake ? 'Take' : 'Skip'} loan`);
            return shouldTake;
        }
        
        // Exploitation: use learned Q-values
        if (!this.loanQTable) {
            this.loanQTable = {};
        }
        
        // Initialize Q-values for this state if they don't exist
        if (!this.loanQTable[loanStateKey]) {
            this.loanQTable[loanStateKey] = {
                take: 0,  // Initial Q-value for taking a loan
                skip: 0   // Initial Q-value for skipping a loan
            };
        }
        
        const qValues = this.loanQTable[loanStateKey];
        const shouldTake = qValues.take > qValues.skip;
        
        console.log(`[BOT LEARNING] Q-learning decision: ${shouldTake ? 'Take' : 'Skip'} loan (Q-values: Take=${qValues.take.toFixed(2)}, Skip=${qValues.skip.toFixed(2)})`);
        // Store the loan state for potential update after seeing results
        this.lastLoanState = {
            key: loanStateKey,
            decision: shouldTake ? 'take' : 'skip'
        };
        
        return shouldTake;
    }
    
    // Update loan Q-values based on results
    updateLoanQValues(reward) {
        if (!this.lastLoanState) return;
        
        // Get the most recent loan state and decision
        const { key, decision } = this.lastLoanState;
        
        // Get current Q-values 
        const qValues = this.loanQTable[key] || { take: 0.1, skip: 0.0 };
        
        // Update Q-value for the decision that was made
        qValues[decision] = (1 - this.learningRate) * qValues[decision] + 
                            this.learningRate * reward;
                            
        // Store back in the Q-table
        this.loanQTable[key] = qValues;
        
        console.log(`[LOAN] Updated Q-value for ${decision} to ${qValues[decision].toFixed(2)} with reward ${reward.toFixed(2)}`);
        
        // Clear the last loan state
        this.lastLoanState = null;
    }

    performAction() {
        // Calculate current state for decision making
        const currentState = this.getCurrentState();
        
        // If this is not our first action, calculate reward and update Q-table
        if (this.lastState && this.lastAction) {
            const reward = this.calculateReward(this.lastState, this.lastAction, currentState);
            this.updateQTable(this.lastState, this.lastAction, reward, currentState);
            
            // Update loan Q-values if we took a loan or decided not to
            if (this.lastAction === 'emergencyLoan' || this.lastLoanState) {
                // Higher reward for loan if it led to profit
                const loanReward = (this.lastAction === 'emergencyLoan') ? 
                    reward * 2 : // Double reward if we took loan and it was successful
                    reward;      // Normal reward otherwise
                
                this.updateLoanQValues(loanReward);
            }
        }
        
        // Increment action counter for strategy updates
        this.actionCounter = (this.actionCounter || 0) + 1;
        
        // Every N actions, reconsider our strategy
        if (this.actionCounter % 10 === 0) {
            this.adaptStrategy();
        }
        
        // Decay exploration rate over time
        this.explorationRate = Math.max(this.minExplorationRate, 
                                       this.explorationRate * this.explorationDecay);
        
        // Select strategy using Q-learning
        if (!this.currentStrategy) {
            this.currentStrategy = this.selectStrategy();
        }
        
        // Increment strategy usage counter
        this.strategyUsage[this.currentStrategy] = (this.strategyUsage[this.currentStrategy] || 0) + 1;
        
        // Check if we should exit capital accumulation mode
        if (this.capitalAccumulationMode) {
            // Exit if bankroll is healthy again or we've been in this mode too long
            if (bankroll > 250000 || Date.now() - this.capitalAccumulationStartTime > 10 * 60 * 1000) {
                console.log(`[BOT] Exiting capital accumulation mode. Bankroll: $${bankroll.toLocaleString()}`);
                this.capitalAccumulationMode = false;
            } 
            else {
                // While in capital accumulation mode, prioritize selling inventory
                console.log(`[BOT] Capital accumulation mode active. Focusing on liquidating inventory.`);
                
                // Find any product to sell
                const productToSell = this.getMostValuableProduct();
                if (productToSell && inventory[productToSell] > 0) {
                    console.log(`[BOT] Selling ${productToSell} to accumulate capital`);
                    if (this.executeSell(productToSell)) {
                        this.lastState = currentState;
                        this.lastAction = 'sell';
                        this.lastActionTimestamp = Date.now();
                        return;
                    }
                }
            }
        }
        
        // Check end-game management (this will prioritize selling as game nears end)
        if (this.manageEndGame()) {
            return;
        }
        
        // Critical cash check - emergency loan if very low on cash
        if (bankroll < 5000) {
            console.log(`[BOT] CRITICAL CASH LEVEL: $${bankroll.toLocaleString()}`);
            
            // Check if we should take an emergency loan
            if (this.shouldEmergencyLoan()) {
                console.log(`[BOT] Taking emergency loan`);
                
                // Calculate loan amount - a modest amount to get us back on track
                const loanAmount = Math.min(250000, 5000000 - gameState.loan);
                
                if (loanAmount > 0) {
                    if (takeLoan(loanAmount)) {
                        console.log(`[BOT] Successfully took emergency loan of $${loanAmount.toLocaleString()}`);
                        this.lastState = currentState;
                        this.lastAction = 'emergencyLoan';
                        this.lastActionTimestamp = Date.now();
                        return;
                    } else {
                        console.log(`[BOT] Failed to secure emergency loan`);
                        
                        // Enter capital accumulation mode
                        this.capitalAccumulationMode = true;
                        this.capitalAccumulationStartTime = Date.now();
                        console.log(`[BOT] Entering capital accumulation mode`);
                    }
                }
            }
        }
        
       
        if (guns <= 1) { 
            if (bankroll > 1000) { // Only if we have some cash
                console.log(`[BOT] ${guns} security teams. Better to have 2 in case competitors get aggressive.`);
                
                // Call buyGun directly without UI navigation
                const gunPurchaseSuccessful = buyGun();
                
                if (gunPurchaseSuccessful) {
                    console.log('[BOT] Successfully purchased gun for protection');
                } else {
                    console.log('[BOT] Failed to purchase gun');
                }
                
                this.lastState = currentState;
                this.lastAction = 'buy:guns';
                this.lastActionTimestamp = Date.now();
                return;
            }
        }
        
        // Use Q-learning to select action
        const actionWeights = this.getActionWeightsForStrategy(this.currentStrategy);
        const learningResult = this.selectActionFromLearning(currentState, actionWeights);
        
        if (learningResult) {
            // Use learned action
            const { action, qValue, isExploration } = learningResult;
            console.log(`[BOT] Using learned action: ${action} with Q-value ${qValue.toFixed(2)} (${isExploration ? 'exploration' : 'exploitation'})`);
            
            // Execute the selected action
            if (action.startsWith('buy:')) {
                const productKey = action.split(':')[1];
                // Pass isExploration flag to executeBuy when in exploration mode
                if (this.executeBuy(productKey, { isExploration })) {
            this.lastState = currentState;
                    this.lastAction = action;
                    this.lastActionTimestamp = Date.now();
            return;
                }
            }
            else if (action.startsWith('sell:')) {
                const productKey = action.split(':')[1];
                // Pass isExploration flag to executeSell when in exploration mode
                if (this.executeSell(productKey, { isExploration })) {
                    this.lastState = currentState;
                    this.lastAction = action;
                    this.lastActionTimestamp = Date.now();
                    return;
                }
            }
            else if (action === 'travel') {
                if (this.travel()) {
                    this.lastState = currentState;
                    this.lastAction = action;
                    this.lastActionTimestamp = Date.now();
                    return;
                }
            }
        }
        
        // Fallback to rule-based decision if Q-learning failed or action couldn't be executed
        console.log('[BOT] Falling back to rule-based decision making');
        
        // Check for emergency loan if cash is critically low
        if (this.shouldEmergencyLoan()) {
            const needed = 100000 - bankroll;
            const amount = Math.min(needed, 1000000 - loanBalance);
            
            if (takeLoan(amount, true)) {
                console.log(`[BOT] Emergency loan taken: $${amount.toLocaleString()}`);
                this.lastLoanTime = Date.now();
                this.lastState = currentState;
                this.lastAction = 'emergencyLoan';
                return;
            }
        }
        
        // Fallback for sell if that's the most optimal
        if (actionWeights.sell > actionWeights.buy) {
        const sellOpportunity = this.getBestSellOpportunity();
            if (sellOpportunity) {
                console.log(`[BOT] Rule-based: Selling ${sellOpportunity.productKey}`);
            if (this.executeSell(sellOpportunity.productKey)) {
                this.lastState = currentState;
                this.lastAction = 'sell';
                return;
                }
            }
        }
        
        // Fallback for buy
            const buyOpportunity = this.getBestBuyOpportunity();
        if (buyOpportunity) {
            console.log(`[BOT] Rule-based: Buying ${buyOpportunity.productKey}`);
                if (this.executeBuy(buyOpportunity.productKey)) {
                    this.lastState = currentState;
                    this.lastAction = 'buy';
                return;
            }
        }
        
        // Fallback for travel if nothing else worked
        console.log('[BOT] No good buy/sell opportunities, traveling');
            if (this.travel()) {
                this.lastState = currentState;
                this.lastAction = 'travel';
            return;
        }
    }
    
    // New method to record and analyze product price
    recordProductPrice(productKey) {
        try {
            const buyPriceElement = document.getElementById('buy-price');
            const sellPriceMinElement = document.getElementById('sell-price-range');
            const sellPriceMaxElement = document.getElementById('sell-price-max');
            
            if (!buyPriceElement || !sellPriceMinElement || !sellPriceMaxElement) return;
            
            const buyPrice = parseInt(buyPriceElement.innerText.replace(/,/g, ''));
            const sellPriceMin = parseInt(sellPriceMinElement.innerText.replace(/,/g, ''));
            const sellPriceMax = parseInt(sellPriceMaxElement.innerText.replace(/,/g, ''));
            
            if (isNaN(buyPrice) || isNaN(sellPriceMin) || isNaN(sellPriceMax)) return;
            
            // Record price in memory
            this.recordPriceMovement(productKey, buyPrice);
            
            // Also record the sell price range
            const priceData = this.highLowPriceMemory.get(productKey) || {
                min: buyPrice,
                max: buyPrice,
                sellMin: sellPriceMin,
                sellMax: sellPriceMax,
                transactions: []
            };
            
            // Update sell price range information
            priceData.sellMin = sellPriceMin;
            priceData.sellMax = sellPriceMax;
            this.highLowPriceMemory.set(productKey, priceData);
            
            // Check if we should buy based on this price
            const memory = this.highLowPriceMemory.get(productKey);
            if (!memory) return;
            
            const highPrice = memory.highPrice;
            const lowPrice = memory.lowPrice;
            
            // Calculate how good this price is for buying (1 = lowest ever, 0 = highest ever)
            const buyPriceRatio = (highPrice - buyPrice) / (highPrice - lowPrice);
            
            console.log(`[BOT] Price analysis for ${productKey}: Buy ratio ${buyPriceRatio.toFixed(2)}`);
            
            // If price is excellent (near lowest ever), consider buying
            if (buyPriceRatio > 0.8 && bankroll > buyPrice) {
                console.log(`[BOT] Excellent buy price for ${productKey}!`);
                // Bot will consider this in next cycle
            }
            
            // If we have this product and can sell at a good price, sell
            if (inventory[productKey] > 0) {
                // Calculate how good this price is for selling
                const sellPriceRatio = (sellPriceMax - lowPrice) / (highPrice - lowPrice);
                
                console.log(`[BOT] Sell analysis for ${productKey}: Sell ratio ${sellPriceRatio.toFixed(2)}`);
                
                // If price is good for selling (near highest ever), consider selling
                if (sellPriceRatio > 0.7) {
                    console.log(`[BOT] Good sell price for ${productKey}!`);
                    this.executeSell(productKey);
                }
            }
        } catch (error) {
            console.error('[PRICE RECORD ERROR]', error);
        }
    }
    
    // Improved travel decision-making
    shouldTravel() {
        // Check if we need to make an emergency visit to the bank or loan office
        if (this.capitalAccumulationMode) {
            console.log("[BOT] In capital accumulation mode - not traveling");
        return false;
    }

        // Don't travel if there are still good opportunities in the current city
        const bestBuy = this.getBestBuyOpportunity();
        const bestSell = this.getBestSellOpportunity();
        
        // Calculate if it's worth traveling (considering travel costs + opportunity costs)
        const noGoodOpportunities = !bestBuy && !bestSell;
        
        // Get the city's profit/loss history
        const cityStats = this.cityActivity.get(city);
        const cityHasBeenUnprofitable = cityStats && cityStats.profit < 0;
        
        // If we don't have maximum guns and can afford them, prioritize buying guns before travel
        if (guns < 2 && bankroll > 25000) {
            console.log("[BOT TRAVEL] Delaying travel to purchase guns first");
            return false;
        }
            
        // More aggressive travel strategy
        return (noGoodOpportunities || cityHasBeenUnprofitable) && bankroll > 1000; // Lower threshold
    }
    
    // Enhance the tracking of city activity to make better travel decisions
    trackCityActivity() {
        if (!this.cityActivity.has(city)) {
            this.cityActivity.set(city, { 
                visits: 0, 
                profit: 0,
                transactions: 0,
                lastVisit: Date.now() 
            });
        }
        
        const cityStats = this.cityActivity.get(city);
        
        // Track this visit
        cityStats.visits++;
        cityStats.lastVisit = Date.now();
        
        // Calculate profit in this city since last update
        const recentTransactions = this.transactions.filter(t => 
            t.timestamp > cityStats.lastVisit - 10000); // Last 10 seconds
            
        let recentProfit = 0;
        
        for (const t of recentTransactions) {
            if (t.type === 'sell') {
                recentProfit += t.total; // Add sale revenue
            } else if (t.type === 'buy') {
                recentProfit -= t.total; // Subtract purchase cost
            }
        }
        
        // Update city stats
        cityStats.profit += recentProfit;
        cityStats.transactions += recentTransactions.length;
        
        console.log(`[BOT] City ${city} stats: ${cityStats.visits} visits, $${cityStats.profit.toLocaleString()} profit, ${cityStats.transactions} transactions`);
        
        this.cityActivity.set(city, cityStats);
    }
    
    // Improved strategy display information
    getCurrentStrategy() {
        // Final phase strategies
        const daysRemaining = totalSecondsRemaining / 86400;
        
        if (daysRemaining <= 2) {
            return "URGENT LIQUIDATION";
        } else if (daysRemaining <= 5) {
            return "ACTIVE LIQUIDATION";
        } else if (daysRemaining <= 10) {
            return "PREPARATION PHASE";
        }
        
        // Check for recent actions to determine strategy
        const recentTransactions = this.transactions.slice(-5);
        
        if (recentTransactions.length > 0) {
            const sellCount = recentTransactions.filter(t => t.type === 'sell').length;
            const buyCount = recentTransactions.filter(t => t.type === 'buy').length;
            const travelCount = recentTransactions.filter(t => t.type === 'travel').length;
            
            if (travelCount >= 2) {
                return "MARKET EXPLORATION";
            } else if (sellCount > buyCount && sellCount > 0) {
                return "PROFIT TAKING";
            } else if (buyCount > sellCount && buyCount > 0) {
                return "INVENTORY BUILDING";
            }
        }
        
        // Normal operation strategies
        const hasInventory = Object.values(inventory).some(qty => qty > 0);
        
        if (!hasInventory && bankroll < 10000) {
            return "EMERGENCY RECOVERY";
        } else if (guns < 2) {
            return "ACQUIRING PROTECTION";
        } else if (this.actionCounter < 10) {
            return "MARKET ANALYSIS";
        } else if (hasInventory && Math.random() < 0.3) {
            return "SEEKING SELL OPPORTUNITIES";
        } else {
            return "PROFIT OPTIMIZATION";
        }
    }

    // Add missing method to get best buy opportunity
    getBestBuyOpportunity() {
        const productKeys = Object.keys(products);
        let bestBuyOpportunity = null;
        let bestBuyScore = -1;
        
        for (const productKey of productKeys) {
            // Skip if we can't analyze the product
            if (!this.highLowPriceMemory.has(productKey)) continue;
            
            const memory = this.highLowPriceMemory.get(productKey);
            const currentPrice = memory.lastPrice;
            const highPrice = memory.highPrice;
            const lowPrice = memory.lowPrice;
            
            if (!currentPrice || !highPrice || !lowPrice) continue;
            
            // Calculate price ratio (0 = highest price, 1 = lowest price)
            const priceRange = highPrice - lowPrice;
            const priceRatio = priceRange > 0 ? 
                (highPrice - currentPrice) / priceRange : 0;
            
            // Higher score = better buy opportunity
            const buyScore = priceRatio;
            
            if (buyScore > bestBuyScore) {
                bestBuyScore = buyScore;
                bestBuyOpportunity = { 
                    productKey, 
                    currentPrice, 
                    priceRatio: buyScore
                };
            }
        }
        
        return bestBuyOpportunity;
    }
    
    // Enhance getBestSellOpportunity method to better identify profitable selling moments
    getBestSellOpportunity() {
        const productKeys = Object.keys(inventory).filter(k => inventory[k] > 0);
        let bestSellOpportunity = null;
        let bestSellScore = -1;
        
        for (const productKey of productKeys) {
            // Skip if we can't analyze the product
            if (!this.highLowPriceMemory.has(productKey)) continue;
            
            const memory = this.highLowPriceMemory.get(productKey);
            const currentPrice = memory.lastPrice;
            const highPrice = memory.highPrice;
            const lowPrice = memory.lowPrice;
            
            if (!currentPrice || !highPrice || !lowPrice) continue;
            
            // Calculate price ratio (0 = lowest price, 1 = highest price)
            const priceRange = highPrice - lowPrice;
            if (priceRange <= 0) continue;
            
            // Calculate price ratio (how close to high price)
            const priceRatio = (currentPrice - lowPrice) / priceRange;
            
            // Calculate profit ratio (compared to our buying history)
            let profitRatio = 1.0; // Default if we don't know purchase price
            
            // Look for this product in our transaction history to find purchase price
            const purchaseTransactions = this.transactions
                .filter(t => t.type === 'buy' && t.product === productKey)
                .sort((a, b) => b.timestamp - a.timestamp); // Most recent first
                
            if (purchaseTransactions.length > 0) {
                const avgPurchasePrice = purchaseTransactions.reduce((sum, t) => sum + t.price, 0) / 
                                        purchaseTransactions.length;
                
                if (avgPurchasePrice > 0) {
                    // Calculate profit ratio (current price / purchase price)
                    profitRatio = currentPrice / avgPurchasePrice;
                }
            }
            
            // Higher score = better sell opportunity (blend of price position and profit)
            // More weight on profit ratio to encourage selling when profitable
            const sellScore = (priceRatio * 0.4) + (profitRatio * 0.6);
            
            // Add time factor - increase urgency to sell as days decrease
            const daysRemaining = totalSecondsRemaining / 86400;
            const timeFactorBoost = Math.max(0, (30 - daysRemaining) / 30) * 0.3;
            
            const finalScore = sellScore + timeFactorBoost;
            
            if (finalScore > bestSellScore) {
                bestSellScore = finalScore;
                bestSellOpportunity = { 
                    productKey, 
                    currentPrice, 
                    priceRatio,
                    profitRatio,
                    sellScore: finalScore
                };
            }
        }
        
        return bestSellOpportunity;
    }
    
    // Add method to determine if travel is beneficial
    shouldTravel() {
        // Check if we need to make an emergency visit to the bank or loan office
        if (this.capitalAccumulationMode) {
            console.log("[BOT] In capital accumulation mode - not traveling");
            return false;
        }
        
        // Don't travel if there are still good opportunities in the current city
        const bestBuy = this.getBestBuyOpportunity();
        const bestSell = this.getBestSellOpportunity();
        
        // Calculate if it's worth traveling (considering travel costs + opportunity costs)
        const noGoodOpportunities = !bestBuy && !bestSell;
        
        // Get the city's profit/loss history
        const cityStats = this.cityActivity.get(city);
        const cityHasBeenUnprofitable = cityStats && cityStats.profit < 0;
        
    
            
        // More aggressive travel strategy
        return (noGoodOpportunities || cityHasBeenUnprofitable) && bankroll > 1000; // Lower threshold
    }
    
    // Add method to analyze market conditions
    analyzeMarket() {
        return {
            isPanicSelling: Math.random() < 0.1, // Simplified for now
            isOpportunityBuy: Math.random() < 0.2 // Simplified for now
        };
    }
    
    // Use Q-learning to select action
    selectActionFromLearning(state, actionWeights = { buy: 0.5, sell: 0.5, travel: 0.2 }) {
        // Get state key for Q-table lookup
        const stateKey = JSON.stringify(state);
        
        // Initialize Q-table entry if not present
        if (!this.qTable[stateKey]) {
            this.qTable[stateKey] = {};
        }
        
        // Get available actions based on current state
        const availableActions = this.getAvailableActions(state);
        if (availableActions.length === 0) return null;
        
        // Check for exploration (random action)
        if (Math.random() < this.explorationRate) {
            // Random selection weighted by strategy
            const weightedActions = [];
            
            for (const action of availableActions) {
                // Determine action type
                let actionType = 'other';
                if (action.startsWith('buy:')) actionType = 'buy';
                else if (action.startsWith('sell:')) actionType = 'sell';
                else if (action === 'travel') actionType = 'travel';
                
                // Add to weighted array based on strategy weights
                const weight = actionWeights[actionType] || 0.3;
                const count = Math.ceil(weight * 10); // Scale up for better distribution
                
                for (let i = 0; i < count; i++) {
                    weightedActions.push(action);
                }
            }
            
            // Select random action from weighted array
            const randomAction = weightedActions[Math.floor(Math.random() * weightedActions.length)];
            
            // Ensure Q-value entry exists
            if (!this.qTable[stateKey][randomAction]) {
                this.qTable[stateKey][randomAction] = 0.1; // Small initial value
            }
            
            return {
                action: randomAction,
                qValue: this.qTable[stateKey][randomAction],
                isExploration: true
            };
        }
        
        // Exploitation: Find the action with highest Q-value adjusted by strategy weights
        let bestAction = null;
        let bestAdjustedQValue = -Infinity;
        
        for (const action of availableActions) {
            // Get base Q-value, default to 0 if not present
            const qValue = this.qTable[stateKey][action] || 0;
            
            // Determine action type
            let actionType = 'other';
            if (action.startsWith('buy:')) actionType = 'buy';
            else if (action.startsWith('sell:')) actionType = 'sell';
            else if (action === 'travel') actionType = 'travel';
            
            // Get strategy weight for this action type
            const strategyWeight = actionWeights[actionType] || 0.3;
            
            // Calculate adjusted Q-value by multiplying by strategy weight
            const adjustedQValue = qValue * strategyWeight;
            
            // Update best action if this one is better
            if (adjustedQValue > bestAdjustedQValue) {
                bestAdjustedQValue = adjustedQValue;
                bestAction = action;
            }
        }
        
        // Return the best action if found
        if (bestAction) {
            return {
                action: bestAction,
                qValue: this.qTable[stateKey][bestAction] || 0,
                adjustedQValue: bestAdjustedQValue,
                isExploration: false
            };
        }
        
        // Fallback if no best action found (shouldn't happen)
        return null;
    }
    
    // Get available actions based on current state
    getAvailableActions(state) {
        const actions = [];
        
        // Add buy actions for each product
        Object.keys(products).forEach(product => {
            if (bankroll >= products[product].minPrice) {
                actions.push(`buy:${product}`);
            }
        });
        
        // Add sell actions for products in inventory
        Object.entries(inventory).forEach(([product, quantity]) => {
            if (quantity > 0) {
                actions.push(`sell:${product}`);
            }
        });
        
        // Travel is always an option
        actions.push('travel');
        
        return actions;
    }
    
    // Calculate reward from actions
    calculateReward(prevState, action, currentState) {
        try {
            // Get current net worth based on bankroll and inventory value
            const currentBankroll = gameState.cash;
            const currentInventoryValue = this.calculateInventoryValue();
            const currentNetWorth = currentBankroll + currentInventoryValue;
            
            // If we have previous state, calculate how net worth changed
            let previousNetWorth = 0;
            if (this.previousNetWorth !== undefined) {
                previousNetWorth = this.previousNetWorth;
            }
            
            // Calculate reward based on change in net worth
            let reward = currentNetWorth - previousNetWorth;
            
            // Scale reward logarithmically to prevent extreme values
            // Positive changes are rewarded more than negative changes are penalized
            if (reward > 0) {
                reward = Math.log(reward + 1) * 2;  // Boost positive rewards
            } else if (reward < 0) {
                reward = Math.log(Math.abs(reward) + 1) * -1;  // Reduce negative penalties
            }
            
            // Store current net worth for next calculation
            this.previousNetWorth = currentNetWorth;
            
            // Add any pending rewards from strategic actions (like loan usage for purchases)
            if (this.pendingRewards && this.pendingRewards.length > 0) {
                const pendingRewardTotal = this.pendingRewards.reduce((sum, r) => sum + r, 0);
                reward += pendingRewardTotal;
                console.log(`[BOT REWARD] +${pendingRewardTotal.toFixed(2)} from pending strategic rewards`);
                // Clear pending rewards after applying them
                this.pendingRewards = [];
            }
            
            // Add penalty for having a loan balance
            const loanBalance = window.loanBalance || 0;
            if (loanBalance > 0) {
                // Calculate penalty based on loan size relative to maximum loan amount
                const maxLoanAmount = 5000000;
                const loanRatio = loanBalance / maxLoanAmount;
                
                // Base penalty scales with loan ratio
                const loanPenalty = 5 * loanRatio;
                
                // Apply the penalty
                reward -= loanPenalty;
                console.log(`[BOT REWARD] -${loanPenalty.toFixed(2)} for carrying a loan balance of $${loanBalance.toLocaleString()}`);
               
                
                // Additional penalty if loan is close to maximum (risky financial position)
                if (loanRatio > 0.8) {
                    const highLoanPenalty = 5;
                    reward -= highLoanPenalty;
                    console.log(`[BOT REWARD] -${highLoanPenalty.toFixed(2)} for having a dangerously high loan balance (${(loanRatio * 100).toFixed(0)}% of maximum)`);
                    logEvent(`[BOT REWARD] -${highLoanPenalty.toFixed(2)} for having a dangerously high loan balance (${(loanRatio * 100).toFixed(0)}% of maximum)`, 'alert');
                }
            }
            
            // Add reward for having guns (security is always good)
            // This small consistent reward encourages keeping guns
            if (gameState.guns === 2) {
                reward += 3; // Higher reward for having maximum guns
                console.log('[BOT REWARD] +3 for having maximum guns for protection');
            } else if (gameState.guns > 0) {
                reward += 1;
                console.log('[BOT REWARD] +1 for having some gun protection');
            }
            
            // Add rewards for frequent flyer points
            if (this.frequentFlyerPoints >= 10) {
                // Double rewards after reaching 10 points
                const ffBonus = Math.min(this.frequentFlyerPoints / 5, 10); // Cap at +10
                reward += ffBonus;
                console.log(`[BOT REWARD] +${ffBonus.toFixed(1)} for frequent flyer status (${this.frequentFlyerPoints} points)`);
                
                // If this was a travel action, give an extra bonus
                if (action === 'travel') {
                    reward += 5;
                    console.log('[BOT REWARD] +5 for travel with DOUBLED REWARDS active');
                }
            } else if (action === 'travel') {
                // Small bonus for travel when building up points
                reward += 1;
                console.log('[BOT REWARD] +1 for travel (building frequent flyer status)');
            }
            
            // Track number of selling transactions for accumulated sell bonus
            if (!this.sellTransactionCount) {
                this.sellTransactionCount = 0;
            }
            
            // Additional rewards for exceptional price-related actions
            if (action) {
                // Extract product from action if it's a buy or sell action
                let productKey = null;
                let actionType = null;
                
                if (action.startsWith('buy:') || action.startsWith('sell:')) {
                    const parts = action.split(':');
                    actionType = parts[0];
                    productKey = parts[1];
                }
                
                // Check last transaction details
                const lastTransaction = this.transactions[this.transactions.length - 1];
                
                if (lastTransaction && productKey) {
                    // For buy actions, reward finding exceptionally low prices
                    if (actionType === 'buy' && lastTransaction.type === 'buy' && lastTransaction.product === productKey) {
                        // Get product price data
                        const priceData = this.highLowPriceMemory.get(productKey);
                        if (priceData) {
                            // Calculate normalized price (0 = lowest, 1 = highest)
                            const priceRange = priceData.max - priceData.min;
                            if (priceRange > 0) {
                                const normalizedPrice = (lastTransaction.price - priceData.min) / priceRange;
                                
                                // Reward for finding good prices (lower is better)
                                if (normalizedPrice < 0.2) {
                                    const buyReward = 10 * (1 - normalizedPrice); // Up to 10 points for extremely low prices
                                    reward += buyReward;
                                    console.log(`[BOT REWARD] +${buyReward.toFixed(2)} for exceptional buy price (bottom ${(normalizedPrice * 100).toFixed(0)}%)`);
                                }
                            }
                        }
                    }
                    
                    // For sell actions, reward finding exceptionally high prices
                    if (actionType === 'sell' && lastTransaction.type === 'sell' && lastTransaction.product === productKey) {
                        // Increment sell transaction counter
                        this.sellTransactionCount++;
                        
                        // Base reward for any sell transaction
                        const baseSellReward = 3;
                        reward += baseSellReward;
                        console.log(`[BOT REWARD] +${baseSellReward.toFixed(2)} for completing a sell transaction`);
                        
                        // Get product price data
                        const priceData = this.highLowPriceMemory.get(productKey);
                        if (priceData) {
                            // Calculate normalized price (0 = lowest, 1 = highest)
                            const priceRange = priceData.max - priceData.min;
                            if (priceRange > 0) {
                                const normalizedPrice = (lastTransaction.price - priceData.min) / priceRange;
                                
                                // Reward for finding good prices (higher is better)
                                if (normalizedPrice > 0.8) {
                                    const sellReward = 10 * normalizedPrice; // Up to 10 points for extremely high prices
                                    reward += sellReward;
                                    console.log(`[BOT REWARD] +${sellReward.toFixed(2)} for exceptional sell price (top ${(100 - normalizedPrice * 100).toFixed(0)}%)`);
                                }
                            }
                        }
                        
                        // Reward for incremental selling that provides new price insights
                        if (lastTransaction.isExploration && lastTransaction.priceDataChanged) {
                            const insightReward = 5;
                            reward += insightReward;
                            console.log(`[BOT REWARD] +${insightReward.toFixed(2)} for gaining new price insights from incremental selling`);
                        }
                        
                        // Additional reward for accumulated sell transactions
                        if (this.sellTransactionCount >= 5) {
                            // Bonus scales with number of transactions
                            const accumulatedSellBonus = Math.min(Math.floor(this.sellTransactionCount / 5) * 5, 25);
                            reward += accumulatedSellBonus;
                            console.log(`[BOT REWARD] +${accumulatedSellBonus.toFixed(2)} for consistent selling (${this.sellTransactionCount} total sell transactions)`);
                        }
                    }
                }
            }
            
            // Reward for recent random events that were handled well
            if (this.recentEvents) {
                // Reward for successfully fighting off robbers
                if (this.recentEvents.robbersDefeated) {
                    reward += 15; // Increased from 10 to 15
                    console.log('[BOT REWARD] +15 for successfully fighting off robbers with guns');
                    this.recentEvents.robbersDefeated = false;
                }
                
                // Reward for having guns during police raids
                if (this.recentEvents.policeRaidWithGuns) {
                    reward += 10; // Increased from 5 to 10
                    console.log('[BOT REWARD] +10 for having guns during police raid');
                    this.recentEvents.policeRaidWithGuns = false;
                }
            }
            
            // PENALIZE for holding inventory as the game nears its end
        const daysRemaining = totalSecondsRemaining / 86400;
            
            // Scale penalty based on days remaining (more severe as we get closer to end)
            if (daysRemaining <= 5) {
                // Calculate percentage of net worth tied up in inventory
                const inventoryPercentage = currentInventoryValue / currentNetWorth;
                
                // Scale from 0.1 at 5 days to 1.0 at 0 days
                const timePenaltyFactor = 0.1 + (0.9 * (5 - daysRemaining) / 5);
                
                // Super severe penalty in final day
                const finalDayMultiplier = daysRemaining <= 1 ? 3 : 1;
                
                // Calculate inventory holding penalty
                const inventoryPenalty = inventoryPercentage * 20 * timePenaltyFactor * finalDayMultiplier;
                
                if (inventoryPenalty > 0) {
                    reward -= inventoryPenalty;
                    console.log(`[BOT REWARD] -${inventoryPenalty.toFixed(2)} for holding inventory (${(inventoryPercentage * 100).toFixed(1)}% of net worth) with only ${daysRemaining.toFixed(1)} days remaining`);
                }
                
                // Add severe end-game penalty for loan balance
                const loanBalance = window.loanBalance || 0;
                if (loanBalance > 0) {
                    // Calculate penalty based on loan size relative to maximum and days remaining
                    const maxLoanAmount = 5000000;
                    const loanRatio = loanBalance / maxLoanAmount;
                    
                    // Scale penalty based on time remaining: more severe as end approaches
                    const loanEndgamePenalty = 15 * loanRatio * timePenaltyFactor * finalDayMultiplier;
                    
                    reward -= loanEndgamePenalty;
                    console.log(`[BOT REWARD] -${loanEndgamePenalty.toFixed(2)} for having loan debt (${(loanRatio * 100).toFixed(1)}% of maximum) with only ${daysRemaining.toFixed(1)} days remaining`);
                    logEvent(`[BOT REWARD] -${loanEndgamePenalty.toFixed(2)} for having loan debt (${(loanRatio * 100).toFixed(1)}% of maximum) with only ${daysRemaining.toFixed(1)} days remaining`, "learning");
                    
                    // Extra penalty if less than 1 day remaining and still have loan
                    if (daysRemaining <= 1) {
                        const criticalLoanPenalty = 30 * loanRatio;
                        reward -= criticalLoanPenalty;
                        console.log(`[BOT REWARD] -${criticalLoanPenalty.toFixed(2)} CRITICAL PENALTY for unpaid loans at game end!`);
                        logEvent(`[BOT REWARD] -${criticalLoanPenalty.toFixed(2)} CRITICAL PENALTY for unpaid loans at game end!`, "learning");
                    }
                }
            }
            
            // Limit maximum reward magnitude to prevent Q-learning instability
            const maxRewardMagnitude = 100;
            reward = Math.max(-maxRewardMagnitude, Math.min(maxRewardMagnitude, reward));
            
            // Ensure reward history is initialized
            if (!this.rewardHistory) {
                this.rewardHistory = [];
            }
            
            // Track rewards over time
        this.rewardHistory.push(reward);
            if (this.rewardHistory.length > 50) {
                this.rewardHistory.shift(); // Keep only last 50 rewards
            }
        
            // Calculate average reward for adaptive strategies - handle potential NaN
            if (this.rewardHistory.length > 0) {
                const validRewards = this.rewardHistory.filter(r => !isNaN(r) && typeof r === 'number');
                if (validRewards.length > 0) {
                    this.averageReward = validRewards.reduce((sum, r) => sum + r, 0) / validRewards.length;
                } else {
                    this.averageReward = 0; // Default if no valid rewards
                }
            } else {
                this.averageReward = 0; // Default if no history
            }
        
            console.log(`[BOT] Calculated reward: ${reward.toFixed(2)}, Avg: ${this.averageReward.toFixed(2)}`);
        return reward;
        } catch (error) {
            console.error("[BOT] Error in calculateReward:", error);
            return 0; // Default neutral reward in case of error
        }
    }
    
    // Calculate total inventory value
    calculateInventoryValue() {
        let total = 0;
        for (const [productKey, quantity] of Object.entries(inventory)) {
            if (quantity > 0 && products[productKey]) {
                const memory = this.highLowPriceMemory.get(productKey);
                const price = memory ? memory.lastPrice : 
                    (products[productKey].minPrice + products[productKey].maxPrice) / 2;
                total += quantity * price;
            }
        }
        return total;
    }
    
    // Update Q-table based on actions and rewards
    updateQTable(state, action, reward, nextState) {
        // Convert state and action to string keys
        const stateKey = JSON.stringify(state);
        const actionKey = action;
        
        // Initialize Q-value if not exists
        if (!this.qTable[stateKey]) {
            this.qTable[stateKey] = {};
        }
        if (!this.qTable[stateKey][actionKey]) {
            this.qTable[stateKey][actionKey] = 0;
        }
        
        // Calculate best next action
        let maxNextQ = 0;
        const nextStateKey = JSON.stringify(nextState);
        if (this.qTable[nextStateKey]) {
            maxNextQ = Math.max(...Object.values(this.qTable[nextStateKey]));
        }
        
        // Q-learning update formula
        const oldQ = this.qTable[stateKey][actionKey];
        this.qTable[stateKey][actionKey] = oldQ + this.learningRate * 
            (reward + this.discountFactor * maxNextQ - oldQ);
            
        this.cumulativeReward += reward;
        
        console.log(`[BOT LEARNING] Updated Q-value for ${actionKey}: ${oldQ.toFixed(2)} -> ${this.qTable[stateKey][actionKey].toFixed(2)}, Reward: ${reward.toFixed(2)}`);
    }
    
    // Make sure executeBuy shows ASCII art
    executeBuy(productKey, options = {}) {
        try {
            // Extract options
            const isExploration = options.isExploration || false;
            
            // Switch to the product
            const dropdown = document.getElementById('product-dropdown');
            if (!dropdown) {
                console.error("[BOT] Product dropdown not found");
                return false;
            }
            
                dropdown.value = productKey;
                dropdown.dispatchEvent(new Event('change'));
                currentProduct = productKey;
            
            // Add a longer delay to ensure price elements are fully updated
            // This allows time for getRandomPrice() to complete and update the DOM
            return new Promise(resolve => {
                setTimeout(() => {
                    // Force an update of prices to ensure fresh random values
                    updatePrices();
                    
                    // Add another small delay after explicitly updating prices
                    setTimeout(() => {
                        this._completeBuy(productKey, resolve, isExploration);
                    }, 100);
                }, 250); // 250ms primary delay
            });
        } catch (error) {
            console.error("[BOT EXECUTE BUY ERROR]", error);
            return false;
        }
    }
    
    // Helper method to complete the buying process after price generation
    _completeBuy(productKey, callback, isExploration = false) {
        try {
            // Get current product price and information
            const buyPrice = parseInt(document.getElementById('buy-price').textContent.replace(/[^0-9]/g, ''));
            let buyQuantity = parseInt(document.getElementById('quantity').value);
            let batchSize = 1; // Default to buying one unit
            
            // Skip if product is not eligible for buying
            if (!buyPrice || buyPrice <= 0 || isNaN(buyPrice)) {
                console.log(`[BOT] Invalid buy price for ${productKey}`);
                if (callback) callback(false);
                return false;
            }
            
            // Track if we take a loan for this purchase (for reward calculation)
            const startingBankroll = window.bankroll || 0;
            const initialLoanBalance = window.loanBalance || 0;
            let tookLoanForPurchase = false;
            
            // Check if we need a loan before buying - don't allow negative bankroll
            if (bankroll < buyPrice) {
                // Need to take a loan
                const maxLoanAmount = 5000000; // Maximum loan allowed
                
                if (loanBalance >= maxLoanAmount) {
                    console.log("[BOT] Cannot buy: At maximum loan limit");
                    setTimeout(callback, 100);
                    return;
                }

                // Calculate how much cash we want
                const desiredCash = buyPrice * 1.2; // Buy price plus 20% buffer
                    const loanNeeded = Math.min(desiredCash - bankroll, maxLoanAmount - loanBalance);
                    
                    if (loanNeeded > 0) {
                        console.log(`[BOT] Taking loan of $${loanNeeded.toLocaleString()} to fund purchase`);
                        const loanSuccess = takeLoan(loanNeeded, true);
                        
                        if (loanSuccess) {
                            this.lastLoanTime = Date.now();
                            console.log(`[BOT] New bankroll after loan: $${bankroll.toLocaleString()}`);
                        tookLoanForPurchase = true; // Mark that we took a loan for this purchase
                        } else {
                            console.log("[BOT] Failed to get loan");
                            // Shift strategy to capital accumulation mode
                            console.log("[BOT] Shifting strategy to capital accumulation mode");
                        setTimeout(callback, 100);
                        return;
                    }
                }
            }
            
            // Recalculate affordable quantity based on current bankroll
            let maxQuantity = Math.floor(bankroll / buyPrice);
            
            // If can't afford even 1 unit, abort
            if (maxQuantity <= 0) {
                console.log("[BOT] Cannot afford to buy any units of", productKey);
                if (callback) callback(false);
            return false;
        }

            // Calculate days remaining to adjust buying strategy
            const daysRemaining = totalSecondsRemaining / 86400;
            
            // Define smart batch sizes for buying
            const getBuyBatchSize = (maxAffordable, price) => {
                // Calculate a reasonable batch size based on affordability and days remaining
                if (maxAffordable <= 10) return maxAffordable; // Buy all we can if it's only a few
                if (maxAffordable <= 100) return Math.max(10, Math.floor(maxAffordable * 0.4)); // ~40% if under 100
                if (maxAffordable <= 1000) return Math.max(100, Math.floor(maxAffordable * 0.3)); // ~30% if under 1000
                if (maxAffordable <= 10000) return Math.max(500, Math.floor(maxAffordable * 0.25)); // ~25% if under 10K
                return Math.max(1000, Math.floor(maxAffordable * 0.2)); // ~20% for huge quantities
            };
            
            // Determine buy quantity based on game state
            let quantity;
            
            // In final days, reduce purchase quantities
            if (daysRemaining <= 2) {
                // In final 2 days, only buy if price is exceptionally good
                const priceFactor = this.isExceptionalBuyPrice(productKey, buyPrice) ? 0.3 : 0.1;
                quantity = Math.max(1, Math.floor(maxQuantity * priceFactor));
                console.log(`[BOT] LATE GAME: Buying small batch of ${quantity} ${productKey} (${Math.round(priceFactor * 100)}% of max) with ${daysRemaining.toFixed(1)} days left`);
            }
            else if (daysRemaining <= 5) {
                // In final week, buy reduced quantities
                const priceFactor = this.isExceptionalBuyPrice(productKey, buyPrice) ? 0.5 : 0.2;
                quantity = Math.max(1, Math.floor(maxQuantity * priceFactor));
                console.log(`[BOT] END GAME APPROACH: Moderate buying of ${quantity} ${productKey} (${Math.round(priceFactor * 100)}% of max)`);
            }
            else if (isExploration) {
                // In exploration mode, buy a random percentage between 10% and 30% of max affordable
                const buyPercentage = 0.1 + (Math.random() * 0.2); // 10-30%
                quantity = Math.max(1, Math.floor(maxQuantity * buyPercentage));
                // Cap at the default batch size to avoid buying too much during exploration
                quantity = Math.min(quantity, getBuyBatchSize(maxQuantity, buyPrice));
                console.log(`[BOT EXPLORATION] Buying ${quantity} units (${Math.round(buyPercentage * 100)}% of max ${maxQuantity}) for price testing`);
            } else {
                // In normal mode, use the incremental batch size logic
                quantity = getBuyBatchSize(maxQuantity, buyPrice);
                console.log(`[BOT] Buying batch of ${quantity} of max ${maxQuantity} ${productKey} (incremental strategy)`);
            }
            
            // Ensure at least 1 unit and never more than maxQuantity
            quantity = Math.max(1, Math.min(quantity, maxQuantity));
            
            // Set quantity input
            const quantityInput = document.getElementById('quantity');
            if (quantityInput) {
                quantityInput.value = quantity;
            }
            
            // Record bankroll before purchase for verification
            const preTransactionBankroll = bankroll;
            const expectedCost = quantity * buyPrice;
            
            // Verify we won't go negative
            if (expectedCost > preTransactionBankroll) {
                console.warn(`[BOT] Aborting purchase that would cause negative bankroll: Cost $${expectedCost.toLocaleString()} > Bankroll $${preTransactionBankroll.toLocaleString()}`);
                if (callback) callback(false);
                return false;
            }
            
            // Execute the buy
            console.log(`[BOT] Buying ${quantity} ${productKey} at $${buyPrice.toLocaleString()}`);
            const success = buyProduct();
            
            // Record transaction details on success
            if (success) {
                // Show ASCII art for successful purchase
                showAsciiArt('buy');
                
                this.tradesMade++; // Count successful trades
                
                // Check if we learned new price information from this transaction
                let priceDataChanged = false;
                
                // Get current price data for this product
                const priceData = this.highLowPriceMemory.get(productKey) || { 
                    min: buyPrice, 
                    max: buyPrice,
                    transactions: []
                };
                
                // Check if we found a new min/max buy price
                if (buyPrice < priceData.min) {
                    priceData.min = buyPrice;
                    priceDataChanged = true;
                    console.log(`[BOT] Discovered new minimum buy price for ${productKey}: $${buyPrice}`);
                }
                
                if (buyPrice > priceData.max) {
                    priceData.max = buyPrice;
                    priceDataChanged = true;
                    console.log(`[BOT] Discovered new maximum buy price for ${productKey}: $${buyPrice}`);
                }
                
                // Update last buy price
                priceData.lastBuyPrice = buyPrice;
                
                // Update price memory
                this.highLowPriceMemory.set(productKey, priceData);
                
                // Store transaction with exploration flag and price data info
                this.transactions.push({
                    type: 'buy',
                    product: productKey,
                    quantity: quantity,
                    price: buyPrice,
                    total: expectedCost,
                    timestamp: Date.now(),
                    isExploration: isExploration,
                    priceDataChanged: priceDataChanged
                });
                
                // Record analytics for learning
                this.lastState = this.getCurrentState();
                this.lastAction = 'buy:' + productKey;
                this.lastActionTimestamp = Date.now();
                
                // Increment product trade counter
                this.currentProductTrades++;
                
                // Calculate and learn from reward
                const reward = this.calculateReward();
                if (reward !== null) {
                    this.updateQTable(this.previousState, this.lastAction, reward, this.lastState);
                }
                
                // If we took a loan to make this purchase, add a reward
                if (tookLoanForPurchase) {
                    // Calculate the loan amount that was taken
                    const loanAmount = window.loanBalance - initialLoanBalance;
                    // Calculate the reward based on the purchase made
                    const purchaseValue = buyPrice * quantity;
                    const loanPurchaseRatio = purchaseValue / loanAmount;
                    
                    // Higher reward if the loan was efficiently used (purchase close to loan amount)
                    // Scale from 0 to 50 points based on how efficiently the loan was used
                    const efficiencyFactor = Math.min(loanPurchaseRatio, 1); // Cap at 1.0 (100% efficiency)
                    const loanBuyReward = 50 * efficiencyFactor;
                    
                    // Record the reward
                    console.log(`[BOT REWARD] +${loanBuyReward.toFixed(2)} for strategic loan of $${loanAmount.toLocaleString()} to buy ${productKey}`);
                    
                    // Reward will be factored into next reward calculation
                    // Store for use in calculateReward
                    if (!this.pendingRewards) {
                        this.pendingRewards = [];
                    }
                    this.pendingRewards.push(loanBuyReward);
                }
            }
            
            if (callback) callback(success);
            return success;
        } catch (error) {
            console.error("[BOT BUY ERROR]", error);
            if (callback) callback(false);
            return false;
        }
    }
    
    // Make sure executeSell shows ASCII art
    executeSell(productKey, options = {}) {
        try {
            // Check if we have inventory to sell
            if (!gameState.inventory[productKey] || gameState.inventory[productKey] <= 0) {
                console.log(`[BOT] No ${productKey} to sell`);
                return false;
            }

            // Determine if we are in exploration mode (passed from the caller)
            const isExploration = options.isExploration || false;

            // Switch to the product
            const dropdown = document.getElementById('product-dropdown');
            if (dropdown) {
                dropdown.value = productKey;
                dropdown.dispatchEvent(new Event('change'));
                currentProduct = productKey;
                
                // Add a longer delay to ensure price elements are fully updated
                // This allows time for getRandomPrice() to complete and update the DOM
                return new Promise(resolve => {
                    setTimeout(() => {
                        // Force an update of prices to ensure fresh random values
                        updatePrices();
                        
                        // Add another small delay after explicitly updating prices
                    setTimeout(() => {
                        this._completeSell(productKey, resolve, isExploration);
                        }, 100);
                    }, 250); // Increased from 150ms to 250ms for primary delay
                });
        } else {
                console.error("[BOT] Product dropdown not found");
                return false;
            }
        } catch (error) {
            console.error("[BOT EXECUTE SELL ERROR]", error);
            return false;
        }
    }
    
    // Helper method to complete the selling process after product switch
    _completeSell(productKey, callback, isExploration = false) {
        // Check both inventory systems and sync them if needed
        const regularInventory = inventory[productKey] || 0;
        const gameStateInventory = gameState.inventory[productKey] || 0;
        
        console.log(`[BOT SELL] Inventory check for ${productKey}: regular=${regularInventory}, gameState=${gameStateInventory}`);
        
        // If inventories don't match, sync them using the higher value
        if (regularInventory !== gameStateInventory) {
            const highestValue = Math.max(regularInventory, gameStateInventory);
            console.log(`[BOT SELL] Syncing inventories to ${highestValue}`);
            
            // Update both inventory systems
            inventory[productKey] = highestValue;
            gameState.inventory[productKey] = highestValue;
        }
        
        // Check if we have inventory to sell after syncing
        if (!gameState.inventory[productKey] || gameState.inventory[productKey] <= 0) {
            console.log(`[BOT] Cannot sell ${productKey}: no inventory available`);
            if (callback) callback(false);
            return;
        }

        try {
            // Get current product selection and set it to the product we want to sell
            const selectElement = document.getElementById('product-dropdown');
            if (!selectElement) {
                console.error("[BOT SELL ERROR] Product dropdown not found");
                if (callback) callback(false);
                return;
            }

            // Determine quantity to sell using incremental batch sizing
            const productInventory = gameState.inventory[productKey] || 0;
            let quantityToSell;
            
            // Calculate days remaining to adjust selling strategy
            const daysRemaining = totalSecondsRemaining / 86400;
            
            // Define batch sizes based on inventory size (powers of 10)
            const getBatchSize = (inventory) => {
                if (inventory <= 10) return inventory; // Sell all if 10 or fewer
                if (inventory <= 100) return Math.max(10, Math.floor(inventory * 0.3)); // ~30% if under 100 
                if (inventory <= 1000) return Math.max(100, Math.floor(inventory * 0.25)); // ~25% if under 1000
                if (inventory <= 10000) return Math.max(500, Math.floor(inventory * 0.2)); // ~20% if under 10000
                return Math.max(1000, Math.floor(inventory * 0.15)); // ~15% for huge inventories
            };
            
            // In final days, increase batch sizes to ensure liquidation
            if (daysRemaining <= 1) {
                // In the final day, sell everything
                quantityToSell = productInventory;
                console.log(`[BOT] FINAL DAY: Selling all ${productInventory} ${productKey}`);
            } 
            else if (daysRemaining <= 3) {
                // In final 3 days, sell larger batches (50-100%)
                const sellPercentage = 0.5 + ((3 - daysRemaining) * 0.25); // 50-100% based on urgency
                quantityToSell = Math.max(getBatchSize(productInventory), Math.floor(productInventory * sellPercentage));
                console.log(`[BOT] URGENT: Selling ${quantityToSell} of ${productInventory} ${productKey} (${(sellPercentage * 100).toFixed(1)}%) due to time constraints`);
            }
            else if (isExploration) {
                // In exploration mode, sell smaller batches to test prices
                // Randomize between 10%, 20%, 30% to test different price points
                const minBatchPercentage = 0.1;
                const maxBatchPercentage = 0.3;
                const sellPercentage = minBatchPercentage + (Math.random() * (maxBatchPercentage - minBatchPercentage));
                
                // Calculate quantity but ensure at least sensible batch size
                quantityToSell = Math.max(10, Math.floor(productInventory * sellPercentage));
                // Cap at the default batch size to avoid selling too much during exploration
                quantityToSell = Math.min(quantityToSell, getBatchSize(productInventory));
                
                console.log(`[BOT EXPLORATION] Selling ${quantityToSell} of ${productInventory} ${productKey} (${(sellPercentage * 100).toFixed(1)}%) to learn price patterns`);
            } 
            else {
                // In normal mode, use the incremental batch size logic
                quantityToSell = getBatchSize(productInventory);
                console.log(`[BOT] Selling batch of ${quantityToSell} of ${productInventory} ${productKey} (incremental strategy)`);
            }
            
            // Ensure we never try to sell more than available
            quantityToSell = Math.min(quantityToSell, productInventory);
            
            // Set the quantity input
                const quantityInput = document.getElementById('quantity');
                if (!quantityInput) {
                    console.error("[BOT SELL ERROR] Quantity input not found");
                    if (callback) callback(false);
                    return;
                }
            quantityInput.value = quantityToSell;
            
            // Get the sell price from UI elements - IMPORTANT: use the randomly generated price ranges
            const buyPriceElement = document.getElementById('buy-price');
            const sellPriceMinElement = document.getElementById('sell-price-range');
            const sellPriceMaxElement = document.getElementById('sell-price-max');
            
            // Read values from the DOM
            let buyPrice = 0;
            let sellPriceMin = 0;
            let sellPriceMax = 0;
            
            if (buyPriceElement && buyPriceElement.textContent) {
                buyPrice = parseInt(buyPriceElement.textContent.replace(/,/g, ''));
            }
            
            if (sellPriceMinElement && sellPriceMinElement.textContent) {
                sellPriceMin = parseInt(sellPriceMinElement.textContent.replace(/,/g, ''));
            }
            
            if (sellPriceMaxElement && sellPriceMaxElement.textContent) {
                sellPriceMax = parseInt(sellPriceMaxElement.textContent.replace(/,/g, ''));
            }
            
            // Strict check - only proceed if we have both min and max sell prices from the UI
            if (sellPriceMin <= 0 || sellPriceMax <= 0 || isNaN(sellPriceMin) || isNaN(sellPriceMax)) {
                console.error("[BOT SELL ERROR] UI price elements not properly populated", {
                    sellPriceMin,
                    sellPriceMax,
                    buyPrice
                });
                if (callback) callback(false);
                return;
            }
            
            // Generate a random sell price between min and max, just like a real city change would do
            const sellPrice = Math.floor(Math.random() * (sellPriceMax - sellPriceMin + 1)) + sellPriceMin;
            console.log(`[BOT SELL] Using random price from UI range: $${sellPrice} (range: $${sellPriceMin}-$${sellPriceMax})`);
            
            // Safety check for final price
            if (sellPrice <= 0) {
                console.error("[BOT SELL ERROR] Generated invalid sell price");
                    if (callback) callback(false);
            return;
        }
        
                // Calculate expected revenue
                const expectedRevenue = quantityToSell * sellPrice;
                
                // Store old values for verification
                const oldCash = gameState.cash;
                const oldInventory = gameState.inventory[productKey];
                
                // Determine if this is a high-value or exceptional sale
                const isExceptionalSale = sellPrice > (products[productKey].maxPrice * 0.8);
                
                // Log before attempting the sell
                console.log(`[BOT] Selling ${quantityToSell} ${products[productKey].name} at $${sellPrice}, expected revenue: $${expectedRevenue.toLocaleString()}`);
                
                // Execute the standard sell function instead of updating directly
                const success = sellProduct();
                
                // Record transaction details on success
                if (success) {
                    // Show ASCII art for successful sale
                    showAsciiArt('sell');
                    
                    this.tradesMade++; // Count successful trades
                    
                    // Check if we learned new price information from this transaction
                    let priceDataChanged = false;
                    
                    // Get current price data for this product
                    const priceData = this.highLowPriceMemory.get(productKey) || { 
                        min: sellPrice, 
                        max: sellPrice,
                        transactions: []
                    };
                    
                    // Check if we found a new min/max price
                    if (sellPrice < priceData.min) {
                        priceData.min = sellPrice;
                        priceDataChanged = true;
                        console.log(`[BOT] Discovered new minimum sell price for ${productKey}: $${sellPrice}`);
                    }
                    
                    if (sellPrice > priceData.max) {
                        priceData.max = sellPrice;
                        priceDataChanged = true;
                        console.log(`[BOT] Discovered new maximum sell price for ${productKey}: $${sellPrice}`);
                    }
                    
                    // Update last sell price
                    priceData.lastSellPrice = sellPrice;
                    
                    // Update price memory
                    this.highLowPriceMemory.set(productKey, priceData);
                    
                    // Record transaction with exploration flag and price data change info
                    this.transactions.push({
                        type: 'sell',
                        product: productKey,
                        quantity: quantityToSell,
                        price: sellPrice,
                        total: expectedRevenue,
                        timestamp: Date.now(),
                        isExploration: isExploration,
                        priceDataChanged: priceDataChanged
                    });
                    
                    // Record analytics for learning
                    this.lastState = this.getCurrentState();
                    this.lastAction = 'sell:' + productKey;
                    this.lastActionTimestamp = Date.now();
                    
                    // Monitor inventory rotation
                    this.currentProductTrades = 0; // Reset counter after selling
                    
                    // Calculate and learn from reward
                    const reward = this.calculateReward();
                    if (reward !== null) {
                        this.updateQTable(this.previousState, this.lastAction, reward, this.lastState);
                    }
                }
                
                if (callback) callback(success);
        } catch (error) {
            console.error("[BOT SELL ERROR]", error);
            if (callback) callback(false);
        }
    }

    // Make sure travel shows ASCII art
    travel() {
        try {
            // Get current city before travel
            const startingCity = city;
            
            // Execute travel
            console.log(`[BOT] Traveling from ${city}`);
            travel(); // Call the global travel function
            
            // Get the new travel messages about the destination city
            const travelMessages = [
                `${city} is where the action is tonight.`,
                `${city} is a town that never sleeps and neither do I.`,
                `In ${city}, the deals are always sweeter.`,
                `${city} calls to those who hear her ringing.`,
                `${city}... smells like opportunity.`,
                `Off to ${city}. Let's see what the weather brings.`,
                `${city}, where fortunes are made or lost.`,
                `${city}, time to get busy.`
            ];
            
            // Log a stylish bot travel message
            console.log(`[BOT TRAVEL] ${travelMessages[Math.floor(Math.random() * travelMessages.length)]}`);
            
            // Show ASCII art - travel() function already does this, but ensure it's visible
            showAsciiArt('travel');
            
            // Update timestamp and increment travel points
            this.lastActionTimestamp = Date.now();
            
            // Double the points earned when frequentFlyerPoints is already above 10
            const pointsToAdd = this.frequentFlyerPoints >= 10 ? 2 : 1;
            this.frequentFlyerPoints += pointsToAdd;
            
            // Log frequent flyer points progress
            const flightStatus = this.frequentFlyerPoints >= 10 ? 
                `${this.frequentFlyerPoints} (DOUBLED REWARDS ACTIVE)` : 
                `${this.frequentFlyerPoints}/10`;
            console.log(`[BOT TRAVEL] Frequent flyer points: ${flightStatus}`);
            
            // Record travel as a transaction for reward calculation
            this.transactions.push({
                type: 'travel',
                from: startingCity,
                to: city,
                timestamp: Date.now()
            });
            
            // Track city visit in cityActivity
        this.trackCityActivity();
        
            return true;
        } catch (error) {
            console.error("[BOT TRAVEL ERROR]", error);
            return false;
        }
    }

    // Add method to determine the most valuable product to sell
    getMostValuableProduct(productList) {
        if (!productList || productList.length === 0) return null;
        if (productList.length === 1) return productList[0];
        
        // Calculate estimated value for each product
        const productValues = productList.map(productKey => {
            const quantity = inventory[productKey] || 0;
            
            // Try to estimate current value from price memory
            let estimatedUnitValue = 0;
            
            if (this.highLowPriceMemory && this.highLowPriceMemory.has(productKey)) {
                const memory = this.highLowPriceMemory.get(productKey);
                
                // If we have a last price, use it
                if (memory.lastPrice) {
                    estimatedUnitValue = memory.lastPrice;
                }
                // Otherwise use average of high and low if available
                else if (memory.highPrice && memory.lowPrice) {
                    estimatedUnitValue = (memory.highPrice + memory.lowPrice) / 2;
                }
            }
            
            // Fallback to product definition if no memory
            if (estimatedUnitValue <= 0 && products[productKey]) {
                if (products[productKey].currentPrice) {
                    estimatedUnitValue = products[productKey].currentPrice;
                } else if (products[productKey].minPrice && products[productKey].maxPrice) {
                    estimatedUnitValue = (products[productKey].minPrice + products[productKey].maxPrice) / 2;
                }
            }
            
            // Calculate total estimated value
            const totalValue = quantity * estimatedUnitValue;
            
            return {
                productKey,
                quantity,
                estimatedUnitValue,
                totalValue
            };
        });
        
        // Sort by total value, highest first
        productValues.sort((a, b) => b.totalValue - a.totalValue);
        
        console.log("[BOT] Product value ranking for liquidation:", 
            productValues.map(p => `${p.productKey}: $${p.totalValue.toLocaleString()}`).join(', '));
        
        // Return the product with highest value
        return productValues[0].productKey;
    }

    // Get a simplified state representation for strategy decisions
    getStrategyState() {
        // Calculate normalized days remaining (1.0 to 0.0)
        const totalGameDays = 30;
        const daysRemaining = totalSecondsRemaining / 86400; // Convert seconds to days
        const daysRemainingNorm = Math.max(0, Math.min(1, daysRemaining / totalGameDays));
        
        // Calculate total inventory value for state representation
        const totalInventoryValue = this.calculateInventoryValue();
        
        // Calculate total wealth (bankroll + inventory)
        const totalWealth = bankroll + totalInventoryValue;
        
        // Calculate loan burden as a ratio of wealth
        const loanBurden = loanBalance > 0 ? loanBalance / Math.max(1, totalWealth) : 0;
        
        // Create a discrete state key for the Q-table
        return {
            wealth: this.discretizeValue(totalWealth, 0, 5000000, 5),
            cashRatio: this.discretizeValue(bankroll / Math.max(1, totalWealth), 0, 1, 5),
            loanBurden: this.discretizeValue(loanBurden, 0, 1, 3),
            gameProgress: this.discretizeValue(1 - daysRemainingNorm, 0, 1, 4) // 0=start, 3=end
        };
    }
    
    // Convert the strategy state object to a string key for the Q-table
    getStrategyStateKey(state) {
        if (!state) return 'unknown';
        return `w${state.wealth}:c${state.cashRatio}:l${state.loanBurden}:g${state.gameProgress}`;
    }
    
    // Get Q-values for a given strategy state
    getStrategyQValues(stateKey) {
        if (!this.strategyQTable[stateKey]) {
            // Initialize Q-values for new state
            this.strategyQTable[stateKey] = {};
            
            // Set initial Q-values for each strategy
            this.availableStrategies.forEach(strategy => {
                // Start with slightly randomized values for exploration
                this.strategyQTable[stateKey][strategy] = Math.random() * 0.1;
            });
        }
        
        return this.strategyQTable[stateKey];
    }
    
    // Select the best strategy based on current state
    selectStrategy() {
        // Get the current strategy state
        const strategyState = this.getStrategyState();
        const stateKey = this.getStrategyStateKey(strategyState);
        
        // Get Q-values for this state
        const qValues = this.getStrategyQValues(stateKey);
        
        // Emergency override for capital accumulation mode
        if (this.capitalAccumulationMode) {
            console.log("[BOT] Strategy selection: Forced 'liquidation' due to capital accumulation mode");
            return 'liquidation';
        }
        
        // Exploration vs exploitation
        if (Math.random() < this.explorationRate) {
            // Explore: choose a random strategy
            const randomStrategy = this.availableStrategies[
                Math.floor(Math.random() * this.availableStrategies.length)
            ];
            console.log(`[BOT] Strategy selection: Exploring with '${randomStrategy}'`);
            return randomStrategy;
        } else {
            // Exploit: choose best strategy by Q-value
            let bestStrategy = 'balanced'; // Default
            let bestQValue = -Infinity;
            
            for (const [strategy, qValue] of Object.entries(qValues)) {
                if (qValue > bestQValue) {
                    bestQValue = qValue;
                    bestStrategy = strategy;
                }
            }
            
            console.log(`[STRATEGY] Strategy selection: Best strategy is '${bestStrategy}' with Q-value ${bestQValue.toFixed(2)}`);
            return bestStrategy;
        }
    }
    
    // Update strategy Q-values based on reward
    updateStrategyQValue(prevStateKey, strategy, reward, nextStateKey) {
        if (!prevStateKey || !strategy) return;
        
        // Get current Q-value for the state-action pair
        const currentQ = this.strategyQTable[prevStateKey]?.[strategy] || 0;
        
        // Get max Q-value for next state
        let maxNextQ = 0;
        if (nextStateKey && this.strategyQTable[nextStateKey]) {
            maxNextQ = Math.max(...Object.values(this.strategyQTable[nextStateKey]));
        }
        
        // Q-learning update formula: Q(s,a) = Q(s,a) + α * [r + γ * max(Q(s',a')) - Q(s,a)]
        const newQ = currentQ + this.learningRate * (reward + this.discountFactor * maxNextQ - currentQ);
        
        // Ensure state exists in the Q-table
        if (!this.strategyQTable[prevStateKey]) {
            this.strategyQTable[prevStateKey] = {};
        }
        
        // Update the Q-value
        this.strategyQTable[prevStateKey][strategy] = newQ;
        
        console.log(`[STRATEGY] Strategy Q-update: ${strategy} in state ${prevStateKey}: ${currentQ.toFixed(2)} → ${newQ.toFixed(2)}`);
    }
    
    // Calculate strategy reward based on change in wealth
    calculateStrategyReward() {
        if (!this.lastStrategyState) return 0;
        
        // Previous wealth snapshot
        const prevBankroll = this.previousBankroll || 0;
        const prevInventoryValue = this.previousInventoryValue || 0;
        const prevTotalWealth = prevBankroll + prevInventoryValue;
        
        // Current wealth snapshot
        const currentBankroll = bankroll;
        const currentInventoryValue = this.calculateInventoryValue();
        const currentTotalWealth = currentBankroll + currentInventoryValue;
        
        // Calculate wealth change
        const wealthChange = currentTotalWealth - prevTotalWealth;
        const percentChange = prevTotalWealth > 0 ? wealthChange / prevTotalWealth : 0;
        
        // Base reward on percentage wealth change
        let reward = percentChange * 100; // Scale for better learning
        
        // Adjust for game progress stage - higher rewards later in game
        const daysRemaining = totalSecondsRemaining / 86400;
        const gameProgressFactor = Math.max(1, (30 - daysRemaining) / 10); // 1x at start, 3x at end
        reward *= gameProgressFactor;
        
        console.log(`[STRATEGY] Strategy reward: ${reward.toFixed(2)} (wealth change: ${wealthChange.toLocaleString()}, ${(percentChange * 100).toFixed(1)}%)`);
        
        // Update wealth tracking for next reward calculation
        this.previousBankroll = currentBankroll;
        this.previousInventoryValue = currentInventoryValue;
        
        return reward;
    }
    
    // Helper method to discretize a continuous value
    discretizeValue(value, min, max, bins) {
        if (value <= min) return 0;
        if (value >= max) return bins - 1;
        return Math.floor((value - min) / (max - min) * bins);
    }

    // Save Q-tables to localStorage
    saveQTables() {
        try {
            // Save strategy Q-table
            if (this.strategyQTable && this.strategyQTable instanceof Map) {
                localStorage.setItem('strategyQTable', JSON.stringify(Array.from(this.strategyQTable.entries())));
                console.log('[BOT] Saved strategy Q-table to localStorage');
            }
            
            // Save loan Q-table (regular object)
            if (this.loanQTable) {
                localStorage.setItem('loanQTable', JSON.stringify(this.loanQTable));
                console.log('[BOT] Saved loan Q-table to localStorage');
            }
            
            // Save main Q-table
            if (this.qTable && this.qTable instanceof Map) {
                // Convert Map to array of entries for serialization
                const entries = Array.from(this.qTable.entries());
                
                // Only save the most valuable entries to avoid localStorage limits
                if (entries.length > 1000) {
                    // Sort by highest Q-values
                    const sortedEntries = entries.sort((a, b) => {
                        const maxA = Math.max(...Object.values(a[1]));
                        const maxB = Math.max(...Object.values(b[1]));
                        return maxB - maxA;
                    });
                    
                    // Take top 1000 entries
                    const topEntries = sortedEntries.slice(0, 1000);
                    localStorage.setItem('qTable', JSON.stringify(topEntries));
        } else {
                    localStorage.setItem('qTable', JSON.stringify(entries));
                }
                
                console.log('[BOT] Saved main Q-table to localStorage');
            }
        } catch (e) {
            console.error('[BOT] Error saving Q-tables:', e);
        }
    }
    
    // Load Q-tables from localStorage
    loadQTables() {
        try {
            // Try to load bot knowledge first
            const savedKnowledge = localStorage.getItem('botKnowledge');
            if (savedKnowledge) {
                const knowledge = JSON.parse(savedKnowledge);
                
                // Restore frequentFlyerPoints if available
                if (knowledge.frequentFlyerPoints !== undefined) {
                    this.frequentFlyerPoints = knowledge.frequentFlyerPoints;
                    console.log(`[BOT] Loaded ${this.frequentFlyerPoints} frequent flyer points`);
                }
                
                // Restore other saved values
                if (knowledge.qValues) this.qValues = knowledge.qValues;
                if (knowledge.strategyQValues) this.strategyQValues = knowledge.strategyQValues;
                if (knowledge.priceHistory) this.priceHistory = knowledge.priceHistory;
                if (knowledge.explorationRate) this.explorationRate = knowledge.explorationRate;
                
                console.log('[BOT] Successfully loaded knowledge from previous sessions');
                return;
            }
            
            // Legacy loading code for backward compatibility
            // Load strategy Q-table
            const savedStrategyQTable = localStorage.getItem('strategyQTable');
            if (savedStrategyQTable) {
                const parsedData = JSON.parse(savedStrategyQTable);
                // Convert back to a Map if it was serialized as entries array
                this.strategyQTable = Array.isArray(parsedData) 
                    ? new Map(parsedData) 
                    : new Map(Object.entries(parsedData));
                console.log('[BOT] Loaded strategy Q-table from localStorage');
            }
            
            // Load main Q-table and other data
            // ... [rest of the code for legacy loading]
        } catch (e) {
            console.error('[BOT] Error loading knowledge:', e);
            // Reset values if loading fails
            this.frequentFlyerPoints = 0;
        }
    }

    // Get the current state for Q-learning decisions
    getCurrentState() {
        // Calculate total inventory value
        const inventoryValue = this.calculateInventoryValue();
        const totalWealth = bankroll + inventoryValue;
        
        // Get current city
        const currentCity = gameState.currentCity;
        
        // Calculate days remaining
        const daysRemaining = totalSecondsRemaining / 86400;
        
        // Calculate loan burden as a percentage of total wealth
        const loanBurden = loanBalance > 0 ? (loanBalance / totalWealth) : 0;
        
        // Calculate inventory diversity
        const productCount = Object.keys(products).length;
        const ownedProductCount = Object.values(inventory).filter(qty => qty > 0).length;
        const diversity = ownedProductCount / productCount;
        
        // Create a discretized state for Q-learning
        const state = {
            cashLevel: this.discretizeValue(bankroll, 0, 1000000, 10),
            totalWealthLevel: this.discretizeValue(totalWealth, 0, 2000000, 10),
            inventoryValueLevel: this.discretizeValue(inventoryValue, 0, 1000000, 5),
            loanBurdenLevel: this.discretizeValue(loanBurden, 0, 1, 3),
            daysRemainingLevel: this.discretizeValue(daysRemaining, 0, 30, 3),
            diversityLevel: this.discretizeValue(diversity, 0, 1, 3),
            cityIndex: cities.indexOf(currentCity),
            guns: guns
        };
        
        return state;
    }

    // Get action weights based on current strategy
    getActionWeightsForStrategy(strategy) {
        // Default balanced weights
        let actionWeights = { buy: 0.5, sell: 0.5, travel: 0.2 };
        
        // Adjust weights based on selected strategy
        switch(strategy) {
            case 'accumulation':
                // Accumulation strategy: focus heavily on buying
                actionWeights = { buy: 0.8, sell: 0.2, travel: 0.3 };
                break;
            case 'liquidation':
                // Liquidation strategy: focus on selling
                actionWeights = { buy: 0.1, sell: 0.9, travel: 0.4 };
                break;
            case 'aggressive':
                // Aggressive strategy: focus on both buying and selling, with more travel
                actionWeights = { buy: 0.7, sell: 0.7, travel: 0.5 };
                break;
            case 'conservative':
                // Conservative strategy: careful buying and selling
                actionWeights = { buy: 0.3, sell: 0.3, travel: 0.1 };
                break;
        }
        
        return actionWeights;
    }

    // Helper method to determine if a buy price is exceptionally good
    isExceptionalBuyPrice(productKey, currentPrice) {
        try {
            // Get product price data from memory
            const memory = this.highLowPriceMemory.get(productKey);
            if (!memory) {
                // If we don't have memory data, use product definition
                return currentPrice < (products[productKey].minPrice * 1.2);
            }
            
            // Calculate where in the range this price falls (0 = lowest possible, 1 = highest possible)
            const priceRange = memory.max - memory.min;
            if (priceRange <= 0) return false;
            
            const pricePosition = (currentPrice - memory.min) / priceRange;
            
            // Consider it exceptional if in the bottom 20% of observed prices
            return pricePosition <= 0.2;
        } catch (error) {
            console.error("[BOT] Error in isExceptionalBuyPrice:", error);
            return false;
        }
    }

    // Adapt the bot's learning strategy based on performance
    adaptStrategy() {
        // Ensure reward history is initialized
        if (!this.rewardHistory) {
            this.rewardHistory = [];
        }
        
        // Calculate recent average reward with validation
        const recentRewards = this.rewardHistory.slice(-10); // Last 10 rewards
        let avgReward = 0;
        
        if (recentRewards.length > 0) {
            const validRewards = recentRewards.filter(r => !isNaN(r) && typeof r === 'number');
            if (validRewards.length > 0) {
                avgReward = validRewards.reduce((sum, r) => sum + r, 0) / validRewards.length;
            }
        }
            
        console.log(`[STRATEGY] Average recent reward: ${avgReward.toFixed(2)}`);
        
        // Adjust exploration rate based on performance
        if (avgReward < 0) {
            // If we're doing poorly, increase exploration to find new strategies
            this.explorationRate = Math.min(0.8, this.explorationRate * 1.1);
            console.log(`[STRATEGY] Increasing exploration to ${this.explorationRate.toFixed(2)} due to poor performance`);
        } else if (avgReward > 10) {
            // If we're doing well, slightly reduce exploration to exploit current strategy
            this.explorationRate = Math.max(0.05, this.explorationRate * 0.95);
            console.log(`[STRATEGY] Decreasing exploration to ${this.explorationRate.toFixed(2)} to exploit successful strategy`);
        }
        
        // Reset game-specific tracking
        this.currentProductTrades = 0;
    }
};

// Function to update the strategy display for the bot
function updateStrategyDisplay() {
    try {
        // Check if bot controls exist
        const botControls = document.getElementById('bot-controls');
        if (!botControls) {
            // If no bot controls, create them first
            console.log('Bot controls not found, creating strategy display will be handled by createBotControls');
            return;
        }
        
        // Look for strategy display
        let strategyDisplay = document.getElementById('strategy-display');
        
        // If it doesn't exist, create it
        if (!strategyDisplay) {
            console.log('Creating strategy display container');
            
            strategyDisplay = document.createElement('div');
            strategyDisplay.id = 'strategy-display';
            strategyDisplay.className = 'strategy-display';
            
            const strategyLabel = document.createElement('span');
            strategyLabel.className = 'strategy-label';
            strategyLabel.textContent = 'Strategy: ';
            
            const currentStrategy = document.createElement('span');
            currentStrategy.id = 'current-strategy';
            currentStrategy.textContent = 'Initializing...';
            currentStrategy.className = 'current-strategy-value';
            
            strategyDisplay.appendChild(strategyLabel);
            strategyDisplay.appendChild(currentStrategy);
            
            // Add to bot controls
            botControls.appendChild(strategyDisplay);
        }
        
        // Update strategy text
        const currentStrategyElement = document.getElementById('current-strategy');
        if (currentStrategyElement) {
            if (!tradingBot || !botEnabled) {
            currentStrategyElement.textContent = "Bot inactive";
            } else {
                // Set strategy text based on bot's current strategy
        const strategy = tradingBot.getCurrentStrategy?.() || "Analyzing market";
        currentStrategyElement.textContent = strategy;
            }
        } else {
            console.warn('Strategy element not found even after creation attempt');
        }
        } catch (error) {
        console.error('[STRATEGY DISPLAY ERROR]', error);
    }
}

// Function to create bot controls in the UI
function createBotControls() {
    try {
        // Check if controls already exist
        if (document.getElementById('bot-controls')) {
            console.log('Bot controls already exist');
            // Ensure strategy display exists
            updateStrategyDisplay();
            // Ensure loan and bank pages are properly positioned
            positionBankAndLoanPages();
            return; // 
        }
        
        // Find the game container and its parent
        const gameContainer = document.getElementById('game-container');
        if (!gameContainer) {
            console.warn('Game container not found');
            return;
        }
        
        // Create bot controls container
        const botControlsContainer = document.createElement('div');
        botControlsContainer.id = 'bot-controls';
        botControlsContainer.className = 'bot-controls';
        
        // Create toggle button
        const toggleButton = document.createElement('button');
        toggleButton.id = 'bot-toggle';
        toggleButton.textContent = botEnabled ? 'Disable AI' : 'Enable AI';
        toggleButton.className = botEnabled ? 'bot-enabled' : 'bot-disabled';
        toggleButton.onclick = toggleAI;
        
        // Add the toggle button to the container
        botControlsContainer.appendChild(toggleButton);
        
        // Create strategy display immediately
        const strategyDisplay = document.createElement('div');
        strategyDisplay.id = 'strategy-display';
        strategyDisplay.className = 'strategy-display';
        
        const strategyLabel = document.createElement('span');
        strategyLabel.className = 'strategy-label';
        strategyLabel.textContent = 'Strategy: ';
        
        const currentStrategy = document.createElement('span');
        currentStrategy.id = 'current-strategy';
        currentStrategy.textContent = botEnabled && tradingBot ? (tradingBot.getCurrentStrategy?.() || 'Initializing...') : 'Bot inactive';
        currentStrategy.className = 'current-strategy-value';
        
        // Add elements to strategy display
        strategyDisplay.appendChild(strategyLabel);
        strategyDisplay.appendChild(currentStrategy);
        
        // Add strategy display to controls
        botControlsContainer.appendChild(strategyDisplay);
        
        // Add bot controls to the page
        gameContainer.parentElement.insertBefore(botControlsContainer, gameContainer);
        
        console.log('Bot controls created successfully');
        
        // Ensure loan and bank pages are properly positioned
        positionBankAndLoanPages();
    } catch (error) {
        console.error('[BOT CONTROLS ERROR]', error);
    }
}

// Add toggleAI function if it doesn't exist
function toggleAI() {
    botEnabled = !botEnabled;
    
    const toggleButton = document.getElementById('bot-toggle');
    if (toggleButton) {
        toggleButton.textContent = botEnabled ? 'Disable AI' : 'Enable AI';
        toggleButton.className = botEnabled ? 'bot-enabled' : 'bot-disabled';
    }
    
    // Update UI to show bot status
    updateBotStatusIndicator(botEnabled);
    
    if (botEnabled) {
        if (tradingBot) {
            tradingBot.startTrading();
        } else {
            tradingBot = new TradingBot();
            window.bot = tradingBot;
        }
        logEvent("AI trader activated - manual controls disabled");
        // Update strategy display when bot is enabled
        updateStrategyDisplay();
        
    } else {
        if (tradingBot) {
            tradingBot.stopTrading();
        }
        logEvent("AI trader deactivated - manual controls enabled");
        // Update strategy display when bot is disabled
    updateStrategyDisplay();
        
        // Clear the strategy update interval
        if (window.strategyUpdateInterval) {
            clearInterval(window.strategyUpdateInterval);
            window.strategyUpdateInterval = null;
        }
    }
}

// Function to update the bot status indicator in the UI
function updateBotStatusIndicator(isActive) {
    // Remove existing indicator if it exists
    const existingIndicator = document.getElementById('bot-status-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    if (isActive) {
        // Create bot active indicator
        const indicator = document.createElement('div');
        indicator.id = 'bot-status-indicator';
        indicator.innerHTML = `
            <div class="status-pulse"></div>
            <div class="status-text">AI BOT ACTIVE</div>
            <div class="status-subtext">Manual controls disabled</div>
            <div class="status-subtext">Press <kbd>B</kbd> to disable</div>
        `;
        indicator.style.cssText = `
            position: fixed;
            top: 50px;
            left: 20px;
            background-color: rgba(0, 0, 0, 0.8);
            color: #00ff00;
            padding: 10px 15px;
            border-radius: 5px;
            border-left: 4px solid #00ff00;
            font-family: 'Lucida Console', monospace;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            align-items: center;
            box-shadow: 0 0 15px rgba(0, 255, 0, 0.5);
        `;
        document.body.appendChild(indicator);
        
        // Apply styles to the status elements
        const style = document.createElement('style');
        style.textContent = `
            .status-pulse {
                width: 12px;
                height: 12px;
                background-color: #00ff00;
                border-radius: 50%;
                margin-bottom: 5px;
                animation: pulse 1.5s infinite;
            }
            
            @keyframes pulse {
                0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 255, 0, 0.7); }
                70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(0, 255, 0, 0); }
                100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 255, 0, 0); }
            }
            
            .status-text {
                font-weight: bold;
                font-size: 1.1em;
                margin-bottom: 5px;
                color: #00ff00;
                text-shadow: 0 0 10px #00ff00, 0 0 20px #00ff00, 0 0 30px rgba(0, 255, 0, 0.5);
            }
            
            .status-subtext {
                font-size: 0.8em;
                color: #aaa;
                margin-bottom: 3px;
            }
            
            #bot-status-indicator kbd {
                font-size: 0.9em;
                background-color: #333;
                padding: 1px 3px;
                border-radius: 3px;
            }
        `;
        document.head.appendChild(style);
    }
}

// Also need to modify handleKeyboardNavigation to disable game controls when bot is active
document.addEventListener('DOMContentLoaded', function() {
    // Update game controls when bot is active
    const actionButtons = ['buy-button', 'sell-button', 'travel-button'];
    
    // Define function to update button disabled state
    function updateButtonsState(disabled) {
        actionButtons.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.disabled = disabled;
                if (disabled) {
                    button.setAttribute('data-original-title', button.title || '');
                    button.title = 'Disabled while AI Bot is active';
                    button.classList.add('bot-control-disabled');
                } else {
                    button.title = button.getAttribute('data-original-title') || '';
                    button.classList.remove('bot-control-disabled');
                }
            }
        });
        
        // Also update quantity input
        const quantityInput = document.getElementById('quantity');
        if (quantityInput) {
            quantityInput.disabled = disabled;
            if (disabled) {
                quantityInput.setAttribute('data-original-placeholder', quantityInput.placeholder || '');
                quantityInput.placeholder = 'Bot Active';
            } else {
                quantityInput.placeholder = quantityInput.getAttribute('data-original-placeholder') || '';
            }
        }
    }
    
    // Add observer to watch for bot toggle button class changes
    const botToggleButton = document.getElementById('bot-toggle');
    if (botToggleButton) {
        // Set initial state
        if (typeof botEnabled !== 'undefined' && botEnabled) {
            updateButtonsState(true);
            updateBotStatusIndicator(true);
        }
        
        // Add mutation observer to watch for class changes
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'class') {
                    const isEnabled = botToggleButton.classList.contains('bot-enabled');
                    updateButtonsState(isEnabled);
                }
            });
        });
        
        observer.observe(botToggleButton, { attributes: true });
    }
    
    // Add style for disabled buttons
    const style = document.createElement('style');
    style.textContent += `
        .bot-control-disabled {
            opacity: 0.5;
            cursor: not-allowed;
            position: relative;
        }
        
        .bot-control-disabled::after {
            content: "🤖";
            position: absolute;
            top: 2px;
            right: 2px;
            font-size: 0.7em;
        }
    `;
    document.head.appendChild(style);
});

// Add this function near the other player action functions
function handlePlayerAction() {
    // Increment transaction count
    transactionCount++;
    
    // Check for random events based on transaction count
    if (transactionCount % 5 === 0 && Math.random() < 0.3) {
        randomEvent();
    }
    
    // Save game state
    saveGameState();
}

// Add this new function after formatTime() function
function startGameTimerDisplay() {
    // Clear any existing timer
    if (window.gameTimerInterval) {
        clearInterval(window.gameTimerInterval);
        window.gameTimerInterval = null;
    }
    
    // Ensure gameTime is set to match totalSecondsRemaining
    if (typeof totalSecondsRemaining !== 'undefined') {
        gameTime = totalSecondsRemaining;
    } else if (typeof gameTime === 'undefined') {
        gameTime = 30 * 86400; // Default to 30 days if no value exists
    }
    
    // Update the timer display every 100ms for smooth updates
    window.gameTimerInterval = setInterval(() => {
        const timeDisplay = document.getElementById('time-display');
        if (timeDisplay) {
            // Always use totalSecondsRemaining for display if available
            if (typeof totalSecondsRemaining !== 'undefined') {
                timeDisplay.textContent = formatTime(totalSecondsRemaining);
            } else if (typeof gameTime !== 'undefined') {
                timeDisplay.textContent = formatTime(gameTime);
            } else {
                timeDisplay.textContent = "Time error";
            }
        }
        
        // Check if game should end here as a fallback
        if ((totalSecondsRemaining === 0 || gameTime === 0) && window.gameTimerInterval) {
            if (tradingBot && tradingBot.isTrading) {
                tradingBot.stopTrading();
            }
            showGameOver();
            clearInterval(window.gameTimerInterval);
            window.gameTimerInterval = null;
        }
    }, 100);
}

// Modify the startNewGame function to start the timer display
function startNewGame() {
    // ... existing code ...
    
    // Initialize game variables
    currentCity = cities[0];
    gameTime = 60 * 60 * 24 * 30; // Start with 30 days
    bankroll = 2000;
    inventory = {};
    Object.keys(products).forEach(product => {
        inventory[product] = 0;
    });
    loan = 0;
    deposited = 0;
    currentProduct = 'Weed';
    gunOwned = false;
    dayInterval = null;
    randomEventsDisabled = false;
    loggedEvents = [];
    
    // Initialize game statistics tracking
    gameStats = {
        policeRaids: 0,
        robberEncounters: 0,
        successfulDefenses: 0,
        citiesVisited: 0,
        totalTrades: 0
    };
    
    // Start the continuous timer display
    startGameTimerDisplay();
    
    // ... rest of existing code ...
}

// Modify the loadGameState function to restart the timer display when loading a game
function loadGameState() {
    // ... existing code ...
    
    updateUI();

    
    // Start the continuous timer display for the loaded game
    startGameTimerDisplay();
    
    // ... rest of existing code ...
}

// Add cleanup for the timer in the gameOver function or anywhere the game ends
function hideGameOver() {
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    
    // Clear the game timer interval when game is over
    if (window.gameTimerInterval) {
        clearInterval(window.gameTimerInterval);
        window.gameTimerInterval = null;
    }
}

// Add this function after hideGameOver to properly show the game over screen
function showGameOver() {
    console.log("[GAME OVER] Function called");
    
    // Prevent multiple calls
    if (document.getElementById('game-over').classList.contains('showing')) {
        console.log("[GAME OVER] Already showing, ignoring duplicate call");
        return;
    }
    
    // Mark game as over to prevent further actions
    if (gameState) {
        gameState.gameActive = false;
    }
    
    // Calculate total net worth - EXCLUDING inventory value
    const inventoryValue = calculateTotalInventoryValue();
    // Modified: Remove inventoryValue from netWorth calculation
    const netWorth = bankroll + bankBalance - loanBalance;
    
    // Get the game over container
    const gameOverElement = document.getElementById('game-over');
    if (!gameOverElement) {
        console.error("Game over element not found");
        return;
    }
    
    // Flag to prevent multiple game over screens
    gameOverElement.classList.add('showing');
    
    // Clear all game intervals immediately
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
        console.log("[GAME OVER] Cleared game interval");
    }
    
    if (window.gameTimerInterval) {
        clearInterval(window.gameTimerInterval);
        window.gameTimerInterval = null;
        console.log("[GAME OVER] Cleared timer interval");
    }
    
    // Stop the trading bot if active
    if (tradingBot) {
        tradingBot.stopTrading();
        console.log("[GAME OVER] Stopped trading bot");
        
        // Save just the bot's knowledge state for future games
        const botKnowledge = tradingBot.saveState();
        localStorage.setItem('botKnowledge', JSON.stringify(botKnowledge));
        console.log("[GAME OVER] Saved bot knowledge for future games");
    }
    
    // Update financial stats
    document.getElementById('final-cash').textContent = bankroll.toLocaleString();
    document.getElementById('final-bank').textContent = bankBalance.toLocaleString();
    document.getElementById('final-loans').textContent = loanBalance.toLocaleString();
    document.getElementById('final-networth').textContent = netWorth.toLocaleString();
    
    // Add note about inventory not counting toward net worth
    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        const noteElement = document.createElement('div');
        noteElement.className = 'stat-row info-note';
        noteElement.innerHTML = '<span class="stat-note">Note: Unsold inventory is not counted in final net worth.</span>';
        statsSection.appendChild(noteElement);
    }
    
    // Update gameplay stats
    document.getElementById('cities-visited').textContent = (citiesVisitedCount || 0).toString();
    document.getElementById('raids-survived').textContent = (raidsSurvivedCount || 0).toString();
    document.getElementById('robber-encounters').textContent = (robberEncountersCount || 0).toString();
    document.getElementById('successful-defenses').textContent = (successfulDefensesCount || 0).toString();
    document.getElementById('total-trades').textContent = (totalTradesCount || 0).toString();
    
    // Update AI stats from the trading bot if available
    if (tradingBot) {
        document.getElementById('ai-trades').textContent = tradingBot.tradesMade.toString();
        document.getElementById('travel-points').textContent = Object.keys(tradingBot.qTable).length.toString();
        // Removed avg-reward reference
        document.getElementById('learning-rate').textContent = tradingBot.learningRate.toFixed(3);
        document.getElementById('exploration-rate').textContent = tradingBot.explorationRate.toFixed(3);
    } else {
        // If tradingBot is not available, set default values
        document.getElementById('ai-trades').textContent = "0";
        document.getElementById('travel-points').textContent = "0";
        // Removed avg-reward reference
        document.getElementById('learning-rate').textContent = "0.000";
        document.getElementById('exploration-rate').textContent = "0.000";
    }
    
    // Show game over screen, hide game container
    gameOverElement.classList.remove('hidden');
    document.getElementById('game-container').classList.add('hidden');
    
    console.log("[GAME OVER] Final net worth (excluding inventory): $" + netWorth.toLocaleString());
    if (inventoryValue > 0) {
        console.log("[GAME OVER] Unsold inventory value (not counted): $" + inventoryValue.toLocaleString());
    }
    
    // Auto-restart if bot is enabled (bot playing = auto-restart on)
    if (botEnabled && tradingBot) {
        console.log("[GAME OVER] Bot is enabled, auto-restarting in 3 seconds...");
        setTimeout(() => {
            restartGame();
        }, 3000);
    }
}

// Add helper function to calculate total inventory value
function calculateTotalInventoryValue() {
    let totalValue = 0;
    for (const [productKey, quantity] of Object.entries(inventory)) {
        if (quantity > 0 && products[productKey]) {
            // Use currentPrice if available, otherwise use average of min and max price
            const currentPrice = products[productKey].currentPrice || 
                Math.floor((products[productKey].minPrice + products[productKey].maxPrice) / 2);
            totalValue += quantity * currentPrice;
        }
    }
    return totalValue;
}

// Game statistics tracking
let citiesVisitedCount = 0;
let visitedCities = [];
let raidsSurvivedCount = 0;
let robberEncountersCount = 0;
let successfulDefensesCount = 0;
let totalTradesCount = 0;

// Initialize event handlers
// Ensure bot continues when tab is in background
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        console.log('[BOT] Tab hidden - bot will continue running in background');
    } else {
        console.log('[BOT] Tab visible - updating UI');
        // Update UI when tab becomes visible again
        if (typeof updateUI === 'function') {
            updateUI();
        }
        if (typeof updateStrategyDisplay === 'function') {
            updateStrategyDisplay();
        }
    }
});

window.addEventListener('load', function() {
    // Disable the bank and loan buttons since they're not working correctly
    const bankButton = document.getElementById('bank-button');
    const loanButton = document.getElementById('loan-button');
    
    if (bankButton) {
        bankButton.disabled = true;
        bankButton.title = 'Currently unavailable';
        bankButton.onclick = function(e) {
            e.preventDefault();
            logEvent('Bank feature is currently unavailable', 'info');
            return false;
        };
    }
    
    if (loanButton) {
        loanButton.disabled = true;
        loanButton.title = 'Currently unavailable';
        loanButton.onclick = function(e) {
            e.preventDefault();
            logEvent('Loan feature is currently unavailable', 'info');
            return false;
        };
    }
    
    initProductDropdown();
    updatePrices();
    updateUI();
    
    // Start background music for initial location
    // Wait a bit for audio to load, then start music
    setTimeout(() => {
        if (typeof window !== 'undefined' && window.backgroundMusic && city) {
            window.backgroundMusic.startMusicForLocation(city);
            window.backgroundMusic.updateToggleUI();
        }
    }, 500);
    
    // Audio toggle button
    const audioToggle = document.getElementById('audio-toggle');
    if (audioToggle) {
        audioToggle.addEventListener('click', function() {
            if (typeof window !== 'undefined' && window.backgroundMusic) {
                window.backgroundMusic.toggle();
            }
        });
    }
    
    // Travel button
    document.getElementById('travel-button').addEventListener('click', travel);
    
    // Buy button
    document.getElementById('buy-button').addEventListener('click', buyProduct);
    
    // Sell button
    document.getElementById('sell-button').addEventListener('click', sellProduct);
    
    // Bank button
    document.getElementById('bank-button').addEventListener('click', function() {
        switchPage('bank-page');
        showAsciiArt('bank');
    });
    
    // Loan button
    document.getElementById('loan-button').addEventListener('click', function() {
        switchPage('loan-page');
        showAsciiArt('loan');
    });
    
    // Game Over close button 
    document.getElementById('close-game-over').addEventListener('click', function() {
        hideGameOver();
        // Do NOT make game container visible - leave it hidden
        // This ensures only the console remains visible
    });
    
    // Restart game button
    const restartBtn = document.getElementById('restart-game-btn');
    if (restartBtn) {
        restartBtn.addEventListener('click', function() {
            restartGame();
        });
    }
    
    // Initialize loan page controls
    initLoanPage();
    
    // Initialize bank page controls
    initBankPage();
    
    // Ensure loan and bank pages are properly positioned
    //positionBankAndLoanPages();
    
    // ... existing code ...
});

// Function to hide the game over screen
function hideGameOver() {
    const gameOverElement = document.getElementById('game-over');
    if (gameOverElement) {
        gameOverElement.classList.add('hidden');
        gameOverElement.classList.remove('showing');
    }
    
    // Keep game container hidden - only console should be visible
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
        gameContainer.classList.add('hidden');
    }
}

// Function to restart the game
function restartGame() {
    console.log("[GAME] Restarting game...");
    
    // Hide game over screen
    const gameOverElement = document.getElementById('game-over');
    if (gameOverElement) {
        gameOverElement.classList.add('hidden');
        gameOverElement.classList.remove('showing');
    }
    
    // Show game container
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
        gameContainer.classList.remove('hidden');
    }
    
    // Clear any existing intervals
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }
    if (window.gameTimerInterval) {
        clearInterval(window.gameTimerInterval);
        window.gameTimerInterval = null;
    }
    
    // Stop bot if running
    if (tradingBot && tradingBot.actionInterval) {
        tradingBot.stopTrading();
    }
    
    // Reset game state variables
    city = "Silicon Valley";
    totalSecondsRemaining = 30 * 86400; // 30 days in seconds
    bankroll = 1000000;
    // Initialize inventory with all products set to 0
    inventory = Object.keys(products).reduce((acc, p) => {
        acc[p] = 0;
        return acc;
    }, {});
    bankBalance = 0;
    loanBalance = 0;
    guns = 0;
    
    // Reset game statistics
    citiesVisitedCount = 0;
    visitedCities = [];
    raidsSurvivedCount = 0;
    robberEncountersCount = 0;
    successfulDefensesCount = 0;
    totalTradesCount = 0;
    
    // Reset day message index
    if (typeof dayMessageIndex !== 'undefined') {
        dayMessageIndex = 0;
    }
    
    // Initialize starting city as visited
    visitedCities.push("Silicon Valley");
    citiesVisitedCount = 1;
    
    // Reset game state object
    if (gameState) {
        gameState.gameActive = true;
        gameState.city = city;
        gameState.bankroll = bankroll;
        gameState.inventory = inventory;
        gameState.bankBalance = bankBalance;
        gameState.loanBalance = loanBalance;
        gameState.guns = guns;
    }
    
    // Initialize game statistics tracking
    gameStats = {
        policeRaids: 0,
        robberEncounters: 0,
        successfulDefenses: 0,
        citiesVisited: 1,
        totalTrades: 0
    };
    
    // Reset the bot's exploration rate for the new game
    if (tradingBot && typeof tradingBot.resetForNewGame === 'function') {
        tradingBot.resetForNewGame();
        console.log('[GAME] Reset bot exploration rate for new game');
    }
    
    // Initialize product dropdown
    if (typeof initProductDropdown === 'function') {
        initProductDropdown();
    }
    
    // Start the game timer
    if (typeof startGameTimerDisplay === 'function') {
        startGameTimerDisplay();
    }
    
    // Start the game interval
    if (!gameInterval) {
        gameInterval = setInterval(trackDays, 1000);
    }
    
    // Update UI
    if (typeof updatePrices === 'function') {
        updatePrices();
    }
    if (typeof updateUI === 'function') {
        updateUI();
    }
    
    // Start background music for new location
    if (typeof window !== 'undefined' && window.backgroundMusic && city) {
        window.backgroundMusic.startMusicForLocation(city);
    }
    
    // Start bot if it's enabled (bot enabled = auto-restart on)
    if (botEnabled && tradingBot) {
        // Small delay to ensure game is initialized
        setTimeout(() => {
            if (tradingBot && !tradingBot.actionInterval) {
                tradingBot.startTrading();
                console.log("[GAME] Bot started with new game");
            }
        }, 1000);
    }
    
    console.log("[GAME] Game restarted successfully");
}

// Function to reset AI learning data
function resetAI() {
    // Ensure window.bot references tradingBot
    window.bot = tradingBot;
    
    // Reset the AI's learning data
    if (window.bot) {
        // Call the bot's new reset method
        if (typeof window.bot.resetForNewGame === 'function') {
            window.bot.resetForNewGame();
            console.log('[GAME] Reset AI for new game with preserved knowledge');
        } else {
            // Fallback to traditional reset if the method doesn't exist
            // Reset Q-values
            window.bot.qValues = {};
            // Reset previous states
            window.bot.previousState = null;
            window.bot.previousAction = null;
            // Reset exploration rate to initial high value (0.9)
            window.bot.explorationRate = 0.9;
            console.log('[GAME] Reset AI with traditional method');
        }
        
        // Reset recent events tracking
        window.bot.recentEvents = {
            successfulTrades: 0,
            failedTrades: 0,
            robberEncounters: 0,
            policeRaids: 0,
            successfulDefenses: 0
        };
        
        // Reset other tracking metrics
        window.bot.lastReward = 0;
        window.bot.totalReward = 0;
        window.bot.actionCount = 0;
        
        console.log("AI learning data has been reset");
        updateStrategyDisplay(); // Update the strategy display after reset
    } else {
        console.warn("AI bot is not initialized, nothing to reset");
    }
}

// Add loan page event listeners (should be added in the document ready or init section)
function initLoanPage() {
    // Take loan button
    document.getElementById('take-loan-button').addEventListener('click', function() {
        const amount = parseInt(document.getElementById('loan-amount').value);
        if (takeLoan(amount)) {
            // Update loan balance display
            document.getElementById('loan-balance').textContent = loanBalance.toLocaleString();
        }
    });
    
    // Pay loan button
    document.getElementById('pay-loan-button').addEventListener('click', function() {
        const amount = parseInt(document.getElementById('loan-amount').value);
        if (payLoan(amount)) {
            // Update loan balance display
            document.getElementById('loan-balance').textContent = loanBalance.toLocaleString();
        }
    });
    
    // Back button
    document.getElementById('loan-back-button').addEventListener('click', function() {
        switchPage('game');
    });
    
    // Buy gun button
    document.getElementById('buy-gun-button').addEventListener('click', function() {
        buyGun();
        // Update loan page UI after buying a gun
        document.getElementById('loan-balance').textContent = loanBalance.toLocaleString();
    });
}

// Add initLoanPage to the document ready or init section
document.addEventListener('DOMContentLoaded', function() {
    // ... existing initialization code ...
    
    initLoanPage();
    
    // ... rest of initialization ...
});

// Add bank page event listeners
function initBankPage() {
    // Deposit button
    document.getElementById('deposit-button').addEventListener('click', function() {
        const amount = parseInt(document.getElementById('bank-amount').value);
        if (deposit(amount)) {
            // Update bank balance display
            document.getElementById('bank-balance').textContent = bankBalance.toLocaleString();
        }
    });
    
    // Withdraw button
    document.getElementById('withdraw-button').addEventListener('click', function() {
        const amount = parseInt(document.getElementById('bank-amount').value);
        if (withdraw(amount)) {
            // Update bank balance display
            document.getElementById('bank-balance').textContent = bankBalance.toLocaleString();
        }
    });
    
    // Back button
    document.getElementById('back-button').addEventListener('click', function() {
        switchPage('game');
    });
}

// Function to ensure loan and bank pages are properly positioned in the DOM
function positionBankAndLoanPages() {
    try {
        console.log("Positioning bank and loan pages...");
        
        // First, check if the game container is visible - if it's hidden, check why
        const gameContainer = document.getElementById('game-container');
        console.log("Game container visibility:", !gameContainer.classList.contains('hidden'));
        
        // Get the bot controls, page containers, and document body
        const botControls = document.getElementById('bot-controls');
        const loanPage = document.getElementById('loan-page');
        const bankPage = document.getElementById('bank-page');
        const body = document.body;
        
        // Log the elements and their current states
        console.log("Bot controls found:", !!botControls);
        console.log("Loan page found:", !!loanPage, "visible:", !loanPage.classList.contains('hidden'));
        console.log("Bank page found:", !!bankPage, "visible:", !bankPage.classList.contains('hidden'));
        
        // Ensure both pages exist in the DOM
        if (!loanPage) {
            console.error("Loan page element is missing from the DOM!");
            return;
        }
        
        if (!bankPage) {
            console.error("Bank page element is missing from the DOM!");
            return;
        }
        
        // If we're moving these, we need to ensure they're not already
        // in the process of being modified
        if (loanPage._beingProcessed || bankPage._beingProcessed) {
            console.log("Pages are already being processed, skipping");
            return;
        }
        
        loanPage._beingProcessed = true;
        bankPage._beingProcessed = true;
        
        // Ensure they're directly in the body for proper z-indexing and visibility
        if (loanPage.parentElement !== body) {
            body.appendChild(loanPage);
            console.log("Moved loan page to body");
        }
        
        if (bankPage.parentElement !== body) {
            body.appendChild(bankPage);
            console.log("Moved bank page to body");
        }
        
        // Update styles to ensure visibility when needed
        loanPage.style.position = 'fixed';
        loanPage.style.top = '100px';  // Position below nav
        loanPage.style.left = '50%';
        loanPage.style.transform = 'translateX(-50%)';
        loanPage.style.zIndex = '1000';
        
        bankPage.style.position = 'fixed';
        bankPage.style.top = '100px';  // Position below nav
        bankPage.style.left = '50%';
        bankPage.style.transform = 'translateX(-50%)';
        bankPage.style.zIndex = '1000';
        
        loanPage._beingProcessed = false;
        bankPage._beingProcessed = false;
        
        console.log('Bank and loan pages positioned correctly');
    } catch (error) {
        console.error('[POSITIONING ERROR]', error);
    }
}

// Initialize focusable elements for keyboard navigation
let focusableElements = ['buy', 'sell', 'travel', 'product-dropdown', 'quantity'];
let currentElementIndex = 0;
let currentFocus = focusableElements[currentElementIndex];

// Add keyboard navigation to the window
window.addEventListener('keydown', handleKeyboardNavigation);