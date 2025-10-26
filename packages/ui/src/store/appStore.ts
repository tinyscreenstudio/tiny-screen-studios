import { create } from 'zustand';
import type {
  DevicePreset,
  PackedFrame,
  AddressingMode,
  BitOrderMode,
} from '@tiny-screen-studios/core';
import { defaultConfig } from '../config/appConfig';

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{ message: string; context?: unknown }>;
  warnings: Array<{ message: string }>;
}

export interface FileValidation {
  fileErrors: Map<number, string>;
  warnings: string[];
  validCount: number;
}

export interface AppState {
  // File management
  currentFiles: File[];
  currentPackedFrames: PackedFrame[];

  // Device settings
  devicePreset: DevicePreset;
  threshold: number;
  invert: boolean;
  dithering: boolean;

  // Preview settings
  scale: number;
  showGrid: boolean;

  // Animation state
  fps: number;
  isAnimationPlaying: boolean;
  currentFrame: number;

  // Export settings
  symbolName: string;
  bytesPerRow: number;
  perFrame: boolean;
  includeMetadata: boolean;
  addressing: AddressingMode;
  bitOrder: BitOrderMode;
  autoLineWrap: boolean;

  // UI state
  isProcessing: boolean;
  showExportPanel: boolean;
  validationResults: ValidationResult | null;
  fileValidation: FileValidation | null;
  progressText: string;
  progressPercentage: number;

  // Actions
  setCurrentFiles: (files: File[]) => void;
  setCurrentPackedFrames: (frames: PackedFrame[]) => void;
  setDevicePreset: (preset: DevicePreset) => void;
  setThreshold: (threshold: number) => void;
  setInvert: (invert: boolean) => void;
  setDithering: (dithering: boolean) => void;
  setScale: (scale: number) => void;
  setShowGrid: (showGrid: boolean) => void;
  setFps: (fps: number) => void;
  setIsAnimationPlaying: (playing: boolean) => void;
  setCurrentFrame: (frame: number) => void;
  setSymbolName: (name: string) => void;
  setBytesPerRow: (bytes: number) => void;
  setPerFrame: (perFrame: boolean) => void;
  setIncludeMetadata: (include: boolean) => void;
  setAddressing: (addressing: AddressingMode) => void;
  setBitOrder: (bitOrder: BitOrderMode) => void;
  setAutoLineWrap: (auto: boolean) => void;
  setIsProcessing: (processing: boolean) => void;
  setShowExportPanel: (show: boolean) => void;
  setValidationResults: (results: ValidationResult | null) => void;
  setFileValidation: (validation: FileValidation | null) => void;
  setProgress: (text: string, percentage: number) => void;
  resetSettings: () => void;
  clearFiles: () => void;
}

export const useAppStore = create<AppState>(set => ({
  // Initial state
  currentFiles: [],
  currentPackedFrames: [],
  devicePreset: defaultConfig.device.defaultPreset,
  threshold: defaultConfig.device.defaultSettings.threshold,
  invert: defaultConfig.device.defaultSettings.invert,
  dithering: defaultConfig.device.defaultSettings.dithering,
  scale: 4,
  showGrid: false,
  fps: 10,
  isAnimationPlaying: false,
  currentFrame: 0,
  symbolName: 'display_data',
  bytesPerRow: 16,
  perFrame: true,
  includeMetadata: true,
  addressing: 'vertical',
  bitOrder: 'lsb-first',
  autoLineWrap: true,
  isProcessing: false,
  showExportPanel: false,
  validationResults: null,
  fileValidation: null,
  progressText: '',
  progressPercentage: 0,

  // Actions
  setCurrentFiles: files => set({ currentFiles: files }),
  setCurrentPackedFrames: frames => set({ currentPackedFrames: frames }),
  setDevicePreset: preset => set({ devicePreset: preset }),
  setThreshold: threshold => set({ threshold }),
  setInvert: invert => set({ invert }),
  setDithering: dithering => set({ dithering }),
  setScale: scale => set({ scale }),
  setShowGrid: showGrid => set({ showGrid }),
  setFps: fps => set({ fps }),
  setIsAnimationPlaying: playing => set({ isAnimationPlaying: playing }),
  setCurrentFrame: frame => set({ currentFrame: frame }),
  setSymbolName: name => set({ symbolName: name }),
  setBytesPerRow: bytes => set({ bytesPerRow: bytes }),
  setPerFrame: perFrame => set({ perFrame }),
  setIncludeMetadata: include => set({ includeMetadata: include }),
  setAddressing: addressing => set({ addressing }),
  setBitOrder: bitOrder => set({ bitOrder }),
  setAutoLineWrap: auto => set({ autoLineWrap: auto }),
  setIsProcessing: processing => set({ isProcessing: processing }),
  setShowExportPanel: show => set({ showExportPanel: show }),
  setValidationResults: results => set({ validationResults: results }),
  setFileValidation: validation => set({ fileValidation: validation }),
  setProgress: (text, percentage) =>
    set({ progressText: text, progressPercentage: percentage }),

  resetSettings: () =>
    set({
      devicePreset: defaultConfig.device.defaultPreset,
      threshold: defaultConfig.device.defaultSettings.threshold,
      invert: defaultConfig.device.defaultSettings.invert,
      dithering: defaultConfig.device.defaultSettings.dithering,
      scale: 4,
      showGrid: false,
      fps: 10,
      symbolName: 'display_data',
      bytesPerRow: 16,
      perFrame: true,
      includeMetadata: true,
      addressing: 'vertical',
      bitOrder: 'lsb-first',
      autoLineWrap: true,
    }),

  clearFiles: () =>
    set({
      currentFiles: [],
      currentPackedFrames: [],
      validationResults: null,
      fileValidation: null,
      showExportPanel: false,
      isAnimationPlaying: false,
      currentFrame: 0,
      isProcessing: false,
      progressText: '',
      progressPercentage: 0,
    }),
}));
