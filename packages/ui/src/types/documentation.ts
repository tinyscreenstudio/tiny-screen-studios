/**
 * TypeScript interfaces for the markdown documentation system
 */

/**
 * Service interface for loading documentation content
 */
export interface DocumentationLoader {
  /**
   * Load markdown content for a specific section and optional topic
   * @param section - The documentation section (e.g., 'getting-started')
   * @param topic - Optional specific topic within the section (e.g., 'first-image')
   * @returns Promise resolving to the markdown content as a string
   */
  loadContent(section: string, topic?: string): Promise<string>;

  /**
   * Get the file path for a given section and topic
   * @param section - The documentation section
   * @param topic - Optional specific topic within the section
   * @returns The relative path to the markdown file
   */
  getContentPath(section: string, topic?: string): string;
}

/**
 * Props for the MarkdownRenderer component
 */
export interface MarkdownRendererProps {
  /**
   * The markdown content to render
   */
  content: string;

  /**
   * Optional CSS class name for styling
   */
  className?: string;
}

/**
 * Props for the DocumentationContent component
 */
export interface DocumentationContentProps {
  /**
   * The documentation section to display
   */
  section?: string;

  /**
   * Optional specific topic within the section
   */
  topic?: string;
}

/**
 * Metadata about documentation content
 */
export interface ContentMetadata {
  /**
   * The title of the content
   */
  title: string;

  /**
   * Optional description of the content
   */
  description?: string;

  /**
   * When the content was last modified
   */
  lastModified: Date;

  /**
   * The section this content belongs to
   */
  section: string;

  /**
   * Optional topic within the section
   */
  topic?: string;
}

/**
 * Cache entry for storing loaded content
 */
export interface CacheEntry {
  /**
   * The cached markdown content
   */
  content: string;

  /**
   * Metadata about the content
   */
  metadata: ContentMetadata;

  /**
   * Timestamp when the content was cached
   */
  timestamp: number;
}

/**
 * Configuration options for the documentation system
 */
export interface DocumentationConfig {
  /**
   * Base path for documentation files
   */
  basePath: string;

  /**
   * Cache timeout in milliseconds
   */
  cacheTimeout: number;

  /**
   * Whether to enable content preloading
   */
  enablePreloading: boolean;
}

/**
 * Error types that can occur in the documentation system
 */
export enum DocumentationError {
  CONTENT_NOT_FOUND = 'CONTENT_NOT_FOUND',
  LOADING_ERROR = 'LOADING_ERROR',
  PARSING_ERROR = 'PARSING_ERROR',
  CACHE_ERROR = 'CACHE_ERROR',
}

/**
 * Custom error class for documentation system errors
 */
export class DocumentationSystemError extends Error {
  constructor(
    public type: DocumentationError,
    message: string,
    public section?: string,
    public topic?: string
  ) {
    super(message);
    this.name = 'DocumentationSystemError';
  }
}
