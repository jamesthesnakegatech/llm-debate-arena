#!/bin/bash

echo "🎨 Applying Risograph style to ALL debate pages..."

# Find all debate pages and apply risograph styling
find pages/debate -name "*.tsx" -type f | while read -r file; do
    echo "Updating $file..."
    
    # Create a backup
    cp "$file" "${file}.backup"
    
    # Apply risograph styling transformations
    perl -i -pe '
        # Update main container
        s/min-h-screen bg-gray-50/min-h-screen riso-gradient-bg/g;
        
        # Add texture overlay after opening div
        s/(<div className="min-h-screen[^>]*>)/$1\n        {/* Risograph texture overlay */}\n        <div className="fixed inset-0 pointer-events-none z-10 opacity-30">\n          <div className="absolute inset-0 halftone-overlay"><\/div>\n        <\/div>/g if !$done1++;
        
        # Update container div
        s/container mx-auto px-4 py-8 max-w-6xl/container mx-auto px-4 py-8 max-w-6xl relative z-20/g;
        
        # Update header card
        s/bg-white rounded-lg shadow-sm/riso-card riso-card-yellow transform -rotate-1/g;
        
        # Update back button
        s/text-blue-600 hover:text-blue-800 font-medium/riso-button px-4 py-2 text-sm/g;
        
        # Update status badges
        s/px-3 py-1 rounded-full text-sm font-medium/riso-badge text-white/g;
        s/bg-yellow-100 text-yellow-800/bg-yellow-500/g;
        s/bg-green-100 text-green-800/bg-green-500/g;
        s/bg-gray-100 text-gray-800/bg-gray-500/g;
        
        # Update topic heading
        s/text-2xl font-bold text-gray-900/text-3xl font-black uppercase riso-misalign/g;
        
        # Update debater cards
        s/text-center p-4 bg-blue-50 rounded-lg/text-center p-4 riso-card transform rotate-1/g;
        s/text-center p-4 bg-red-50 rounded-lg/text-center p-4 riso-card transform -rotate-1/g;
        s/text-lg font-semibold text-blue-900/text-xl font-black uppercase/g;
        s/text-lg font-semibold text-red-900/text-xl font-black uppercase/g;
        
        # Update position badges
        s/px-2 py-1 text-xs font-medium rounded-full/riso-badge text-white/g;
        s/bg-green-100 text-green-800/bg-green-500/g;
        s/bg-orange-100 text-orange-800/bg-orange-500/g;
        
        # Update start debate section
        s/bg-white rounded-lg shadow-sm p-6 mb-6 text-center/riso-card riso-card-green p-6 mb-6 text-center transform rotate-1/g;
        s/text-xl font-semibold mb-4/text-2xl font-black uppercase mb-4/g;
        s/text-gray-600 mb-4/font-bold uppercase mb-4/g;
        s/px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700/riso-button px-8 py-4 text-xl riso-shake/g;
        
        # Update debate turns
        s/bg-blue-100 border-l-4 border-blue-500/riso-debate-turn transform -rotate-1/g;
        s/bg-red-100 border-r-4 border-red-500/riso-debate-turn transform rotate-1/g;
        s/font-semibold.*text-blue-900/font-black uppercase text-xl/g;
        s/font-semibold.*text-red-900/font-black uppercase text-xl/g;
        s/text-sm text-gray-500/riso-badge bg-black text-white/g;
        s/text-gray-800 leading-relaxed/font-medium text-lg leading-relaxed/g;
        
        # Update continue button section
        s/bg-white rounded-lg shadow-sm p-6 text-center mb-6/riso-card riso-card-purple p-6 text-center mb-6 transform -rotate-1/g;
        s/px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700/riso-button px-6 py-4 text-xl/g;
        
        # Update voting section
        s/bg-white rounded-lg shadow-sm p-6 mb-6/riso-card riso-card-pink p-6 mb-6 transform rotate-1/g;
        s/text-xl font-semibold mb-4/text-2xl font-black uppercase mb-4/g;
        s/text-gray-600 mb-4/font-bold uppercase mb-4/g;
        s/flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50/flex items-center space-x-3 cursor-pointer p-4 riso-card hover:transform hover:scale-105 transition-transform/g;
        s/font-medium/font-black uppercase/g;
        
        # Update vote results
        s/bg-white rounded-lg shadow-sm p-6/riso-card riso-card-yellow p-6 transform -rotate-1/g;
        s/px-3 py-1 bg-blue-100 text-blue-800 rounded-full/riso-badge bg-pink-500 text-white/g;
        s/px-3 py-1 bg-red-100 text-red-800 rounded-full/riso-badge bg-blue-500 text-white/g;
        s/px-3 py-1 bg-gray-100 text-gray-800 rounded-full/riso-badge bg-gray-500 text-white/g;
        s/px-3 py-1 bg-orange-100 text-orange-800 rounded-full/riso-badge bg-orange-500 text-white/g;
        
        # Fix checkboxes
        s/w-4 h-4 text-blue-600 rounded/w-4 h-4 accent-pink-500/g;
        
        # Update labels
        s/text-sm font-medium text-gray-700/font-bold uppercase text-sm/g;
        
        # Add decorative elements at the end of the main container
        s/(<\/div>\s*<\/div>\s*<\/>\s*\);)/<div className="absolute top-10 right-10 text-8xl transform rotate-12 opacity-10">⚔️<\/div>\n          <div className="absolute bottom-20 left-10 text-6xl transform -rotate-12 opacity-10">💥<\/div>\n          <div className="absolute top-40 left-20 text-5xl transform rotate-45 opacity-10">⚡<\/div>\n$1/g if !$done2++;
    ' "$file"
    
    # Add data-text attribute for misalign effect on topic
    perl -i -pe 's/(className="[^"]*riso-misalign[^"]*")/$1 data-text={debate.topic}/g' "$file"
    
    # Fix debate turn colors based on LLM
    perl -i -pe '
        s/style=\{\{[\s\S]*?\}\}/style={{ backgroundColor: color === '\''pink'\'' ? '\''var(--riso-pink)'\'' : '\''var(--riso-blue)'\'', opacity: 0.9 }}/g if /riso-debate-turn/;
    ' "$file"
    
    echo "✅ Updated $file"
done

# Also ensure the CSS has the correct colors for debate pages
cat >> styles/globals.css << 'EOF'

/* Additional debate page specific fixes */
.debate-message .riso-debate-turn {
  color: var(--riso-black) !important;
}

.debate-message .riso-debate-turn p,
.debate-message .riso-debate-turn span {
  color: var(--riso-black) !important;
}

/* Fix for debate turn backgrounds */
.riso-debate-turn[style*="pink"] {
  background-color: var(--riso-pink) !important;
  color: var(--riso-black) !important;
}

.riso-debate-turn[style*="blue"] {
  background-color: var(--riso-blue) !important;
  color: white !important;
}

.riso-debate-turn[style*="blue"] * {
  color: white !important;
}
EOF

echo "🎨 All debate pages updated with Risograph style!"
echo "🚀 Restart your dev server to see the changes"
