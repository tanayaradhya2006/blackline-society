@echo off
cd /d "%~dp0"
title Blackline Society - keep this window open
if not exist node_modules (
  echo Installing packages, this can take a few minutes...
  call npm install
)
echo Starting Blackline Society at http://localhost:3000
echo Keep this window open while you use the site.
call npm run dev
pause
