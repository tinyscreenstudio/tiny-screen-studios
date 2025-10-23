import type {
  DocumentationLoader as IDocumentationLoader,
  CacheEntry,
  ContentMetadata,
} from '../types/documentation';
import {
  DocumentationError,
  DocumentationSystemError,
} from '../types/documentation';

/**
 * Service for loading and caching markdown documentation content
 */
export class DocumentationLoader implements IDocumentationLoader {
  private cache = new Map<string, CacheEntry>();
  private readonly basePath = '/src/docs';
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes

  /**
   * Load markdown content for a specific section and optional topic
   */
  async loadContent(section: string, topic?: string): Promise<string> {
    const cacheKey = this.getCacheKey(section, topic);

    // Check cache first
    const cachedEntry = this.getCachedContent(cacheKey);
    if (cachedEntry) {
      return cachedEntry.content;
    }

    try {
      const filePath = this.getContentPath(section, topic);
      const content = await this.loadMarkdownFile(filePath);

      // Cache the loaded content
      this.cacheContent(cacheKey, content, section, topic);

      return content;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      if (
        errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('404')
      ) {
        throw new DocumentationSystemError(
          DocumentationError.CONTENT_NOT_FOUND,
          `Documentation content not found for ${section}${topic ? `/${topic}` : ''}`,
          section,
          topic
        );
      }

      throw new DocumentationSystemError(
        DocumentationError.LOADING_ERROR,
        `Failed to load documentation: ${errorMessage}`,
        section,
        topic
      );
    }
  }

  /**
   * Get the file path for a given section and topic
   */
  getContentPath(section: string, topic?: string): string {
    // Validate section name
    if (!section || !this.isValidPathSegment(section)) {
      throw new DocumentationSystemError(
        DocumentationError.LOADING_ERROR,
        `Invalid section name: ${section}`
      );
    }

    // If no topic is provided, use index.md
    if (!topic) {
      return `${this.basePath}/${section}/index.md`;
    }

    // Validate topic name
    if (!this.isValidPathSegment(topic)) {
      throw new DocumentationSystemError(
        DocumentationError.LOADING_ERROR,
        `Invalid topic name: ${topic}`,
        section,
        topic
      );
    }

    return `${this.basePath}/${section}/${topic}.md`;
  }

