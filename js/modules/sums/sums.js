let mainSumsChart = null;
let euroSums2022Chart = null;
let euroSums2014Chart = null;
let euroSums2012Chart = null;

// Function to load CSV data
async function loadCSVData(filename) {
  try {
    const response = await fetch(filename);
    const text = await response.text();
    const rows = text.trim().split('\n').slice(1); // Skip header and remove empty rows
    
    const data = [];
    rows.forEach((row, index) => {
      const trimmedRow = row.trim();
      if (trimmedRow) { // Only process non-empty rows
        const columns = trimmedRow.split(',');
        if (columns.length >= 2 && columns[0] && columns[1]) {
          const sum = parseInt(columns[0].trim());
          const value = parseFloat(columns[1].trim());
          
          if (!isNaN(sum) && !isNaN(value)) {
            data.push({
              sum: sum,
              value: value
            });
          }
        }
      }
    });
    
    console.log(`Loaded ${data.length} data points from ${filename}`);
    return data.sort((a, b) => a.sum - b.sum);
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    return [];
  }
}

// Function to load raw drawing data with time filtering
async function loadRawDrawingData() {
  try {
    const response = await fetch('Data_Analysis/Data/drawing_results_20250808.csv');
    const text = await response.text();
    const rows = text.trim().split('\n');
    const headers = rows[0].split(',');
    
    const data = [];
    for (let i = 1; i < rows.length; i++) {
      const columns = rows[i].split(',');
      if (columns.length >= headers.length) {
        const record = {};
        headers.forEach((header, index) => {
          record[header.trim()] = columns[index].trim();
        });
        
        // Parse date (try both Datum and Date columns)
        const dateStr = record['Datum'] || record['Date'];
        if (dateStr) {
          record.date = new Date(dateStr);
          
          // Parse main numbers
          record.mainSum = parseInt(record.Z1) + parseInt(record.Z2) + parseInt(record.Z3) + parseInt(record.Z4) + parseInt(record.Z5);
          
          // Parse euro numbers
          record.euroSum = parseInt(record.EZ1) + parseInt(record.EZ2);
          
          data.push(record);
        }
      }
    }
    
    console.log(`Loaded ${data.length} raw drawing records`);
    return data.sort((a, b) => a.date - b.date);
  } catch (error) {
    console.error('Error loading raw drawing data:', error);
    return [];
  }
}

// Function to filter data by time frame (only for main chart now)
function filterDataByTimeFrame(data, timeFrame) {
  if (data.length === 0) return data;
  
  const now = new Date();
  let startDate;
  
  switch (timeFrame) {
    case '1year':
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      break;
    case '2years':
      startDate = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
      break;
    case '3years':
      startDate = new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());
      break;
    case 'max':
    default:
      return data; // Return all data
  }
  
  return data.filter(record => record.date >= startDate);
}

// Function to create empirical distribution from filtered data
function createEmpiricalDistributionFromData(data, sumProperty) {
  const sums = data.map(record => record[sumProperty]);
  const sumCounts = {};
  
  sums.forEach(sum => {
    sumCounts[sum] = (sumCounts[sum] || 0) + 1;
  });
  
  const result = Object.keys(sumCounts).map(sum => ({
    sum: parseInt(sum),
    value: sumCounts[sum]
  }));
  
  return result.sort((a, b) => a.sum - b.sum);
}

// Function to calculate statistics
function calculateStatistics(data, isFrequency = true) {
  if (data.length === 0) return { mean: 0, min: 0, max: 0, total: 0 };
  
  const sums = data.map(d => d.sum);
  const values = data.map(d => d.value);
  
  let mean;
  if (isFrequency) {
    // Weighted mean for frequency data
    const totalCount = values.reduce((sum, val) => sum + val, 0);
    mean = data.reduce((sum, item) => sum + (item.sum * item.value), 0) / totalCount;
  } else {
    // Simple mean for probability data
    mean = data.reduce((sum, item) => sum + (item.sum * item.value), 0);
  }
  
  return {
    mean: mean.toFixed(2),
    min: Math.min(...sums),
    max: Math.max(...sums),
    total: isFrequency ? values.reduce((sum, val) => sum + val, 0) : values.length
  };
}

