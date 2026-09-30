#!/bin/bash
# Double-click to push this folder to GitHub. GitHub Pages then publishes it automatically.
# First time only: create an EMPTY public repo on github.com, then paste its URL when asked.
cd "$(dirname "$0")"
if [ ! -d .git ]; then
  git init -b main
fi
git add .
git commit -m "Update RP prototype" || echo "Nothing new to commit."
if ! git remote get-url origin >/dev/null 2>&1; then
  read -p "Paste your GitHub repo URL (e.g. https://github.com/you/rp-prototype.git): " URL
  git remote add origin "$URL"
fi
git push -u origin main --tags
echo ""
echo "Done. First time: on GitHub open Settings > Pages > Source = GitHub Actions."
echo "Your site will be at https://<your-username>.github.io/<repo-name>/"
read -p "Press Enter to close."
