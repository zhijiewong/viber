// DevTools page script
// This runs in the context of the DevTools window

chrome.devtools.panels.create(
  'DOM Agent',
  'icons/icon16.png',
  'devtools-panel.html',
  (panel) => {
    console.log('DOM Agent DevTools panel created');

    // Set up panel event listeners
    panel.onShown.addListener(() => {
      console.log('DOM Agent DevTools panel shown');
    });

    panel.onHidden.addListener(() => {
      console.log('DOM Agent DevTools panel hidden');
    });
  }
);

// Create elements panel (optional)
chrome.devtools.panels.elements.createSidebarPane(
  'DOM Agent',
  (sidebar: any) => {
    sidebar.setPage('devtools-panel.html');
    console.log('DOM Agent elements sidebar created');
  }
);

// Network panel integration (optional)
chrome.devtools.panels.create(
  'DOM Agent Network',
  'icons/icon16.png',
  'devtools-panel.html',
  (panel) => {
    console.log('DOM Agent network panel created');

    panel.onShown.addListener(() => {
      console.log('DOM Agent network panel shown');
    });

    panel.onHidden.addListener(() => {
      console.log('DOM Agent network panel hidden');
    });
  }
);
