import { AppConfig, defaultConfig } from '../config/appConfig';

/**
 * Configuration manager for handling app configuration
 * This can be extended to support:
 * - Loading from localStorage
 * - Fetching from API
 * - Environment-specific configs
 * - User preference overrides
 */
export class ConfigManager {
  private static instance: ConfigManager;
  private config: AppConfig;

  private constructor() {
    this.config = this.loadConfig();
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private loadConfig(): AppConfig {
    try {
      // Try to load from localStorage first
      const savedConfig = localStorage.getItem('app-config');
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        // Merge with default config to ensure all properties exist
        return this.mergeConfigs(defaultConfig, parsedConfig);
      }
    } catch (error) {
      console.warn('Failed to load config from localStorage:', error);
    }

    // Fall back to default config
    return defaultConfig;
  }

  private mergeConfigs(
    defaultConf: AppConfig,
    userConf: Partial<AppConfig>
  ): AppConfig {
    // Deep merge configs, with user config taking precedence
    return {
      ...defaultConf,
      ...userConf,
      app: { ...defaultConf.app, ...userConf.app },
      navigation: userConf.navigation || defaultConf.navigation,
      header: { ...defaultConf.header, ...userConf.header },
      device: { ...defaultConf.device, ...userConf.device },
      ui: { ...defaultConf.ui, ...userConf.ui },
      features: { ...defaultConf.features, ...userConf.features },
      processing: { ...defaultConf.processing, ...userConf.processing },
    };
  }

  public getConfig(): AppConfig {
    return this.config;
  }

  public updateConfig(updates: Partial<AppConfig>): void {
    this.config = this.mergeConfigs(this.config, updates);
    this.saveConfig();
  }

  public resetConfig(): void {
    this.config = defaultConfig;
    this.saveConfig();
  }

  private saveConfig(): void {
    try {
      localStorage.setItem('app-config', JSON.stringify(this.config));
    } catch (error) {
      console.warn('Failed to save config to localStorage:', error);
    }
  }

  // Utility methods for specific config sections
  public getNavigationItems() {
    return this.config.navigation
      .filter(item => item.enabled)
      .sort((a, b) => a.order - b.order);
  }

  public getFeatureFlag(flag: keyof AppConfig['features']): boolean {
    return this.config.features[flag];
  }

  public toggleFeature(flag: keyof AppConfig['features']): void {
    this.updateConfig({
      features: {
        ...this.config.features,
        [flag]: !this.config.features[flag],
      },
    });
  }
}

// Export singleton instance
export const configManager = ConfigManager.getInstance();
