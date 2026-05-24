@echo off
del .git\index.lock 2>nul
git add -A
git commit -m "fix: use UUID for task IDs, fix cloud persistence for tasks and XP"
git push origin main
echo DONE
pause
