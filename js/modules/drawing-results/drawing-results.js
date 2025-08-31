let drawingData = [];
let prizeData = [];

async function loadDrawingData() {
    try {
        console.log('Attempting to load drawing data from: Data_Analysis/Data/drawing_results_20250829.csv');
        const response = await fetch('Data_Analysis/Data/drawing_results_20250829.csv');
        console.log('Drawing data response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`Failed to load drawing data: ${response.status} ${response.statusText}`);
        }
        const text = await response.text();
        console.log('Drawing data loaded, first 100 chars:', text.substring(0, 100));
        
        const lines = text.trim().split('\n');
        
        drawingData = lines.slice(1).map(line => {
            const values = line.split(',');
            return {
                id: parseInt(values[0]),
                date: values[1],
                mainNumbers: [
                    parseInt(values[2]),
                    parseInt(values[3]),
                    parseInt(values[4]),
                    parseInt(values[5]),
                    parseInt(values[6])
                ].sort((a, b) => a - b),
                euroNumbers: [
                    parseInt(values[7]),
                    parseInt(values[8])
                ].sort((a, b) => a - b)
            };
        });
        
        console.log(`Loaded ${drawingData.length} drawing results`);
        return drawingData;
        
    } catch (error) {
        console.error('Error loading drawing data:', error);
        throw new Error(`Drawing data: ${error.message}`);
    }
}

async function loadPrizeData() {
    try {
        console.log('Attempting to load prize data from: Data_Analysis/Data/price_breakdown.csv');
        const response = await fetch('Data_Analysis/Data/price_breakdown.csv');
        console.log('Prize data response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`Failed to load prize data: ${response.status} ${response.statusText}`);
        }
        const text = await response.text();
        console.log('Prize data loaded, first 100 chars:', text.substring(0, 100));
        
        const lines = text.trim().split('\n');
        
        prizeData = lines.slice(1).map(line => {
            const values = line.split(',');
            return {
                id: parseInt(values[0]),
                prizes: [
                    parseFloat(values[1]),  // price_category_1
                    parseFloat(values[2]),  // price_category_2
                    parseFloat(values[3]),  // price_category_3
                    parseFloat(values[4]),  // price_category_4
                    parseFloat(values[5]),  // price_category_5
                    parseFloat(values[6]),  // price_category_6
                    parseFloat(values[7]),  // price_category_7
                    parseFloat(values[8]),  // price_category_8
                    parseFloat(values[9]),  // price_category_9
                    parseFloat(values[10]), // price_category_10
                    parseFloat(values[11]), // price_category_11
                    parseFloat(values[12])  // price_category_12
                ],
                winners: [
                    parseInt(values[13]), // winner_1
                    parseInt(values[14]), // winner_2
                    parseInt(values[15]), // winner_3
                    parseInt(values[16]), // winner_4
                    parseInt(values[17]), // winner_5
                    parseInt(values[18]), // winner_6
                    parseInt(values[19]), // winner_7
                    parseInt(values[20]), // winner_8
                    parseInt(values[21]), // winner_9
                    parseInt(values[22]), // winner_10
                    parseInt(values[23]), // winner_11
                    parseInt(values[24])  // winner_12
                ]
            };
        });
        
        console.log(`Loaded ${prizeData.length} price breakdown records`);
        return prizeData;
        
    } catch (error) {
        console.error('Error loading prize data:', error);
        throw new Error(`Prize data: ${error.message}`);
    }
}

