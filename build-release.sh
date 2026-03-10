#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

APP_DIR="release/Spin the Wheel-win32-x64"
ZIP_FILE="release/Spin-the-Wheel-win32-x64.zip"

if ! node -e "const p=require('./package.json'); process.exit(p.scripts && p.scripts['electron:package'] ? 0 : 1)"; then
  echo "Error: npm script 'electron:package' was not found in package.json" >&2
  echo "Add an electron packaging script first, then run this release script again." >&2
  exit 1
fi

echo "Building and packaging app..."
npm run electron:package

if [[ ! -d "$APP_DIR" ]]; then
  echo "Error: expected output folder not found: $APP_DIR" >&2
  exit 1
fi

echo "Creating zip: $ZIP_FILE"
if command -v powershell.exe >/dev/null 2>&1; then
  powershell.exe -NoProfile -Command "\
    \$ErrorActionPreference = 'Stop'; \
    if (Test-Path '$ZIP_FILE') { Remove-Item '$ZIP_FILE' -Force }; \
    Compress-Archive -Path '$APP_DIR' -DestinationPath '$ZIP_FILE' -CompressionLevel Optimal"
elif command -v zip >/dev/null 2>&1; then
  rm -f "$ZIP_FILE"
  zip -r "$ZIP_FILE" "$APP_DIR"
else
  echo "Error: no zip tool found (need powershell.exe or zip)." >&2
  exit 1
fi

echo "Done: $ZIP_FILE"