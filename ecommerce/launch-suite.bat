@echo off
start "Portfolio" /d "..\Portfolio-master\Portfolio" npm start
start "Ecommerce Backend" /d "backend" npm run dev
start "Ecommerce Frontend" /d "frontend" npm run dev
echo "All systems engaged. Portfolio and E-commerce suites are launching..."
pause
