#!/bin/bash
npm run build && \
npx wrangler pages deploy dist --project-name storybox-forms --branch=main && \
echo "✅ Deployed — check the live URL"
