let mainNumbersChart = null;
let euroChart1 = null;
let euroChart2 = null;
let euroChart3 = null;

// Function to load CSV data
async function loadCSVData(filename) {
  try {
    const response = await fetch(filename);
    const text = await response.text();
    const rows = text.split('\n').slice(1); // Skip header
    
    const data = [];
    rows.forEach(row => {
      const columns = row.split(',');
      if (columns.length >= 2 && columns[0] && columns[1]) {
        data.push({
          number: parseInt(columns[0]),
          value: parseFloat(columns[1])
        });
      }
    });
    
    return data.sort((a, b) => a.number - b.number);
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    return [];
  }
}
// Function to load frequency data with both absolute and relative frequencies
async function loadFrequencyData(filename) {
    try {
      const response = await fetch(filename);
      const text = await response.text();
      const rows = text.trim().split('\n').slice(1); // Skip header and remove empty rows
      
      const data = [];
      rows.forEach((row, index) => {
        const trimmedRow = row.trim();
        if (trimmedRow) { // Only process non-empty rows
          const columns = trimmedRow.split(',');
          if (columns.length >= 3 && columns[0] && columns[1] && columns[2]) {
            const number = parseInt(columns[0].trim());
            const absoluteFreq = parseInt(columns[1].trim());
            const relativeFreq = parseFloat(columns[2].trim());
            
            if (!isNaN(number) && !isNaN(absoluteFreq) && !isNaN(relativeFreq)) {
              data.push({
                number: number,
                absoluteFrequency: absoluteFreq,
                relativeFrequency: relativeFreq
              });
            }
          }
        }
      });
      
      console.log(`Loaded ${data.length} frequency data points from ${filename}`);
      return data.sort((a, b) => a.number - b.number);
    } catch (error) {
      console.error(`Error loading ${filename}:`, error);
      return [];
    }
  }

// Function to create euro number chart
async function createEuroChart(canvasId, interval, maxNumber, folderSuffix, statsPrefix) {
  try {
    const basePath = `Data_Analysis/Number_Frequency_Analysis/euro_numbers_${folderSuffix}`;
    
    // Load both CSV files
    const [absoluteData, relativeData] = await Promise.all([
      loadCSVData(`${basePath}/absolute_frequencies.csv`),
      loadCSVData(`${basePath}/relative_frequencies.csv`)
    ]);

    if (absoluteData.length === 0 || relativeData.length === 0) {
      document.getElementById(canvasId).parentElement.innerHTML = 
        `<div class="alert alert-warning">Unable to load frequency data for ${interval}. Please check that the CSV files exist.</div>`;
      return;
    }

    // Extract data
    const numbers = absoluteData.map(d => d.number);
    const absoluteFreqs = absoluteData.map(d => d.value);
    const relativeFreqs = relativeData.map(d => d.value);

    // Calculate statistics
    const totalFreq = absoluteFreqs.reduce((sum, freq) => sum + freq, 0);
    const expectedRelativeFreq = 1 / maxNumber;
    
    const maxAbsIdx = absoluteFreqs.indexOf(Math.max(...absoluteFreqs));
    const minAbsIdx = absoluteFreqs.indexOf(Math.min(...absoluteFreqs));

    // Update statistics display
    document.getElementById(`${statsPrefix}-most-frequent`).textContent = 
      `#${numbers[maxAbsIdx]} (${absoluteFreqs[maxAbsIdx]})`;
    document.getElementById(`${statsPrefix}-least-frequent`).textContent = 
      `#${numbers[minAbsIdx]} (${absoluteFreqs[minAbsIdx]})`;
    document.getElementById(`${statsPrefix}-total-draws`).textContent = Math.round(totalFreq / 2);

    // Create bar colors (highlight most and least frequent)
    const barColors = numbers.map((num, idx) => {
      if (idx === maxAbsIdx) return 'rgba(220, 53, 69, 0.8)'; // Red for most frequent
      if (idx === minAbsIdx) return 'rgba(25, 135, 84, 0.8)'; // Green for least frequent
      return 'rgba(255, 159, 64, 0.8)'; // Orange for normal (different from main numbers)
    });

    // Create the chart
    const ctx = document.getElementById(canvasId).getContext('2d');
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: numbers,
        datasets: [
          {
            label: 'Absolute Frequency',
            data: absoluteFreqs,
            backgroundColor: barColors,
            borderColor: barColors.map(color => color.replace('0.8', '1')),
            borderWidth: 1,
            yAxisID: 'y'
          },
          {
            label: 'Relative Frequency',
            data: relativeFreqs,
            type: 'line',
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.1)',
            borderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 5,
            yAxisID: 'y1',
            fill: false
          },
          {
            label: 'Expected Relative Frequency',
            data: new Array(maxNumber).fill(expectedRelativeFreq),
            type: 'line',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderDash: [10, 5],
            borderWidth: 2,
            pointRadius: 0,
            yAxisID: 'y1',
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          title: {
            display: true,
            text: `Euro Numbers - ${interval}`,
            font: { size: 12 }
          },
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              title: function(context) {
                return `Euro Number: ${context[0].label}`;
              },
              label: function(context) {
                if (context.datasetIndex === 0) {
                  return `Absolute Frequency: ${context.parsed.y}`;
                } else if (context.datasetIndex === 1) {
                  return `Relative Frequency: ${(context.parsed.y * 100).toFixed(2)}%`;
                } else {
                  return `Expected: ${(context.parsed.y * 100).toFixed(2)}%`;
                }
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Euro Numbers',
              font: { size: 11 }
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Absolute',
              color: 'rgba(255, 159, 64, 1)',
              font: { size: 10 }
            },
            ticks: {
              color: 'rgba(255, 159, 64, 1)',
              font: { size: 10 }
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Relative',
              color: 'rgba(75, 192, 192, 1)',
              font: { size: 10 }
            },
            ticks: {
              color: 'rgba(75, 192, 192, 1)',
              font: { size: 10 },
              callback: function(value) {
                return (value * 100).toFixed(1) + '%';
              }
            },
            grid: {
              drawOnChartArea: false,
            }
          }
        }
      }
    });

    return chart;

  } catch (error) {
    console.error(`Error creating euro chart ${canvasId}:`, error);
    document.getElementById(canvasId).parentElement.innerHTML = 
      `<div class="alert alert-danger">Error creating chart for ${interval}. Please check the console for details.</div>`;
    return null;
  }
}


