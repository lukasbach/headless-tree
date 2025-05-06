#!/usr/bin/env zx

import "zx/globals";
import fm from "front-matter";

const prefix = "https://headless-tree.lukasbach.com/llm";
const { entries: sb } = await fs.readJSON(path.join(__dirname, `../packages/sb-react/storybook-static/index.json`));
const files = await glob([`./packages/docs/docs/**/*.mdx`, `./packages/docs/docs/**/*.md`]);
const slugs = [];

let entrySmall = "# Headless Tree Documentation\n\n";
let entryFull = `${entrySmall}`;

const consumeMdx = async (file) => {
    const content = await fs.readFile(file, { encoding: "utf8" });
    const { attributes, body } = fm(content);
    if (!attributes?.slug) return;

    const bodyWithFixedLinks = body.replace(/\[(.*?)\]\((.*?)\)/g, (match, p1, p2) => {
        if (p2.startsWith("http")) return match;
        const matchedSlug = slugs.find(slug => p2 === slug || p2.startsWith(`${slug}#`));
        if (matchedSlug) {
            return `[${p1}](${prefix}${matchedSlug}.md)`;
        }
        return p1;
    });

    // fix <DemoBox stories={["abc"]} /> to ```abc```
    const bodyWithFixedDemoBox = bodyWithFixedLinks.replace(/<DemoBox (.*?) \/>/g, (match, p1) => {
        const story = /initialStory="([^"]*)"/.exec(p1)?.[1] ?? /stories=\{\["([^"]*)"/.exec(p1)?.[1];
        const file = sb[story]?.importPath;
        if (!file) return "";
        const code = fs.readFileSync(path.join(__dirname, "../packages/sb-react", file), { encoding: "utf8" });
        return `\`\`\`ts jsx\n${code}\`\`\``;
    });

    await fs.ensureDir(path.dirname(path.join(__dirname, "../packages/docs/static/llm", `${attributes.slug}.md`)));
    await fs.writeFile(path.join(__dirname, "../packages/docs/static/llm", `${attributes.slug}.md`), bodyWithFixedDemoBox, { encoding: "utf8" });

    entryFull += `\n---\n<!-- ${attributes.slug } -->\n# ${attributes.title}\n\n${bodyWithFixedDemoBox}\n`;
    entrySmall += `\n- [${attributes.title}](${prefix}${attributes.slug}.md)${attributes.subtitle ? ": " : ""}${attributes.subtitle ?? ""}`;
}

for (const file of files) {
    const content = await fs.readFile(file, { encoding: "utf8" });
    const { attributes } = fm(content);
    if (attributes?.slug) slugs.push(attributes.slug);
}


for (const file of files) {
    await consumeMdx(file);
}
await fs.writeFile(path.join(__dirname, "../packages/docs/static/llms.txt"), entrySmall, { encoding: "utf8" });
await fs.writeFile(path.join(__dirname, "../packages/docs/static/llm.txt"), entrySmall, { encoding: "utf8" });
await fs.writeFile(path.join(__dirname, "../packages/docs/static/llm-full.txt"), entryFull, { encoding: "utf8" });
await fs.writeFile(path.join(__dirname, "../packages/docs/static/llms-full.txt"), entryFull, { encoding: "utf8" });
