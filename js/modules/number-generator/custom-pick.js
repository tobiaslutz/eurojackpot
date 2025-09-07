class CustomPickGenerator {
    constructor() {
        this.type = 'custom-pick';
        this.generatedPicks = [];
        this.settings = {
            count: 1,
            customMain: [],
            customEuro: [],
            balanceRanges: false
        };
        this.init();
    }

    init() {
        this.bindGenerateButton();
        this.bindExportButton();
        this.bindSettings();
        this.bindBackButton();
    }

    bindBackButton() {
        const backBtn = document.getElementById('back-to-dashboard');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                showDefaultContent();
            });
        }
    }

    bindGenerateButton() {
        const generateBtn = document.getElementById('generate-btn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                console.log('Generate button clicked');
                this.generate();
            });
        }
    }

    bindExportButton() {
        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportResults());
        }
    }

    bindSettings() {
        const countSelect = document.getElementById('custom-count');
        const mainInput = document.getElementById('custom-main');
        const euroInput = document.getElementById('custom-euro');
        const balanceCheck = document.getElementById('balance-ranges');

        if (countSelect) {
            countSelect.addEventListener('change', (e) => {
                this.settings.count = parseInt(e.target.value);
            });
        }

        if (mainInput) {
            mainInput.addEventListener('input', (e) => {
                this.settings.customMain = this.parseNumbers(e.target.value, 1, 50).slice(0, 5);
                console.log('Custom main numbers:', this.settings.customMain);
            });
        }

        if (euroInput) {
            euroInput.addEventListener('input', (e) => {
                this.settings.customEuro = this.parseNumbers(e.target.value, 1, 12).slice(0, 2);
                console.log('Custom euro numbers:', this.settings.customEuro);
            });
        }

        if (balanceCheck) {
            balanceCheck.addEventListener('change', (e) => {
                this.settings.balanceRanges = e.target.checked;
            });
        }
    }

    parseNumbers(input, min, max) {
        if (!input || !input.trim()) return [];
        
        const numbers = input.split(',')
            .map(n => parseInt(n.trim()))
            .filter(n => !isNaN(n) && n >= min && n <= max);
        
        return [...new Set(numbers)];
    }

    generate() {
        console.log('Generating picks with settings:', this.settings);
        const picks = [];
        
        // Generate each pick independently
        for (let i = 0; i < this.settings.count; i++) {
            const pick = {
                main: this.generateCustomMain(),
                euro: this.generateCustomEuro()
            };
            picks.push(pick);
        }
        
        this.displayResults(picks);
    }

    generateCustomMain() {
        const custom = [...this.settings.customMain];
        const needed = 5 - custom.length;
        
        if (needed > 0) {
            if (this.settings.balanceRanges) {
                const remainingNumbers = this.generateBalancedRemaining(custom, needed);
                custom.push(...remainingNumbers);
            } else {
                // Simple random fill - no exclusions
                const remaining = this.generateRandomNumbers(1, 50, needed, false, custom);
                custom.push(...remaining);
            }
        }
        
        return custom.slice(0, 5).sort((a, b) => a - b);
    }

    generateBalancedRemaining(customNumbers, needed) {
        const ranges = [[1,10], [11,20], [21,30], [31,40], [41,50]];
        
        // Identify which ranges are already occupied by custom numbers
        const occupiedRanges = new Set();
        customNumbers.forEach(num => {
            const rangeIndex = Math.floor((num - 1) / 10);
            occupiedRanges.add(rangeIndex);
        });
        
        // Get available ranges (not occupied by custom numbers)
        const availableRanges = ranges
            .map((range, index) => ({ range, index }))
            .filter(({ index }) => !occupiedRanges.has(index));
        
        const remainingNumbers = [];
        
        // Try to fill from available ranges first
        for (let i = 0; i < needed && i < availableRanges.length; i++) {
            const { range } = availableRanges[i];
            const [min, max] = range;
            
            let attempts = 0;
            let num;
            
            do {
                num = Math.floor(Math.random() * (max - min + 1)) + min;
                attempts++;
            } while (
                (remainingNumbers.includes(num) || customNumbers.includes(num)) && 
                attempts < 50
            );
            
            if (!remainingNumbers.includes(num) && !customNumbers.includes(num)) {
                remainingNumbers.push(num);
            }
        }
        
        // Fill remaining slots from any range if needed
        while (remainingNumbers.length < needed) {
            const num = Math.floor(Math.random() * 50) + 1;
            if (!remainingNumbers.includes(num) && !customNumbers.includes(num)) {
                remainingNumbers.push(num);
            }
        }
        
        return remainingNumbers.slice(0, needed);
    }

    generateCustomEuro() {
        const custom = [...this.settings.customEuro];
        const needed = 2 - custom.length;
        
        if (needed > 0) {
            const remaining = this.generateRandomNumbers(1, 12, needed, false, custom);
            custom.push(...remaining);
        }
        
        return custom.slice(0, 2).sort((a, b) => a - b);
    }

    generateRandomNumbers(min, max, count, avoidConsecutive = false, excludeNumbers = []) {
        const numbers = [];
        const maxAttempts = 1000;
        let attempts = 0;

        while (numbers.length < count && attempts < maxAttempts) {
            const num = Math.floor(Math.random() * (max - min + 1)) + min;
            
            if (!numbers.includes(num) && !excludeNumbers.includes(num)) {
                if (!avoidConsecutive || !this.hasConsecutive([...numbers, num])) {
                    numbers.push(num);
                }
            }
            attempts++;
        }

        // Simple fallback
        while (numbers.length < count) {
            const num = Math.floor(Math.random() * (max - min + 1)) + min;
            if (!numbers.includes(num) && !excludeNumbers.includes(num)) {
                numbers.push(num);
            }
        }

        return numbers.sort((a, b) => a - b);
    }

    hasConsecutive(numbers) {
        const sorted = [...numbers].sort((a, b) => a - b);
        for (let i = 0; i < sorted.length - 1; i++) {
            if (sorted[i + 1] - sorted[i] === 1) {
                return true;
            }
        }
        return false;
    }

    displayResults(picks) {
        console.log('Displaying results:', picks);
        this.generatedPicks = picks;
        const resultsDiv = document.getElementById('generated-numbers');
        if (!resultsDiv) {
            console.error('Results div not found!');
            return;
        }
    
        let html = '<div class="generated-picks">';
        
        picks.forEach((pick, index) => {
            const mainStr = pick.main.map(n => `<span class="number-ball main-ball">${n}</span>`).join(' ');
            const euroStr = pick.euro.map(n => `<span class="number-ball euro-ball">${n}</span>`).join(' ');
            
            html += `
                <div class="pick-row mb-3 p-3 bg-light border rounded shadow-sm">
                    <small class="text-muted fw-bold">Pick ${index + 1}:</small>
                    <div class="mt-2">
                        ${mainStr} + ${euroStr}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        resultsDiv.innerHTML = html;
    
        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            exportBtn.style.display = 'block';
        }
    }

    exportResults() {
        if (this.generatedPicks.length === 0) return;

        let content = `Eurojackpot Generated Numbers - ${this.type.replace('-', ' ').toUpperCase()}\n`;
        content += `Generated on: ${new Date().toLocaleString()}\n`;
        content += `Number of picks: ${this.generatedPicks.length}\n`;
        content += `Settings: Balance Ranges: ${this.settings.balanceRanges}\n\n`;

        this.generatedPicks.forEach((pick, index) => {
            const mainStr = pick.main.join(', ');
            const euroStr = pick.euro.join(', ');
            content += `Pick ${index + 1}: Main: ${mainStr} | Euro: ${euroStr}\n`;
        });

        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `eurojackpot-${this.type}-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
}

window.CustomPickGenerator = CustomPickGenerator;