// Function to create main numbers sum chart (with time frame functionality)
async function createMainSumsChart(timeFrame = 'max') {
  try {
    const basePath = 'Data_Analysis/Sum_Number_Analysis';
    
    // Load theoretical data and raw data
    const [theoreticalData, rawData] = await Promise.all([
      loadCSVData(`${basePath}/main_numbers_theoretical_sum_distribution.csv`),
      loadRawDrawingData()
    ]);

    if (theoreticalData.length === 0 || rawData.length === 0) {
      document.getElementById('mainSumsChart').parentElement.innerHTML = 
        '<div class="alert alert-warning">Unable to load main numbers sum data. Please check that the CSV files exist.</div>';
      return;
    }

    // Filter raw data by time frame and create empirical distribution
    const filteredData = filterDataByTimeFrame(rawData, timeFrame);
    const empiricalData = createEmpiricalDistributionFromData(filteredData, 'mainSum');

    console.log(`Filtered to ${filteredData.length} records for timeframe: ${timeFrame}`);

    // Calculate statistics
    const empStats = calculateStatistics(empiricalData, true);
    const theoStats = calculateStatistics(theoreticalData, false);
    
    // Update statistics display
    document.getElementById('main-empirical-mean').textContent = empStats.mean;
    document.getElementById('main-theoretical-mean').textContent = theoStats.mean;
    document.getElementById('main-empirical-range').textContent = `${empStats.min}-${empStats.max}`;
    document.getElementById('main-total-draws').textContent = Math.round(empStats.total / 5); // 5 numbers per draw

    // Use the COMPLETE theoretical data range as the base for x-axis
    const allSums = theoreticalData.map(d => d.sum);

    // Map empirical frequencies to match theoretical sum values (use 0 for missing)
    const empiricalFreqsAbsolute = allSums.map(sum => {
      const empEntry = empiricalData.find(item => item.sum === sum);
      return empEntry ? empEntry.value : 0;
    });

    // Convert absolute frequencies to relative frequencies
    const totalEmpiricalCount = empiricalFreqsAbsolute.reduce((sum, freq) => sum + freq, 0);
    const empiricalFreqsRelative = empiricalFreqsAbsolute.map(freq => freq / totalEmpiricalCount);

    // Use all theoretical probabilities as-is (complete dataset)
    const theoreticalProbsComplete = theoreticalData.map(d => d.value);

    // Calculate scaling to maintain visual alignment between axes
    const maxEmpiricalFreq = Math.max(...empiricalFreqsRelative);
    const maxTheoreticalProb = Math.max(...theoreticalProbsComplete);
    const yAxisMax = Math.max(maxEmpiricalFreq, maxTheoreticalProb) * 1.1; // Add 10% padding

    // Destroy existing chart
    if (mainSumsChart) {
      mainSumsChart.destroy();
    }

    // Helper function to get time frame label
    function getTimeFrameLabel(timeFrame) {
      switch (timeFrame) {
        case '1year': return 'Last 1 Year';
        case '2years': return 'Last 2 Years';
        case '3years': return 'Last 3 Years';
        case 'max': return 'All Time';
        default: return 'All Time';
      }
    }

    // Create the chart with absolute frequency on left axis
    const ctx = document.getElementById('mainSumsChart').getContext('2d');
    mainSumsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: allSums,
        datasets: [
          {
            label: 'Empirical Distribution',
            data: empiricalFreqsAbsolute,
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            yAxisID: 'y'
          },
          {
            label: 'Theoretical Probability',
            data: theoreticalProbsComplete,
            type: 'line',
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.1)',
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 3,
            yAxisID: 'y1',
            fill: false,
            borderDash: [5, 5],
            tension: 0.1
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
            text: `Main Numbers Sum Distribution (${getTimeFrameLabel(timeFrame)})`,
            font: { size: 16 }
          },
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: { size: 11 }
            }
          },
          tooltip: {
            callbacks: {
              title: function(context) {
                return `Sum: ${context[0].label}`;
              },
              label: function(context) {
                if (context.datasetIndex === 0) {
                  return `Empirical Absolute Frequency: ${context.parsed.y}`;
                } else {
                  return `Theoretical Probability: ${(context.parsed.y * 100).toFixed(4)}%`;
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
              text: 'Sum of Main Numbers'
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            min: 0,
            max: Math.max(...empiricalFreqsAbsolute) * 1.1,
            title: {
              display: true,
              text: 'Empirical Absolute Frequency',
              color: 'rgba(54, 162, 235, 1)'
            },
            ticks: {
              color: 'rgba(54, 162, 235, 1)'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            min: 0,
            max: yAxisMax,
            title: {
              display: true,
              text: 'Theoretical Probability',
              color: 'rgba(255, 99, 132, 1)'
            },
            ticks: {
              color: 'rgba(255, 99, 132, 1)',
              callback: function(value) {
                return (value * 100).toFixed(2) + '%';
              }
            },
            grid: {
              drawOnChartArea: false,
            }
          }
        }
      }
    });

  } catch (error) {
    console.error('Error creating main sums chart:', error);
    document.getElementById('mainSumsChart').parentElement.innerHTML = 
      '<div class="alert alert-danger">Error creating main numbers chart. Please check the console for details.</div>';
  }
}

