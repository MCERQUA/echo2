@echo off
echo Updating ECHO2 structure for Echo1...
powershell -ExecutionPolicy Bypass -File update-structure.ps1
echo.
echo Structure updated! Please review project-structure.md
echo and commit it to the repository for Echo1.
echo.
pause