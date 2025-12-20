## 2024-05-23 - Accessibility Patterns in Modal Forms
**Learning:** React forms in this codebase often use labels that aren't programmatically associated with their inputs (missing `htmlFor`/`id` pairs). This breaks screen reader navigation. Also, icon-only buttons (like "Close") frequently miss `aria-label`.
**Action:** When creating or modifying forms, always ensure `htmlFor` matches the input `id`. For icon-only buttons, check for `aria-label` or `title` immediately.
