![Headless Tree](https://github.com/lukasbach/headless-tree/raw/main/packages/docs/static/img/banner-github.png)

[![Documentation](https://img.shields.io/badge/docs-1e1f22?style=flat)](https://headless-tree.lukasbach.com/)
[![Chat on Discord](https://img.shields.io/badge/discord-4c57d9?style=flat&logo=discord&logoColor=ffffff)](https://discord.gg/KuZ6EezzVw)
[![Follow on BLuesky](https://img.shields.io/badge/bluesky-0285FF?style=flat&logo=bluesky&logoColor=ffffff)](https://bsky.app/profile/lukasbach.bsky.social)
[![Support on Github Sponsors](https://img.shields.io/badge/sponsor-EA4AAA?style=flat&logo=githubsponsors&logoColor=ffffff)](https://github.com/sponsors/lukasbach)
[![Follow on Github](https://img.shields.io/badge/follow-181717?style=flat&logo=github&logoColor=ffffff)](https://github.com/lukasbach)
[![NPM Core package](https://img.shields.io/badge/core-CB3837?style=flat&logo=npm&logoColor=ffffff)](https://www.npmjs.com/package/@headless-tree/core)
[![NPM React package](https://img.shields.io/badge/react-CB3837?style=flat&logo=npm&logoColor=ffffff)](https://www.npmjs.com/package/@headless-tree/react)


Super-easy integration of complex tree components into React. Supports ordered 
and unordered drag-and-drop, extensive keybindings, search, renaming and more.
Fully customizable and accessible. Headless Tree is the official successor for
[react-complex-tree](https://github.com/lukasbach/react-complex-tree).

It aims to bring the many features of complex tree views, like multi-select,
drag-and-drop, keyboard navigation, tree search, renaming and more, while
being unopinionated about the styling and rendering of the tree itself.
Accessibility is ensured by default, and the integration is extremely
simple and flexible. 

The interface gives you a flat list of tree nodes
that you can easily render yourself, which keeps the complexity of the
code low and allows you to customize the tree to your needs. This flat
structure also allows you to virtualize the tree with any virtualization
library you want. The library automatically provides the necessary
aria tags to emulate a nested tree structure, so that accessibility
requirements are met despite the flat structure.

Dive into [the Get Started page](https://headless-tree.lukasbach.com/getstarted)
to find out how to use Headless Tree, or have a look at
[the samples on the Headless Tree Homepage](https://headless-tree.lukasbach.com/#demogrid)
to get an idea of what you can do with it.

> [!TIP]  
> Headless Tree is now available as Beta! The library is mostly stable and
> production ready, and will be generally released within two months, once
> I have collected feedback and fixed any bugs that might arise. I've written
> [a blog post](https://medium.com/@lukasbach/headless-tree-and-the-future-of-react-complex-tree-fc920700e82a)
> about the details of the change, and the future of the library.
> 
> Join
> [the Discord](https://discord.gg/KuZ6EezzVw) to get involved, and
> [follow on Bluesky](https://bsky.app/profile/lukasbach.bsky.social) to
> stay up to date.

## Features

- [Simple Interface](https://headless-tree.lukasbach.com/?demo=0#demogrid): Easy integration in React with full customizability of DOM
- [Drag and Drop](https://headless-tree.lukasbach.com/?demo=1#demogrid): Powerful ordered drag-and-drop, that can interact with external drag events
- [Scalable](https://headless-tree.lukasbach.com/?demo=2#demogrid): Headless Tree remains performant even with large trees
- [Virtualization Support](https://headless-tree.lukasbach.com/?demo=3#demogrid): Compatible with common virtualization library to support 100k+ items
- [Hotkeys!](https://headless-tree.lukasbach.com/?demo=4#demogrid): Lots of hotkeys, fully customizable
- [Search Support](https://headless-tree.lukasbach.com/?demo=5#demogrid): Typeahead anywhere in the tree to quickly search the entire tree
- [Rename items](https://headless-tree.lukasbach.com/?demo=6#demogrid): Optionally allow users to rename items inside the tree
- [Manage State](https://headless-tree.lukasbach.com/?demo=7#demogrid): Let Headless Tree manage tree state internally, or manage any part of it yourself
- [Customize Behavior](https://headless-tree.lukasbach.com/?demo=8#demogrid): Easily overwrite internal behavior like requiring double clicks on items to expand
- [Customize Logic](https://headless-tree.lukasbach.com/?demo=9#demogrid): Overwrite or expand any internal behavior of Headless Tree
- [Async Data Support](https://headless-tree.lukasbach.com/?demo=10#demogrid): Use synchronous or asynchronous data sources for your tree. Headless Tree comes with optional caching for async data
- Free of dependencies
- Or check out [this comprehensive playground](https://headless-tree.lukasbach.com/?demo=11#demogrid) that has most of the capabilities enabled.

## Bundle Size

Headless Tree exports individual features in a tree-shaking-friendly
way, allowing you to only include what you need to keep your bundle size
small. Listed bundle sizes are based on min+gzipped bundles, and are
based on the Bundlephobia report as of Headless Tree v0.0.15.

| Feature                | Bundle Size |
|------------------------|-------------|
| Tree Core              | 3.1kB       |
| Sync Data Loader       | 0.8kB       |
| Async Data Loader      | 1.4kB       |
| Selections             | 1.1kB       |
| Drag and Drop          | 2.8kB       |
| Keyboard Drag and Drop | 2.7kB       |
| Hotkeys                | 0.8kB       |
| Tree Search            | 1.3kB       |
| Renaming               | 0.9kB       |
| Expand All             | 0.7kB       |
| React Bindings         | 0.4kB       |

Total bundle size is 9.5kB plus 0.4kB for the React bindings. Note that
the sum of features is bigger than the total bundle size, because several
features share code. Tree-shaking will ensure that the minimum amount of
code is included in your bundle.

## Get Started

> [!TIP]  
> You can find a comprehensive [get-started guide](https://headless-tree.lukasbach.com/getstarted)
> on the documentation homepage. The following gives a brief overview.

Install Headless Tree via npm:

```bash
npm install @headless-tree/core @headless-tree/react
```

In your react component, call the `useTree` hook from `@headless-tree/react` with the configuration of
your tree:

```tsx
import {
  hotkeysCoreFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";

const tree = useTree<string>({
  initialState: { expandedItems: ["folder-1"] },
  rootItemId: "folder",
  getItemName: (item) => item.getItemData(),
  isItemFolder: (item) => !item.getItemData().endsWith("item"),
  dataLoader: {
    getItem: (itemId) => itemId,
    getChildren: (itemId) => [
      `${itemId}-folder`,
      `${itemId}-1-item`,
      `${itemId}-2-item`,
    ],
  },
  indent: 20,
  features: [syncDataLoaderFeature, selectionFeature, hotkeysCoreFeature],
});
```

Then, render your tree based on the tree instance returned from the hook:

```tsx
<div {...tree.getContainerProps()} className="tree">
  {tree.getItems().map((item) => (
    <button
      {...item.getProps()}
      key={item.getId()}
      style={{ paddingLeft: `${item.getItemMeta().level * 20}px` }}
    >
      <div
        className={cn("treeitem", {
          focused: item.isFocused(),
          expanded: item.isExpanded(),
          selected: item.isSelected(),
          folder: item.isFolder(),
        })}
      >
        {item.getItemName()}
      </div>
    </button>
  ))}
</div>
```

Read on in the [get started guide](https://headless-tree.lukasbach.com/getstarted) to learn more about
how to use Headless Tree, and how to customize it to your needs.