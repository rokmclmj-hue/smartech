@echo off
cd /d "C:\Users\rokmc\smartech"
node --env-file=.env scripts\auto-publish-x-post.mjs
