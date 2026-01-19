# Implementation Plan: Homepage Frontend - Initial Setup

**Branch**: `001-homepage-initial` | **Date**: 2026-01-20 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-homepage-initial/spec.md`

## Summary

Create the initial homepage frontend for GoViral using Next.js 16.1.1 and Tailwind CSS v4. The homepage features a responsive layout with:

- Desktop: Horizontal navbar (no sidebar), heading section, upload section, 4 feature boxes, footer
- Mobile: Collapsible sidebar (hamburger menu), same content sections
- Fonts: Poppins semibold for headings (GoViral, Features), Inter for body text
- Icons: FontAwesome via react-icons (faCloudArrowUp, faMagnifyingGlass, faYoutube, faHourglassHalf, faBars, faCircleXmark)
- WCAG 2.1 Level A accessibility compliance

## Technical Context

**Language/Version**: TypeScript 5, Next.js 16.1.1, React 19.2.3
**Primary Dependencies**:

- next: 16.1.1
- react: 19.2.3
- react-dom: 19.2.3
- react-icons: 5.5.0 (FontAwesome icons)
- tailwindcss: ^4
- @tailwindcss/postcss: ^4
  **Storage**: N/A (frontend-only)
  **Testing**: N/A (Excluded per Constitution Rule 6)
  **Target Platform**: Web (cross-browser, responsive)
  **Project Type**: Next.js web application
  **Performance Goals**: Page load under 2 seconds, responsive with no layout shift
  **Constraints**: No automated tests; WCAG 2.1 Level A; use existing assets only
  **Scale/Scope**: Single page (homepage) with responsive variants

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Technology Stack Compliance**:

- [x] Frontend: Next.js, React, Tailwind CSS, TypeScript only
- [x] Backend: N/A (frontend-only feature)
- [x] No unauthorized dependencies added (react-icons is already in package.json)

**Quality Standards**:

- [x] Code follows industry best practices and production-grade standards
- [x] UI is fully responsive and mobile-optimized (768px tablet, 1024px laptop breakpoints)
- [x] Performance meets production requirements (<2s load time)
- [x] Code is clean, professional, well-commented, and modular

**Development Practices**:

- [x] Existing code reused; search conducted before creating new functions
- [x] DRY principle followed; no duplicate implementations
- [x] Dependencies are minimal and approved (only existing dependencies)
- [x] Only explicitly requested features implemented; no additional functionality

**Testing Compliance (CRITICAL - Rule 6)**:

- [x] NO unit tests included
- [x] NO integration tests included
- [x] NO E2E tests included
- [x] NO test files or test directories created
- [x] All verification will be manual or through other non-automated methods

## Project Structure

### Documentation (this feature)

```text
specs/001-homepage-initial/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (skipped - no unknowns)
├── data-model.md        # Phase 1 output (skipped - no backend data)
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (skipped - no API contracts)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
web_app/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Homepage main page
│   │   ├── layout.tsx            # Root layout with fonts
│   │   └── globals.css           # Global styles
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx        # Desktop navbar component
│   │   │   ├── Sidebar.tsx       # Mobile sidebar component
│   │   │   └── Footer.tsx        # Footer component
│   │   ├── homepage/
│   │   │   ├── HeroSection.tsx   # Heading with logo
│   │   │   ├── UploadSection.tsx # Upload box section
│   │   │   └── FeaturesSection.tsx # 4 feature boxes
│   │   └── ui/
│   │       └── IconButton.tsx    # Reusable icon button
│   └── lib/
│       └── fonts.ts              # Font configuration
└── public/
    ├── logo-white.png            # Existing asset
    └── logo.png                  # Existing asset
```

**Structure Decision**: Next.js App Router structure with modular component organization under `src/components/` divided by concern (layout, homepage, ui). This follows Next.js best practices for code organization and reusability.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| N/A       | N/A        | N/A                                  |

## Research & Design Decisions

### Icons (react-icons FontAwesome)

| Icon              | Usage                              |
| ----------------- | ---------------------------------- |
| FaCloudArrowUp    | Upload section visual              |
| FaMagnifyingGlass | Search functionality (placeholder) |
| FaYoutube         | Feature icon or branding           |
| FaHourglassHalf   | Loading or processing state        |
| FaBars            | Mobile sidebar toggle              |
| FaCircleXmark     | Mobile sidebar close               |

### Typography

| Element                           | Font    | Weight         |
| --------------------------------- | ------- | -------------- |
| Main headings (GoViral, Features) | Poppins | Semibold (600) |
| Body text, descriptions, labels   | Inter   | Regular (400)  |

### Responsive Breakpoints

| Breakpoint | Min Width | Max Width | Navigation               |
| ---------- | --------- | --------- | ------------------------ |
| Mobile     | -         | 767px     | Sidebar (hamburger menu) |
| Tablet     | 768px     | 1023px    | Sidebar (hamburger menu) |
| Desktop    | 1024px    | -         | Horizontal navbar        |

## Quickstart

### Prerequisites

- Node.js 18+ installed
- Dependencies installed: `npm install` in `/web_app/`
- Run dev server: `npm run dev` from `/web_app/`

### Development

1. Navigate to web_app directory: `cd web_app`
2. Start development server: `npm run dev`
3. Open http://localhost:3000
4. Verify responsive behavior at 1440px (desktop) and 412px (mobile)

### Verification Checklist

- [ ] Desktop (1440px): Horizontal navbar visible, no sidebar
- [ ] Mobile (412px): Hamburger menu visible, sidebar opens on tap
- [ ] All sections scroll vertically without cutoff
- [ ] Navigation links work correctly
- [ ] Feature boxes display with correct content
- [ ] Fonts render correctly (Poppins semibold headings, Inter body)
- [ ] Icons display correctly from react-icons
- [ ] Page loads under 2 seconds
