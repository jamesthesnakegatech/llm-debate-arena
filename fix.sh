#!/bin/bash

echo "🎨 Fixing debate page styling to match homepage..."

# Add debate-specific styles to globals.css
cat >> styles/globals.css << 'EOF'

/* ===== DEBATE PAGE SPECIFIC RISOGRAPH STYLES ===== */

/* Override default debate page styles */
.min-h-screen:not(.riso-gradient-bg) {
  background-color: var(--riso-paper) !important;
  background-image: 
    repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      rgba(255, 72, 176, 0.02) 10px,
      rgba(255, 72, 176, 0.02) 20px
    ) !important;
}

/* Debate header section */
.container .flex.items-center.justify-between {
  background: var(--riso-yellow) !important;
  border: 4px solid var(--riso-black) !important;
  padding: 1.5rem !important;
  margin-bottom: 1rem !important;
  box-shadow: 5px 5px 0 var(--riso-pink), 5px 5px 0 1px var(--riso-black) !important;
}

/* Back button */
a[href="/"], 
button:contains("Back to Arena"),
.text-blue-600 {
  @apply font-black text-white uppercase !important;
  background: var(--riso-blue) !important;
  border: 3px solid var(--riso-black) !important;
  padding: 0.5rem 1rem !important;
  box-shadow: 3px 3px 0 var(--riso-black) !important;
  color: white !important;
  text-decoration: none !important;
}

/* Status badges */
.bg-green-100,
.bg-yellow-100,
.bg-gray-100 {
  background: var(--riso-green) !important;
  color: white !important;
  border: 2px solid var(--riso-black) !important;
  font-weight: 900 !important;
  text-transform: uppercase !important;
  transform: rotate(-2deg);
}

/* Topic header */
h1:not(.riso-misalign) {
  @apply text-3xl font-black uppercase !important;
  color: var(--riso-black) !important;
}

/* Fighter cards */
.grid.grid-cols-2 > div {
  border: 4px solid var(--riso-black) !important;
  background: white !important;
}

.grid.grid-cols-2 > div:first-child {
  background: var(--riso-pink) !important;
  box-shadow: -5px 5px 0 var(--riso-black) !important;
  transform: rotate(1deg);
}

.grid.grid-cols-2 > div:last-child {
  background: var(--riso-blue) !important;
  box-shadow: 5px 5px 0 var(--riso-black) !important;
  transform: rotate(-1deg);
  color: white !important;
}

.grid.grid-cols-2 > div:last-child * {
  color: white !important;
}

/* Position badges PRO/CON */
.bg-green-100.text-green-800,
.bg-orange-100.text-orange-800,
span:contains("PRO"),
span:contains("CON") {
  @apply font-black uppercase !important;
  background: var(--riso-orange) !important;
  color: white !important;
  border: 2px solid var(--riso-black) !important;
  padding: 0.25rem 0.75rem !important;
  display: inline-block !important;
  transform: rotate(-2deg) !important;
}

/* Debate turns */
.bg-blue-100,
.bg-red-100 {
  background: white !important;
  border: 4px solid var(--riso-black) !important;
  padding: 1.5rem !important;
  margin-bottom: 1.5rem !important;
}

.bg-blue-100 {
  box-shadow: -8px 8px 0 var(--riso-pink), -8px 8px 0 1px var(--riso-black) !important;
  transform: rotate(-1deg) !important;
}

.bg-red-100 {
  box-shadow: 8px 8px 0 var(--riso-blue), 8px 8px 0 1px var(--riso-black) !important;
  transform: rotate(1deg) !important;
}

/* Turn headers */
.font-semibold.text-blue-900,
.font-semibold.text-red-900 {
  @apply font-black uppercase text-xl !important;
  color: var(--riso-black) !important;
}

/* Turn numbers */
.text-sm.text-gray-500 {
  @apply font-black uppercase !important;
  background: var(--riso-black) !important;
  color: white !important;
  padding: 0.25rem 0.5rem !important;
  border-radius: 0 !important;
}

/* Message content */
.text-gray-800.leading-relaxed {
  @apply font-medium text-lg !important;
  color: var(--riso-black) !important;
}

/* Vote buttons */
button:not(.riso-button) {
  @apply font-black uppercase !important;
  background: var(--riso-blue) !important;
  color: white !important;
  border: 3px solid var(--riso-black) !important;
  padding: 0.75rem 1.5rem !important;
  box-shadow: 4px 4px 0 var(--riso-black) !important;
  transition: all 0.2s !important;
}

button:hover {
  transform: translate(-2px, -2px) !important;
  box-shadow: 6px 6px 0 var(--riso-black) !important;
}

/* Add decorative elements */
body::after {
  content: '⚡';
  position: fixed;
  top: 10%;
  right: 5%;
  font-size: 6rem;
  opacity: 0.1;
  transform: rotate(15deg);
  pointer-events: none;
  z-index: 0;
}

body::before {
  content: '💥';
  position: fixed;
  bottom: 10%;
  left: 5%;
  font-size: 5rem;
  opacity: 0.1;
  transform: rotate(-20deg);
  pointer-events: none;
  z-index: 0;
}

/* Fact check checkboxes */
input[type="checkbox"] {
  accent-color: var(--riso-pink) !important;
  width: 1.25rem !important;
  height: 1.25rem !important;
}

/* Labels next to checkboxes */
label {
  @apply font-bold uppercase !important;
  color: var(--riso-black) !important;
}
EOF

echo "✅ Added debate page specific styles"

# Create a simpler fix for immediate application
echo "🔧 Creating immediate fix script..."
cat > fix-debate-immediate.js << 'EOF'
// Run this in browser console on debate page
document.body.style.backgroundColor = '#FFFBF5';
document.body.style.backgroundImage = 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 72, 176, 0.02) 10px, rgba(255, 72, 176, 0.02) 20px)';

// Fix header
const header = document.querySelector('.container');
if (header) {
  header.style.backgroundColor = '#FFB300';
  header.style.border = '4px solid #1A1A1A';
  header.style.padding = '1.5rem';
}

// Fix debate turns
document.querySelectorAll('.bg-blue-100, .bg-red-100').forEach((el, i) => {
  el.style.backgroundColor = 'white';
  el.style.border = '4px solid #1A1A1A';
  el.style.padding = '1.5rem';
  el.style.marginBottom = '1.5rem';
  el.style.transform = i % 2 === 0 ? 'rotate(-1deg)' : 'rotate(1deg)';
  el.style.boxShadow = i % 2 === 0 
    ? '-8px 8px 0 #E91E63, -8px 8px 0 1px #1A1A1A'
    : '8px 8px 0 #0056A0, 8px 8px 0 1px #1A1A1A';
});

console.log('✅ Risograph styles applied!');
EOF

echo "📋 To fix immediately, copy the contents of fix-debate-immediate.js"
echo "   and run in browser console on the debate page"
echo ""
echo "🚀 Or restart your dev server to load the new CSS"
echo ""
echo "💡 If styles still don't apply, try:"
echo "   1. Clear browser cache (Cmd+Shift+R)"
echo "   2. Check if another CSS file is overriding"
echo "   3. Add !important to more rules"
