#!/bin/zsh
set -eu
cd "${0:A:h}/.."
# Prefer the project Node version without embedding a developer machine path.
if [[ -s "${NVM_DIR:-$HOME/.nvm}/nvm.sh" ]]; then
  source "${NVM_DIR:-$HOME/.nvm}/nvm.sh"
  nvm use
fi
command -v node >/dev/null || { print 'Install the Node version in .nvmrc first.'; exit 1; }
npm run cms:watch-stop
npm run cms:start
npm run dev -- --background --host 127.0.0.1
printf '\nCMS: http://127.0.0.1:8055/admin\nWebsite: http://localhost:4321\nLogin details: local-cms/LOGIN.txt\nKeep this window open to sync saved edits. Ctrl+C stops syncing.\n\n'
npm run cms:watch
