@echo off
echo =======================================================
echo   Deploying ParkEase All-in-One to GitHub
echo   Repository: https://github.com/Avani1904/parkease-live
echo =======================================================
cd /d "%~dp0"
git init
git remote remove origin 2>nul
git remote add origin https://github.com/Avani1904/parkease-live.git
git branch -M main
git add .
git commit -m "Deploy ParkEase all-in-one dynamic system"
git push -u origin main --force
echo.
echo Done! Now open dashboard.render.com and trigger deploy.
pause
