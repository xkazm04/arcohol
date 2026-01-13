# UI Style Identity - Arc Dashboard Design System

This skill documents the visual design language for the Arc dashboard. Use this guide when creating or upgrading UI components to maintain consistent high-fidelity aesthetics.

## Design Philosophy

- **Cyberpunk/Fintech Aesthetic**: Dark slate backgrounds with cyan/purple neon accents
- **Compact Information Density**: Maximum data in minimal space
- **Subtle Motion**: Framer Motion animations that enhance without distracting
- **Glow Effects**: Strategic use of text-shadow and box-shadow for emphasis
- **Corner Markers**: L-shaped decorative borders as signature visual element

---

## Color System

### Accent Colors
```typescript
const accentColors = {
  cyan: { primary: '#06b6d4', glow: 'rgba(6, 182, 212, 0.5)', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400' },
  purple: { primary: '#a855f7', glow: 'rgba(168, 85, 247, 0.5)', bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
  emerald: { primary: '#10b981', glow: 'rgba(16, 185, 129, 0.5)', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  amber: { primary: '#f59e0b', glow: 'rgba(245, 158, 11, 0.5)', bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
  red: { primary: '#ef4444', glow: 'rgba(239, 68, 68, 0.5)', bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
  blue: { primary: '#3b82f6', glow: 'rgba(59, 130, 246, 0.5)', bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
};
```

### Status Colors
- **Active/Success/Paid**: Green (`bg-green-500/10 text-green-400`)
- **Pending/Processing**: Yellow (`bg-yellow-500/10 text-yellow-400`)
- **Warning/Low Balance**: Amber (`bg-amber-500/10 text-amber-400`)
- **Error/Failed/Overdue**: Red (`bg-red-500/10 text-red-400`)
- **Info/Sent**: Blue (`bg-blue-500/10 text-blue-400`)
- **Disabled/Neutral**: Slate (`bg-slate-500/10 text-slate-400`)

### Background Hierarchy
1. Page background: `bg-slate-950` (implicit from layout)
2. Card background: `bg-slate-900/50`
3. Nested element: `bg-slate-800/50` or `bg-slate-800/80`
4. Interactive hover: `bg-slate-800/20`

---

## Visual Patterns

### Corner Markers (Signature Element)
```tsx
// Apply to cards, modals, and hero sections
<div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-cyan-500/30 rounded-tl" />
<div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-cyan-500/30 rounded-tr" />
<div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-cyan-500/30 rounded-bl" />
<div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-cyan-500/30 rounded-br" />
```

### Grid Pattern Overlay
```tsx
// Subtle tech-grid background for hero/featured cards
<div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#0891b2_1px,transparent_1px),linear-gradient(to_bottom,#0891b2_1px,transparent_1px)] bg-[size:20px_20px]" />
```

### Glow Effects
```tsx
// Text glow for important values
style={{ textShadow: '0 0 20px rgba(6, 182, 212, 0.5)' }}

// Box glow for buttons/badges on hover
className="hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]"

// Animated glow pulse
animate={{ boxShadow: ['0 0 10px rgba(6,182,212,0.3)', '0 0 20px rgba(6,182,212,0.5)', '0 0 10px rgba(6,182,212,0.3)'] }}
transition={{ duration: 2, repeat: Infinity }}
```

### Glass Shine (for buttons)
```tsx
<div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-lg" />
```

---

## Animation Patterns (Framer Motion)

### Stagger Container
```typescript
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 }
  }
};
```

### List Item Animation
```typescript
const listItem = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } }
};
```

### Card Entrance
```typescript
const cardEntrance = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } }
};
```

### Slide-in Modal (from right)
```typescript
const slideInRight = {
  hidden: { x: '100%', opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } },
  exit: { x: '100%', opacity: 0, transition: { duration: 0.2 } }
};
```

### Interactive Hover Effects
```tsx
// Row slide on hover
whileHover={{ x: 3, backgroundColor: 'rgba(51, 65, 85, 0.2)' }}

// Scale on hover
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}

// Icon rotate + scale
whileHover={{ scale: 1.1, rotate: 5 }}
```

---

## Component Usage

### Import Pattern
```tsx
import { motion } from 'framer-motion';
import {
  StatCard,
  HeroStatCard,
  Card,
  CardHeader,
  Modal,
  GlowButton,
  FormInput,
  FormSelect,
  ToggleSwitch,
  FilterTabs,
  StatusBadge,
  StatusDot,
  DataList,
  DataListItem,
  ActivityFeed,
  AlertBanner,
  staggerContainer,
  listItem,
} from '@/components/dashboard';
```

### Page Structure
```tsx
export default function PageName() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-4 max-w-6xl"
    >
      {/* Header with title + actions */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h1 className="text-lg font-semibold text-white">Page Title</h1>
        <GlowButton>Action</GlowButton>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={staggerContainer} className="grid grid-cols-4 gap-3">
        <StatCard label="Label" value="Value" accent="cyan" delay={0} />
        {/* More stat cards with incremental delays: 0.05, 0.1, 0.15 */}
      </motion.div>

      {/* Main Content Cards */}
      <Card accent="cyan" delay={0.2} className="overflow-hidden">
        <CardHeader title="Section Title" />
        {/* Content */}
      </Card>
    </motion.div>
  );
}
```

