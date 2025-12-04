---
"@headless-tree/react": patch
"@headless-tree/core": patch
---

Setup trusted publishing in NPM. Package deploys now don't work with a deploy token, but instead with a Trusted Publishing that directly connects the NPM package to Github Actions, allowing only deploys from the official pipeline and reducing the likelyhood of malicious deployments.
