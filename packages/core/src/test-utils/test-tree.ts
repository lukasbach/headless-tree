import { beforeEach, vi } from "vitest";
import { TreeConfig, TreeInstance } from "../types/core";
import { createTree } from "../core/create-tree";
import { TestTreeDo } from "./test-tree-do";
import { TestTreeExpect } from "./test-tree-expect";

export class TestTree<T = string> {
  public readonly do = new TestTreeDo(this);

  public readonly expect = new TestTreeExpect(this);

  private treeInstance: TreeInstance<T> | null = null;

  get instance() {
    if (!this.treeInstance) {
      this.treeInstance = createTree(this.config);
    }
    return this.treeInstance;
  }

  private constructor(private config: TreeConfig<T>) {}

  static default(config: Partial<TreeConfig<string>>) {
    return new TestTree({
      rootItemId: "x",
      dataLoader: {
        getItem: (id) => id,
        getChildren: (id) => [`${id}1`, `${id}2`, `${id}3`, ` ${id}4`],
      },
      getItemName: (item) => item.getItemData(),
      indent: 20,
      isItemFolder: (item) => item.getItemMeta().level < 3, // TODO?
      initialState: {
        expandedItems: ["x1", "x11"],
      },
      features: [],
    });
  }

  withResetBeforeEach() {
    beforeEach(() => {
      this.reset();
    });
    return this;
  }

  withFeatures(...features: any) {
    this.config.features ??= [];
    this.config.features.push(...features);
    return this;
  }

  mockedHandler(handlerName: keyof TreeConfig<T>) {
    this.config[handlerName as any] = vi.fn();
    return this.config[handlerName];
  }

  reset() {
    this.treeInstance = null;
  }
}
