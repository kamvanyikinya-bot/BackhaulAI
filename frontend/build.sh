#!/bin/bash
cd /home/team/shared/frontend
echo "=== START BUILD ==="
npx vite build 2>&1
echo "=== BUILD EXIT CODE: $? ==="