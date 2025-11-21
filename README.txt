# DrugTrade Simulator

## Overview
DrugTrade Simulator is an interactive browser-based economic simulation game that models the dynamics of an underground market economy. The player navigates a fictional world of trading various illicit substances while managing inventory, bankroll, and risk factors like police raids and robber encounters.

## Installation and Setup

### Local Installation
1. Clone the repository or download the files
2. No build process required - this is pure HTML, CSS, and JavaScript
3. Open `index.html` in your browser to start playing

### Hosting Online
The game can be hosted on any static web server:
1. Upload all files to your web server
2. Ensure the server can serve HTML, CSS, and JavaScript files
3. Access the game through the URL where you uploaded the files

### Progressive Web App Features
The game includes PWA capabilities:
- Installable on mobile devices
- Service worker for offline functionality
- Responsive design for various screen sizes

## Features
- **Dynamic Market Economy**: Prices fluctuate based on supply, demand, and location
- **Multiple Cities**: Travel between different locations with unique market conditions
- **Banking System**: Store money safely to earn interest and avoid robberies
- **Loan System**: Borrow money for investment opportunities
- **Protection Mechanics**: Purchase guns to defend against robbers
- **Random Events**: Encounter police raids and robbers during gameplay
- **AI Trading Bot**: Advanced reinforcement learning bot that can play the game autonomously

## Game Mechanics

### Core Gameplay
The game revolves around buying products at low prices and selling them at higher prices to accumulate wealth. Players have a limited number of days (default 30) to maximize their net worth.

- **Buy/Sell**: Purchase products when prices are low, sell when prices are high
- **Travel**: Move between cities to find better market conditions
- **Bank**: Deposit or withdraw money from the bank for safekeeping
- **Loans**: Borrow money to increase purchasing power
- **Protection**: Buy guns to defend against robbers

### Products and Cities
The game features various products with different value ranges:

**Products:**
- Acid (LSD): Generally lower value, high volatility
- Coke (Cocaine): High value, medium volatility
- Heroin: Very high value, low volatility
- Speed (Methamphetamine): Medium value, high volatility
- Weed (Marijuana): Low value, low volatility
- MDMA (Ecstasy): Medium value, medium volatility

**Cities:**
- New York: Balanced market, moderate prices
- Miami: High demand for expensive products
- Los Angeles: Tech-focused with specific product preferences
- Chicago: Industrial hub with unique market dynamics
- Detroit: Lower-income area with different pricing patterns
- Boston: Academic center with specific demand patterns

Each city has unique pricing factors that affect the products differently, encouraging travel and exploration.

### Random Events
Random events occur throughout gameplay to add risk and unpredictability:

#### Police Raids
```javascript
function policeRaid() {
    // Police may confiscate products or be fought off with guns
    // Affects inventory and game statistics
}
```

#### Robber Encounters
```javascript
function robbers() {
    // Robbers may steal money or products unless player has guns
    // Updates game statistics and tracks successful defenses
}
```

### Market System
The market operates with dynamic pricing that changes based on:
- Current city
- Random fluctuations
- Product type
- Special events

```javascript
function updatePrices() {
    // Generates new random prices for all products
    // Takes into account city-specific price factors
}

function isExceptionalPrice(buyPrice, sellPrice, productKey) {
    // Determines if a price is exceptionally high or low
    // Used by the AI bot for decision making
}
```

## AI Trading Bot

The game includes a sophisticated AI trading bot that uses reinforcement learning to play the game autonomously.

### Bot Architecture
The bot is implemented as a class with multiple methods for different aspects of gameplay:

```javascript
class TradingBot {
    constructor(options = {}) {
        // Initializes bot parameters, learning rates, and state tracking
    }
    
    startTrading() {
        // Begins automated trading with periodic actions
    }
    
    stopTrading() {
        // Halts bot activities
    }
    
    // Many other methods for decision making and learning
}
```

### Reinforcement Learning Implementation
The bot uses Q-learning, a popular reinforcement learning algorithm:

#### State Representation
The bot discretizes continuous state values into bins for better learning:

```javascript
discretize(value, min, max, bins) {
    // Converts continuous values into discrete bins
    // Makes the state space more manageable for learning
}

getCurrentState() {
    // Creates a state representation with:
    // - Discretized bankroll
    // - Inventory levels
    // - Current prices relative to historical data
    // - Days remaining
    // - City information
}
```

#### Action Selection
The bot balances exploration (trying new actions) and exploitation (using known good actions):

