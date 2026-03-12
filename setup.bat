@echo off
echo ===============================================
echo Instagram DM Commerce SaaS - Setup Script
echo ===============================================
echo.

echo Step 1: Installing Backend Dependencies...
cd backend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error: Backend installation failed
    exit /b 1
)
echo Backend dependencies installed successfully!
echo.

echo Step 2: Installing Frontend Dependencies...
cd ..\frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error: Frontend installation failed
    exit /b 1
)
echo Frontend dependencies installed successfully!
echo.

cd ..

echo Step 3: Setting up environment files...

if not exist "backend\.env" (
    copy "backend\.env.example" "backend\.env"
    echo Created backend\.env from template
) else (
    echo backend\.env already exists, skipping...
)

if not exist "frontend\.env" (
    copy "frontend\.env.example" "frontend\.env"
    echo Created frontend\.env from template
) else (
    echo frontend\.env already exists, skipping...
)

echo.
echo ===============================================
echo Setup Complete!
echo ===============================================
echo.
echo Next Steps:
echo 1. Edit backend\.env with your configuration
echo 2. Make sure MongoDB and Redis are running
echo 3. Run 'npm run dev' in backend directory
echo 4. Run 'npm run worker' in backend directory (new terminal)
echo 5. Run 'npm run dev' in frontend directory (new terminal)
echo.
echo See QUICKSTART.md for detailed instructions
echo ===============================================
pause
