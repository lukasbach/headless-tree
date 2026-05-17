import { describe, expect, it, vi } from "vitest";
import { TestTree } from "../../test-utils/test-tree";
import { selectionFeature } from "../selection/feature";
import { syncDataLoaderFeature } from "../sync-data-loader/feature";
import { hotkeysCoreController } from "./shared";
import { HotkeysCoreDataRef } from "./types";

describe("hotkeys-core shared controller", () => {
  it("uses the original DOM event object", async () => {
    const onTreeHotkey = vi.fn();
    const tree = await TestTree.default({ onTreeHotkey })
      .withFeatures(syncDataLoaderFeature, selectionFeature)
      .createTestCaseTree();

    const event = {
      code: "ArrowDown",
      key: "ArrowDown",
      prevented: false,
      preventDefault() {
        if (this !== event) {
          throw new TypeError("Illegal invocation");
        }

        this.prevented = true;
      },
      stopPropagation() {},
    };

    hotkeysCoreController.dispatchKeyDown(
      tree.instance,
      tree.instance.getDataRef<HotkeysCoreDataRef>(),
      event,
    );

    expect(event.prevented).toBe(true);
    expect(tree.instance.getFocusedItem().getId()).toBe("x11");
    expect(onTreeHotkey.mock.calls[0]?.[1]).toBe(event);
  });
});
