import { useMemo } from 'react';
import { defaultConfig, AppConfig } from '../config/appConfig';

/**
 * Hook to access application configuration
 * In the future, this can be extended to:
 * - Load config from localStorage
 * - Fetch config from API
 * - Merge with user preferences
 * - Support environment-specific configs
 */
export function useAppConfig(): AppConfig {
  const config = useMemo(() => {
    // For now, return default config
    // Later we can add logic to merge with user preferences or environment configs
    return defaultConfig;
  }, []);

  return config;
}

/**
 * Hook to get specific config sections
 */
export function useNavigationConfig() {
  const config = useAppConfig();
  return config.navigation
    .filter(item => item.enabled)
    .sort((a, b) => a.order - b.order);
}

export function useHeaderConfig() {
  const config = useAppConfig();
  return config.header;
}

export function useDeviceConfig() {
  const config = useAppConfig();
  return config.device;
}

export function useFeatureFlags() {
  const config = useAppConfig();
  return config.features;
}

export function useUIConfig() {
  const config = useAppConfig();
  return config.ui;
}

export function useProcessingConfig() {
  const config = useAppConfig();
  return config.processing;
}
