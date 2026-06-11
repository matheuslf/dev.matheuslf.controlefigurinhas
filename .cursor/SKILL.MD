---
name: design-system-json-web-tokens
description: Creates implementation-ready design-system guidance with tokens, component behavior, and accessibility standards. Use when creating or updating UI rules, component specifications, or design-system documentation.
---

<!-- TYPEUI_SH_MANAGED_START -->

# JSON Web Tokens

## Mission
Deliver implementation-ready design-system guidance for JSON Web Tokens that can be applied consistently across documentation site interfaces.

## Brand
- Product/brand: JSON Web Tokens
- URL: https://www.jwt.io/
- Audience: developers and technical teams
- Product surface: documentation site

## Style Foundations
- Visual style: structured, accessible, implementation-first
- Main font style: `font.family.primary=__Inter_74bcf7`, `font.family.stack=__Inter_74bcf7, __Inter_Fallback_74bcf7`, `font.size.base=16px`, `font.weight.base=400`, `font.lineHeight.base=normal`
- Typography scale: `font.size.xs=12px`, `font.size.sm=13px`, `font.size.md=13.33px`, `font.size.lg=14px`, `font.size.xl=16px`, `font.size.2xl=18.29px`, `font.size.3xl=28px`, `font.size.4xl=32px`
- Color palette: `color.text.primary=#e5e5e5`, `color.surface.base=#000000`, `color.text.tertiary=#fbfbfb`, `color.text.inverse=#c5c5c5`, `color.surface.muted=#111111`, `color.surface.raised=#1e1e1e`, `color.surface.strong=#f2f2f2`
- Spacing scale: `space.1=4px`, `space.2=8px`, `space.3=12px`, `space.4=16px`, `space.5=24px`, `space.6=40px`, `space.7=112px`, `space.8=128px`
- Radius/shadow/motion tokens: `radius.xs=4px`, `radius.sm=8px`, `radius.md=12px`, `radius.lg=16px`, `radius.xl=9999px` | `shadow.1=rgba(0, 0, 0, 0.1) 0px 2px 4px 0px`, `shadow.2=rgba(0, 0, 0, 0.12) 0px 0px 0px 0.5px, rgba(0, 0, 0, 0.04) 0px 2px 2px -1px, rgba(0, 0, 0, 0.04) 0px 4px 4px -2px, rgba(0, 0, 0, 0.04) 0px 6px 6px -3px`, `shadow.3=rgba(0, 0, 0, 0.04) 0px 1px 1px -0.5px, rgba(0, 0, 0, 0.04) 0px 3px 3px -1.5px, rgba(0, 0, 0, 0.04) 0px 6px 6px -3px, rgba(0, 0, 0, 0.04) 0px 12px 12px -6px, rgba(0, 0, 0, 0.04) 0px 24px 24px -12px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px inset`, `shadow.4=rgba(0, 0, 0, 0.04) 0px 0px 0px 1px, rgba(0, 0, 0, 0.04) 0px 1px 1px -0.5px, rgba(0, 0, 0, 0.04) 0px 0px 0px 1px inset` | `motion.duration.instant=200ms`, `motion.duration.fast=250ms`, `motion.duration.normal=300ms`

## Accessibility
- Target: WCAG 2.2 AA
- Keyboard-first interactions required.
- Focus-visible rules required.
- Contrast constraints required.

## Writing Tone
concise, confident, implementation-focused

## Rules: Do
- Use semantic tokens, not raw hex values in component guidance.
- Every component must define required states: default, hover, focus-visible, active, disabled, loading, error.
- Responsive behavior and edge-case handling should be specified for every component family.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.

## Guideline Authoring Workflow
1. Restate design intent in one sentence.
2. Define foundations and tokens.
3. Define component anatomy, variants, and interactions.
4. Add accessibility acceptance criteria.
5. Add anti-patterns and migration notes.
6. End with QA checklist.

## Required Output Structure
- Context and goals
- Design tokens and foundations
- Component-level rules (anatomy, variants, states, responsive behavior)
- Accessibility requirements and testable acceptance criteria
- Content and tone standards with examples
- Anti-patterns and prohibited implementations
- QA checklist

## Component Rule Expectations
- Include keyboard, pointer, and touch behavior.
- Include spacing and typography token requirements.
- Include long-content, overflow, and empty-state handling.

## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Prefer system consistency over local visual exceptions.

<!-- TYPEUI_SH_MANAGED_END -->
