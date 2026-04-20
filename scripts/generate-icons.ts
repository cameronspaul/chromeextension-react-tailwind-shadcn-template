/**
 * Icon Generator
 * 
 * Creates placeholder SVG icons for the Chrome extension.
 * Run this script to generate all required icon sizes.
 */

const iconSizes = [16, 32, 48, 128]

const svgTemplate = (size: number) => `<svg width="${size}" height="${size}" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad-${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="20" fill="url(#grad-${size})" />
  <text x="64" y="82" font-family="system-ui, -apple-system, sans-serif" font-size="60" font-weight="bold" text-anchor="middle" fill="white">RE</text>
</svg>`

// Generate icons
iconSizes.forEach(size => {
  const svg = svgTemplate(size)
  // In a real build, you would convert these to PNG
  console.log(`Generated icon-${size}.svg`)
})

console.log('Icons generated! Please convert SVGs to PNGs for use in the extension.')
console.log('Or use online tools like https://convertio.co/svg-png/')
