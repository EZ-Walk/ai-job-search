#!/usr/bin/env bash
# Publish this branch as its own GitHub repository (run from a clone of branch ezwalker).
set -euo pipefail

if [[ ! -f package.json ]] || ! grep -q '"name": "ezwalker"' package.json 2>/dev/null; then
  echo "Run this script from the root of the ezwalker branch (portfolio app at repo root)." >&2
  exit 1
fi

REMOTE="${1:-}"
if [[ -z "$REMOTE" ]]; then
  echo "Usage: $0 <new-git-remote-url>" >&2
  echo "Example: $0 git@github.com:EZ-Walk/ezwalker-site.git" >&2
  exit 1
fi

git remote remove origin 2>/dev/null || true
git remote add origin "$REMOTE"
git push -u origin ezwalker:main

echo "Pushed ezwalker branch to main on $REMOTE"
echo "Point Vercel at the new repo and set production branch to main."
