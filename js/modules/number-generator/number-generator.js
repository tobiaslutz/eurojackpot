class NumberGeneratorModule {
    constructor() {
        this.currentType = null;
        this.generators = {};
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('generator-link') || e.target.closest('.generator-link')) {
                e.preventDefault();
                const link = e.target.closest('.generator-link') || e.target;
                const generatorType = link.getAttribute('data-type');
                
                this.closeMobileNav();
                this.loadGenerator(generatorType);
            }
        });
    }

    closeMobileNav() {
        const mobileNav = document.getElementById('mobileNav');
        if (mobileNav) {
            const bsOffcanvas = bootstrap.Offcanvas.getInstance(mobileNav);
            if (bsOffcanvas) {
                bsOffcanvas.hide();
            }
        }
    }

    async loadGenerator(type) {
        this.currentType = type;
        
        document.querySelectorAll('.generator-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelectorAll(`[data-type="${type}"]`).forEach(link => {
            link.classList.add('active');
        });

        try {
            const htmlFile = `modules/number-generator/${type}.html`;
            const response = await fetch(htmlFile);
            const html = await response.text();
            
            updateMainContent('Number Generator', html);
            await this.loadGeneratorScript(type);

        } catch (error) {
            console.error(`Error loading generator ${type}:`, error);
            updateMainContent('Number Generator', '<p class="alert alert-danger">Error loading generator.</p>');
        }
    }

    async loadGeneratorScript(type) {
        const scriptSrc = `js/modules/number-generator/${type}.js`;
        
        if (!document.querySelector(`script[src="${scriptSrc}"]`)) {
            const script = document.createElement('script');
            script.src = scriptSrc;
            script.onload = () => {
                this.initializeGenerator(type);
            };
            document.head.appendChild(script);
        } else {
            this.initializeGenerator(type);
        }
    }

    initializeGenerator(type) {
        setTimeout(() => {
            switch(type) {
                case 'random-pick':
                    if (window.RandomPickGenerator) {
                        this.generators[type] = new window.RandomPickGenerator();
                    }
                    break;
                case 'custom-pick':
                    if (window.CustomPickGenerator) {
                        this.generators[type] = new window.CustomPickGenerator();
                    }
                    break;
                case 'structured-pick':
                    if (window.StructuredPickGenerator) {
                        this.generators[type] = new window.StructuredPickGenerator();
                    }
                    break;
            }
        }, 100);
    }
}

// Base Generator Class
class BaseGenerator {
    constructor(type) {
        this.type = type;
        this.generatedPicks = [];
    }

    init() {
        this.bindGenerateButton();
        this.bindExportButton();
    }

    bindGenerateButton() {
        const generateBtn = document.getElementById('generate-btn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generate());
        }
    }

    bindExportButton() {
        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportResults());
        }
    }

    displayResults(picks) {
        this.generatedPicks = picks;
        const resultsDiv = document.getElementById('generated-numbers');
        if (!resultsDiv) return;

        let html = '<div class="generated-picks">';
        
        picks.forEach((pick, index) => {
            const mainStr = pick.main.map(n => `<span class="number-ball main-ball small">${n}</span>`).join(' ');
            const euroStr = pick.euro.map(n => `<span class="number-ball euro-ball small">${n}</span>`).join(' ');
            
            html += `
                <div class="pick-row mb-2">
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
        content += `Number of picks: ${this.generatedPicks.length}\n\n`;

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

// Utility functions
class GeneratorUtils {
    static generateRandomNumbers(min, max, count, avoidConsecutive = false, excludeNumbers = []) {
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

        while (numbers.length < count) {
            const num = Math.floor(Math.random() * (max - min + 1)) + min;
            if (!numbers.includes(num) && !excludeNumbers.includes(num)) {
                numbers.push(num);
            }
        }

        return numbers.sort((a, b) => a - b);
    }

    static hasConsecutive(numbers) {
        const sorted = [...numbers].sort((a, b) => a - b);
        for (let i = 0; i < sorted.length - 1; i++) {
            if (sorted[i + 1] - sorted[i] === 1) {
                return true;
            }
        }
        return false;
    }

    static parseNumbers(input, min, max) {
        if (!input || !input.trim()) return [];
        
        const numbers = input.split(',')
            .map(n => parseInt(n.trim()))
            .filter(n => !isNaN(n) && n >= min && n <= max);
        
        return [...new Set(numbers)];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.numberGeneratorModule = new NumberGeneratorModule();
});