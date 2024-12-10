@echo off
ECHO ====================================
ECHO ECHO AI Repository Update Script
ECHO ====================================
ECHO.

REM Change to the directory containing this batch file
cd /d "%~dp0"

ECHO Current Directory: %CD%
ECHO.

ECHO Fetching latest changes from GitHub...
git fetch origin
IF %ERRORLEVEL% NEQ 0 (
    ECHO Error: Failed to fetch from repository
    PAUSE
    EXIT /B 1
)

ECHO.
ECHO Checking current branch...
for /f "tokens=* USEBACKQ" %%F in (`git branch --show-current`) do set BRANCH=%%F
ECHO Current branch: %BRANCH%

ECHO.
ECHO Pulling latest changes...
git pull origin %BRANCH%
IF %ERRORLEVEL% NEQ 0 (
    ECHO Error: Failed to pull changes
    PAUSE
    EXIT /B 1
)

ECHO.
ECHO ====================================
ECHO Repository successfully updated!
ECHO ====================================
ECHO.

ECHO Showing latest changes:
git log -1 --pretty=format:"Latest Commit:%%nDate: %%ad%%nAuthor: %%an%%nMessage: %%s" --date=local
ECHO.
ECHO.

PAUSE