// Global variables
let currentModule = null;

// Function to show default content
function showDefaultContent() {
  document.getElementById('default-content').style.display = 'block';
  document.getElementById('dynamic-content').innerHTML = '';
  
  // Close mobile navigation if open
  const mobileNav = bootstrap.Offcanvas.getInstance(document.getElementById('mobileNav'));
  if (mobileNav) {
    mobileNav.hide();
  }
  
  // Clean up current module
  if (currentModule && typeof currentModule.cleanup === 'function') {
    currentModule.cleanup();
  }
  currentModule = null;
}

// Function to load a module
async function loadModule(moduleName) {
  try {
    // Hide default content
    document.getElementById('default-content').style.display = 'none';
    
    // Load HTML content
    const htmlResponse = await fetch(`modules/${moduleName}/${moduleName}.html`);
    const htmlContent = await htmlResponse.text();
    document.getElementById('dynamic-content').innerHTML = htmlContent;
    
    // Load and execute JavaScript module
    const jsModule = await import(`./modules/${moduleName}/${moduleName}.js`);
    
    // Clean up previous module
    if (currentModule && typeof currentModule.cleanup === 'function') {
      currentModule.cleanup();
    }
    
    // Initialize new module
    currentModule = jsModule;
    if (typeof jsModule.init === 'function') {
      jsModule.init();
    }
    
    // Close mobile navigation if open
    const mobileNav = bootstrap.Offcanvas.getInstance(document.getElementById('mobileNav'));
    if (mobileNav) {
      mobileNav.hide();
    }
    
  } catch (error) {
    console.error(`Error loading module ${moduleName}:`, error);
    document.getElementById('dynamic-content').innerHTML = 
      '<div class="alert alert-danger">Error loading content. Please try again.</div>';
  }
}

// Event listeners for navigation
document.addEventListener('DOMContentLoaded', function() {
  console.log('Setting up navigation event listeners');
  
  // Drawing Results links (MOVED INSIDE DOMContentLoaded)
  const drawingResultsLinks = document.querySelectorAll('.drawing-results-link');
  drawingResultsLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Drawing results link clicked');
      loadModule('drawing-results');
    });
  });
  
  // Handle Numbers links (both desktop and mobile)
  const numbersLinks = document.querySelectorAll('.numbers-link');
  numbersLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Numbers link clicked');
      loadModule('numbers');
    });
  });

  // Handle Sums links (both desktop and mobile)
  const sumsLinks = document.querySelectorAll('.sums-link');
  sumsLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Sums link clicked');
      loadModule('sums');
    });
  });

  // Handle Even-Odd links (both desktop and mobile)
  const evenOddLinks = document.querySelectorAll('.even-odd-link');
  evenOddLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Even-Odd link clicked');
      loadModule('even-odd');
    });
  });

  // Handle Hot & Cold links (both desktop and mobile)
  const hotColdLinks = document.querySelectorAll('.hot-cold-link');
  hotColdLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Hot & Cold link clicked');
      showDefaultContent();
    });
  });
  
  console.log('All navigation event listeners set up successfully');
});