@echo off
echo.
echo ========================================================
echo   🚀 LAUNCHING UNIFIED MHD PROJECT SUITE 🚀
echo ========================================================
echo.

:: Launch Portfolio
echo [1/2] Starting Portfolio Site...
start "MHD-Portfolio" /d "portfolio" npm start

:: Launch E-commerce Suite (Backend + Frontend)
echo [2/2] Starting E-commerce Engine (Backend + Frontend)...
start "MHD-Commerce" /d "ecommerce" npm run dev

echo.
echo --------------------------------------------------------
echo ✅ All systems are launching in separate windows!
echo --------------------------------------------------------
pause
