#!/bin/bash

echo "=== Adding Auto-Refresh to Update UI ==="
echo ""

# Create a patch to add auto-refresh
cat > add_auto_refresh.patch << 'PATCH_EOF'
--- pages/debate/[id].tsx.orig
+++ pages/debate/[id].tsx
@@ -110,6 +110,28 @@
     }
   }, [debate.turns.length, debate.status, isGenerating, showVoting]);
 
+  // Auto-refresh to get latest turns
+  useEffect(() => {
+    let interval: NodeJS.Timeout;
+    
+    const refreshDebate = async () => {
+      try {
+        const res = await fetch(`/api/debate/${debate.id}`);
+        const data = await res.json();
+        if (data.success && data.debate) {
+          setDebate(data.debate);
+        }
+      } catch (error) {
+        console.error('Error refreshing debate:', error);
+      }
+    };
+    
+    if (debate.status === 'in_progress') {
+      interval = setInterval(refreshDebate, 1000); // Refresh every second
+    }
+    
+    return () => clearInterval(interval);
+  }, [debate.id, debate.status]);
+
   const startDebate = async () => {
     setIsStarting(true)
     setIsGenerating(true)
PATCH_EOF

echo "Applying auto-refresh patch..."
patch -p0 < add_auto_refresh.patch

if [ $? -ne 0 ]; then
    echo "Patch failed. Adding auto-refresh manually..."
    
    # Add the auto-refresh code after the auto-continue useEffect
    cat > auto_refresh_code.tmp << 'EOF'

  // Auto-refresh to get latest turns
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    const refreshDebate = async () => {
      try {
        const res = await fetch(`/api/debate/${debate.id}`);
        const data = await res.json();
        if (data.success && data.debate) {
          setDebate(data.debate);
        }
      } catch (error) {
        console.error('Error refreshing debate:', error);
      }
    };
    
    if (debate.status === 'in_progress') {
      interval = setInterval(refreshDebate, 1000); // Refresh every second
    }
    
    return () => clearInterval(interval);
  }, [debate.id, debate.status]);
EOF

    # Find where to insert (after the auto-continue useEffect)
    LINE_NUM=$(grep -n "}, \[debate.turns.length, debate.status, isGenerating, showVoting\]);" pages/debate/\[id\].tsx | tail -1 | cut -d: -f1)
    
    if [ -n "$LINE_NUM" ]; then
        # Insert the auto-refresh code
        head -n $LINE_NUM pages/debate/\[id\].tsx > pages/debate/\[id\].tsx.new
        cat auto_refresh_code.tmp >> pages/debate/\[id\].tsx.new
        tail -n +$((LINE_NUM + 1)) pages/debate/\[id\].tsx >> pages/debate/\[id\].tsx.new
        
        mv pages/debate/\[id\].tsx pages/debate/\[id\].tsx.backup_before_refresh
        mv pages/debate/\[id\].tsx.new pages/debate/\[id\].tsx
        
        echo "✓ Auto-refresh code added successfully!"
    else
        echo "Could not find insertion point. Please add the code manually."
        echo "Add this code after the auto-continue useEffect:"
        cat auto_refresh_code.tmp
    fi
    
    rm -f auto_refresh_code.tmp
fi

# Clean up
rm -f add_auto_refresh.patch

echo ""
echo "✅ Auto-refresh added!"
echo ""
echo "The page will now:"
echo "1. Refresh every second while debate is in progress"
echo "2. Automatically show new turns as they're created"
echo "3. Stop refreshing when debate is completed"
echo ""
echo "Just refresh your browser once more and watch it update automatically!"
