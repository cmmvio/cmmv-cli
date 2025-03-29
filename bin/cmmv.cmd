@echo off
SETLOCAL

IF NOT EXIST "%~dp0..\dist\bin\cmmv.js" (
    echo Error: CMMV CLI not found. Please ensure the package is installed correctly.
    exit /b 1
)

node "%~dp0..\dist\bin\cmmv.js" %*
IF %ERRORLEVEL% NEQ 0 (
    exit /b %ERRORLEVEL%
)

ENDLOCAL