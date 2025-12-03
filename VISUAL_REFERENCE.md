# Modal & Notification Visual Reference

## Modal Types & Styles

### Success Modal
```
┌─────────────────────────────┐
│  ✓ (green circle)          │
│  Success                    │
│  Your changes were saved    │
│  ┌─────────────────────┐   │
│  │  OK (Green Button)  │   │
│  └─────────────────────┘   │
└─────────────────────────────┘

Colors:
- Icon Background: HSL(142 71% 45%) - Green
- Button: HSL(142 71% 45%) - Green
- Border: 4px left border on notifications
```

### Error Modal
```
┌─────────────────────────────┐
│  ✕ (red circle)            │
│  Error                      │
│  Failed to save changes     │
│  ┌─────────────────────┐   │
│  │  OK (Red Button)    │   │
│  └─────────────────────┘   │
└─────────────────────────────┘

Colors:
- Icon Background: HSL(0 84% 60%) - Red
- Button: HSL(0 84% 60%) - Red
```

### Warning Modal
```
┌─────────────────────────────┐
│  ⚠ (amber circle)          │
│  Warning                    │
│  This action is irreversible │
│  ┌──────────────┐ ┌────────┐│
│  │  Cancel (Gr) │ │OK (Amr)││
│  └──────────────┘ └────────┘│
└─────────────────────────────┘

Colors:
- Icon Background: HSL(38 92% 50%) - Amber
- Confirm Button: HSL(38 92% 50%) - Amber
```

### Info Modal
```
┌─────────────────────────────┐
│  ℹ (blue circle)           │
│  Information                │
│  A new version is available │
│  ┌─────────────────────┐   │
│  │  OK (Blue Button)   │   │
│  └─────────────────────┘   │
└─────────────────────────────┘

Colors:
- Icon Background: HSL(217 91% 60%) - Blue
- Button: HSL(217 91% 60%) - Blue
```

### Confirmation Modal
```
┌─────────────────────────────┐
│  ⚠ (amber circle)          │
│  Confirm Action             │
│  Delete 5 items?            │
│  ┌──────────────┐ ┌────────┐│
│  │ Cancel (Gray)│ │Del(Red)││
│  └──────────────┘ └────────┘│
└─────────────────────────────┘

Colors:
- Cancel: HSL(210 15% 96%) - Gray
- Delete: HSL(0 84% 60%) - Red
```

---

## Toast Notification Styles

### Success Notification
```
┌─────────────────────────────┐
|████| ✓ Success             × |
|  √  | Item saved!             |
└─────────────────────────────┘
Left Border: 4px Green
Auto-dismiss: 4 seconds
```

### Error Notification
```
┌─────────────────────────────┐
|████| ✕ Error              × |
|  ✕  | Connection failed      |
└─────────────────────────────┘
Left Border: 4px Red
Auto-dismiss: 4 seconds
```

### Warning Notification
```
┌─────────────────────────────┐
|████| ⚠ Warning            × |
|  ⚠  | Unsaved changes       |
└─────────────────────────────┘
Left Border: 4px Amber
Auto-dismiss: 4 seconds
```

### Info Notification
```
┌─────────────────────────────┐
|████| ℹ Information         × |
|  ℹ  | New update available   |
└─────────────────────────────┘
Left Border: 4px Blue
Auto-dismiss: 4 seconds
```

---

## Button States & Styles

### Primary Button
```
Normal State:
┌──────────────┐
│ OK           │  Background: HSL(0 60% 35%)
└──────────────┘  Color: White

Hover State:
┌──────────────┐
│ OK           │  Background: Darker shade
│ (elevated)   │  Transform: translateY(-2px)
└──────────────┘  Shadow: Enhanced

Focus State:
┌──────────────┐
│ OK           │  Outline: 2px solid HSL(0 60% 35%)
│ ◉◉◉◉◉◉◉◉  │  Outline-offset: 2px
└──────────────┘

Active State:
┌──────────────┐
│ OK           │  Scale: 0.98
└──────────────┘  Transform: Pressed effect
```

### Secondary Button
```
Normal State:
┌──────────────┐
│ Cancel       │  Background: HSL(210 15% 96%)
└──────────────┘  Color: HSL(210 15% 45%)

Hover State:
┌──────────────┐
│ Cancel       │  Background: Lighter
│ (elevated)   │  Border: Primary color
└──────────────┘  Shadow: Subtle
```

### Danger Button
```
Normal State:
┌──────────────┐
│ Delete       │  Background: HSL(0 84% 60%)
└──────────────┘  Color: White

Hover State:
┌──────────────┐
│ Delete       │  Background: Darker red
│ (elevated)   │  Transform: translateY(-2px)
└──────────────┘  Shadow: Red glow
```

---

## Color Palette

### Primary Colors
```
┌───────────────────────────────────────┐
│ Maroon Primary                        │
│ HSL(0 60% 35%) = #c9362e             │
│ Used for: Primary actions, focus      │
└───────────────────────────────────────┘

┌───────────────────────────────────────┐
│ Orange Secondary                      │
│ HSL(24 85% 53%) = #f08c41            │
│ Used for: Secondary actions           │
└───────────────────────────────────────┘
```

