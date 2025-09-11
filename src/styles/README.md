# CSS Architecture Documentation

## Overview
This document describes the reorganized CSS architecture for the portfolio project, implemented as part of the AI Card Tool Theme optimization.

## Structure

```
src/styles/
├── base/
│   ├── index.css          # Base styles entry point
│   ├── core.css           # Tailwind imports, HTML base styles
│   └── variables.css      # CSS variables and theme configuration
├── components/
│   ├── index.css          # Components entry point
│   ├── animations.css     # Keyframes and animation classes
│   └── utilities.css      # Utility classes and components
└── themes/
    ├── index.css          # Themes entry point
    ├── variables.css      # Theme-specific CSS variables
    ├── mixins.css         # Theme utilities and patterns
    ├── lakers.css         # Lakers theme (Gold & Purple)
    ├── anno.css           # Anno theme (Cool Blue)
    └── cyberpunk.css      # Cyberpunk theme (Neon Tech)
```

## Entry Point
The main entry point is `src/app/globals.css` which imports:
- Base styles (`src/styles/base/index.css`)
- Component styles (`src/styles/components/index.css`)
- Theme styles (`src/styles/themes/index.css`)

## Theme System

### Current Themes
1. **Lakers Theme**: Lakers-inspired gold and purple color scheme
2. **Anno Theme**: Cool blue professional theme (MyGO style)
3. **Cyberpunk Theme**: Neon tech with cyan and pink colors

### Theme Variables
All theme colors are defined in `src/styles/themes/variables.css` using CSS custom properties for consistency and maintainability.

### Adding New Themes
1. Add theme variables to `src/styles/themes/variables.css`
2. Create new theme file (e.g., `new-theme.css`)
3. Import in `src/styles/themes/index.css`
4. Follow the pattern established in existing themes

### Theme Usage
Themes are applied by adding class to the `html` element:
- `html.lakers` - Lakers theme
- `html.anno` - Anno theme  
- `html.cyberpunk` - Cyberpunk theme

## Benefits of New Architecture

### Maintainability
- **Clear separation of concerns**: Base styles, components, and themes are separate
- **Modular imports**: Easy to enable/disable specific features
- **Consistent naming**: Predictable file organization

### Performance
- **Optimized imports**: Only load what's needed
- **CSS variables**: Efficient theme switching
- **Minimal duplication**: Shared variables and mixins

### Scalability
- **Easy theme addition**: Template and patterns established
- **Component isolation**: New components can be added independently
- **Variable management**: Centralized color and spacing definitions

## Migration Notes
- Original `globals.css` backed up as `globals.css.backup`
- All existing functionality preserved
- No breaking changes to existing projects
- Theme classes continue to work as before

## Development Guidelines

### Theme Development
- Use CSS variables for all theme-specific values
- Follow the established naming convention
- Test with all existing components
- Ensure accessibility standards are met

### Component Development
- Keep component styles in the `components/` directory
- Use utility classes where appropriate
- Follow the established animation patterns
- Consider theme compatibility

### Performance Considerations
- Minimize CSS custom property usage in critical rendering path
- Use efficient selectors
- Group related rules together
- Test build output size regularly

## Browser Support
- CSS Custom Properties (IE11+ with PostCSS fallbacks)
- CSS Imports (All modern browsers)
- CSS Grid & Flexbox (IE11+ with prefixes)

## Backup & Recovery
- Original CSS backed up at `src/app/globals.css.backup`
- All changes are additive - no functionality removed
- Can revert by restoring backup if needed