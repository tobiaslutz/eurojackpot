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

// Function to load generator modules (special handling)
async function loadGeneratorModule(generatorType) {
  try {
    // Hide default content
    document.getElementById('default-content').style.display = 'none';
    
    // Load HTML content from the generator-specific file
    const htmlResponse = await fetch(`modules/number-generator/${generatorType}.html`);
    const htmlContent = await htmlResponse.text();
    document.getElementById('dynamic-content').innerHTML = htmlContent;
    
    // Load the generator-specific JavaScript
    const script = document.createElement('script');
    script.src = `js/modules/number-generator/${generatorType}.js`;
    script.onload = () => {
      // Initialize the specific generator
      setTimeout(() => {
        switch(generatorType) {
          case 'random-pick':
            if (window.RandomPickGenerator) {
              currentModule = new window.RandomPickGenerator();
            }
            break;
          case 'custom-pick':
            if (window.CustomPickGenerator) {
              currentModule = new window.CustomPickGenerator();
            }
            break;
          case 'structured-pick':
            if (window.StructuredPickGenerator) {
              currentModule = new window.StructuredPickGenerator();
            }
            break;
        }
      }, 100);
    };
    
    // Remove existing script if present
    const existingScript = document.querySelector(`script[src="js/modules/number-generator/${generatorType}.js"]`);
    if (existingScript) {
      existingScript.remove();
    }
    
    document.head.appendChild(script);
    
    // Close mobile navigation if open
    const mobileNav = bootstrap.Offcanvas.getInstance(document.getElementById('mobileNav'));
    if (mobileNav) {
      mobileNav.hide();
    }
    
  } catch (error) {
    console.error(`Error loading generator ${generatorType}:`, error);
    document.getElementById('dynamic-content').innerHTML = 
      '<div class="alert alert-danger">Error loading generator. Please try again.</div>';
  }
}

// Event listeners for navigation
document.addEventListener('DOMContentLoaded', function() {
  console.log('Setting up navigation event listeners');
  
  // Drawing Results links
  const drawingResultsLinks = document.querySelectorAll('.drawing-results-link');
  drawingResultsLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Drawing results link clicked');
      loadModule('drawing-results');
    });
  });
  
  // Handle Numbers links
  const numbersLinks = document.querySelectorAll('.numbers-link');
  numbersLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Numbers link clicked');
      loadModule('numbers');
    });
  });

  // Handle Sums links
  const sumsLinks = document.querySelectorAll('.sums-link');
  sumsLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Sums link clicked');
      loadModule('sums');
    });
  });

  // Handle Even-Odd links
  const evenOddLinks = document.querySelectorAll('.even-odd-link');
  evenOddLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Even-Odd link clicked');
      loadModule('even-odd');
    });
  });

  // Handle Hot & Cold links
  const hotColdLinks = document.querySelectorAll('.hot-cold-link');
  hotColdLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Hot & Cold link clicked');
      showDefaultContent();
    });
  });

  // Handle Generator links
  const generatorLinks = document.querySelectorAll('.generator-link');
  generatorLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const generatorType = this.getAttribute('data-type');
      console.log('Generator link clicked:', generatorType);
      loadGeneratorModule(generatorType);
    });
  });
  
  console.log('All navigation event listeners set up successfully');
});