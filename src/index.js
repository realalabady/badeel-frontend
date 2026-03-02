import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './i18n';
import App from './App';

// Remove any externally injected branding badges (e.g. Emergent Agent)
const removeBrandingBadges = () => {
  document.querySelectorAll('a[href*="emergent"], a[href*="emergentagent"]').forEach(el => {
    const parent = el.closest('[style*="fixed"]') || el;
    if (parent && parent !== document.getElementById('root')) {
      parent.remove();
    }
  });
  // Also remove any fixed-position elements outside #root in bottom-right
  document.querySelectorAll('body > *:not(#root):not(script):not(noscript)').forEach(el => {
    const style = window.getComputedStyle(el);
    if (style.position === 'fixed' && style.bottom !== 'auto' && style.right !== 'auto') {
      el.remove();
    }
  });
};

// Run after initial render and observe for dynamically injected elements
const observer = new MutationObserver(removeBrandingBadges);
observer.observe(document.body, { childList: true, subtree: true });
setTimeout(removeBrandingBadges, 1000);
setTimeout(removeBrandingBadges, 3000);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
