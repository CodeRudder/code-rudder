# .pen to HTML/CSS Mapping Reference

## Node Type Mappings

| .pen Type | HTML | Notes |
|-----------|------|-------|
| `frame` | `<div>` or semantic tags | Use `<header>`, `<nav>`, `<section>` based on `name` |
| `text` | `<span>`, `<p>`, `<h1-h6>` | Choose based on font size and semantic meaning |
| `icon_font` | Icon component | Use lucide-react: `<Search size={18} />` |
| `image` | `<img>` | Check `fill.url` property |
| `rectangle` | `<div>` | Usually decorative/background |
| `ellipse` | `<div>` | Use `border-radius: 50%` |

## Layout System

### layout Property

| .pen | CSS |
|------|-----|
| `"vertical"` | `display: flex; flex-direction: column;` |
| `"horizontal"` or unset | `display: flex; flex-direction: row;` |
| `"none"` | `position: relative;` (children use absolute positioning) |

### Alignment

| .pen Property | CSS | Description |
|---------------|-----|-------------|
| `alignItems: "center"` | `align-items: center` | Cross-axis center |
| `alignItems: "start"` | `align-items: flex-start` | Cross-axis start |
| `alignItems: "end"` | `align-items: flex-end` | Cross-axis end |
| `justifyContent: "center"` | `justify-content: center` | Main-axis center |
| `justifyContent: "space_between"` | `justify-content: space-between` | Main-axis space between |
| `justifyContent: "start"` | `justify-content: flex-start` | Main-axis start |
| `justifyContent: "end"` | `justify-content: flex-end` | Main-axis end |

### Spacing

| .pen Property | CSS | Notes |
|---------------|-----|-------|
| `gap: 16` | `gap: 16px` | Space between children |
| `padding: 24` | `padding: 24px` | All sides |
| `padding: [8, 16]` | `padding: 8px 16px` | Vertical, horizontal |
| `padding: [8, 16, 12, 20]` | `padding: 8px 16px 12px 20px` | Top, right, bottom, left |

## Sizing System

| .pen Value | CSS | Notes |
|------------|-----|-------|
| `120` | `width: 120px` | Fixed pixels |
| `"fill_container"` | `width: 100%` or `flex: 1` | Use `flex: 1` on main axis, `width: 100%` on cross axis |
| `"fill_container(500)"` | `width: 100%; min-width: 500px` | Fill with minimum |
| unset | `width: auto` | Content-based |

## Style Properties

### Background & Borders

| .pen Property | CSS |
|---------------|-----|
| `fill: "#3B82F6"` | `background-color: #3B82F6` |
| `fill: "transparent"` | `background-color: transparent` |
| `cornerRadius: 8` | `border-radius: 8px` |
| `cornerRadius: [8, 8, 0, 0]` | `border-radius: 8px 8px 0 0` |
| `stroke: {fill: "#E2E8F0", thickness: 1}` | `border: 1px solid #E2E8F0` |
| `stroke: {thickness: {bottom: 1}}` | `border-bottom: 1px solid #E2E8F0` |

### Typography

| .pen Property | CSS |
|---------------|-----|
| `fontFamily: "Inter"` | `font-family: 'Inter', sans-serif` |
| `fontSize: 14` | `font-size: 14px` |
| `fontWeight: "500"` | `font-weight: 500` |
| `fontWeight: "normal"` | `font-weight: 400` |
| `fontWeight: "600"` | `font-weight: 600` |
| `lineHeight: 1.6` | `line-height: 1.6` |
| `fill: "#1E293B"` (text) | `color: #1E293B` |

### Icons

| .pen Property | Implementation |
|---------------|----------------|
| `iconFontFamily: "lucide"` | Use lucide-react library |
| `iconFontName: "search"` | `<Search size={18} />` |
| `width: 18, height: 18` | `size={18}` prop |
| `fill: "#64748B"` | `color="#64748B"` or CSS |

## Common Patterns

### Header (space-between)

```css
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 64px;
}
```

### Vertical List

```css
.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}
```

## Special Cases

### Text Overflow (textGrowth: "fixed-width-height")

```css
.text-fixed {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
```

### Responsive Container

```css
.page-container {
  max-width: 1080px;
  margin: 0 auto;
}
```

### Dark Mode

Extract colors to CSS variables or theme config. Use same structure, switch colors only.