  /**
   * Load markdown file content using dynamic import
   */
  private async loadMarkdownFile(filePath: string): Promise<string> {
    try {
      // Map file paths to actual import paths
      const importMap: Record<string, () => Promise<{ default: string }>> = {
        // Getting Started
        '/src/docs/getting-started/index.md': () =>
          import('../docs/getting-started/index.md?raw'),
        '/src/docs/getting-started/first-image.md': () =>
          import('../docs/getting-started/first-image.md?raw'),
        '/src/docs/getting-started/arduino.md': () =>
          import('../docs/getting-started/arduino.md?raw'),

        // Displays
        '/src/docs/displays/index.md': () =>
          import('../docs/displays/index.md?raw'),
        '/src/docs/displays/ssd1306.md': () =>
          import('../docs/displays/ssd1306.md?raw'),
        '/src/docs/displays/sh1106.md': () =>
          import('../docs/displays/sh1106.md?raw'),
        '/src/docs/displays/ssd1309.md': () =>
          import('../docs/displays/ssd1309.md?raw'),

        // Image Processing
        '/src/docs/image-processing/index.md': () =>
          import('../docs/image-processing/index.md?raw'),
        '/src/docs/image-processing/formats.md': () =>
          import('../docs/image-processing/formats.md?raw'),
        '/src/docs/image-processing/optimization.md': () =>
          import('../docs/image-processing/optimization.md?raw'),
        '/src/docs/image-processing/animations.md': () =>
          import('../docs/image-processing/animations.md?raw'),

        // Export
        '/src/docs/export/index.md': () =>
          import('../docs/export/index.md?raw'),
        '/src/docs/export/c-arrays.md': () =>
          import('../docs/export/c-arrays.md?raw'),
        '/src/docs/export/binary.md': () =>
          import('../docs/export/binary.md?raw'),
        '/src/docs/export/arduino.md': () =>
          import('../docs/export/arduino.md?raw'),

        // Advanced
        '/src/docs/advanced/index.md': () =>
          import('../docs/advanced/index.md?raw'),
        '/src/docs/advanced/dithering.md': () =>
          import('../docs/advanced/dithering.md?raw'),
        '/src/docs/advanced/bit-order.md': () =>
          import('../docs/advanced/bit-order.md?raw'),
        '/src/docs/advanced/presets.md': () =>
          import('../docs/advanced/presets.md?raw'),

        // Troubleshooting
        '/src/docs/troubleshooting/index.md': () =>
          import('../docs/troubleshooting/index.md?raw'),
        '/src/docs/troubleshooting/display.md': () =>
          import('../docs/troubleshooting/display.md?raw'),
        '/src/docs/troubleshooting/arduino.md': () =>
          import('../docs/troubleshooting/arduino.md?raw'),
        '/src/docs/troubleshooting/quality.md': () =>
          import('../docs/troubleshooting/quality.md?raw'),
      };

      const importFn = importMap[filePath];
      if (!importFn) {
        throw new Error(`No import mapping found for ${filePath}`);
      }

      const module = await importFn();
      return module.default || '';
    } catch (error) {
      console.error('Failed to load markdown file:', {
        filePath,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw new Error(
        `Failed to load ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Check if cached content is still valid
   */
  private getCachedContent(cacheKey: string): CacheEntry | null {
    const entry = this.cache.get(cacheKey);

    if (!entry) {
      return null;
    }

    // Check if cache has expired
    const now = Date.now();
    if (now - entry.timestamp > this.cacheTimeout) {
      this.cache.delete(cacheKey);
      return null;
    }

    return entry;
  }

  /**
   * Cache loaded content
   */
  private cacheContent(
    cacheKey: string,
    content: string,
    section: string,
    topic?: string
  ): void {
    const metadata: ContentMetadata = {
      title: this.generateTitle(section, topic),
      section,
      lastModified: new Date(),
      ...(topic && { topic }),
    };

    const cacheEntry: CacheEntry = {
      content,
      metadata,
      timestamp: Date.now(),
    };

    this.cache.set(cacheKey, cacheEntry);
  }

  /**
   * Generate cache key for section and topic
   */
  private getCacheKey(section: string, topic?: string): string {
    return topic ? `${section}/${topic}` : `${section}/index`;
  }

  /**
   * Generate a title from section and topic
   */
  private generateTitle(section: string, topic?: string): string {
    const sectionTitle = this.formatTitle(section);
    if (!topic) {
      return sectionTitle;
    }
    return `${sectionTitle} - ${this.formatTitle(topic)}`;
  }

  /**
   * Format a path segment into a readable title
   */
  private formatTitle(segment: string): string {
    return segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Validate that a path segment is safe and valid
   */
  private isValidPathSegment(segment: string): boolean {
    // Allow alphanumeric characters, hyphens, and underscores
    // Prevent directory traversal and other unsafe characters
    const validPattern = /^[a-zA-Z0-9_-]+$/;
    return (
      validPattern.test(segment) && segment.length > 0 && segment.length < 100
    );
  }

  /**
   * Clear all cached content
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics for debugging
   */
  public getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Preload content for common sections
   */
  public async preloadCommonContent(): Promise<void> {
    const commonSections = [
      { section: 'getting-started' },
      { section: 'getting-started', topic: 'first-image' },
      { section: 'displays' },
      { section: 'export' },
    ];

    const preloadPromises = commonSections.map(async ({ section, topic }) => {
      try {
        await this.loadContent(section, topic);
      } catch (error) {
        // Silently fail preloading - content may not exist yet
        console.debug(
          `Preload failed for ${section}${topic ? `/${topic}` : ''}:`,
          error
        );
      }
    });

    await Promise.allSettled(preloadPromises);
  }

  /**
   * Preload related content based on current section
   */
  public async preloadRelatedContent(
    currentSection: string,
    currentTopic?: string
  ): Promise<void> {
    const relatedContent: Array<{ section: string; topic?: string }> = [];

    // Define related content mapping
    const relatedMap: Record<
      string,
      Array<{ section: string; topic?: string }>
    > = {
      'getting-started': [
        { section: 'getting-started', topic: 'first-image' },
        { section: 'getting-started', topic: 'arduino' },
        { section: 'displays' },
        { section: 'export' },
      ],
      displays: [
        { section: 'displays', topic: 'ssd1306' },
        { section: 'displays', topic: 'sh1106' },
        { section: 'getting-started', topic: 'arduino' },
        { section: 'troubleshooting', topic: 'display' },
      ],
      'image-processing': [
        { section: 'image-processing', topic: 'formats' },
        { section: 'image-processing', topic: 'optimization' },
        { section: 'advanced', topic: 'dithering' },
        { section: 'export' },
      ],
      export: [
        { section: 'export', topic: 'c-arrays' },
        { section: 'export', topic: 'arduino' },
        { section: 'getting-started', topic: 'arduino' },
        { section: 'troubleshooting', topic: 'arduino' },
      ],
      advanced: [
        { section: 'advanced', topic: 'dithering' },
        { section: 'advanced', topic: 'bit-order' },
        { section: 'advanced', topic: 'presets' },
        { section: 'image-processing' },
      ],
      troubleshooting: [
        { section: 'troubleshooting', topic: 'display' },
        { section: 'troubleshooting', topic: 'arduino' },
        { section: 'troubleshooting', topic: 'quality' },
        { section: 'getting-started' },
      ],
    };

    // Get related content for current section
    const related = relatedMap[currentSection] || [];

    // Filter out the current page to avoid redundant loading
    const filteredRelated = related.filter(
      ({ section, topic }) =>
        !(section === currentSection && topic === currentTopic)
    );

    relatedContent.push(...filteredRelated);

    // Preload in background without blocking
    const preloadPromises = relatedContent.map(async ({ section, topic }) => {
      try {
        await this.loadContent(section, topic);
      } catch (error) {
        console.debug(
          `Related content preload failed for ${section}${topic ? `/${topic}` : ''}:`,
          error
        );
      }
    });

    // Don't await - let it happen in background
    Promise.allSettled(preloadPromises);
  }

  /**
   * Preload next logical content based on user journey
   */
  public async preloadNextContent(
    currentSection: string,
    currentTopic?: string
  ): Promise<void> {
    const nextContentMap: Record<
      string,
      Array<{ section: string; topic?: string }>
    > = {
      'getting-started': [{ section: 'getting-started', topic: 'first-image' }],
      'getting-started/first-image': [
        { section: 'getting-started', topic: 'arduino' },
        { section: 'displays' },
      ],
      'getting-started/arduino': [
        { section: 'export', topic: 'c-arrays' },
        { section: 'troubleshooting', topic: 'arduino' },
      ],
      displays: [{ section: 'displays', topic: 'ssd1306' }],
      'displays/ssd1306': [
        { section: 'export', topic: 'c-arrays' },
        { section: 'getting-started', topic: 'arduino' },
      ],
      export: [{ section: 'export', topic: 'c-arrays' }],
      'export/c-arrays': [
        { section: 'export', topic: 'arduino' },
        { section: 'getting-started', topic: 'arduino' },
      ],
    };

    const key = currentTopic
      ? `${currentSection}/${currentTopic}`
      : currentSection;
    const nextContent = nextContentMap[key] || [];

    // Preload next content in background
    const preloadPromises = nextContent.map(async ({ section, topic }) => {
      try {
        await this.loadContent(section, topic);
      } catch (error) {
        console.debug(
          `Next content preload failed for ${section}${topic ? `/${topic}` : ''}:`,
          error
        );
      }
    });

    Promise.allSettled(preloadPromises);
  }
}

// Export singleton instance
export const documentationLoader = new DocumentationLoader();
