#!/usr/bin/env zx

import 'zx/globals';

// ------ CHANGELOG COPYING ------
const copyChangelog = async (pkg) => {
    const contents = await fs.readFile(path.join(__dirname, `../packages/${pkg}/CHANGELOG.md`));
    const prefix = [
        '---',
        `slug: "/changelog/${pkg}"`,
        `title: "${pkg}"`,
        'category: changelog',
        '---\n\n',
    ].join("\n");
    await fs.writeFile(path.join(__dirname, `../packages/docs/docs/6-changelog/${pkg}.md`), prefix + contents);
}

await copyChangelog('core');
await copyChangelog('react');
await fs.copy(
    path.join(__dirname, `../CONTRIBUTING.md`),
    path.join(__dirname, `../packages/docs/docs/5-contributing/1-overview.mdx`)
);


// ------ EXAMPLES REDUNDANT FILES COPYING ------
const samples = await glob('./examples/*/package.json');
let samplesList = "";

for (const sample of samples) {
    const pkg = await fs.readJSON(sample);
    const sampleName = /\.\/examples\/(.*)\/package.json/.exec(sample)[1];
    await fs.copy(
        path.join(__dirname, "../packages/sb-react/.storybook/style.css"),
        path.join(__dirname, "../examples", sampleName, "src/style.css")
    );
    await fs.copy(
        path.join(__dirname, "examples-data-template.ts.tpl"),
        path.join(__dirname, "../examples", sampleName, "src/data.ts")
    );

    // embed=1&theme=dark&
    const stackblitz = `https://stackblitz.com/github/lukasbach/headless-tree/tree/main/examples/${sampleName}?preset=node&file=src/main.tsx`;
    const codesandbox = `https://codesandbox.io/p/devbox/github/lukasbach/headless-tree/tree/main/examples/${sampleName}?file=src/main.tsx`;
    const github = `https://github.com/lukasbach/headless-tree/tree/main/examples/${sampleName}`;
    samplesList += `- ${pkg.description}: [Stackblitz](${stackblitz}), [CodeSandbox](${codesandbox}), [GitHub](${github})\n`;
    await fs.writeFile(
        path.join(__dirname, `../examples/${sampleName}/readme.MD`),
        `# ${pkg.description}\n\nTo run this example:\n\n- \`npm install\` to install dependencies\n- \`npm start\` to start the dev server\n\n`
        + `You can run this sample from [Stackblitz](${stackblitz}) or [CodeSandbox](${codesandbox}). The source code is available on [GitHub](${github}).\n\n`,
        { encoding: "utf8" }
    );
}

await fs.writeFile(
    path.join(__dirname, "../packages/docs/docs/0-root/examples.mdx"),
    `---\nslug: "/examples"\ntitle: "Sandboxes"\ncategory: intro\ntemplate: page\nsidebar_position: 1\n---\n` +
    `# Example Sandboxes\n\nThis is a collection of example integrations for the Headless Tree library. You can ` +
    `use them as basis to quickly scaffold an app with Headless Tree, get started with experimenting with the ` +
    `capabilities of HT or to create minimalistic bug-reproductions for issue reports.\n\n${samplesList}\n\n`
);