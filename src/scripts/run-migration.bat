@echo off
echo Running expenditure category migration script...
echo.

rem Check if dotenv is installed
call npm list dotenv >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing dotenv...
    call npm install dotenv
)

rem Run the migration script
node src/scripts/run-expenditure-category-migration.js

echo.
echo Migration script completed.
pause
