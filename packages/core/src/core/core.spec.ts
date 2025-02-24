import { describe, expect, it, vi } from "vitest";
import { TestTree } from "../test-utils/test-tree";

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
