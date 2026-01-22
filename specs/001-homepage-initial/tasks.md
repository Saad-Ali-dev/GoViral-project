# Tasks: Homepage Frontend - Initial Setup

**Feature Branch**: `001-homepage-initial` | **Generated**: 2026-01-20
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

## Task Summary

| Metric             | Count |
| ------------------ | ----- |
| Total Tasks        | 21    |
| Setup Tasks        | 4     |
| Foundational Tasks | 3     |
| User Story 1 Tasks | 6     |
| User Story 2 Tasks | 3     |
| User Story 3 Tasks | 2     |
| User Story 4 Tasks | 1     |
| Polish Tasks       | 2     |

## Dependencies & Execution Order

```
Phase 1 (Setup) ──────────────────────────────────────────┐
    │                                                      │
    ▼                                                      │
Phase 2 (Foundational) ────────────────────────────────────┼──┐
    │                                                      │  │
    ▼                                                      │  │
Phase 3 [US1] Desktop View ────────────────────────────────┼──┼──┐
    │                                                      │  │  │
    ▼                                                      │  │  │
Phase 4 [US2] Mobile View ──────────────────────────────────┼──┼──┼──┐
    │                                                      │  │  │  │
    ▼                                                      │  │  │  │
Phase 5 [US3] Navigation ───────────────────────────────────┴──┼──┼──┤
    │                                                         │  │  │
    ▼                                                         │  │  │
Phase 6 [US4] Scrolling ──────────────────────────────────────┴──┼──┤
    │                                                            │
    ▼                                                            │
Phase 7 Polish ──────────────────────────────────────────────────┘
```

**Parallel Opportunities**:

- Tasks T002-T004 can run in parallel (different files, no dependencies)
- T006 [US1] and T007 [US1] can run in parallel (different sections)
- T010 [US2] and T011 [US2] can run in parallel (sidebar and content)

## Implementation Strategy

### MVP Scope (User Story 1 Only)

- Complete Phase 1 and Phase 2
- Complete Phase 3 [US1] Desktop View
- Result: Functional desktop homepage with all sections

### Incremental Delivery

1. **MVP**: Desktop homepage (US1 complete)
2. **Iteration 2**: Mobile responsiveness (US2 complete)
3. **Iteration 3**: Navigation links (US3 complete)
4. **Iteration 4**: Polish and edge cases (US4 + Polish)

---

## Phase 1: Setup

Initialize Next.js project structure with proper directories.

**Goal**: Create all required directories and configuration files per implementation plan.

**Independent Test**: Run `ls -la web_app/src/` and verify all directories exist.

- [x] T001 Create project directory structure in `web_app/src/`
- [x] T002 [P] Create `web_app/src/app/layout.tsx` with Next.js root layout
- [x] T003 [P] Create `web_app/src/app/globals.css` with Tailwind CSS v4 imports
- [x] T004 [P] Create `web_app/src/lib/fonts.ts` with Poppins and Inter font configuration

---

## Phase 2: Foundational Components

Create shared UI components and base styling.

**Goal**: Establish typography, global styles, and reusable UI building blocks.

**Independent Test**: Verify fonts load correctly by checking browser DevTools Network tab.

### Typography & Global Styles

- [x] T005 Configure Tailwind CSS v4 in `web_app/tailwind.config.ts` with custom font variables
- [x] T006 [P] Create `web_app/src/app/page.tsx` as homepage entry point with basic structure

### Reusable UI Components

- [x] T007 [P] Create `web_app/src/components/ui/IconButton.tsx` reusable icon button component

---

## Phase 3: User Story 1 - Desktop View

**Story Goal**: Display homepage on desktop with horizontal navbar, heading, upload section, features, and footer.

**Priority**: P1 (Primary entry point for desktop users)

**Independent Test**: Open http://localhost:3000 at 1440px viewport width. Verify: horizontal navbar visible, no sidebar, all sections visible, content flows vertically.

### Layout Components

- [x] T008 [US1] Create `web_app/src/components/layout/Navbar.tsx` desktop navbar with Homepage/Videos/Login links
- [x] T009 [US1] Create `web_app/src/components/layout/Footer.tsx` footer with simple text

### Homepage Sections

- [x] T010 [US1] Create `web_app/src/components/homepage/HeroSection.tsx` with GoViral logo, title, description
- [x] T011 [US1] Create `web_app/src/components/homepage/UploadSection.tsx` upload box section with icon
- [x] T012 [US1] Create `web_app/src/components/homepage/FeaturesSection.tsx` with 4 feature boxes

### Integration

- [x] T013 [US1] Compose all sections in `web_app/src/app/page.tsx` with responsive container

---

## Phase 4: User Story 2 - Mobile View

**Story Goal**: Display homepage on mobile/tablet with collapsible sidebar navigation.