// Function to create main numbers frequency chart
async function createMainNumbersChart() {
    try {
      const data = await loadFrequencyData('Data_Analysis/Number_Frequency_Analysis/main_numbers_frequency_analysis.csv');
  
      if (data.length === 0) {
        document.getElementById('mainNumbersChart').parentElement.innerHTML = 
          '<div class="alert alert-warning">Unable to load main numbers frequency data. Please check that the CSV file exists.</div>';
        return;
      }
  
      // Calculate statistics
        const totalNumbers = data.reduce((sum, d) => sum + d.absoluteFrequency, 0);
        const totalDraws = totalNumbers / 5; // 5 main numbers per draw
        const expectedFrequency = totalNumbers / 50; // Add this line

        // Find most and least frequent numbers
        const mostFrequentData = data.reduce((max, current) => 
        current.absoluteFrequency > max.absoluteFrequency ? current : max
        );
        const leastFrequentData = data.reduce((min, current) => 
        current.absoluteFrequency < min.absoluteFrequency ? current : min
        );

        // Update statistics display if elements exist
        const mostFreqNumberElement = document.getElementById('most-frequent-number');
        const mostFreqCountElement = document.getElementById('most-frequent-count');
        const mostFreqRelativeElement = document.getElementById('most-frequent-relative');
        const leastFreqNumberElement = document.getElementById('least-frequent-number');
        const leastFreqCountElement = document.getElementById('least-frequent-count');
        const leastFreqRelativeElement = document.getElementById('least-frequent-relative');
        const totalDrawsElement = document.getElementById('total-draws');

        if (mostFreqNumberElement) mostFreqNumberElement.textContent = mostFrequentData.number;
        if (mostFreqCountElement) mostFreqCountElement.textContent = mostFrequentData.absoluteFrequency + ' times';
        if (mostFreqRelativeElement) mostFreqRelativeElement.textContent = (mostFrequentData.relativeFrequency * 100).toFixed(2) + '%';
        if (leastFreqNumberElement) leastFreqNumberElement.textContent = leastFrequentData.number;
        if (leastFreqCountElement) leastFreqCountElement.textContent = leastFrequentData.absoluteFrequency + ' times';
        if (leastFreqRelativeElement) leastFreqRelativeElement.textContent = (leastFrequentData.relativeFrequency * 100).toFixed(2) + '%';
        if (totalDrawsElement) totalDrawsElement.textContent = Math.round(totalDraws);
  
      // Prepare chart data
      const numbers = data.map(d => d.number);
      const absoluteFrequencies = data.map(d => d.absoluteFrequency);
      const relativeFrequencies = data.map(d => d.relativeFrequency);
  
      // Destroy existing chart
      if (mainNumbersChart) {
        mainNumbersChart.destroy();
      }
  
      // Create the chart
const ctx = document.getElementById('mainNumbersChart').getContext('2d');
mainNumbersChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: numbers,
    datasets: [
      {
        label: 'Absolute Frequency',
        data: absoluteFrequencies,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        yAxisID: 'y'
      },
      {
        label: 'Expected Frequency',
        data: new Array(50).fill(expectedFrequency),
        type: 'line',
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 3,
        yAxisID: 'y',
        fill: false,
        borderDash: [5, 5]
      },
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: 'Main Numbers Frequency Distribution (1-50)',
        font: { size: 16 }
      },
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        callbacks: {
          title: function(context) {
            return `Number: ${context[0].label}`;
          },
          label: function(context) {
            if (context.datasetIndex === 0) {
              return `Absolute Frequency: ${context.parsed.y}`;
            } else {
              return `Expected Frequency: ${context.parsed.y.toFixed(1)}`;
            }
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Main Numbers (1-50)'
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Absolute Frequency',
          color: 'rgba(54, 162, 235, 1)'
        },
        ticks: {
          color: 'rgba(54, 162, 235, 1)'
        },
        min: Math.min(...absoluteFrequencies) - 5,
        max: Math.max(...absoluteFrequencies) + 5
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Relative Frequency (%)',
          color: 'rgba(75, 192, 192, 1)'
        },
        ticks: {
          color: 'rgba(75, 192, 192, 1)',
          callback: function(value) {
            return (value * 100).toFixed(1) + '%';
          }
        },
        min: Math.min(...relativeFrequencies) - 0.001,
        max: Math.max(...relativeFrequencies) + 0.001,
        grid: {
          drawOnChartArea: false,
        }
      }
    }
  }
});
  
    } catch (error) {
      console.error('Error creating main numbers frequency chart:', error);
      document.getElementById('mainNumbersChart').parentElement.innerHTML = 
        '<div class="alert alert-danger">Error creating main numbers frequency chart. Please check the console for details.</div>';
    }
}

