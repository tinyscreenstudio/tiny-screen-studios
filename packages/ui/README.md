# TinyScreen.Studios - Modern React UI

A modern, responsive web interface for converting pixel art and animations to tiny OLED display formats.

## ✨ Features

- **Modern React + TypeScript** - Built with React 18, TypeScript, and functional components
- **TailwindCSS Styling** - Utility-first CSS with custom design system
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Real-time Preview** - Live OLED canvas preview with scaling and grid options
- **Animation Support** - Multi-frame animation playback with FPS control
- **Multiple Export Formats** - Binary, C arrays, and C files with headers
- **Drag & Drop Upload** - Intuitive file upload with validation
- **Accessibility Ready** - WCAG compliant with proper contrast and keyboard navigation

## 🎨 Design System

### Colors
- **Background**: `#FAF3E0` (Cream)
- **Accent Colors**:
  - Coral: `#F6A3A3` (Primary actions)
  - Mint: `#A3F6D0` (Settings)
  - Sky: `#A3D8F6` (Preview controls)
- **Text**: `#2C2C2C` (Charcoal)

### Typography
- **Primary Font**: Inter (Google Fonts)
- **Monospace**: JetBrains Mono (for code/data)

## 🏗️ Architecture

### Component Structure
```
src/
├── components/
│   ├── Header.tsx                 # App header with branding
│   ├── FileUploadPanel.tsx        # File upload and validation
│   ├── DeviceSettingsPanel.tsx    # Device presets and conversion settings
│   ├── OLEDPreviewCanvas.tsx      # Live preview with animation controls
│   ├── ExportControlsPanel.tsx    # Export options and download buttons
│   ├── ValidationResults.tsx      # Error/warning display
│   ├── ProgressIndicator.tsx      # Processing progress bar
│   ├── FileList.tsx              # Uploaded files list
│   ├── RecoveryActions.tsx       # Error recovery options
│   └── Tooltip.tsx               # Reusable tooltip component
├── store/
│   └── appStore.ts               # Zustand state management
├── utils/
│   └── fileProcessor.ts          # File processing logic
├── App.tsx                       # Main app component
├── main.tsx                      # React entry point
└── index.css                     # TailwindCSS imports and custom styles
```

### State Management
Uses **Zustand** for lightweight, TypeScript-friendly state management:

- File management (current files, processed frames)
- Device settings (preset, threshold, invert, dithering)
- Preview settings (scale, grid, animation)
- Export settings (symbol name, formatting options)
- UI state (processing, validation, progress)

### Processing Pipeline
1. **File Upload** - Drag & drop or file picker
2. **Validation** - Client-side file type and size checks
3. **Processing** - Decode → Monochrome → Pack → Render
4. **Preview** - Real-time canvas rendering with controls
5. **Export** - Multiple format options with download

## 🚀 Development

### Prerequisites
- Node.js 18+
- pnpm 8+

### Commands
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Type checking
pnpm type-check
```

### Development Server
The dev server runs on `http://localhost:3000` with hot reload enabled.

## 📱 Responsive Layout

### Desktop (1024px+)
- 3-column layout: Input | Preview | Export
- Full feature set with all controls visible

### Tablet (768px - 1023px)
- 2-column layout: Input/Preview stacked | Export
- Collapsible export panel

### Mobile (< 768px)
- Single column layout
- Stacked panels with optimized spacing
- Touch-friendly controls

## 🎯 Key Improvements Over Legacy UI

1. **Modern Framework** - React vs vanilla JS for better maintainability
2. **Type Safety** - Full TypeScript coverage
3. **Component Architecture** - Modular, reusable components
4. **State Management** - Centralized state with Zustand
5. **Responsive Design** - Mobile-first approach
6. **Better UX** - Improved error handling and user feedback
7. **Accessibility** - WCAG compliant design
8. **Performance** - Optimized rendering and lazy loading

## 🔧 Configuration

### TailwindCSS
Custom configuration in `tailwind.config.js` with:
- Extended color palette
- Custom animations
- Responsive breakpoints
- Typography scale

### Vite
Optimized build configuration with:
- React plugin
- TypeScript support
- PostCSS processing
- Development server with HMR

## 📦 Dependencies

### Runtime
- `react` - UI framework
- `react-dom` - DOM rendering
- `@heroicons/react` - Icon library
- `zustand` - State management
- `@tiny-screen-studios/core` - Processing engine

### Development
- `@vitejs/plugin-react` - Vite React support
- `tailwindcss` - CSS framework
- `typescript` - Type checking
- `vitest` - Testing framework

## 🎨 Customization

The UI is designed to be easily customizable:

1. **Colors** - Update `tailwind.config.js` color palette
2. **Layout** - Modify grid classes in `App.tsx`
3. **Components** - Each component is self-contained and modular
4. **Animations** - Custom animations defined in Tailwind config

## 🔍 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Modern browsers with ES2022 support required.