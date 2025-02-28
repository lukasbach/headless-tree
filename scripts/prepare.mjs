#!/usr/bin/env zx

import 'zx/globals';

const copyChangelog = async (pkg) => {
    const contents = await fs.readFile(path.join(__dirname, `../packages/${pkg}/CHANGELOG.md`));
    const prefix = [
        '---',
        `slug: "/changelog/${pkg}"`,
        `title: "${pkg}"`,
        'category: changelog',
        '---\n\n',
    ].join("\n");
    await fs.writeFile(path.join(__dirname, `../packages/docs/docs/changelog/${pkg}.md`), prefix + contents);
}

await copyChangelog('core');
await copyChangelog('react');
await fs.copy(
    path.join(__dirname, `../CONTRIBUTING.md`),
    path.join(__dirname, `../packages/docs/docs/contributing/1-overview.mdx`)
);