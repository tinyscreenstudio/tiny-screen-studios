import { useEffect, useRef } from 'react';
import { documentationLoader } from '../utils/documentationLoader';

/**
 * Hook to manage documentation content preloading
 */
export function useDocumentationPreloader() {
  const hasPreloaded = useRef(false);

  useEffect(() => {
    // Only preload once per app session
    if (hasPreloaded.current) return;

    const preloadContent = async () => {
      try {
        // Preload common content that users are likely to visit
        await documentationLoader.preloadCommonContent();
        hasPreloaded.current = true;
      } catch (error) {
        console.debug('Initial content preloading failed:', error);
      }
    };

    // Start preloading after a short delay to not block initial render
    const timeoutId = setTimeout(preloadContent, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  return {
    preloadCommonContent: () => documentationLoader.preloadCommonContent(),
    preloadRelatedContent: (section: string, topic?: string) =>
      documentationLoader.preloadRelatedContent(section, topic),
    preloadNextContent: (section: string, topic?: string) =>
      documentationLoader.preloadNextContent(section, topic),
  };
}
