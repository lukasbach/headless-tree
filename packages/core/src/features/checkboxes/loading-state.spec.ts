import { describe, expect, it, vi } from "vitest";
import { TestTree } from "../../test-utils/test-tree";
import { checkboxesFeature } from "./feature";

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

const withPendingLoads = async (
  base: TestTree,
  ...loads: Promise<string[]>[]
) => {
  const loader = vi.fn<(id: string) => Promise<string[]> | undefined>();
  const tree = await base
    .withFeatures({
      key: "test-deferred-children",
      overwrites: ["sync-data-loader", "async-data-loader"],
      treeInstance: {
        loadChildrenIds: (
          { prev }: { prev: (id: string) => Promise<string[]> },
          id: string,
        ) => loader(id) ?? prev(id),
      },
    })
    .createTestCaseTree();
  loads.forEach((load) => loader.mockReturnValueOnce(load));
  return tree;
};

describe("checkbox propagation loading state", () => {
  TestTree.default({})
    .withFeatures(checkboxesFeature)
    .forSuits((base) => {
      it("does not publish loading updates for an immediate leaf change", async () => {
        const tree = base;
        const onLoading = tree.mockedHandler("setLoadingCheckPropagationItems");
        await tree.item("x111").setChecked();
        await tree.item("x111").setUnchecked();
        expect(onLoading).not.toHaveBeenCalled();
      });

      it.each(["setChecked", "setUnchecked"] as const)(
        "reports loading until %s finishes loading descendants",
        async (method) => {
          const children = deferred<string[]>();
          const tree = await withPendingLoads(base, children.promise);
          const operation = tree.item("x11")[method]();

          try {
            await vi.waitFor(() => {
              expect(
                tree.instance.getState().loadingCheckPropagationItems,
              ).toEqual(["x11"]);
              expect(tree.item("x11").isLoadingCheckPropagation()).toBe(true);
              expect(tree.item("x12").isLoadingCheckPropagation()).toBe(false);
            });
          } finally {
            children.resolve(["x111"]);
            await operation;
          }
          expect(tree.instance.getState().loadingCheckPropagationItems).toEqual(
            [],
          );
          expect(tree.item("x11").isLoadingCheckPropagation()).toBe(false);
        },
      );

      it("clears loading and propagates a descendant loader rejection", async () => {
        const children = deferred<string[]>();
        const tree = await withPendingLoads(base, children.promise);
        const operation = tree
          .item("x11")
          .setChecked()
          .catch((error) => error);
        const error = new Error("load failed");

        try {
          await vi.waitFor(() => {
            expect(
              tree.instance.getState().loadingCheckPropagationItems,
            ).toEqual(["x11"]);
          });
        } finally {
          children.reject(error);
          expect(await operation).toBe(error);
        }
        expect(tree.instance.getState().loadingCheckPropagationItems).toEqual(
          [],
        );
        expect(tree.instance.getState().checkedItems).toEqual([]);
      });

      it("keeps loading until overlapping operations on the same item finish", async () => {
        const first = deferred<string[]>();
        const second = deferred<string[]>();
        const tree = await withPendingLoads(
          base,
          first.promise,
          second.promise,
        );
        const checking = tree.item("x11").setChecked();
        const unchecking = tree.item("x11").setUnchecked();

        try {
          await vi.waitFor(() => {
            expect(
              tree.instance.getState().loadingCheckPropagationItems,
            ).toEqual(["x11"]);
          });
          first.resolve(["x111"]);
          await checking;
          expect(tree.instance.getState().loadingCheckPropagationItems).toEqual(
            ["x11"],
          );
        } finally {
          first.resolve(["x111"]);
          second.resolve(["x111"]);
          await Promise.all([checking, unchecking]);
        }
        expect(tree.instance.getState().loadingCheckPropagationItems).toEqual(
          [],
        );
      });
    });
});