### StatCard Props
```tsx
<StatCard
  label="Credits"                    // Small uppercase label
  value="$45,230"                    // Large mono value
  subValue="5.2% APY"               // Optional secondary text
  accent="cyan"                      // cyan | purple | amber | emerald | red | blue
  delay={0.1}                        // Stagger delay
  href="/dashboard/credits"          // Optional link
  icon={<svg>...</svg>}             // Optional icon
  trend={{ value: '+12%', positive: true }}  // Optional trend indicator
/>
```

### Card with Lists
```tsx
<Card accent="cyan" delay={0.2} className="overflow-hidden">
  <CardHeader
    title="Section"
    action={<button className="text-[10px] text-cyan-400">All</button>}
  />
  <DataList>
    {items.map((item) => (
      <DataListItem key={item.id}>
        {/* Row content */}
      </DataListItem>
    ))}
  </DataList>
</Card>
```

### Modal Pattern
```tsx
<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Modal Title"
  subtitle="Optional subtitle"
  size="sm"  // sm | md | lg
  footer={
    <>
      <GlowButton variant="secondary" onClick={() => setShowModal(false)}>Cancel</GlowButton>
      <GlowButton onClick={handleSubmit}>Confirm</GlowButton>
    </>
  }
>
  {/* Modal content */}
</Modal>
```

---

## Typography

- **Page Title**: `text-lg font-semibold text-white`
- **Section Title**: `text-xs font-medium text-slate-400`
- **Label**: `text-[10px] text-slate-500 uppercase`
- **Value (large)**: `text-2xl font-bold text-white font-mono` + glow
- **Value (medium)**: `text-lg font-bold text-white font-mono`
- **Body Text**: `text-xs text-slate-300`
- **Secondary Text**: `text-[10px] text-slate-500` or `text-slate-600`
- **Mono (IDs, codes)**: `font-mono`

---

## Spacing Guidelines

- **Page sections**: `space-y-4`
- **Card grid gap**: `gap-3` or `gap-4`
- **Card padding**: `p-3` or `p-4`
- **List item padding**: `px-3 py-2.5`
- **Button padding**: `px-3 py-1.5` (default), `px-2 py-1` (small)

---

## Icons

Use inline SVG with Heroicons style:
```tsx
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="..." />
</svg>
```

Icon sizes: `w-3 h-3` (tiny), `w-4 h-4` (default), `w-5 h-5` (medium), `w-6 h-6` (large)

---

## Common Patterns

### Live Indicator
```tsx
<motion.span
  animate={{ opacity: [0.5, 1, 0.5] }}
  transition={{ duration: 2, repeat: Infinity }}
  className="text-[10px] text-cyan-400 font-mono flex items-center gap-1"
>
  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
  Live
</motion.span>
```

### Progress Bar
```tsx
<div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
  <motion.div
    initial={{ width: 0 }}
    animate={{ width: `${percentage}%` }}
    transition={{ delay: 0.3, duration: 0.8 }}
    className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full"
  />
</div>
```

### Quick Amount Selector
```tsx
{amounts.map((amt) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={() => setAmount(amt)}
    className={`flex-1 py-1.5 text-[10px] font-medium rounded-lg transition-all ${
      selected === amt
        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
        : 'bg-slate-800/60 text-slate-400 border border-transparent hover:bg-slate-800'
    }`}
  >
    ${amt}
  </motion.button>
))}
```

---

## File Structure

```
src/components/dashboard/
├── index.ts                 # Barrel export
├── utils/
│   ├── animations.ts       # Framer Motion variants
│   └── colors.ts           # Color constants
├── ui/
│   ├── StatCard.tsx        # StatCard, HeroStatCard
│   ├── StatusBadge.tsx     # StatusBadge, StatusDot
│   ├── GlowButton.tsx      # GlowButton, IconButton
│   ├── FormInput.tsx       # FormInput, FormTextarea
│   ├── FormSelect.tsx      # Searchable select
│   ├── ToggleSwitch.tsx    # ToggleSwitch, InlineToggle
│   └── FilterTabs.tsx      # FilterTabs, ButtonGroup
├── layout/
│   ├── Card.tsx            # Card, CardHeader, CardBody, CardFooter
│   ├── Modal.tsx           # Modal, ConfirmModal
│   ├── DataList.tsx        # DataList, DataListItem, etc.
│   ├── DataTable.tsx       # DataTable, TableRow, TableCell
│   └── ActivityFeed.tsx    # ActivityFeed, CompactActivity
└── feedback/
    ├── LoadingSpinner.tsx  # LoadingSpinner, InlineSpinner, LoadingOverlay, Skeleton
    ├── EmptyState.tsx      # EmptyState, InlineEmpty
    └── AlertBanner.tsx     # AlertBanner, DismissibleAlert, Toast
```

---

## Checklist for New Pages

1. [ ] Wrap page in `<motion.div variants={staggerContainer}>`
2. [ ] Add animated header with title
3. [ ] Use `StatCard` for KPI metrics with staggered delays
4. [ ] Use `Card` with `CardHeader` for content sections
5. [ ] Apply corner markers to hero/featured elements
6. [ ] Add glow effects to important values
7. [ ] Use `motion.div whileHover` for interactive rows
8. [ ] Use `Modal` for any overlay content
9. [ ] Use `GlowButton` for primary actions
10. [ ] Use `StatusBadge` for status indicators
11. [ ] Apply `font-mono` to IDs, amounts, codes
12. [ ] Test animations at 0.5x speed to verify smoothness
