import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

function ReloadPrompt() {
  const { offlineReady: [offlineReady, setOfflineReady], needRefresh: [needRefresh, setNeedRefresh], updateServiceWorker } = useRegisterSW({
    onRegistered(r) {
      // eslint-disable-next-line no-console
      console.log(`SW Registered: ${r}`);
    },
    onRegisterError(error) {
      // eslint-disable-next-line no-console
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <div className="fixed right-0 bottom-0 m-4 p-4 border rounded-md shadow-lg bg-white">
      {(offlineReady || needRefresh) && (
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            {offlineReady ? (
              <p>App ready to work offline.</p>
            ) : (
              <p>New content available, click on reload button to update.</p>
            )}
          </div>
          {needRefresh && (
            <button className="px-4 py-2 bg-primary text-white rounded-md" onClick={() => updateServiceWorker(true)}>Reload</button>
          )}
          <button className="px-4 py-2 border rounded-md" onClick={() => close()}>Close</button>
        </div>
      )}
    </div>
  );
}

export default ReloadPrompt;
