// eslint-disable-next-line import/no-extraneous-dependencies
import { beforeEach, describe, vi } from "vitest";
import { DragEvent } from "react";
import { TreeConfig, TreeInstance } from "../types/core";
import { createTree } from "../core/create-tree";
import { TestTreeDo } from "./test-tree-do";
import { TestTreeExpect } from "./test-tree-expect";
import { syncDataLoaderFeature } from "../features/sync-data-loader/feature";
import { asyncDataLoaderFeature } from "../features/async-data-loader/feature";
import { buildProxiedInstance } from "../core/build-proxified-instance";

vi.useFakeTimers({ shouldAdvanceTime: true });

export class TestTree<T = string> {
  public readonly do = new TestTreeDo(this);

  public readonly expect = new TestTreeExpect(this);

  private treeInstance: TreeInstance<T> | null = null;

  private static asyncLoaderResolvers: (() => void)[] = [];

  suits = {
    sync: () => ({
      tree: this.withFeatures(syncDataLoaderFeature),
      title: "Synchronous Data Loader",
    }),
    async: () => ({
      tree: this.withFeatures(asyncDataLoaderFeature),
      title: "Asynchronous Data Loader",
    }),
    proxifiedSync: () => ({
      tree: this.withFeatures(syncDataLoaderFeature).with({
        instanceBuilder: buildProxiedInstance,
      }),
      title: "Proxified Synchronous Data Loader",
    }),
    proxifiedAsync: () => ({
      tree: this.withFeatures(asyncDataLoaderFeature).with({
        instanceBuilder: buildProxiedInstance,
      }),
      title: "Proxified Asynchronous Data Loader",
    }),
  };

  forSuits(runSuite: (tree: TestTree<T>) => void) {
    describe.for([
      this.suits.sync(),
      this.suits.async(),
      this.suits.proxifiedSync(),
      this.suits.proxifiedAsync(),
    ])("$title", ({ tree }) => {
      tree.resetBeforeEach();
      runSuite(tree);
    });
  }

  get instance() {
    if (!this.treeInstance) {
      this.treeInstance = createTree(this.config);
    }
    return this.treeInstance;
  }

  private constructor(private config: TreeConfig<T>) {}

  static async resolveAsyncLoaders() {
    while (TestTree.asyncLoaderResolvers.length) {
      TestTree.asyncLoaderResolvers.shift()?.();
      await new Promise<void>((r) => {
        setTimeout(r);
      });
    }
  }

  async resolveAsyncVisibleItems() {
    this.instance.getItems();
    await TestTree.resolveAsyncLoaders();
    this.instance.getItems().forEach((i) => i.getItemName());
    await TestTree.resolveAsyncLoaders();
  }

  static default(config: Partial<TreeConfig<string>>) {
    return new TestTree({
      rootItemId: "x",
      createLoadingItemData: () => "loading",
      dataLoader: {
        getItem: (id) => id,
        getChildren: (id) => [`${id}1`, `${id}2`, `${id}3`, `${id}4`],
      },
      asyncDataLoader: {
        getItem: async (id) => {
          await new Promise<void>((r) => {
            (r as any).debugName = `Loading getItem ${id}`;
            TestTree.asyncLoaderResolvers.push(r);
          });
          return id;
        },
        getChildren: async (id) => {
          await new Promise<void>((r) => {
            (r as any).debugName = `Loading getChildren ${id}`;
            TestTree.asyncLoaderResolvers.push(r);
          });
          return [`${id}1`, `${id}2`, `${id}3`, `${id}4`];
        },
      },
      getItemName: (item) => item.getItemData(),
      indent: 20,
      isItemFolder: (item) => item.getItemMeta().level < 2,
      initialState: {
        expandedItems: ["x1", "x11"],
      },
      features: [],
      ...config,
    });
  }

  with(config: Partial<TreeConfig<T>>) {
    return new TestTree({ ...this.config, ...config });
  }

  resetBeforeEach() {
    beforeEach(async () => {
      this.reset();
      vi.clearAllMocks();
      // trigger instance creation
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      this.instance;
      await this.resolveAsyncVisibleItems();
    });
  }

  async createDebugTree() {
    this.reset();
    vi.clearAllMocks();
    await this.resolveAsyncVisibleItems();
    return this;
  }

  withFeatures(...features: any) {
    return this.with({
      features: [...(this.config.features ?? []), ...features],
    });
  }

  mockedHandler(handlerName: keyof TreeConfig<T>) {
    const mock = vi.fn();
    if (this.treeInstance) {
      this.treeInstance?.setConfig((prev) => ({
        ...prev,
        [handlerName as any]: mock,
      }));
    } else {
      (this.config as any)[handlerName as any] = mock;
    }
    return mock;
  }

  item(itemId: string) {
    return this.instance.getItemInstance(itemId);
  }

  reset() {
    this.treeInstance = null;
    TestTree.asyncLoaderResolvers = [];
  }

  debug() {
    console.log(
      this.instance
        .getItems()
        .map((item) =>
          [
            "  ".repeat(item.getItemMeta().level),
            '"',
            item.getItemName(),
            '"',
          ].join(""),
        )
        .join("\n"),
    );
  }

  setElementBoundingBox(
    itemId: string,
    bb: Partial<DOMRect> = {
      left: 0,
      right: 100,
      top: 0,
      height: 20,
    },
  ) {
    this.instance.getItemInstance(itemId).registerElement({
      getBoundingClientRect: () => bb as DOMRect,
    } as HTMLElement);
  }

  static dragEvent(pageX = 1000, pageY = 0) {
    return {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      dataTransfer: {
        setData: vi.fn(),
        getData: vi.fn(),
        dropEffect: "unchaged-from-test",
      },
      pageX,
      pageY,
    } as unknown as DragEvent;
  }

  createTopDragEvent(indent = 0) {
    return TestTree.dragEvent(indent * 20, 1);
  }

  createBottomDragEvent(indent = 0) {
    return TestTree.dragEvent(indent * 20, 19);
  }
}
