#!/bin/bash

echo "=== Adding Analysis Components to Debate Page ==="
echo ""

# Create a patch to add the components
cat > add_analysis_components.patch << 'EOF'
--- pages/debate/[id].tsx.orig
+++ pages/debate/[id].tsx
@@ -6,6 +6,8 @@
 import { useSocket } from '../../hooks/useSocket'
 import TypingIndicator from '../../components/TypingIndicator'
+import ArgumentStrengthMeter from '../../components/ArgumentStrengthMeter'
+import FactCheckIndicator from '../../components/FactCheckIndicator'
 
 interface Turn {
   id: string
@@ -13,6 +15,9 @@
   message: string
   turnNumber: number
   createdAt: string
+  argumentStrength?: number | null
+  strengthBreakdown?: any
+  factClaims?: any
 }
 
 interface DebateData {
@@ -410,6 +415,22 @@
                         <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                           {turn.message}
                         </p>
+                        
+                        {/* Argument Strength Meter */}
+                        {turn.argumentStrength && turn.strengthBreakdown && (
+                          <ArgumentStrengthMeter
+                            strength={turn.argumentStrength}
+                            breakdown={turn.strengthBreakdown}
+                            turnId={turn.id}
+                          />
+                        )}
+                        
+                        {/* Fact Check Indicator */}
+                        {turn.factClaims && turn.factClaims.length > 0 && (
+                          <FactCheckIndicator
+                            claims={turn.factClaims}
+                            turnId={turn.id}
+                          />
+                        )}
                       </div>
                     </div>
                   </div>
EOF

# Apply the patch
echo "Applying component imports and usage..."
if [ -f "pages/debate/[id].tsx" ]; then
    # Add imports after the existing imports
    sed -i '' '/import TypingIndicator/a\
import ArgumentStrengthMeter from '"'"'../../components/ArgumentStrengthMeter'"'"'\
import FactCheckIndicator from '"'"'../../components/FactCheckIndicator'"'"'
' "pages/debate/[id].tsx" 2>/dev/null || \
    sed -i '/import TypingIndicator/a\
import ArgumentStrengthMeter from "../../components/ArgumentStrengthMeter"\
import FactCheckIndicator from "../../components/FactCheckIndicator"' "pages/debate/[id].tsx"
    
    # Add fields to Turn interface
    sed -i '' '/createdAt: string/a\
  argumentStrength?: number | null\
  strengthBreakdown?: any\
  factClaims?: any
' "pages/debate/[id].tsx" 2>/dev/null || \
    sed -i '/createdAt: string/a\
  argumentStrength?: number | null\
  strengthBreakdown?: any\
  factClaims?: any' "pages/debate/[id].tsx"
fi

echo "✓ Added component imports"

echo ""
echo "4. Creating a script to add the components to the turn display..."
cat > add_components_to_turns.sh << 'SCRIPT_EOF'
#!/bin/bash

# Find the line with turn.message and add the components after it
awk '
/{turn.message}/ {
    print
    print "                        "
    print "                        {/* Argument Strength Meter */}"
    print "                        {turn.argumentStrength && turn.strengthBreakdown && ("
    print "                          <ArgumentStrengthMeter"
    print "                            strength={turn.argumentStrength}"
    print "                            breakdown={turn.strengthBreakdown}"
    print "                            turnId={turn.id}"
    print "                          />"
    print "                        )}"
    print "                        "
    print "                        {/* Fact Check Indicator */}"
    print "                        {turn.factClaims && turn.factClaims.length > 0 && ("
    print "                          <FactCheckIndicator"
    print "                            claims={turn.factClaims}"
    print "                            turnId={turn.id}"
    print "                          />"
    print "                        )}"
    next
}
{ print }
' pages/debate/\[id\].tsx > pages/debate/\[id\].tsx.with_components

mv pages/debate/\[id\].tsx.with_components pages/debate/\[id\].tsx
SCRIPT_EOF

chmod +x add_components_to_turns.sh
./add_components_to_turns.sh
rm add_components_to_turns.sh

echo ""
echo "✅ Components added to debate page!"
echo ""
echo "5. Adding animation styles to globals.css..."
if ! grep -q "animate-shimmer" styles/globals.css; then
    cat >> styles/globals.css << 'CSS_EOF'

/* Animation for ArgumentStrengthMeter */
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}

/* Fade in animation */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
CSS_EOF
    echo "✓ Added animations to globals.css"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "The debate page will now show:"
echo "- Argument strength meters with detailed breakdown"
echo "- Fact check indicators for claims that need verification"
echo ""
echo "Note: The enhanced service uses heuristics for now. In production,"
echo "you could integrate GPT-4 or Claude for better analysis."
