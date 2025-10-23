import { describe, it, expect, beforeEach } from 'vitest';
import { DocumentationLoader } from './documentationLoader';
import { DocumentationSystemError } from '../types/documentation';

describe('DocumentationLoader', () => {
  let loader: DocumentationLoader;

  beforeEach(() => {
    loader = new DocumentationLoader();
    loader.clearCache();
  });

  describe('getContentPath', () => {
    it('should generate correct path for section only', () => {
      const path = loader.getContentPath('getting-started');
      expect(path).toBe('/src/docs/getting-started/index.md');
    });

    it('should generate correct path for section and topic', () => {
      const path = loader.getContentPath('getting-started', 'first-image');
      expect(path).toBe('/src/docs/getting-started/first-image.md');
    });

    it('should throw error for invalid section name', () => {
      expect(() => loader.getContentPath('')).toThrow(DocumentationSystemError);
      expect(() => loader.getContentPath('invalid/path')).toThrow(
        DocumentationSystemError
      );
    });

    it('should throw error for invalid topic name', () => {
      expect(() => loader.getContentPath('valid', 'invalid/topic')).toThrow(
        DocumentationSystemError
      );
    });
  });

  describe('loadContent with existing files', () => {
    it('should load existing content successfully', async () => {
      const content = await loader.loadContent('getting-started');

      expect(typeof content).toBe('string');
      expect(content.length).toBeGreaterThan(0);
      expect(content).toContain('Getting Started');
    });

    it('should cache loaded content', async () => {
      // Load content twice and verify caching works
      const content1 = await loader.loadContent('getting-started');
      const content2 = await loader.loadContent('getting-started');

      expect(content1).toBe(content2);

      // Verify cache statistics
      const stats = loader.getCacheStats();
      expect(stats.size).toBe(1);
      expect(stats.keys).toContain('getting-started/index');
    });

    it('should throw error for nonexistent content', async () => {
      await expect(loader.loadContent('nonexistent-section')).rejects.toThrow(
        DocumentationSystemError
      );
    });
  });

  describe('caching behavior', () => {
    it('should provide cache statistics', async () => {
      await loader.loadContent('getting-started');

      const stats = loader.getCacheStats();
      expect(stats.size).toBe(1);
      expect(stats.keys).toContain('getting-started/index');
    });

    it('should clear cache when requested', async () => {
      await loader.loadContent('getting-started');
      expect(loader.getCacheStats().size).toBe(1);

      loader.clearCache();
      expect(loader.getCacheStats().size).toBe(0);
    });
  });
});