```javascript
selectActionFromLearning(state, actionWeights) {
    // Uses epsilon-greedy approach:
    // - With probability epsilon: choose random action (exploration)
    // - Otherwise: choose best known action (exploitation)
    // Epsilon decreases over time as the bot learns
}
```

#### Reward Function
The reward function evaluates the effectiveness of actions:

```javascript
calculateReward(prevState, action, currentState) {
    // Primary reward is based on net worth change (logarithmically scaled)
    // Additional rewards for:
    // - Successful trades
    // - Surviving random events
    // - Making progress in the game
    // - Incremental trade success
    
    // Penalties for:
    // - Failed trades
    // - Holding inventory near game end
    // - Taking unnecessary risks
}
```

#### Q-Value Updates
The bot updates its knowledge using the Q-learning formula:

```javascript
updateQTable(state, action, reward, nextState) {
    // Q(s,a) = Q(s,a) + α[r + γ·max Q(s',a') - Q(s,a)]
    // Where:
    // - α is the learning rate
    // - γ is the discount factor
    // - r is the reward
    // - s is the current state
    // - a is the action taken
    // - s' is the next state
    // - max Q(s',a') is the best possible future value
}
```

#### Persistence
The bot saves its learned knowledge to localStorage:

```javascript
saveQTables() {
    // Saves Q-values to browser localStorage
    // Allows learning to persist between sessions
}

loadQTables() {
    // Loads previously learned Q-values
    // Enables continual improvement
}
```

### Trading Strategies
The bot employs different strategies based on market conditions and game state:

1. **URGENT LIQUIDATION**: Sell inventory quickly when the game is ending
2. **ACTIVE LIQUIDATION**: Gradually sell inventory as the game progresses
3. **PREPARATION PHASE**: Initial exploration and planning
4. **MARKET EXPLORATION**: Test different products and markets to gather data
5. **PROFIT TAKING**: Sell products at high prices to secure profits
6. **INVENTORY BUILDING**: Purchase products at low prices to build inventory
7. **EMERGENCY RECOVERY**: Actions when bankroll is critically low
8. **ACQUIRING PROTECTION**: Purchase guns when facing significant threats
9. **MARKET ANALYSIS**: Analyze price patterns across cities
10. **SEEKING SELL OPPORTUNITIES**: Look for optimal selling conditions
11. **PROFIT OPTIMIZATION**: Balance buying and selling for maximum returns

### Smart Batch Sizing
The bot uses intelligent batch sizing for both buying and selling:

```javascript
const getBatchSize = (inventory) => {
    // Determines optimal quantities to sell based on inventory size
    // Adjusts based on game progress and exploration needs
    if (inventory <= 10) return inventory; // Sell all if small amount
    if (inventory <= 100) return Math.ceil(inventory * 0.5); // Sell half if medium
    if (inventory <= 1000) return Math.ceil(inventory * 0.3); // Sell 30% if large
    return Math.ceil(inventory * 0.2); // Sell 20% if very large
}

const getBuyBatchSize = (maxAffordable, price) => {
    // Calculates reasonable batch sizes for buying
    // Ensures bot doesn't spend all its money at once
    if (maxAffordable <= 10) return maxAffordable;
    if (maxAffordable <= 50) return Math.ceil(maxAffordable * 0.8);
    if (maxAffordable <= 200) return Math.ceil(maxAffordable * 0.5);
    if (maxAffordable <= 500) return Math.ceil(maxAffordable * 0.3);
    return Math.ceil(maxAffordable * 0.2);
}
```

## User Interface

### Game Container
The main game interface displays:
- Bankroll and days remaining
- Inventory status
- Current city
- Protection level (guns)
- Market prices for products
- Action buttons (Buy, Sell, Travel, Bank, Loan)

### Console Log
A detailed console log provides game information:
- Transaction details
- Event notifications
- Bot activity logs
- Learning process updates
- Error messages

```javascript
function addLogToDOM(type, args) {
    // Formats and adds log entries to the console display
    // Handles different log types with appropriate styling
}
```

### Bot Controls
Controls to manage the AI bot:
- Toggle AI on/off
- Reset AI learning data
- View current bot strategy

```javascript
function toggleAI() {
    // Enables or disables the trading bot
    // Updates UI to show bot status
}

function updateStrategyDisplay() {
    // Updates the display showing the bot's current strategy
}
```

### Game Over Screen
When the game ends, a detailed results screen shows:
- Final net worth
- Cash on hand
- Bank balance
- Inventory value
- Outstanding loans
- Gameplay statistics
- AI performance metrics

