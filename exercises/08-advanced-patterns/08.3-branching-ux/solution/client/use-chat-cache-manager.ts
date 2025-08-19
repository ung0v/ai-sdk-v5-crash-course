import { useState } from 'react';

/**
 * We need complete control over when useChat's cache gets cleared.
 *
 * For that, we use a random UUID as the id for the useChat hook.
 *
 * We then clear the cache by setting a new random UUID.
 *
 * This way, we can control when the cache gets cleared.
 */
export const useChatCacheManager = () => {
  const [id, setId] = useState(() => crypto.randomUUID());

  return {
    hash: id,
    clear: () => {
      /**
       * We wrap this in requestIdleCallback so that we can
       * call it after the current event loop has finished.
       *
       * This means you can call it after navigate() and it
       * will be guaranteed to be called after the navigation
       * has completed - meaning the new chat id is set.
       */
      requestIdleCallback(() => {
        setId(crypto.randomUUID());
      });
    },
  };
};
