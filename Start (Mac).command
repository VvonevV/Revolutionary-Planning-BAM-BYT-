#!/bin/bash
# Double-click to run Site Memory locally at http://localhost:3000
cd "$(dirname "$0")"
( sleep 1.5; open "http://localhost:3000" ) &
if command -v npx >/dev/null 2>&1; then
  npx --yes serve@14 . -l 3000
else
  python3 -m http.server 3000
fi