## Time Management
The game operates on a day-based timer system:

```javascript
function trackDays() {
    // Decrements the day counter
    // Handles game over when days reach zero
    // Manages time-based events like interest accrual
}

function formatTime(totalSeconds) {
    // Formats the remaining time in days:hours format
    // Provides visual feedback on game progress
}
```

## Banking System
The banking system allows safe money storage with interest:

```javascript
function deposit(amount) {
    // Transfers money from cash to bank account
    // Updates UI and logs the transaction
}

function withdraw(amount) {
    // Transfers money from bank to cash
    // Updates UI and logs the transaction
}

function accrueInterest() {
    // Adds interest to bank balance periodically
    // Interest rate is configurable
}
```

## Loan System
The loan system provides additional funding options:

```javascript
function takeLoan(amount) {
    // Adds to loan balance and increases cash
    // Enforces maximum loan limits
    // Updates UI and logs the transaction
}

function payLoan(amount) {
    // Reduces loan balance using available cash
    // Updates UI and logs the transaction
}
```

## Protection System
Players can buy guns for protection:

```javascript
function buyGun() {
    // Purchases a gun for protection
    // Reduces cash by gun price
    // Updates protection status
    // Affects outcomes of random events
}
```

## ASCII Art
The game features ASCII art for various events:

```javascript
function showAsciiArt(artType) {
    // Displays ASCII art based on event type
    // Includes animations and timed display
    // Enhances the game's visual experience
}
```

## Configuration Options

The game offers several configuration options that can be adjusted in the code:

### Game Parameters
```javascript
// Initial game settings
const gameConfig = {
    startingBankroll: 2000,        // Starting cash
    gameDuration: 30,              // Days
    maxInventory: 10000,           // Max items per product
    interestRate: 0.05,            // Daily bank interest rate
    loanInterestRate: 0.1,         // Daily loan interest rate
    maxLoan: 10000000,             // Maximum loan amount
    gunPrice: 500,                 // Cost of a gun
    eventProbability: 0.15,        // Chance of random event
    priceVolatility: 0.3,          // Price change magnitude
    cityTravelCost: 100            // Base cost to travel
};
```

### Bot Parameters
```javascript
// AI bot settings
const botConfig = {
    learningRate: 0.1,            // How quickly bot adapts
    discountFactor: 0.9,          // Value of future rewards
    explorationRate: 0.2,         // Chance of random actions
    explorationDecay: 0.995,      // Rate exploration decreases
    actionInterval: 1000,         // Milliseconds between actions
    memoryLimit: 10000            // Max number of Q-values stored
};
```

### UI Configuration
```javascript
// UI settings
const uiConfig = {
    logLimit: 500,                // Maximum log entries
    updateInterval: 1000,         // UI refresh rate in ms
    consoleHeight: 400,           // Height of console in pixels
    asciiArtDuration: 3000,       // How long ASCII art displays
    animationSpeed: 0.5           // Animation speed factor
};
```

## Technical Function Reference

### Core Game Functions

#### Game Initialization
```javascript
function startNewGame() {
    // Initializes a new game session
    // Sets up initial bankroll, inventory, prices, and game state
    // Begins day tracking and initializes UI
}

function loadGameState() {
    // Retrieves saved game from localStorage
    // Restores all game parameters, inventory, and positions
}

function saveGameState() {
    // Saves current game state to localStorage
    // Stores all game parameters for future restoration
}
```

#### Game Loop
```javascript
function trackDays() {
    // Main game loop function
    // Decrements day counter and manages game time
    // Triggers time-sensitive events like interest accrual
    // Checks for game over condition
}

function randomEvent() {
    // Randomly selects and executes an event
    // Chooses between police raids and robber encounters
    // Probability affected by city and other factors
}

function updatePrices() {
    // Regenerates all product prices
    // Applies city-specific modifiers
    // Occasionally creates exceptional price opportunities
}
```

#### Transaction Functions
```javascript
function buyProduct() {
    // Handles player purchase attempts
    // Validates quantity, price, and inventory capacity
    // Updates inventory, bankroll, and UI
}

function sellProduct() {
    // Handles player selling attempts
    // Validates product selection and quantity
    // Updates inventory, bankroll, and UI
}

function isExceptionalPrice(buyPrice, sellPrice, productKey) {
    // Analyzes if a price is significantly higher or lower than normal
    // Used by the AI for decision making
    // Returns different values for buy and sell opportunities
}
```

