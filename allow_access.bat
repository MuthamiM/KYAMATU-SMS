@echo off
:: Batch script to allow Kyamatu SMS through firewall
:: Checks for admin privileges and requests them if needed

>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"

if '%errorlevel%' NEQ '0' (
    echo Requesting administrative privileges...
    goto UACPrompt
) else ( goto gotAdmin )

:UACPrompt
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
    echo UAC.ShellExecute "%~s0", "", "", "runas", 1 >> "%temp%\getadmin.vbs"
    "%temp%\getadmin.vbs"
    exit /B

:gotAdmin
    if exist "%temp%\getadmin.vbs" ( del "%temp%\getadmin.vbs" )
    pushd "%CD%"
    CD /D "%~dp0"

echo Adding Firewall Rules for Kyamatu SMS...
echo.

powershell -Command "New-NetFirewallRule -DisplayName 'React Frontend' -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow"
powershell -Command "New-NetFirewallRule -DisplayName 'Node Backend' -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow"

echo.
echo Rules added! 
echo.
echo Please try connecting from your tablet now.
pause
