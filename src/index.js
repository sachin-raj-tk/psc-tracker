import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './AppPart2';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);

setTimeout(() => { if (window.__hideSplash) window.__hideSplash(); }, 300);

serviceWorkerRegistration.register({
  onSuccess: () => console.log('PSC Tracker: ready for offline use'),
  onUpdate: reg => {
    if (window.confirm('New version of PSC Tracker available. Reload to update?')) {
      reg.waiting?.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  },
});
