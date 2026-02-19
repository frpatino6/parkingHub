# Professional Web Design — Reference Manual

> **Scope**: This manual is the Single Source of Truth for all UI/UX decisions, styling, and design tokens.
> **Standards**: WCAG 2.1 AA · Mobile-First · Design Tokens

---

## 1. Design System Foundation

### Color Palette

```scss
// styles/_variables.scss
// Primary — Deep Indigo to Electric Blue
$primary-50:  #eef2ff;
$primary-100: #e0e7ff;
$primary-200: #c7d2fe;
$primary-300: #a5b4fc;
$primary-400: #818cf8;
$primary-500: #6366f1;   // Main brand color
$primary-600: #4f46e5;
$primary-700: #4338ca;
$primary-800: #3730a3;
$primary-900: #312e81;

// Accent — Emerald (success, available spots)
$accent-500:  #10b981;
$accent-600:  #059669;

// Warning — Amber
$warning-500: #f59e0b;
$warning-600: #d97706;

// Error — Rose
$error-500:   #f43f5e;
$error-600:   #e11d48;

// Neutrals — Slate
$neutral-50:  #f8fafc;
$neutral-100: #f1f5f9;
$neutral-200: #e2e8f0;
$neutral-300: #cbd5e1;
$neutral-400: #94a3b8;
$neutral-500: #64748b;
$neutral-600: #475569;
$neutral-700: #334155;
$neutral-800: #1e293b;
$neutral-900: #0f172a;
$neutral-950: #020617;

// Dark Mode Surfaces
$surface-dark:      #0f172a;
$surface-dark-card: #1e293b;
$surface-dark-elevated: #334155;
```

### Typography

```scss
// styles/_typography.scss
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

$font-primary: 'Inter', system-ui, -apple-system, sans-serif;
$font-mono:    'JetBrains Mono', 'Fira Code', monospace;

// Type Scale (1.250 ratio — Major Third)
$text-xs:   0.75rem;    // 12px
$text-sm:   0.875rem;   // 14px
$text-base: 1rem;       // 16px
$text-lg:   1.125rem;   // 18px
$text-xl:   1.25rem;    // 20px
$text-2xl:  1.5rem;     // 24px
$text-3xl:  1.875rem;   // 30px
$text-4xl:  2.25rem;    // 36px
$text-5xl:  3rem;       // 48px

$font-light:    300;
$font-regular:  400;
$font-medium:   500;
$font-semibold: 600;
$font-bold:     700;

$leading-tight:  1.25;
$leading-normal: 1.5;
$leading-relaxed: 1.75;
```

### Spacing & Sizing

```scss
// 4px base unit — consistent rhythm
$space-0:  0;
$space-1:  0.25rem;  // 4px
$space-2:  0.5rem;   // 8px
$space-3:  0.75rem;  // 12px
$space-4:  1rem;     // 16px
$space-5:  1.25rem;  // 20px
$space-6:  1.5rem;   // 24px
$space-8:  2rem;     // 32px
$space-10: 2.5rem;   // 40px
$space-12: 3rem;     // 48px
$space-16: 4rem;     // 64px
$space-20: 5rem;     // 80px

$radius-sm: 0.375rem;  // 6px
$radius-md: 0.5rem;    // 8px
$radius-lg: 0.75rem;   // 12px
$radius-xl: 1rem;      // 16px
$radius-2xl: 1.5rem;   // 24px
$radius-full: 9999px;
```

### Shadows & Elevation

```scss
$shadow-sm:  0 1px 2px 0 rgba(0, 0, 0, 0.05);
$shadow-md:  0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
$shadow-lg:  0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
$shadow-xl:  0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
$shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
$shadow-glow: 0 0 20px rgba(99, 102, 241, 0.3);  // Brand glow
```

## 2. Responsive Breakpoints (Mobile-First)

```scss
// styles/_mixins.scss
$bp-sm:  640px;   // Small phones (landscape)
$bp-md:  768px;   // Tablets
$bp-lg:  1024px;  // Laptops
$bp-xl:  1280px;  // Desktops
$bp-2xl: 1536px;  // Large screens

@mixin sm  { @media (min-width: $bp-sm)  { @content; } }
@mixin md  { @media (min-width: $bp-md)  { @content; } }
@mixin lg  { @media (min-width: $bp-lg)  { @content; } }
@mixin xl  { @media (min-width: $bp-xl)  { @content; } }
@mixin xxl { @media (min-width: $bp-2xl) { @content; } }

// Usage
.card-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: $space-4;

  @include md { grid-template-columns: repeat(2, 1fr); }
  @include lg { grid-template-columns: repeat(3, 1fr); }
  @include xl { grid-template-columns: repeat(4, 1fr); }
}
```

