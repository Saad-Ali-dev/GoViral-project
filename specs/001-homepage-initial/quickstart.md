# Quickstart: Homepage Frontend

## Running the Homepage

### 1. Install Dependencies

```bash
cd web_app
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

### 3. View Homepage

Open http://localhost:3000 in your browser.

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Run production build |
| `npm run lint` | Run ESLint |

## Responsive Testing

| Viewport | Width | Description |
|----------|-------|-------------|
| Mobile | 412px | iPhone-like width, sidebar active |
| Tablet | 768px | Small tablet, sidebar active |
| Desktop | 1440px | Full width, horizontal navbar |

Use browser DevTools to test different viewport sizes.

## Component Structure

```
src/
├── app/
│   ├── page.tsx           # Homepage (composes all sections)
│   ├── layout.tsx         # Root layout with fonts
│   └── globals.css        # Tailwind imports
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx     # Desktop navbar
│   │   ├── Sidebar.tsx    # Mobile sidebar
│   │   └── Footer.tsx     # Footer
│   ├── homepage/
│   │   ├── HeroSection.tsx    # Logo + title
│   │   ├── UploadSection.tsx  # Upload box
│   │   └── FeaturesSection.tsx # 4 feature cards
│   └── ui/
│       └── IconButton.tsx # Reusable button with icon
└── lib/
    └── fonts.ts           # Font configuration
```

## Icons Used

| Icon | Import | Usage |
|------|--------|-------|
| CloudArrowUp | `import { FaCloudArrowUp } from 'react-icons/fa'` | Upload section |
| MagnifyingGlass | `import { FaMagnifyingGlass } from 'react-icons/fa'` | Search (placeholder) |
| Youtube | `import { FaYoutube } from 'react-icons/fa'` | Branding/feature |
| HourglassHalf | `import { FaHourglassHalf } from 'react-icons/fa'` | Processing state |
| Bars | `import { FaBars } from 'react-icons/fa'` | Mobile menu toggle |
| CircleXmark | `import { FaCircleXmark } from 'react-icons/fa'` | Mobile menu close |

## Fonts Configuration

```typescript
// lib/fonts.ts
import { Poppins, Inter } from 'next/font/google'

export const poppins = Poppins({
  subsets: ['latin'],
  weight: ['600'], // Semibold only
  variable: '--font-poppins',
})

export const inter = Inter({
  subsets: ['latin'],
  weight: ['400'], // Regular only
  variable: '--font-inter',
})
```

Apply via CSS variables in Tailwind:
- Headings: `font-semibold font-poppins`
- Body: `font-inter`