// Function to load all euro number charts
async function loadEuroNumbersCharts() {
  // Destroy existing charts if they exist
  if (euroChart1) euroChart1.destroy();
  if (euroChart2) euroChart2.destroy();
  if (euroChart3) euroChart3.destroy();

  // Create all euro charts
  euroChart3 = await createEuroChart('euroChart3', 'Interval 3 (2022-Present)', 12, 'interval_3_(2022-present)', 'euro3');
  euroChart2 = await createEuroChart('euroChart2', 'Interval 2 (2014-2022)', 10, 'interval_2_(2014-2022)', 'euro2');
  euroChart1 = await createEuroChart('euroChart1', 'Interval 1 (2012-2014)', 8, 'interval_1_(2012-2014)', 'euro1');
}

// Module initialization function
export function init() {
  // Create main numbers chart
  createMainNumbersChart();

  loadEuroNumbersCharts();
}

// Module cleanup function
export function cleanup() {
  if (mainNumbersChart) {
    mainNumbersChart.destroy();
    mainNumbersChart = null;
  }
  if (euroChart1) {
    euroChart1.destroy();
    euroChart1 = null;
  }
  if (euroChart2) {
    euroChart2.destroy();
    euroChart2 = null;
  }
  if (euroChart3) {
    euroChart3.destroy();
    euroChart3 = null;
  }
}