## 3. Component Design Patterns

### Glassmorphism Cards
```scss
.glass-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: $radius-xl;
  padding: $space-6;
  box-shadow: $shadow-lg;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-xl;
  }
}
```

### Gradient Accents
```scss
.gradient-primary {
  background: linear-gradient(135deg, $primary-600, $primary-400);
}

.gradient-text {
  background: linear-gradient(135deg, $primary-400, $accent-500);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### Button System
```scss
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $space-2;
  padding: $space-3 $space-6;
  font-family: $font-primary;
  font-size: $text-sm;
  font-weight: $font-semibold;
  border-radius: $radius-lg;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &--primary {
    background: linear-gradient(135deg, $primary-600, $primary-500);
    color: white;
    box-shadow: 0 2px 8px rgba($primary-600, 0.4);

    &:hover {
      background: linear-gradient(135deg, $primary-700, $primary-600);
      box-shadow: 0 4px 12px rgba($primary-600, 0.5);
      transform: translateY(-1px);
    }
    &:active { transform: translateY(0); }
  }

  &--ghost {
    background: transparent;
    color: $primary-400;
    border: 1px solid rgba($primary-400, 0.3);

    &:hover {
      background: rgba($primary-400, 0.1);
      border-color: $primary-400;
    }
  }
}
```

## 4. Micro-Animations

```scss
// Timing functions
$ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
$ease-in-out-cubic: cubic-bezier(0.65, 0, 0.35, 1);
$spring: cubic-bezier(0.34, 1.56, 0.64, 1);

// Reusable animations
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}

@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

// Skeleton loader
.skeleton {
  background: linear-gradient(90deg,
    $neutral-800 25%, $neutral-700 50%, $neutral-800 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: $radius-md;
}

// Staggered list animation
@for $i from 1 through 20 {
  .stagger-item:nth-child(#{$i}) {
    animation: fadeInUp 0.4s $ease-out-expo #{$i * 0.05}s both;
  }
}
```

### Animation Rules
- **Duration**: 150–300ms for micro-interactions, 300–500ms for transitions
- **Easing**: use `$ease-out-expo` for enters, `$ease-in-out-cubic` for exits
- **`prefers-reduced-motion`**: always respect

```scss
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 5. Accessibility (WCAG 2.1 AA)

### Contrast Ratios
| Element              | Minimum Ratio |
|----------------------|---------------|
| Normal text          | 4.5:1         |
| Large text (≥18px)   | 3:1           |
| UI components        | 3:1           |
| Focus indicators     | 3:1           |

### Focus Management
```scss
// Global focus-visible styles
:focus-visible {
  outline: 2px solid $primary-400;
  outline-offset: 2px;
  border-radius: $radius-sm;
}

// Remove default ring when not keyboard-navigating
:focus:not(:focus-visible) {
  outline: none;
}
```

### Semantic HTML Rules
- **Headings**: single `<h1>`, sequential hierarchy
- **Landmarks**: `<main>`, `<nav>`, `<aside>`, `<footer>`
- **Buttons vs Links**: `<button>` for actions, `<a>` for navigation
- **Images**: `alt` text on all `<img>` (empty `alt=""` for decorative)
- **Forms**: every `<input>` has a `<label>`
- **ARIA**: use ARIA only when native semantics are insufficient
- **Color**: never rely on color alone to convey information

### Touch Targets
```scss
// Minimum 44×44px touch targets
.touch-target {
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

## 6. Dark Mode Implementation

```scss
// Use CSS custom properties for theme switching
:root {
  --bg-primary: #{$neutral-50};
  --bg-card: #ffffff;
  --text-primary: #{$neutral-900};
  --text-secondary: #{$neutral-600};
  --border-color: #{$neutral-200};
}

[data-theme='dark'] {
  --bg-primary: #{$surface-dark};
  --bg-card: #{$surface-dark-card};
  --text-primary: #{$neutral-100};
  --text-secondary: #{$neutral-400};
  --border-color: #{$neutral-700};
}

// Auto-detect system preference
@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
    --bg-primary: #{$surface-dark};
    --bg-card: #{$surface-dark-card};
    --text-primary: #{$neutral-100};
    --text-secondary: #{$neutral-400};
    --border-color: #{$neutral-700};
  }
}
```

## 7. Layout Patterns

### Dashboard Grid
```scss
.dashboard-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  grid-template-rows: 64px 1fr;
  grid-template-areas:
    "sidebar header"
    "sidebar main";
  min-height: 100vh;

  @include md-down {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "main";
  }
}
```

### Content Max-Width
```scss
.container {
  width: 100%;
  max-width: 1280px;
  margin-inline: auto;
  padding-inline: $space-4;

  @include lg { padding-inline: $space-8; }
}
```
