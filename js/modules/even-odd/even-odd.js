let charts = [];

async function loadCSVData(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        const lines = text.trim().split('\n');
        const headers = lines[0].split(',');
        
        const data = lines.slice(1).map(line => {
            const values = line.split(',');
            const row = {};
            headers.forEach((header, index) => {
                const value = values[index];
                if (header === 'even_count' || header === 'empirical_frequency') {
                    row[header] = parseInt(value);
                } else {
                    row[header] = parseFloat(value);
                }
            });
            return row;
        });
        
        return data;
    } catch (error) {
        console.error(`Error loading CSV data from ${filePath}:`, error);
        throw error;
    }
}

function createEvenOddChart(canvasId, data, title, maxEvenCount) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // Prepare data for the chart
    const labels = data.map(row => `${row.even_count} even`);
    const empiricalData = data.map(row => row.empirical_relative_frequency);
    const theoreticalData = data.map(row => row.theoretical_probability);
    const frequencyData = data.map(row => row.empirical_frequency);
    
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Empirical Frequency',
                    data: empiricalData,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    yAxisID: 'y'
                },
                {
                    label: 'Theoretical Probability',
                    data: theoreticalData,
                    type: 'line',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderWidth: 3,
                    pointBackgroundColor: 'rgba(255, 99, 132, 1)',
                    pointBorderColor: 'rgba(255, 255, 255, 1)',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    yAxisID: 'y',
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                title: {
                    display: true,
                    text: title,
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            const index = context[0].dataIndex;
                            const evenCount = data[index].even_count;
                            const oddCount = maxEvenCount - evenCount;
                            return `${evenCount} Even, ${oddCount} Odd Numbers`;
                        },
                        label: function(context) {
                            const index = context.dataIndex;
                            const row = data[index];
                            
                            if (context.datasetIndex === 0) {
                                return [
                                    `Empirical Frequency: ${(row.empirical_relative_frequency * 100).toFixed(2)}%`,
                                    `Count: ${row.empirical_frequency} occurrences`
                                ];
                            } else {
                                return `Theoretical Probability: ${(row.theoretical_probability * 100).toFixed(2)}%`;
                            }
                        }
                    },
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: 'white',
                    bodyColor: 'white',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Even-Odd Pattern',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Frequency / Probability',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    beginAtZero: true,
                    max: Math.max(...empiricalData, ...theoreticalData) * 1.1,
                    ticks: {
                        callback: function(value) {
                            return (value * 100).toFixed(1) + '%';
                        }
                    }
                }
            }
        }
    });
    
    return chart;
}

async function loadEvenOddAnalysis() {
    try {
        console.log('Loading even-odd analysis data...');
        
        // Load all three CSV files
        const [mainData, euroData, combinedData] = await Promise.all([
            loadCSVData('Data_Analysis/Even_Odd_Analysis/main_numbers_even_odd_analysis.csv'),
            loadCSVData('Data_Analysis/Even_Odd_Analysis/euro_numbers_even_odd_analysis.csv'),
            loadCSVData('Data_Analysis/Even_Odd_Analysis/combined_numbers_even_odd_analysis.csv')
        ]);
        
        console.log('Main numbers data:', mainData);
        console.log('Euro numbers data:', euroData);
        console.log('Combined data:', combinedData);
        
        // Create charts
        const mainChart = createEvenOddChart(
            'mainNumbersChart',
            mainData,
            'Main Numbers Even-Odd Distribution',
            5
        );
        
        const euroChart = createEvenOddChart(
            'euroNumbersChart',
            euroData,
            'Euro Numbers Even-Odd Distribution',
            2
        );
        
        const combinedChart = createEvenOddChart(
            'combinedNumbersChart',
            combinedData,
            'Combined Numbers Even-Odd Distribution',
            7
        );
        
        // Store charts for cleanup
        charts = [mainChart, euroChart, combinedChart];
        
        console.log('Even-odd analysis loaded successfully');
        
    } catch (error) {
        console.error('Error loading even-odd analysis:', error);
        
        // Show error message to user
        const containers = ['mainNumbersChart', 'euroNumbersChart', 'combinedNumbersChart'];
        containers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                container.parentElement.innerHTML = `
                    <div class="alert alert-danger" role="alert">
                        <i class="bi bi-exclamation-triangle me-2"></i>
                        <strong>Error loading data:</strong> ${error.message}
                        <br><small>Please check that the CSV files exist in Data_Analysis/Even_Odd_Analysis/</small>
                    </div>
                `;
            }
        });
    }
}

export function init() {
    console.log('Initializing even-odd analysis module');
    loadEvenOddAnalysis();
}

export function cleanup() {
    console.log('Cleaning up even-odd analysis module');
    
    // Destroy all charts
    charts.forEach(chart => {
        if (chart) {
            chart.destroy();
        }
    });
    charts = [];
}