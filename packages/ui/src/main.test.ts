import { describe, it, expect, beforeEach } from 'vitest';

describe('UI Main', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
  });

  it('should have an app element', () => {
    const app = document.getElementById('app');
    expect(app).toBeTruthy();
  });

  it('should be able to set innerHTML', () => {
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = '<h1>Test</h1>';
      expect(app.innerHTML).toBe('<h1>Test</h1>');
    }
  });
});