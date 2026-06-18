// Copyright © 2026 Jalapeno Labs

import type { SVGProps } from 'react'

/**
 * Static SVG previews of the three theme options. They are inlined (rather than
 * loaded as asset files) so the component stays dependency-free and renders the
 * same artwork regardless of how the consumer's bundler handles SVG imports.
 *
 * Each preview forwards arbitrary SVG props (className, style, ...) so callers
 * can size and position them. The artwork is a stylized mini-dashboard: a
 * sidebar plus two content cards, recoloured per theme.
 */

/**
 * Light theme preview: pale surfaces with a white sidebar and content cards.
 */
export function ThemePreviewLight(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox='0 0 112 80' xmlns='http://www.w3.org/2000/svg' {...props}>
    {/* Background */}
    <rect width='112' height='80' rx='4' fill='#F5F5F4' />
    {/* Sidebar */}
    <rect x='0' y='0' width='28' height='80' rx='4' fill='#FFFFFF' />
    <rect x='6' y='8' width='16' height='3' rx='1' fill='#E5E5E4' />
    <rect x='6' y='16' width='12' height='2' rx='1' fill='#D4D4D3' />
    <rect x='6' y='22' width='14' height='2' rx='1' fill='#D4D4D3' />
    <rect x='6' y='28' width='10' height='2' rx='1' fill='#D4D4D3' />
    {/* Content area */}
    <rect x='34' y='8' width='40' height='4' rx='1' fill='#D4D4D3' />
    <rect x='34' y='18' width='72' height='24' rx='3' fill='#FFFFFF' />
    <rect x='40' y='24' width='30' height='3' rx='1' fill='#E5E5E4' />
    <rect x='40' y='31' width='20' height='2' rx='1' fill='#E5E5E4' />
    <rect x='34' y='48' width='72' height='24' rx='3' fill='#FFFFFF' />
    <rect x='40' y='54' width='25' height='3' rx='1' fill='#E5E5E4' />
    <rect x='40' y='61' width='18' height='2' rx='1' fill='#E5E5E4' />
  </svg>
}

/**
 * Dark theme preview: the same layout recoloured with deep charcoal surfaces.
 */
export function ThemePreviewDark(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox='0 0 112 80' xmlns='http://www.w3.org/2000/svg' {...props}>
    {/* Background */}
    <rect width='112' height='80' rx='4' fill='#1A1A19' />
    {/* Sidebar */}
    <rect x='0' y='0' width='28' height='80' rx='4' fill='#2A2A29' />
    <rect x='6' y='8' width='16' height='3' rx='1' fill='#3A3A39' />
    <rect x='6' y='16' width='12' height='2' rx='1' fill='#444443' />
    <rect x='6' y='22' width='14' height='2' rx='1' fill='#444443' />
    <rect x='6' y='28' width='10' height='2' rx='1' fill='#444443' />
    {/* Content area */}
    <rect x='34' y='8' width='40' height='4' rx='1' fill='#444443' />
    <rect x='34' y='18' width='72' height='24' rx='3' fill='#2A2A29' />
    <rect x='40' y='24' width='30' height='3' rx='1' fill='#3A3A39' />
    <rect x='40' y='31' width='20' height='2' rx='1' fill='#3A3A39' />
    <rect x='34' y='48' width='72' height='24' rx='3' fill='#2A2A29' />
    <rect x='40' y='54' width='25' height='3' rx='1' fill='#3A3A39' />
    <rect x='40' y='61' width='18' height='2' rx='1' fill='#3A3A39' />
  </svg>
}

/**
 * System theme preview: a vertical split showing the light artwork on the left
 * and the dark artwork on the right, signalling "follow the OS preference".
 */
export function ThemePreviewSystem(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox='0 0 112 80' xmlns='http://www.w3.org/2000/svg' {...props}>
    <defs>
      <clipPath id='theme-preview-system-left-half'>
        <rect x='0' y='0' width='56' height='80' />
      </clipPath>
      <clipPath id='theme-preview-system-right-half'>
        <rect x='56' y='0' width='56' height='80' />
      </clipPath>
    </defs>
    {/* Light half (left) */}
    <g clipPath='url(#theme-preview-system-left-half)'>
      <rect width='112' height='80' rx='4' fill='#F5F5F4' />
      <rect x='0' y='0' width='28' height='80' rx='4' fill='#FFFFFF' />
      <rect x='6' y='8' width='16' height='3' rx='1' fill='#E5E5E4' />
      <rect x='6' y='16' width='12' height='2' rx='1' fill='#D4D4D3' />
      <rect x='6' y='22' width='14' height='2' rx='1' fill='#D4D4D3' />
      <rect x='6' y='28' width='10' height='2' rx='1' fill='#D4D4D3' />
      <rect x='34' y='8' width='40' height='4' rx='1' fill='#D4D4D3' />
      <rect x='34' y='18' width='72' height='24' rx='3' fill='#FFFFFF' />
      <rect x='40' y='24' width='30' height='3' rx='1' fill='#E5E5E4' />
      <rect x='40' y='31' width='20' height='2' rx='1' fill='#E5E5E4' />
      <rect x='34' y='48' width='72' height='24' rx='3' fill='#FFFFFF' />
      <rect x='40' y='54' width='25' height='3' rx='1' fill='#E5E5E4' />
      <rect x='40' y='61' width='18' height='2' rx='1' fill='#E5E5E4' />
    </g>
    {/* Dark half (right) */}
    <g clipPath='url(#theme-preview-system-right-half)'>
      <rect width='112' height='80' rx='4' fill='#1A1A19' />
      <rect x='0' y='0' width='28' height='80' rx='4' fill='#2A2A29' />
      <rect x='6' y='8' width='16' height='3' rx='1' fill='#3A3A39' />
      <rect x='6' y='16' width='12' height='2' rx='1' fill='#444443' />
      <rect x='6' y='22' width='14' height='2' rx='1' fill='#444443' />
      <rect x='6' y='28' width='10' height='2' rx='1' fill='#444443' />
      <rect x='34' y='8' width='40' height='4' rx='1' fill='#444443' />
      <rect x='34' y='18' width='72' height='24' rx='3' fill='#2A2A29' />
      <rect x='40' y='24' width='30' height='3' rx='1' fill='#3A3A39' />
      <rect x='40' y='31' width='20' height='2' rx='1' fill='#3A3A39' />
      <rect x='34' y='48' width='72' height='24' rx='3' fill='#2A2A29' />
      <rect x='40' y='54' width='25' height='3' rx='1' fill='#3A3A39' />
      <rect x='40' y='61' width='18' height='2' rx='1' fill='#3A3A39' />
    </g>
    {/* Divider line */}
    <line x1='56' y1='0' x2='56' y2='80' stroke='#888' strokeWidth='0.5' />
  </svg>
}
