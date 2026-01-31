# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

marker.js UI is a web component-based UI wrapper for marker.js 3 that provides image annotation editing and viewing with minimal setup. It exports two main components:
- **AnnotationEditor**: Full-featured editor for creating/editing annotations
- **AnnotationViewer**: Read-only viewer for displaying annotated images

Built with pure Web Components (no frameworks), TypeScript, Tailwind CSS, and daisyUI.

## Development Commands

```bash
pnpm install        # Install dependencies
pnpm run dev        # Start dev server with hot reload (runs test harness)
pnpm run build      # TypeScript compile + Vite build for production
pnpm run preview    # Preview production build locally
```

## Architecture

### Web Components with Shadow DOM

All components extend `HTMLElement` and use Shadow DOM for style encapsulation. Both main components follow the same structural pattern:

**AnnotationEditor** (`mjsui-annotation-editor`):
```
Shadow DOM
├── Style (lib.css injected)
└── mainContainer
    ├── toolbarContainer → EditorToolbar (save/close/undo/redo/zoom)
    ├── markerAreaContainer → MarkerArea (from marker.js 3)
    └── toolboxContainer → EditorToolbox (property panels)
```

**AnnotationViewer** (`mjsui-annotation-viewer`):
```
Shadow DOM
├── Style (lib.css injected)
└── mainContainer
    ├── markerViewContainer → MarkerView (from marker.js 3)
    └── toolbarContainer → ViewerToolbar (zoom controls only)
```

### Component Relationships

**Main exports** (in `src/lib/index.ts`):
- `AnnotationEditor` - wraps `MarkerArea` from marker.js 3, provides full editing UI
- `AnnotationViewer` - wraps `MarkerView` from marker.js 3, provides display-only UI

**Editor components**:
- `EditorToolbar` - top bar with save, close, delete, undo/redo, zoom buttons
- `EditorToolbox` - bottom panel container managing property editors
- Property panels (all extend `ToolboxPanel`): `FillToolboxPanel`, `StrokeToolboxPanel`, `FontToolboxPanel`, `OpacityToolboxPanel`, `NotesToolboxPanel`

**Viewer components**:
- `ViewerToolbar` - floating zoom controls (zoom-in, zoom-out, zoom-reset)

**Shared**:
- `BaseToolbar` - base class providing `createActionButton()` utility
- `ColorPicker` - reusable color selection component
- `MarkerTypeGroupButton` - grouped marker type selector

### Key Patterns

**Event handlers** are bound in constructor:
```typescript
constructor() {
  this.handleClick = this.handleClick.bind(this);
}
```

**SVG icons** imported as raw strings via Vite:
```typescript
import PointerIcon from "@/assets/icons/pointer.svg?raw";
element.innerHTML = PointerIcon;
```

**Custom events** for editor communication:
- `editorsave` - detail contains `state` (AnnotationState) and optional `dataUrl`
- `editorclose` - user clicked close button

**Accessing underlying marker.js 3 components**:
- `editor.markerArea` - the MarkerArea instance for editing operations
- `viewer.markerView` - the MarkerView instance for display operations

**Theme support** - both components support `theme` property ("light" | "dark")

### Build Output

Vite produces both ESM (`markerjs-ui.js`) and UMD (`markerjs-ui.umd.cjs`) bundles. The `@markerjs/markerjs3` dependency is external (not bundled).

## Key Files

- `src/lib/index.ts` - Single entry point, all public exports
- `src/lib/AnnotationEditor.ts` - Main editor component
- `src/lib/AnnotationViewer.ts` - Main viewer component
- `src/lib/EditorToolbar.ts` - Editor top toolbar
- `src/lib/ViewerToolbar.ts` - Viewer zoom toolbar
- `src/lib/EditorToolbox.ts` - Property panels container
- `src/lib/ToolboxPanel.ts` - Base class for property panels
- `src/lib/models/toolbar.ts` - ToolbarAction types and MarkerTypeList definitions
- `src/lib/lib.css` - Tailwind/daisyUI imports, scoped to Shadow DOM
- `vite.config.js` - Build config with path alias `@/` → `src/`
- `test/manual/main.ts` - Test harness showing component usage
