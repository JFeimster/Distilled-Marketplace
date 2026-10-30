@echo off
setlocal
pwsh -NoProfile -ExecutionPolicy Bypass -File "%~dp0SETUP-DISTILLED-MARKETPLACE.ps1"
if errorlevel 1 (
  echo.
  echo Setup did not complete. Review the error above.
  pause
  exit /b 1
)
echo.
echo Marketplace setup finished.
pause
