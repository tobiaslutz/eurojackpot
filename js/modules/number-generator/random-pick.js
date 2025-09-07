class RandomPickGenerator {
    constructor() {
        this.type = 'random-pick';
        this.generatedPicks = [];
        this.settings = {
            count: 1,
            avoidConsecutive: true,
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
        const countSelect = document.getElementById('random-count');
        const consecutiveCheck = document.getElementById('avoid-consecutive');
        const balanceCheck = document.getElementById('balance-ranges');

        if (countSelect) {
            countSelect.addEventListener('change', (e) => {
                this.settings.count = parseInt(e.target.value);
                console.log('Count changed to:', this.settings.count);
            });
        }

        if (consecutiveCheck) {
            consecutiveCheck.addEventListener('change', (e) => {
                this.settings.avoidConsecutive = e.target.checked;
            });
        }

        if (balanceCheck) {
            balanceCheck.addEventListener('change', (e) => {
                this.settings.balanceRanges = e.target.checked;
            });
        }
    }

    generate() {
        console.log('Generating picks with settings:', this.settings);
        const picks = [];
        for (let i = 0; i < this.settings.count; i++) {
            picks.push({
                main: this.generateRandomMain(),
                euro: this.generateRandomEuro()
            });
        }
        this.displayResults(picks);
    }

    generateRandomMain() {
        if (this.settings.balanceRanges) {
            return this.generateBalancedMain();
        } else {
            // Only pass avoidConsecutive if user selected it
            return this.generateRandomNumbers(1, 50, 5, this.settings.avoidConsecutive);
        }
    }

    generateBalancedMain() {
        const ranges = [[1,10], [11,20], [21,30], [31,40], [41,50]];
        const numbers = [];
        
        // GUARANTEED: One number from each range
        for (const [min, max] of ranges) {
            let attempts = 0;
            let num;
            
            do {
                num = Math.floor(Math.random() * (max - min + 1)) + min;
                attempts++;
                
                // Only check consecutive if user enabled it
                if (this.settings.avoidConsecutive && this.hasConsecutive([...numbers, num])) {
                    continue;
                }
                
                // If we can't find a valid number after many attempts, ignore consecutive rule for this range
                if (attempts > 50) {
                    num = Math.floor(Math.random() * (max - min + 1)) + min;
                    break;
                }
                
            } while (numbers.includes(num) && attempts < 100);
            
            // Ensure we don't add duplicates
            if (!numbers.includes(num)) {
                numbers.push(num);
            }
        }
        
        // Handle edge case: if we somehow have < 5 numbers (very rare)
        while (numbers.length < 5) {
            let num;
            let attempts = 0;
            
            do {
                num = Math.floor(Math.random() * 50) + 1;
                attempts++;
                
                // Only check consecutive if user enabled it
                if (this.settings.avoidConsecutive && this.hasConsecutive([...numbers, num])) {
                    continue;
                }
                
                if (attempts > 100) {
                    break;
                }
                
            } while (numbers.includes(num));
            
            if (!numbers.includes(num)) {
                numbers.push(num);
            }
        }
        
        return numbers.slice(0, 5).sort((a, b) => a - b);
    }

    generateRandomEuro() {
        return this.generateRandomNumbers(1, 12, 2, false);
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

        // Fallback: ignore consecutive constraint if we can't fill the array
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

    balanceMainNumbers(numbers) {
        const ranges = [[1,10], [11,20], [21,30], [31,40], [41,50]];
        const result = [];
        const used = [];

        for (const [min, max] of ranges) {
            if (result.length >= 5) break;
            
            const candidates = numbers.filter(n => n >= min && n <= max && !used.includes(n));
            if (candidates.length > 0) {
                const selected = candidates[Math.floor(Math.random() * candidates.length)];
                result.push(selected);
                used.push(selected);
            }
        }

        const remaining = numbers.filter(n => !used.includes(n));
        while (result.length < 5 && remaining.length > 0) {
            const selected = remaining.splice(Math.floor(Math.random() * remaining.length), 1)[0];
            result.push(selected);
        }

        return result.sort((a, b) => a - b);
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
                <div class="pick-row mb-2 p-3 bg-light border rounded w-100">
                    <small class="text-muted">Pick ${index + 1}:</small><br>
                    ${mainStr} + ${euroStr}
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
        content += `Settings: Avoid Consecutive: ${this.settings.avoidConsecutive}, Balance Ranges: ${this.settings.balanceRanges}\n\n`;

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

window.RandomPickGenerator = RandomPickGenerator;