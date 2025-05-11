#!/usr/bin/env zx

import "zx/globals";

// to fix https://github.com/changesets/changesets/issues/1011
await $({ cwd: "packages/react" })`npm pkg delete peerDependencies."@headless-tree/core"`;
await $`yarn changeset version`;
await $({ cwd: "packages/react" })`npm pkg set peerDependencies."@headless-tree/core"="*"`;