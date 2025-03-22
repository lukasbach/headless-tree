import { describe, expect, it, vi } from "vitest";
import { TestTree } from "../test-utils/test-tree";
import { buildStaticInstance } from "./build-static-instance";

declare module "../types/core" {
  export interface TreeInstance<T> {
    customHandler: (param1: number, param2: number) => void;
  }
  export interface ItemInstance<T> {
    customHandler: (param1: number, param2: number) => void;
  }
}

const handler1 = vi.fn(({ prev }, ...params) => prev?.(...params));
const handler2 = vi.fn(({ prev }, ...params) => prev?.(...params));

const factory = TestTree.default({});

describe("core-feature/prop-memoization", () => {
  factory.forSuits((tree) => {
    describe("rebuilds item instance", () => {
      it("rebuilds when explicitly invoked", async () => {
        const instanceBuilder = vi.fn().mockImplementation(buildStaticInstance);
        const testTree = await tree
          .with({ instanceBuilder })
          .createTestCaseTree();
        expect(instanceBuilder).toBeCalled();
        instanceBuilder.mockClear();
        testTree.instance.rebuildTree();
        // if tree structure doesnt mutate, only root tree item is rebuilt actually
        expect(instanceBuilder).toBeCalled();
      });

      it("rebuilds when config changes with new expanded items", async () => {
        const instanceBuilder = vi.fn().mockImplementation(buildStaticInstance);
        const testTree = await tree
          .with({ instanceBuilder })
          .createTestCaseTree();
        expect(instanceBuilder).toBeCalled();
        instanceBuilder.mockClear();
        testTree.instance.setConfig((oldCfg) => ({
          ...oldCfg,
          state: {
            expandedItems: ["x4"],
          },
        }));
        expect(instanceBuilder).toBeCalled();
      });
    });

    describe("calls prev in correct order", () => {
      it("tree instance with overwrite marks, order 1", async () => {
        const testTree = await tree
          .withFeatures(
            {
              key: "feature2",
              overwrites: ["feature1"],
              treeInstance: {
                customHandler: handler1,
              },
            },
            {
              key: "feature1",
              treeInstance: {
                customHandler: () => 123,
              },
            },
            {
              key: "feature3",
              overwrites: ["feature2"],
              treeInstance: {
                customHandler: handler2,
              },
            },
          )
          .createTestCaseTree();

        expect(testTree.instance.customHandler(1, 2)).toBe(123);
        expect(handler2).toHaveBeenCalledBefore(handler1);
        expect(handler1).toBeCalledWith(expect.anything(), 1, 2);
        expect(handler2).toBeCalledWith(expect.anything(), 1, 2);
      });

      it("tree instance with overwrite marks, order 2", async () => {
        const testTree = await tree
          .withFeatures(
            {
              key: "feature3",
              overwrites: ["feature2"],
              treeInstance: {
                customHandler: handler2,
              },
            },
            {
              key: "feature2",
              overwrites: ["feature1"],
              treeInstance: {
                customHandler: handler1,
              },
            },
            {
              key: "feature1",
              treeInstance: {
                customHandler: () => 123,
              },
            },
          )
          .createTestCaseTree();

        expect(testTree.instance.customHandler(1, 2)).toBe(123);
        expect(handler2).toHaveBeenCalledBefore(handler1);
        expect(handler1).toBeCalledWith(expect.anything(), 1, 2);
        expect(handler2).toBeCalledWith(expect.anything(), 1, 2);
      });

      it("tree instance with implicit order", async () => {
        const testTree = await tree
          .withFeatures(
            {
              key: "feature1",
              treeInstance: {
                customHandler: () => 123,
              },
            },
            {
              key: "feature2",
              treeInstance: {
                customHandler: handler1,
              },
            },
            {
              key: "feature3",
              treeInstance: {
                customHandler: handler2,
              },
            },
          )
          .createTestCaseTree();

        expect(testTree.instance.customHandler(1, 2)).toBe(123);
        expect(handler2).toHaveBeenCalledBefore(handler1);
        expect(handler1).toBeCalledWith(expect.anything(), 1, 2);
        expect(handler2).toBeCalledWith(expect.anything(), 1, 2);
      });

      it("item instance with overwrite marks, order 1", async () => {
        const testTree = await tree
          .withFeatures(
            {
              key: "feature2",
              overwrites: ["feature1"],
              itemInstance: {
                customHandler: handler1,
              },
            },
            {
              key: "feature1",
              itemInstance: {
                customHandler: () => 123,
              },
            },
            {
              key: "feature3",
              overwrites: ["feature2"],
              itemInstance: {
                customHandler: handler2,
              },
            },
          )
          .createTestCaseTree();

        expect(testTree.item("x111").customHandler(1, 2)).toBe(123);
        expect(handler2).toHaveBeenCalledBefore(handler1);
        expect(handler1).toBeCalledWith(expect.anything(), 1, 2);
        expect(handler2).toBeCalledWith(expect.anything(), 1, 2);
      });

      it("item instance with overwrite marks, order 2", async () => {
        const testTree = await tree
          .withFeatures(
            {
              key: "feature3",
              overwrites: ["feature2"],
              itemInstance: {
                customHandler: handler2,
              },
            },
            {
              key: "feature2",
              overwrites: ["feature1"],
              itemInstance: {
                customHandler: handler1,
              },
            },
            {
              key: "feature1",
              itemInstance: {
                customHandler: () => 123,
              },
            },
          )
          .createTestCaseTree();

        expect(testTree.item("x111").customHandler(1, 2)).toBe(123);
        expect(handler2).toHaveBeenCalledBefore(handler1);
        expect(handler1).toBeCalledWith(expect.anything(), 1, 2);
        expect(handler2).toBeCalledWith(expect.anything(), 1, 2);
      });

      it("item instance with implicit order", async () => {
        const testTree = await tree
          .withFeatures(
            {
              key: "feature1",
              itemInstance: {
                customHandler: () => 123,
              },
            },
            {
              key: "feature2",
              itemInstance: {
                customHandler: handler1,
              },
            },
            {
              key: "feature3",
              itemInstance: {
                customHandler: handler2,
              },
            },
          )
          .createTestCaseTree();

        expect(testTree.item("x111").customHandler(1, 2)).toBe(123);
        expect(handler2).toHaveBeenCalledBefore(handler1);
        expect(handler1).toBeCalledWith(expect.anything(), 1, 2);
        expect(handler2).toBeCalledWith(expect.anything(), 1, 2);
      });
    });
  });
});