### Semantic Colors
```
┌─────────────────────┐  ┌─────────────────────┐
│ Success - Green     │  │ Error - Red         │
│ HSL(142 71% 45%)    │  │ HSL(0 84% 60%)      │
│ #22c55e             │  │ #ef4444             │
└─────────────────────┘  └─────────────────────┘

┌─────────────────────┐  ┌─────────────────────┐
│ Warning - Amber     │  │ Info - Blue         │
│ HSL(38 92% 50%)     │  │ HSL(217 91% 60%)    │
│ #f59e0b             │  │ #3b82f6             │
└─────────────────────┘  └─────────────────────┘
```

### Neutral Colors
```
┌──────────────────────────────────────┐
│ Text - Dark                          │
│ HSL(210 15% 20%) = #1a2634          │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ Background - Light                   │
│ HSL(0 0% 98%) = #f8f8f8             │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ Card - White                         │
│ HSL(0 0% 100%) = #ffffff            │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ Muted - Gray                         │
│ HSL(210 15% 45%) = #8891a0          │
└──────────────────────────────────────┘
```

---

## Animation Specifications

### Modal Open
```
Duration: 300ms
Easing: cubic-bezier(0.34, 1.56, 0.64, 1)
Transform: scale(0.95) → scale(1)
           translateY(10px) → translateY(0)
Opacity: 0 → 1
```

### Notification Slide In
```
Duration: 300ms
Easing: cubic-bezier(0.34, 1.56, 0.64, 1)
Transform: translateX(400px) → translateX(0)
Opacity: 0 → 1
```

### Notification Slide Out
```
Duration: 300ms
Easing: ease
Transform: translateX(0) → translateX(400px)
Opacity: 1 → 0
```

### Button Hover
```
Duration: 200ms
Easing: ease
Transform: translateY(0) → translateY(-2px)
Box-shadow: Enhanced
```

### Button Active
```
Duration: 0ms (immediate)
Transform: scale(1) → scale(0.98)
```

---

## Responsive Breakpoints

### Desktop (1024px+)
```
Modal Box Width: 500px max
Icon Size: 80px
Title Font: 1.75rem
Padding: 2.5rem
Button Size: Full width or auto
```

### Tablet (768px - 1023px)
```
Modal Box Width: 28rem max
Icon Size: 70px
Title Font: 1.35rem
Padding: 1.75rem 1.25rem
Button Size: Auto with flex wrap
```

### Mobile (640px - 767px)
```
Modal Box Width: Full width - 2rem margin
Icon Size: 60px
Title Font: 1.25rem
Padding: 1.5rem 1rem
Button Size: Full width, stacked
```

### Small Mobile (< 640px)
```
Modal Box Width: Full width - 1.5rem margin
Icon Size: 50px
Title Font: 1.1rem
Padding: 1rem
Button Size: Full width, stacked
Border Radius: 8px
```

---

## Accessibility Features

### Keyboard Support
```
TAB              → Focus next element
SHIFT + TAB      → Focus previous element
ENTER            → Activate focused button
ESCAPE           → Close modal
```

### Focus Indicators
```
┌──────────────┐
│ OK           │  Outline: 2px solid primary
│ ◉◉◉◉◉◉◉◉  │  Outline-offset: 2px
└──────────────┘  Border-radius: 4px
```

### Color Contrast
```
Primary on White:    4.5:1 (WCAG AA)
White on Primary:    7.8:1 (WCAG AAA)
Text on Card:        7.2:1 (WCAG AAA)
Muted on Background: 4.8:1 (WCAG AA)
```

### Touch Targets
```
Minimum Size: 44px × 44px
Recommended: 48px × 48px
Spacing: 8px minimum between targets
```

---

## Dark Mode

### Color Adjustments
```
Light Mode:
Background: HSL(0 0% 98%)
Text: HSL(210 15% 20%)
Card: HSL(0 0% 100%)

Dark Mode:
Background: HSL(210 20% 8%)
Text: HSL(210 15% 95%)
Card: HSL(210 20% 10%)

Accent colors remain the same
(Maroon, Green, Red, Amber, Blue)
```

---

## Print Styles

```
Modals: Hidden (display: none)
Notifications: Hidden (display: none)
Print friendly: Only visible content prints
```

---

## Examples in Context

### Success Flow
```
1. User submits form
2. Loading spinner appears
3. Server processes request
4. Success modal displays
   - User clicks OK
5. Modal closes
6. Page updates
```

### Error Flow
```
1. User submits form
2. Loading spinner appears
3. Server returns error
4. Error modal displays
   - Shows error message
   - User clicks OK
5. Modal closes
6. User corrects input
```

### Notification Flow
```
1. Item added to cart
2. Toast notification appears from right
3. Success icon in green
4. Auto-dismisses after 4 seconds
   OR
   User clicks close button
```

---

**Visual Guide Version**: 2.0
**Last Updated**: December 3, 2025

