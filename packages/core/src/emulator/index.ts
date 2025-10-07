/**
 * Display emulator module for rendering packed frames to canvas
 * Provides pixel-exact rendering with scaling and overlay options
 */

export * from './canvas.js';
export type {
  RenderOptions,
  AnimationOptions,
  AnimationController,
  DisplayEmulator,
} from '../types/index.js';