// Function to create euro sums chart (no time frame functionality)
async function createEuroSumsChart(canvasId, period, statsPrefix) {
  try {
    const basePath = 'Data_Analysis/Sum_Number_Analysis';
    
    // Load both empirical and theoretical data
    const [empiricalData, theoreticalData] = await Promise.all([
      loadCSVData(`${basePath}/euro_numbers_${period}_empirical_sum_distribution.csv`),
      loadCSVData(`${basePath}/euro_numbers_${period}_theoretical_sum_distribution.csv`)
    ]);

    if (empiricalData.length === 0 || theoreticalData.length === 0) {
      document.getElementById(canvasId).parentElement.innerHTML = 
        '<div class="alert alert-warning">Unable to load euro numbers sum data for this period.</div>';
      return;
    }

    // Calculate statistics
    const empStats = calculateStatistics(empiricalData, true);
    const theoStats = calculateStatistics(theoreticalData, false);
    
    // Update statistics display
    document.getElementById(`${statsPrefix}-empirical-mean`).textContent = empStats.mean;
    document.getElementById(`${statsPrefix}-theoretical-mean`).textContent = theoStats.mean;
    document.getElementById(`${statsPrefix}-range`).textContent = `${empStats.min}-${empStats.max}`;
    document.getElementById(`${statsPrefix}-draws`).textContent = Math.round(empStats.total / 2); // 2 euro numbers per draw

    // Use theoretical data as complete base for euro charts too
    const allSums = theoreticalData.map(d => d.sum);
    
    // Map empirical frequencies
    const empiricalFreqsAbsolute = allSums.map(sum => {
      const empEntry = empiricalData.find(item => item.sum === sum);
      return empEntry ? empEntry.value : 0;
    });

    // Convert to relative frequencies
    const totalEmpiricalCount = empiricalFreqsAbsolute.reduce((sum, freq) => sum + freq, 0);
    const empiricalFreqsRelative = empiricalFreqsAbsolute.map(freq => freq / totalEmpiricalCount);

    const theoreticalProbsComplete = theoreticalData.map(d => d.value);

    // Calculate unified scaling for euro charts
    const maxEmpiricalFreq = Math.max(...empiricalFreqsRelative);
    const maxTheoreticalProb = Math.max(...theoreticalProbsComplete);
    const yAxisMax = Math.max(maxEmpiricalFreq, maxTheoreticalProb) * 1.1; // Add 10% padding

    // Create the chart
    const ctx = document.getElementById(canvasId).getContext('2d');
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: allSums,
        datasets: [
          {
            label: 'Empirical',
            data: empiricalFreqsAbsolute,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            yAxisID: 'y'
          },
          {
            label: 'Theoretical',
            data: theoreticalProbsComplete,
            type: 'line',
            borderColor: 'rgba(255, 159, 64, 1)',
            backgroundColor: 'rgba(255, 159, 64, 0.1)',
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 3,
            yAxisID: 'y1',
            fill: false,
            borderDash: [5, 5],
            tension: 0.1
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
            text: `Euro Numbers Sum Distribution ${period}`,
            font: { size: 12 }
          },
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: { size: 9 }
            }
          },
          tooltip: {
            callbacks: {
              title: function(context) {
                return `Sum: ${context[0].label}`;
              },
              label: function(context) {
                if (context.datasetIndex === 0) {
                  return `Empirical Absolute Frequency: ${context.parsed.y}`;
                } else {
                  return `Theoretical Probability: ${(context.parsed.y * 100).toFixed(2)}%`;
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
              text: 'Sum',
              font: { size: 10 }
            },
            ticks: {
              font: { size: 9 }
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            min: 0,
            max: Math.max(...empiricalFreqsAbsolute) * 1.1,
            title: {
              display: true,
              text: 'Empirical Absolute Frequency',
              color: 'rgba(75, 192, 192, 1)',
              font: { size: 10 }
            },
            ticks: {
              color: 'rgba(75, 192, 192, 1)',
              font: { size: 9 }
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            min: 0,
            max: yAxisMax,
            title: {
              display: true,
              text: 'Theoretical Probability',
              color: 'rgba(255, 159, 64, 1)',
              font: { size: 10 }
            },
            ticks: {
              color: 'rgba(255, 159, 64, 1)',
              font: { size: 9 },
              callback: function(value) {
                return (value * 100).toFixed(2) + '%';
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
    console.error(`Error creating euro sums chart ${canvasId}:`, error);
    document.getElementById(canvasId).parentElement.innerHTML = 
      '<div class="alert alert-danger">Error creating chart. Please check the console for details.</div>';
    return null;
  }
}

// Function to handle time frame selection (only for main chart)
function handleTimeFrameChange(chartType, timeFrame) {
  if (chartType === 'main') {
    createMainSumsChart(timeFrame);
  }
}

// Function to load all euro charts (no time frame parameter)
async function loadEuroSumsCharts() {
  // Destroy existing charts if they exist
  if (euroSums2022Chart) euroSums2022Chart.destroy();
  if (euroSums2014Chart) euroSums2014Chart.destroy();
  if (euroSums2012Chart) euroSums2012Chart.destroy();

  // Create all euro charts
  euroSums2022Chart = await createEuroSumsChart('euroSums2022Chart', '2022_present', 'euro2022');
  euroSums2014Chart = await createEuroSumsChart('euroSums2014Chart', '2014_2022', 'euro2014');
  euroSums2012Chart = await createEuroSumsChart('euroSums2012Chart', '2012_2014', 'euro2012');
}

// Module initialization function
export function init() {
  console.log('Initializing sums module...');
  createMainSumsChart();
  loadEuroSumsCharts();
  
  // Expose the handleTimeFrameChange function globally for dropdown events (main chart only)
  window.handleSumsTimeFrameChange = handleTimeFrameChange;
}

// Module cleanup function
export function cleanup() {
  if (mainSumsChart) {
    mainSumsChart.destroy();
    mainSumsChart = null;
  }
  if (euroSums2022Chart) {
    euroSums2022Chart.destroy();
    euroSums2022Chart = null;
  }
  if (euroSums2014Chart) {
    euroSums2014Chart.destroy();
    euroSums2014Chart = null;
  }
  if (euroSums2012Chart) {
    euroSums2012Chart.destroy();
    euroSums2012Chart = null;
  }
  
  // Clean up global function
  if (window.handleSumsTimeFrameChange) {
    delete window.handleSumsTimeFrameChange;
  }
}