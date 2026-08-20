# SentraEdu Frontend Architecture & Coding Standards

This project follows strict guidelines extracted from the Master Product Requirement Document (PRD). You MUST adhere to these rules at all times when writing or modifying code.

## 1. Architectural & Code Quality Standards
- **Separation of Concerns (SoC)**: Use **Feature-based Architecture** combined with **Atomic Design**.
  - Atomic Design components go in `src/lib/components/{atoms, molecules, organisms, templates}/`.
  - Feature-specific code goes in `src/lib/features/[feature-name]/` containing `components/`, `stores/`, `api/`, `schemas/`, and `types.ts`.
  - Global shared utilities go in `src/lib/shared/`.
- **DRY (Don't Repeat Yourself)**: Re-use atomic components, centralize Zod validation schemas, and group CSS utilities.
- **Strict Naming Conventions**: 
  - **Files & Folders**: MUST use `kebab-case` in English (e.g., `order-management/`, `data-table.svelte`).
  - **Variables/Functions**: MUST use Meaningful Names. DO NOT use single-letter variables (`u.id`, `e`, `j`, `p`, etc. are strictly forbidden, use `user.id`, `error`, `jobItem`, `programItem`).
- **Strict Typing (Zero `any` & Zero `unknown`)**: 
  - `any` and `unknown` are strictly forbidden.
  - Every variable, prop, API response, function parameter, and return value MUST have an explicit TypeScript type or interface.
- **Zero Build Error Standard**: Strict TypeScript must be maintained. Code must pass `svelte-check` and `tsc --noEmit` with zero warnings or errors.

## 2. Tech Stack
- **Frontend**: SvelteKit (TypeScript), Tailwind CSS v4, Bits UI / Shadcn-Svelte, Google Material Symbols, Svelte Stores / Runes, Zod.

## 3. UI/UX Design System & Tailwind CSS
- **Mobile-First Breakpoint System**: Design for mobile first, then progressively enhance using `sm:`, `md:`, `lg:`, `xl:`.
- **4px Sizing Standard**: All layout utilities (padding, margin, gap, width, height, radius) MUST be multiples of 4px (e.g., 4, 8, 12, 16, 20).
- **Google Material Symbols**: Always use the atomic `<Icon>` wrapper component (`src/lib/components/atoms/icon.svelte`) to render icons.

## 4. Deterministic 4-State UI Matrix
Every data representation component (lists, tables, dashboards) MUST explicitly implement the following 4 states:
1. **Loading State**: Render skeletal loaders (with 4px grid sizing) and disable actions.
2. **Empty State**: Show a relevant `<Icon>`, an informative message, and an action button.
3. **Populated State**: Render the data (responsive table for `md:` and up, or vertical cards for mobile).
4. **Error State**: Catch errors and display an `<AlertBanner>` with a retry action.
