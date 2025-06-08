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
