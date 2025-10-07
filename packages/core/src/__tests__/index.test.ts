import { describe, it, expect } from 'vitest';
import { version } from '../index.js';

describe('Core Library', () => {
  it('should export version', () => {
    expect(version).toBe('0.1.0');
  });

  it('should be a string', () => {
    expect(typeof version).toBe('string');
  });
});
