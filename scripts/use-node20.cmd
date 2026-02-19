@echo off
REM ParkingHub - Run commands with Node 20 (nvm-windows)
REM Usage: scripts\use-node20.cmd npm install
REM        scripts\use-node20.cmd npm run dev

set "NVM_ROOT=%NVM_HOME%"
if "%NVM_ROOT%"=="" set "NVM_ROOT=C:\ProgramData\nvm"

if exist "%NVM_ROOT%\v20.20.0\node.exe" (set "NODE20=%NVM_ROOT%\v20.20.0") else if exist "%NVM_ROOT%\v20.19.5\node.exe" (set "NODE20=%NVM_ROOT%\v20.19.5") else (
  echo No Node 20 found. Run: nvm install 20
  exit /b 1
)

set "PATH=%NODE20%;%PATH%"
%*