function formatCurrency(amount, isJackpot = false) {
    if (amount === 0) return '€0.00';
    
    // Only format jackpot amounts with M/K notation
    if (isJackpot && amount >= 1000000) {
        return `€${(amount / 1000000).toFixed(1)}M`;
    } else {
        // Show exact amounts for all other prizes
        return `€${amount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    }
}

function formatNumber(number) {
    return number.toLocaleString();
}

function populatePrizeTable(drawingId) {
    // Find the prize data for this drawing
    const prizeInfo = prizeData.find(p => p.id === drawingId);
    
    if (!prizeInfo) {
        console.warn(`No prize data found for drawing ID: ${drawingId}`);
        clearPrizeTable();
        return;
    }
    
    // Prize category mapping to HTML IDs
    const prizeMapping = [
        'prize-5-2',  // Category 1: 5+2 (Jackpot)
        'prize-5-1',  // Category 2: 5+1
        'prize-5-0',  // Category 3: 5+0
        'prize-4-2',  // Category 4: 4+2
        'prize-4-1',  // Category 5: 4+1
        'prize-3-2',  // Category 6: 3+2
        'prize-4-0',  // Category 7: 4+0
        'prize-2-2',  // Category 8: 2+2
        'prize-3-1',  // Category 9: 3+1
        'prize-3-0',  // Category 10: 3+0
        'prize-1-2',  // Category 11: 1+2
        'prize-2-1'   // Category 12: 2+1
    ];
    
    const winnerMapping = [
        'winners-5-2', // Category 1: 5+2 (Jackpot)
        'winners-5-1', // Category 2: 5+1
        'winners-5-0', // Category 3: 5+0
        'winners-4-2', // Category 4: 4+2
        'winners-4-1', // Category 5: 4+1
        'winners-3-2', // Category 6: 3+2
        'winners-4-0', // Category 7: 4+0
        'winners-2-2', // Category 8: 2+2
        'winners-3-1', // Category 9: 3+1
        'winners-3-0', // Category 10: 3+0
        'winners-1-2', // Category 11: 1+2
        'winners-2-1'  // Category 12: 2+1
    ];
    
    // Populate prize amounts
    prizeMapping.forEach((elementId, index) => {
        const element = document.getElementById(elementId);
        if (element) {
            const isJackpot = index === 0; // First prize is jackpot
            element.textContent = formatCurrency(prizeInfo.prizes[index], isJackpot);
        }
    });
    
    // Populate winner counts (exact numbers)
    winnerMapping.forEach((elementId, index) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = prizeInfo.winners[index].toLocaleString();
        }
    });
    
    console.log(`Populated prize table for drawing ID: ${drawingId}`);
}

function clearPrizeTable() {
    const allPrizeIds = [
        'prize-5-2', 'prize-5-1', 'prize-5-0', 'prize-4-2', 'prize-4-1', 'prize-3-2',
        'prize-4-0', 'prize-2-2', 'prize-3-1', 'prize-3-0', 'prize-1-2', 'prize-2-1'
    ];
    
    const allWinnerIds = [
        'winners-5-2', 'winners-5-1', 'winners-5-0', 'winners-4-2', 'winners-4-1', 'winners-3-2',
        'winners-4-0', 'winners-2-2', 'winners-3-1', 'winners-3-0', 'winners-1-2', 'winners-2-1'
    ];
    
    [...allPrizeIds, ...allWinnerIds].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = '-';
        }
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatShortDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

function createNumberBall(number, isEuro = false) {
    const ballClass = isEuro ? 'euro-ball' : 'main-ball';
    return `<span class="number-ball ${ballClass}">${number}</span>`;
}

function createResultDisplay(result) {
    const formattedDate = formatDate(result.date);
    const mainBalls = result.mainNumbers.map(num => createNumberBall(num)).join('');
    const euroBalls = result.euroNumbers.map(num => createNumberBall(num, true)).join('');
    
    return `
        <div class="text-center">
            <div class="row justify-content-center">
                <div class="col-lg-10">
                    <div class="numbers-container p-4 rounded shadow-sm bg-light">
                        <div class="mb-4">
                            <h5 class="mb-3 text-dark">
                                <i class="bi bi-speedometer2 me-2"></i>Main Numbers
                            </h5>
                            <div class="numbers-display justify-content-center mb-4">
                                ${mainBalls}
                            </div>
                        </div>
                        
                        <div>
                            <h5 class="mb-3 text-dark">
                                <i class="bi bi-star me-2"></i>Euro Numbers
                            </h5>
                            <div class="numbers-display justify-content-center">
                                ${euroBalls}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function populateDropdown() {
    const dropdown = document.querySelector('#dateSelector');
    if (!dropdown || drawingData.length === 0) return;
    
    // Get last 12 months of data
    const today = new Date();
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(today.getMonth() - 12);
    
    const recentData = drawingData.filter(result => {
        const resultDate = new Date(result.date);
        return resultDate >= twelveMonthsAgo;
    });
    
    // Sort by date descending
    recentData.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Clear existing items except latest and divider
    const existingItems = dropdown.querySelectorAll('li:not(:first-child):not(:nth-child(2))');
    existingItems.forEach(item => item.remove());
    
    // Add historical dates
    recentData.slice(1).forEach(result => { // Skip first (latest)
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.className = 'dropdown-item';
        a.href = '#';
        a.dataset.value = result.id;
        a.textContent = formatShortDate(result.date);
        li.appendChild(a);
        dropdown.appendChild(li);
    });
    
    console.log(`Populated dropdown with ${recentData.length} dates`);
}

function displayResult(result, isLatest = false) {
    const container = document.getElementById('drawing-result-content');
    const dateButton = document.getElementById('selected-date');
    const idElement = document.getElementById('drawing-id');
    
    if (container) {
        container.innerHTML = createResultDisplay(result);
    }
    
    if (dateButton) {
        dateButton.textContent = isLatest ? formatDate(result.date) : formatShortDate(result.date);
    }
    
    if (idElement) {
        idElement.textContent = result.id;
    }
    
    // Populate the prize breakdown table
    populatePrizeTable(result.id);
}

function updateStatistics() {
    const totalElement = document.getElementById('total-drawings');
    if (totalElement && drawingData.length > 0) {
        totalElement.textContent = drawingData.length.toLocaleString();
    }
}

function setupEventListeners() {
    const dropdown = document.querySelector('#dateSelector');
    
    if (dropdown) {
        dropdown.addEventListener('click', function(e) {
            if (e.target.classList.contains('dropdown-item')) {
                e.preventDefault();
                
                const value = e.target.dataset.value;
                
                if (value === 'latest') {
                    const latestResult = drawingData[drawingData.length - 1];
                    displayResult(latestResult, true);
                } else {
                    const selectedId = parseInt(value);
                    const selectedResult = drawingData.find(result => result.id === selectedId);
                    if (selectedResult) {
                        displayResult(selectedResult, false);
                    }
                }
            }
        });
    }
}

async function loadDrawingResults() {
    try {
        console.log('Loading drawing results...');
        console.log('Current page URL:', window.location.href);
        
        // Try to load drawing data first
        try {
            await loadDrawingData();
        } catch (drawingError) {
            console.error('Failed to load drawing data:', drawingError);
            throw new Error(`Drawing data could not be loaded: ${drawingError.message}`);
        }
        
        // Try to load prize data (optional - if it fails, continue without prizes)
        try {
            await loadPrizeData();
            console.log('Prize data loaded successfully');
        } catch (prizeError) {
            console.warn('Prize data could not be loaded:', prizeError);
            console.log('Continuing without prize breakdown data');
        }
        
        // Display latest result
        const latestResult = drawingData[drawingData.length - 1];
        displayResult(latestResult, true);
        
        populateDropdown();
        setupEventListeners();
        updateStatistics();
        
        console.log('Drawing results module loaded successfully');
        
    } catch (error) {
        console.error('Error loading drawing results:', error);
        
        const container = document.getElementById('drawing-result-content');
        if (container) {
            container.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    <strong>Error loading data:</strong> ${error.message}
                    <br><small>Current URL: ${window.location.href}</small>
                    <br><small>Expected files: Data_Analysis/Data/drawing_results_20250829.csv and Data_Analysis/Data/price_breakdown.csv</small>
                    <br><small>Check browser console for detailed error information</small>
                </div>
            `;
        }
    }
}

export function init() {
    console.log('Initializing drawing results module');
    loadDrawingResults();
}

export function cleanup() {
    console.log('Cleaning up drawing results module');
}