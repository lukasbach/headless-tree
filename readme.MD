# Headless Tree

> An unopinionated and accessible Tree component for the web.

Headless Tree is the spiritual successor to 
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

Right now, Headless Tree is in a very early stage of development, and
breaking changes are to be expected in minor version bumps. The core
implementation is framework-independent, and React bindings are provided,
but support for other frameworks is planned for the future.

## Bundle Size

Headless Tree exports individual features in a tree-shaking-friendly
way, allowing you to only include what you need to keep your bundle size
small. Listed bundle sizes are based on min+gzipped bundles, and are
based on the Bundlephobia report as of Headless Tree v0.0.5.

| Feature           | Bundle Size |
| ----------------- | ----------- |
| Tree Core         | 3.1kB       |
| Sync Data Loader  | 0.3kB       |
| Async Data Loader | 1.2kB       |
| Selections        | 1.2kB       |
| Drag and Drop     | 1.8kB       |
| Hotkeys           | 0.8kB       |
| Tree Search       | 1.3kB       |
| Renaming          | 1.1kB       |
| Expand All        | 1.0kB       |
| React Bindings    | 0.4kB       |

Total bundle size is 6.5kB plus 0.4kB for the React bindings. Note that
the sum of features is bigger than the total bundle size, because some
features share code. Tree-shaking will ensure that the minimum amount of
code is included in your bundle.
