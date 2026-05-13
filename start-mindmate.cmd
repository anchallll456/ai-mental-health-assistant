@echo off
cd /d "%~dp0backend"
set PORT=5000
set MONGODB_URI=
"C:\Program Files\nodejs\node.exe" server.js
pause
