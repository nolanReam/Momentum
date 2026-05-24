@echo off
git add -A
git commit -m "fix: skip auth step after Google OAuth redirect, go straight to onboarding preferences"
git push origin main
