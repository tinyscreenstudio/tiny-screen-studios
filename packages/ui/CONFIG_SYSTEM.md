# Configuration System Overview

A comprehensive configuration system has been implemented to centralize all app settings and make the application highly customizable.

## What's Included

### 📁 Core Configuration Files
- `src/config/appConfig.ts` - Main configuration interface and defaults
- `src/config/index.ts` - Exports all config functionality
- `src/config/README.md` - Detailed documentation
- `src/config/examples/custom-config.example.ts` - Example custom configuration

### 🔧 Configuration Management
- `src/utils/configManager.ts` - Configuration manager with localStorage persistence
- `src/hooks/useAppConfig.ts` - React hooks for accessing configuration

### 🎛️ UI Components
- `src/components/ConfigEditor.tsx` - Visual configuration editor
- Updated `Header.tsx` with config button
- Updated components to use configuration values

## Key Features

### ⚙️ Configurable Sections
- **App Info**: Name, version, description
- **Navigation**: Menu items, labels, paths, icons, ordering
- **Header**: Logo, title, subtitle, status indicators
- **Device Settings**: Default presets, available options, default values
- **UI Settings**: Theme colors, animations, layout
- **Feature Flags**: Toggle features on/off
- **Processing**: Overlay messages, progress bar settings

### 🎯 Feature Flags
Toggle any feature:
- Processing overlay
- File validation
- Export controls
- Device preview
- Progress indicators
- Tooltips
- Recovery actions

### 💾 Persistence
- Automatic localStorage saving
- Merges user preferences with defaults
- Graceful fallback to defaults

### 🎨 Visual Editor
- Tabbed interface for different config sections
- Real-time feature toggling
- Easy-to-use controls
- Accessible via gear icon in header

## Usage Examples

### Basic Usage
```tsx
import { useFeatureFlags, useHeaderConfig } from './hooks/useAppConfig'

function MyComponent() {
  const featureFlags = useFeatureFlags()
  const headerConfig = useHeaderConfig()
  
  return (
    <div>
      <h1>{headerConfig.title}</h1>
      {featureFlags.enableTooltips && <Tooltip />}
    </div>
  )
}
```

### Programmatic Configuration
```tsx
import { configManager } from './utils/configManager'

// Toggle a feature
configManager.toggleFeature('enableTooltips')

// Update configuration
configManager.updateConfig({
  header: { title: 'New Title' }
})
```

## Benefits

✅ **Centralized Configuration** - All settings in one place  
✅ **Easy Customization** - Visual editor for non-technical users  
✅ **Developer Friendly** - Type-safe configuration with hooks  
✅ **Extensible** - Easy to add new configuration options  
✅ **Persistent** - Settings saved across sessions  
✅ **Feature Flags** - Toggle features without code changes  
✅ **Maintainable** - Clear separation of configuration and logic  

## Future Enhancements

- Environment-specific configurations
- Remote configuration loading
- Configuration validation
- Import/export functionality
- Real-time updates without page reload
- User preference profiles