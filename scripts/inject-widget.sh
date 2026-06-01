#!/usr/bin/env bash
# Post-build: inject LLM Chat Widget into exported web build
set -euo pipefail

DIST="${1:-dist}"
WIDGET_SRC="public/widget"

if [ ! -d "$DIST" ]; then
  echo "❌ $DIST does not exist. Run 'npx expo export --platform web --output-dir $DIST' first."
  exit 1
fi

if [ ! -f "$WIDGET_SRC/chat-widget.js" ]; then
  echo "❌ $WIDGET_SRC/chat-widget.js not found."
  exit 1
fi

echo "📦 Injecting LLM Chat Widget into $DIST..."

# Copy widget files into dist
mkdir -p "$DIST/widget"
cp "$WIDGET_SRC/chat-widget.js" "$DIST/widget/"
cp "$WIDGET_SRC/chat-widget.css" "$DIST/widget/" 2>/dev/null || true

# Inject script tag + init call before closing </body>
INDEX="$DIST/index.html"

WIDGET_INIT=$(cat <<'INIT'
  <!-- LLM Chat Widget -->
  <script src="/widget/chat-widget.js"></script>
  <script>
    // Defer widget init until React app is mounted (chat widget overlays on top)
    window.__LLMChatConfig = {
      endpoint: 'https://api.deepseek.com/v1/chat/completions',
      apiKey: '__DEEPSEEK_API_KEY__',
      model: 'deepseek-chat',
      title: 'Turbo Assistant',
      welcomeMessage: 'Hey! 👋 I\'m your Turbo Learning assistant. Ask me anything about the AI Operator course.',
      systemPrompt: 'You are the Turbo Learning assistant for the AI Operator course — a 28-day program that teaches people how to go from AI user to AI operator. You help students with course questions, explain AI concepts, and encourage them to keep learning. Be helpful, concise, and motivating.',
      theme: 'light',
      position: 'bottom-right',
    };
    // Init after a short delay to let React render first
    setTimeout(function() {
      LLMChatWidget.init(window.__LLMChatConfig);
    }, 2000);
  </script>
</body>
INIT
)

# Replace </body> with widget init + </body>
sed -i "s|</body>|${WIDGET_INIT//$'\n'/\\n}|g" "$INDEX"

# Detect the actual JS bundle filename and inject widget init there too as backup
BUNDLE=$(ls "$DIST"/_expo/static/js/web/index-*.js 2>/dev/null | head -1)
if [ -n "$BUNDLE" ]; then
  BUNDLE_NAME=$(basename "$BUNDLE")
  echo "  Bundle: $BUNDLE_NAME"
fi

echo "✅ Widget injected into $INDEX"
echo ""
echo "⚠️  Replace __DEEPSEEK_API_KEY__ in $INDEX with the real key before serving!"
echo "   Or use: sed -i 's/__DEEPSEEK_API_KEY__/sk-real-key-here/' $INDEX"
