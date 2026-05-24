@echo off
git add -A
git commit -m "fix: robust cloud profile sync - handle missing profiles, add logging, persist onboarding state"
git push origin main