**Priority**: P1 (Mobile users need optimal experience)

**Independent Test**: Open http://localhost:3000 at 412px viewport width. Verify: hamburger menu visible, sidebar opens on tap, content reflows vertically, all sections accessible.

**Dependencies**: Phase 3 must complete first (desktop layout foundation required)

### Mobile Navigation

- [x] T014 [US2] Create `web_app/src/components/layout/Sidebar.tsx` collapsible sidebar with navigation links
- [x] T015 [US2] Integrate hamburger menu toggle in Navbar component for mobile breakpoint

### Responsive Adjustments

- [x] T016 [US2] Update layout components to show sidebar on mobile (<768px) and navbar on desktop (≥1024px)

---

## Phase 5: User Story 3 - Navigation

**Story Goal**: Enable navigation between Homepage, Videos, and Login pages.

**Priority**: P2 (Essential but secondary to visual layout)

**Independent Test**: Click each navigation link. Verify: "Homepage" anchors to top, "Videos" and "Login" links are present (even if pages don't exist yet).

**Dependencies**: Phase 4 must complete first (sidebar/navbar components required)

### Navigation Implementation

- [x] T017 [US3] Add Link components to Navbar.tsx for Homepage/Videos/Login navigation
- [x] T018 [US3] Add Link components to Sidebar.tsx for Homepage/Videos/Login navigation

---

## Phase 6: User Story 4 - Scrolling

**Story Goal**: Ensure vertical scrolling works smoothly with no content cutoff.

**Priority**: P2 (Standard user expectation)

**Independent Test**: Scroll from top to bottom using mouse wheel. Verify: all sections visible, no fixed-height containers hiding content, smooth scroll behavior.

**Dependencies**: Phases 3-5 must complete first (all sections must exist)

### Scrolling & Layout

- [x] T019 [US4] Verify and fix any layout issues preventing full content visibility on all viewports

---

## Phase 7: Polish & Cross-Cutting Concerns

Final refinements and accessibility compliance.

**Goal**: WCAG 2.1 Level A compliance, smooth interactions, production-ready code.

**Independent Test**: Verify accessibility with keyboard navigation, check page load time under 2 seconds.

### Accessibility & Performance

- [x] T020 Add keyboard navigation support for sidebar toggle (Tab, Enter, Escape keys)
- [x] T021 Add ARIA labels and semantic HTML structure for WCAG 2.1 Level A compliance

---

## Task Completion Checklist

### Format Validation

| Task ID | Format Valid | Has Checkbox | Has ID | Has Story Label | Has File Path |
| ------- | ------------ | ------------ | ------ | --------------- | ------------- |
| T001    | ✅           | ✅           | ✅     | N/A             | ✅            |
| T002    | ✅           | ✅           | ✅     | N/A             | ✅            |
| T003    | ✅           | ✅           | ✅     | N/A             | ✅            |
| T004    | ✅           | ✅           | ✅     | N/A             | ✅            |
| T005    | ✅           | ✅           | ✅     | N/A             | ✅            |
| T006    | ✅           | ✅           | ✅     | N/A             | ✅            |
| T007    | ✅           | ✅           | ✅     | N/A             | ✅            |
| T008    | ✅           | ✅           | ✅     | [US1]           | ✅            |
| T009    | ✅           | ✅           | ✅     | [US1]           | ✅            |
| T010    | ✅           | ✅           | ✅     | [US1]           | ✅            |
| T011    | ✅           | ✅           | ✅     | [US1]           | ✅            |
| T012    | ✅           | ✅           | ✅     | [US1]           | ✅            |
| T013    | ✅           | ✅           | ✅     | [US1]           | ✅            |
| T014    | ✅           | ✅           | ✅     | [US2]           | ✅            |
| T015    | ✅           | ✅           | ✅     | [US2]           | ✅            |
| T016    | ✅           | ✅           | ✅     | [US2]           | ✅            |
| T017    | ✅           | ✅           | ✅     | [US3]           | ✅            |
| T018    | ✅           | ✅           | ✅     | [US3]           | ✅            |
| T019    | ✅           | ✅           | ✅     | [US4]           | ✅            |
| T020    | ✅           | ✅           | ✅     | N/A             | ✅            |
| T021    | ✅           | ✅           | ✅     | N/A             | ✅            |

### Independent Test Criteria Per Story

| User Story       | Test Criteria                                                        |
| ---------------- | -------------------------------------------------------------------- |
| US1 (Desktop)    | Open at 1440px - navbar horizontal, no sidebar, all sections visible |
| US2 (Mobile)     | Open at 412px - hamburger visible, sidebar opens, content reflows    |
| US3 (Navigation) | Click links - Homepage anchors to top, Videos/Login links present    |
| US4 (Scrolling)  | Scroll top to bottom - all content visible, no cutoff                |