#### Travel System
```javascript
function travel() {
    // Moves player to a different city
    // Deducts travel cost
    // Updates prices based on new location
    // Triggers possible random events
}
```

#### Financial System
```javascript
function deposit(amount) {
    // Moves money from cash to bank account
    // Updates UI and logs transaction
}

function withdraw(amount) {
    // Moves money from bank to cash
    // Updates UI and logs transaction
}

function takeLoan(amount) {
    // Adds to loan balance and increases cash
    // Validates against maximum loan amount
    // Updates UI and logs transaction
}

function payLoan(amount) {
    // Reduces loan balance using cash
    // Updates UI and logs transaction
}

function accrueInterest() {
    // Adds interest to bank balance and loan amounts
    // Called periodically during gameplay
}

function calculateTotalInventoryValue() {
    // Sums the value of all inventory items at current prices
    // Used for net worth calculations and bot decisions
}
```

### Bot Functions

#### Core Bot Methods
```javascript
startTrading() {
    // Initializes the trading bot
    // Sets up action interval
    // Begins decision-making process
}

stopTrading() {
    // Halts bot activities
    // Clears action interval
    // Saves learned data
}

performAction() {
    // Main decision-making method
    // Gets current state and selects appropriate action
    // Handles execution of chosen action
}

adaptStrategy() {
    // Adjusts bot strategy based on game conditions
    // Changes focus between buying, selling, traveling, etc.
    // Becomes more conservative as game approaches end
}
```

#### Learning Methods
```javascript
getCurrentState() {
    // Builds state representation from game conditions
    // Discretizes continuous values into bins
    // Includes bankroll, inventory, prices, days remaining, etc.
}

selectActionFromLearning(state, actionWeights) {
    // Uses epsilon-greedy approach for action selection
    // Balances exploration vs. exploitation
}

updateQTable(state, action, reward, nextState) {
    // Implements Q-learning algorithm
    // Updates Q-values based on observed rewards
}

calculateReward(prevState, action, currentState) {
    // Complex reward calculation based on action outcomes
    // Considers net worth changes, inventory, events, etc.
}

saveQTables() {
    // Persists learned Q-values to localStorage
}

loadQTables() {
    // Retrieves previously learned Q-values
}
```

#### Bot Actions
```javascript
executeBuy(productKey, options) {
    // Bot's implementation of buying
    // Includes various safety checks
    // Can operate in exploration or exploitation mode
}

executeSell(productKey, options) {
    // Bot's implementation of selling
    // Includes various safety checks
    // Can operate in exploration or exploitation mode
}

travel() {
    // Bot's implementation of travel
    // Includes destination selection logic
}

shouldEmergencyLoan() {
    // Determines if bot should take a loan to recover
    // Based on current financial situation
}
```

#### Strategy Methods
```javascript
getCurrentStrategy() {
    // Determines the most appropriate strategy
    // Based on game state, inventory, bankroll, etc.
}

getStrategyQValues(stateKey) {
    // Gets Q-values for strategies in current state
}

selectStrategy() {
    // Chooses strategy using epsilon-greedy approach
}

updateStrategyQValue(prevStateKey, strategy, reward, nextStateKey) {
    // Updates Q-values for strategy selection
}

calculateStrategyReward() {
    // Evaluates success of current strategy
}
```

## Troubleshooting

### Common Issues
- **Game Not Saving**: Clear browser cache and check localStorage permissions
- **AI Not Learning**: Try resetting AI data using the "Reset AI" option
- **Performance Issues**: Reduce log entries and limit bot action frequency
- **UI Glitches**: Refresh the page or check browser compatibility 


##GITHUB

### Contributing
Contributions to the DrugTrade Simulator are welcome! If you're interested in contributing:

1. Fork the repository
2. Create a feature branch for your changes
3. Submit a pull request with a detailed description of your modifications

## Disclaimer

**Educational Purpose**: DrugTrade Simulator is a fictional simulation game created for educational and entertainment purposes only. The game emphasizes the role of randomness, chance, and risk in economic decision making, and showcases the dynamic nature of goals and pace dynamics with reinforcement learning in a highly volatile environment.

**No Endorsement**: This simulation does not promote, endorse, or encourage illegal activities in any way. The subject matter is treated as a purely fictional numbers exercise.

**Technical Exercise**: The primary focus of this project is to demonstrate programming concepts including:
- Vanilla JavaScript application architecture
- Reinforcement learning implementation
- Dynamic UI management
- Local storage utilization
- Progressive web app capabilities

---

© 2023 DrugTrade Simulator | Released under MIT License 