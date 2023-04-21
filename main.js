let selectionMade = false;

// Load the data from the JSON file
fetch('data1.json')
  .then(response => response.json())
  .then(data => {
    // Extract the headers from the data
    const headers = data[0];

    // Extract the state and county data
    const stateData = [...new Set(data.slice(1).map(row => row[1]))];
    const countyData = [...new Set(data.slice(1).map(row => row[3]))];

    // Populate the state dropdown
    const stateSelect = document.getElementById('state-select');
    stateData.forEach(state => {
      const option = document.createElement('option');
      option.text = state;
      stateSelect.add(option);
    });

    // Populate the county dropdown
    const countySelect = document.getElementById('county-select');
    countyData.forEach(county => {
      const option = document.createElement('option');
      option.text = county;
      countySelect.add(option);
    });

    // Add an event listener to the state dropdown
    stateSelect.addEventListener('change', () => {
      // Get the selected state
      const selectedState = stateSelect.value;

      // Filter the data by the selected state
      const filteredData = data.filter(row => row[1] === selectedState);

      // Update the county dropdown with the counties in the selected state
      countySelect.innerHTML = '';
      const countiesInState = [...new Set(filteredData.map(row => row[3]))];
      countiesInState.forEach(county => {
        const option = document.createElement('option');
        option.text = county;
        countySelect.add(option);
      });

      // Set selectionMade flag to true
      selectionMade = true;

      // Update the chart with the filtered data
      updateChart(filteredData);
    });

    // Add an event listener to the county dropdown
    countySelect.addEventListener('change', () => {
      // Get the selected state and county
      const selectedState = stateSelect.value;
      const selectedCounty = countySelect.value;

      // Filter the data by the selected state and county
      const filteredData = data.filter(row => row[1] === selectedState && row[3] === selectedCounty);

      // Set selectionMade flag to true
      selectionMade = true;

      // Update the chart with the filtered data
      updateChart(filteredData);
    });

    // Draw the initial chart with all data
    updateChart(data.slice(1));
  });

let myChart; // Declare a variable to hold the chart object

function updateChart(data) {
  const headers = data[0];

  // Only update chart if selection has been made
  if (!selectionMade) {
    return;
  }

  // Create an object that maps the data series to their respective colors
  const colorMap = {
    ABOVEAT: 'red',
    ALICE: 'green',
    POVERTY: 'blue',
  };

  // Get the labels for the x-axis (Group)
  const labels = [...new Set(data.map(row => row[headers.indexOf('Group')]))];

  // Check if a selection has been made in both the state and county dropdowns
  const selectedState = document.getElementById('state-select').value;
  const selectedCounty = document.getElementById('county-select').value;

  if (selectedState && selectedCounty) {
    // Filter the data by the selected state and county
    data = data.filter(row => row[1] === selectedState && row[3] === selectedCounty);
  }

  const chartData = {
    labels: labels,
    datasets: Object.entries
    (colorMap).map(([series, color]) => ({
      label: series,
      data: data.map(row => row[headers.indexOf(series)]),
      backgroundColor: color,
      borderColor: color,
      fill: false,
      })),
      };
      
      // Check if chart has already been initialized
      if (myChart) {
      // If chart exists, update the data
      myChart.data = chartData;
      myChart.update();
      } else {
      // If chart doesn't exist, create it
      const ctx = document.getElementById('chart').getContext('2d');
      myChart = new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: {
      responsive: true,
      maintainAspectRatio: false,
      legend: {
      position: 'top',
      },
      scales: {
      xAxes: [{
      scaleLabel: {
      display: true,
      labelString: headers[headers.indexOf('Group')],
      },
      }],
      yAxes: [{
      scaleLabel: {
      display: true,
      labelString: 'Percentage',
      },
      }],
      },
      },
      });
      }
      }