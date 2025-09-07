class StructuredPickGenerator {
    constructor() {
        this.type = 'structured-pick';
        this.generatedPicks = [];
        this.settings = {
            count: 10,
            strategy: 'hot-numbers'
        };
        this.frequencyData = null;
        this.init();
    }

    async init() {
        await this.loadFrequencyData();
        this.bindGenerateButton();
        this.bindExportButton();
        this.bindSettings();
        this.bindBackButton();
        this.updateStrategyVisualization();
    }

    async loadFrequencyData() {
        try {
            console.log('Loading frequency data...');
            const response = await fetch('Data_Analysis/structured_pick_generator/hot_cold_numbers.json');
            this.frequencyData = await response.json();
            console.log('Frequency data loaded:', this.frequencyData);
        } catch (error) {
            console.error('Error loading frequency data:', error);
            this.loadFallbackData();
        }
    }

    loadFallbackData() {
        console.log('Loading fallback data...');
        this.frequencyData = {
            "main": {
                "hot": [
                    {"number": 20, "relativeFrequency": 0.0242285714285714},
                    {"number": 34, "relativeFrequency": 0.0233142857142857},
                    {"number": 49, "relativeFrequency": 0.0233142857142857},
                    {"number": 11, "relativeFrequency": 0.0226285714285714},
                    {"number": 17, "relativeFrequency": 0.0224},
                    {"number": 16, "relativeFrequency": 0.0219428571428571},
                    {"number": 21, "relativeFrequency": 0.0219428571428571},
                    {"number": 35, "relativeFrequency": 0.0217142857142857},
                    {"number": 7, "relativeFrequency": 0.0214857142857142},
                    {"number": 18, "relativeFrequency": 0.0214857142857142}
                ],
                "cold": [
                    {"number": 48, "relativeFrequency": 0.0153142857142857},
                    {"number": 27, "relativeFrequency": 0.0169142857142857},
                    {"number": 50, "relativeFrequency": 0.0169142857142857},
                    {"number": 5, "relativeFrequency": 0.0171428571428571},
                    {"number": 25, "relativeFrequency": 0.0171428571428571},
                    {"number": 24, "relativeFrequency": 0.0178285714285714},
                    {"number": 36, "relativeFrequency": 0.0178285714285714},
                    {"number": 28, "relativeFrequency": 0.0180571428571428},
                    {"number": 33, "relativeFrequency": 0.0185142857142857},
                    {"number": 42, "relativeFrequency": 0.0185142857142857}
                ]
            },
            "euro": {
                "hot": [
                    {"number": 3, "relativeFrequency": 0.1019830028328611},
                    {"number": 5, "relativeFrequency": 0.1005665722379603},
                    {"number": 10, "relativeFrequency": 0.0949008498583569}
                ],
                "cold": [
                    {"number": 2, "relativeFrequency": 0.0708215297450425},
                    {"number": 11, "relativeFrequency": 0.0722379603399433},
                    {"number": 8, "relativeFrequency": 0.0736543909348441}
                ]
            }
        };
    }

    updateStrategyVisualization() {
        if (!this.frequencyData) return;

        const visualizationDiv = document.getElementById('strategy-visualization');
        if (!visualizationDiv) return;

        let html = '';

        switch (this.settings.strategy) {
            case 'hot-numbers':
                html = this.createHotVisualization();
                break;
            case 'cold-numbers':
                html = this.createColdVisualization();
                break;
            case 'mixed':
                html = this.createMixedVisualization();
                break;
        }

        visualizationDiv.innerHTML = html;
    }

    createHotVisualization() {
        const expectedMain = 1/50; // 2%
        const expectedEuro = 1/12; // ~8.33%

        return `
            <div class="strategy-header mb-4">
                <h5><i class="bi bi-fire text-danger me-2"></i>Hot Numbers Strategy</h5>
                <p class="text-muted">Numbers that appear more frequently than expected</p>
            </div>
            
            <div class="row">
                <div class="col-md-8">
                    <h6>Main Numbers (Hot)</h6>
                    ${this.createFrequencyChart(this.frequencyData.main.hot, expectedMain, 'main')}
                </div>
                <div class="col-md-4">
                    <h6>Euro Numbers (Hot)</h6>
                    ${this.createFrequencyChart(this.frequencyData.euro.hot, expectedEuro, 'euro')}
                </div>
            </div>
        `;
    }

    createColdVisualization() {
        const expectedMain = 1/50; // 2%
        const expectedEuro = 1/12; // ~8.33%

        return `
            <div class="strategy-header mb-4">
                <h5><i class="bi bi-snow text-info me-2"></i>Cold Numbers Strategy</h5>
                <p class="text-muted">Numbers that appear less frequently than expected</p>
            </div>
            
            <div class="row">
                <div class="col-md-8">
                    <h6>Main Numbers (Cold)</h6>
                    ${this.createFrequencyChart(this.frequencyData.main.cold, expectedMain, 'main')}
                </div>
                <div class="col-md-4">
                    <h6>Euro Numbers (Cold)</h6>
                    ${this.createFrequencyChart(this.frequencyData.euro.cold, expectedEuro, 'euro')}
                </div>
            </div>
        `;
    }

    createMixedVisualization() {
        const expectedMain = 1/50; // 2%
        const expectedEuro = 1/12; // ~8.33%

        return `
            <div class="strategy-header mb-4">
                <h5><i class="bi bi-shuffle text-warning me-2"></i>Mixed Strategy</h5>
                <p class="text-muted">Combine hot and cold numbers for balanced approach</p>
            </div>
            
            <div class="row">
                <div class="col-md-6">
                    <h6>Main Numbers</h6>
                    <div class="row">
                        <div class="col-6">
                            <small class="text-danger fw-bold">Hot</small>
                            ${this.createFrequencyChart(this.frequencyData.main.hot, expectedMain, 'main')}
                        </div>
                        <div class="col-6">
                            <small class="text-info fw-bold">Cold</small>
                            ${this.createFrequencyChart(this.frequencyData.main.cold, expectedMain, 'main')}
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <h6>Euro Numbers</h6>
                    <div class="row">
                        <div class="col-6">
                            <small class="text-danger fw-bold">Hot</small>
                            ${this.createFrequencyChart(this.frequencyData.euro.hot, expectedEuro, 'euro')}
                        </div>
                        <div class="col-6">
                            <small class="text-info fw-bold">Cold</small>
                            ${this.createFrequencyChart(this.frequencyData.euro.cold, expectedEuro, 'euro')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    createFrequencyChart(numbers, expectedFreq, type) {
        // Sort numbers by frequency based on strategy
        let sortedNumbers;
        const isHotContext = this.settings.strategy === 'hot-numbers' || 
                            (this.settings.strategy === 'mixed' && numbers === this.frequencyData.main.hot) ||
                            (this.settings.strategy === 'mixed' && numbers === this.frequencyData.euro.hot);
        
        if (isHotContext) {
            // Hot numbers: highest frequency first
            sortedNumbers = [...numbers].sort((a, b) => b.relativeFrequency - a.relativeFrequency);
        } else {
            // Cold numbers: lowest frequency first
            sortedNumbers = [...numbers].sort((a, b) => a.relativeFrequency - b.relativeFrequency);
        }

        const maxFreq = Math.max(...sortedNumbers.map(n => n.relativeFrequency));
        const minFreq = Math.min(...sortedNumbers.map(n => n.relativeFrequency));
        const expectedPercent = (expectedFreq * 100).toFixed(2);

        let html = `
            <div class="frequency-chart-horizontal">
                <div class="expected-line-horizontal mb-3">
                    <small class="text-muted fw-light">
                        Expected: ${expectedPercent}%
                    </small>
                </div>
                <div class="d-flex justify-content-center align-items-end gap-2 flex-wrap">
        `;

        sortedNumbers.forEach((item, index) => {
            const actualPercent = (item.relativeFrequency * 100).toFixed(2);
            const isAboveExpected = item.relativeFrequency > expectedFreq;
            
            // Enhanced height calculation for bigger differences
            const normalizedValue = (item.relativeFrequency - minFreq) / (maxFreq - minFreq);
            const barHeight = Math.max(normalizedValue * 60 + 20, 25); // Min 25px, max 80px
            
            // Elegant, muted colors
            const barColor = isAboveExpected ? 'bg-warning bg-opacity-50' : 'bg-info bg-opacity-40';

            html += `
                <div class="frequency-item-horizontal text-center">
                    <div class="vertical-bar-frequency ${barColor}" 
                         style="height: ${barHeight}px; width: 20px; margin: 0 auto 5px;"
                         title="${actualPercent}%"></div>
                    <span class="number-ball ${type}-ball small">${item.number}</span>
                    <div class="frequency-percentage mt-1">
                        <small class="text-muted fw-light">${actualPercent}%</small>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
        
        return html;
    }

    bindBackButton() {
        const backBtn = document.getElementById('back-to-dashboard');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                if (window.showDefaultContent || typeof showDefaultContent === 'function') {
                    showDefaultContent();
                } else {
                    window.location.reload();
                }
            });
        }
    }

    bindGenerateButton() {
        const generateBtn = document.getElementById('generate-btn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                console.log('Generate button clicked - functionality to be implemented');
                // TODO: Implement actual structured pick generation
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
        const countSelect = document.getElementById('structured-count');
        const strategySelect = document.getElementById('strategy');

        if (countSelect) {
            countSelect.addEventListener('change', (e) => {
                this.settings.count = parseInt(e.target.value);
            });
        }

        if (strategySelect) {
            strategySelect.addEventListener('change', (e) => {
                this.settings.strategy = e.target.value;
                this.updateStrategyVisualization();
            });
        }
    }

    exportResults() {
        if (this.generatedPicks.length === 0) return;

        let content = `Eurojackpot Generated Numbers - ${this.type.replace('-', ' ').toUpperCase()}\n`;
        content += `Strategy: ${this.settings.strategy.replace('-', ' ').toUpperCase()}\n`;
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
        a.download = `eurojackpot-${this.type}-${this.settings.strategy}-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
}

window.StructuredPickGenerator = StructuredPickGenerator;