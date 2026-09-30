#!/bin/bash
# Double-click to push this folder to GitHub. GitHub Pages then publishes it automatically.
# First time only: create an EMPTY public repo on github.com, then paste its URL when asked.
cd "$(dirname "$0")"
if [ ! -d .git ]; then
  git init -b main
  git add .
  git commit -m "Site Memory prototype v5"
  read -p "Paste your GitHub repo URL (e.g. https://github.com/you/site-memory.git): " URL
  git remote add origin "$URL"
else
  git add .
  git commit -m "Update Site Memory prototype" || echo "Nothing new to commit."
fi
git push -u origin main
echo ""
echo "Done. First time: on GitHub open Settings > Pages > Source = GitHub Actions."
echo "Your site will be at https://<your-username>.github.io/<repo-name>/"
read -p "Press Enter to close."
