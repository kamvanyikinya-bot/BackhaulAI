#!/bin/bash
cd /home/team/shared/frontend
npx --yes vercel --prod --token "$VERCEL_TOKEN" --yes 2>&1 | tee /tmp/vercel-result.txt
echo "DONE" >> /tmp/vercel-result.txt
date >> /tmp/vercel-result.txt