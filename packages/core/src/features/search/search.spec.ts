import { describe, expect, it } from "vitest";
import { TestTree } from "../../test-utils/test-tree";
import { searchFeature } from "./feature";
import { selectionFeature } from "../selection/feature";

const factory = TestTree.default({}).withFeatures(
  searchFeature,
  selectionFeature,
);

describe("core-feature/search", () => {
  factory.forSuits((tree) => {
    it("opens and closes search", () => {
      tree.instance.openSearch();
      expect(tree.instance.isSearchOpen()).toBe(true);
      expect(tree.instance.getSearchValue()).toBe("");
      tree.instance.closeSearch();
      expect(tree.instance.isSearchOpen()).toBe(false);
    });

    it("opens and closes search with initial value", () => {
      tree.instance.openSearch("test");
      expect(tree.instance.isSearchOpen()).toBe(true);
      expect(tree.instance.getSearchValue()).toBe("test");
      tree.instance.closeSearch();
      expect(tree.instance.isSearchOpen()).toBe(false);
    });

    it("invokes open and close handlers", () => {
      const onOpenSearch = tree.mockedHandler("onOpenSearch");
      const onCloseSearch = tree.mockedHandler("onCloseSearch");
      tree.instance.openSearch("test");
      expect(onOpenSearch).toHaveBeenCalled();
      tree.instance.closeSearch();
      expect(onCloseSearch).toHaveBeenCalled();
    });

    it("invokes state setter", () => {
      const setSearch = tree.mockedHandler("setSearch");
      tree.instance.openSearch("test");
      expect(setSearch).toHaveBeenCalledWith("test");
      tree.instance.closeSearch();
      expect(setSearch).toHaveBeenCalledWith(null);
    });

    it("can search and return matches", () => {
      tree.instance.setSearch("12");
      expect(tree.instance.getSearchMatchingItems().length).toBe(2);
      expect(tree.instance.getSearchMatchingItems()[0].getId()).toBe("x112");
      expect(tree.instance.getSearchMatchingItems()[1].getId()).toBe("x12");
    });

    it("uses isSearchMatchingItem handler", () => {
      const isSearchMatchingItem = tree.mockedHandler("isSearchMatchingItem");
      isSearchMatchingItem.mockImplementation(
        (_, item) => item.getId() === "x3",
      );
      tree.instance.setSearch("xyz");
      expect(tree.instance.getSearchMatchingItems().length).toBe(1);
      expect(tree.instance.getSearchMatchingItems()[0].getId()).toBe("x3");
    });

    it("changes search input contentwith input props", () => {
      const setSearch = tree.mockedHandler("setSearch");
      tree.instance
        .getSearchInputElementProps()
        .onChange({ target: { value: "test" } });
      expect(setSearch).toHaveBeenCalledWith("test");
    });

    it("closes search input with input props", () => {
      const onCloseSearch = tree.mockedHandler("onCloseSearch");
      tree.instance.openSearch();
      tree.instance.getSearchInputElementProps().onBlur();
      expect(onCloseSearch).toHaveBeenCalled();
    });

    describe("hotkeys", () => {
      it("opens search", () => {
        const setSearch = tree.mockedHandler("setSearch");
        tree.do.hotkey("openSearch");
        expect(setSearch).toHaveBeenCalledWith("");
      });

      it("selects focused item when search is submitted", () => {
        const setSelectedItems = tree.mockedHandler("setSelectedItems");
        const onCloseSearch = tree.mockedHandler("onCloseSearch");
        tree.instance.focusItem("x1");
        tree.do.hotkey("openSearch");
        tree.do.hotkey("submitSearch");
        expect(setSelectedItems).toHaveBeenCalledWith(["x1"]);
        expect(onCloseSearch).toHaveBeenCalled();
      });

      it("scrolls through searched items", () => {
        const setFocusedItem = tree.mockedHandler("setFocusedItem");
        tree.instance.setSearch("12");
        tree.do.hotkey("nextSearchItem");
        expect(setFocusedItem).toHaveBeenCalledWith("x112");

        tree.do.hotkey("nextSearchItem");
        expect(setFocusedItem).toHaveBeenCalledWith("x12");

        tree.do.hotkey("nextSearchItem");
        expect(setFocusedItem).toHaveBeenCalledTimes(2);

        tree.do.hotkey("previousSearchItem");
        tree.do.hotkey("previousSearchItem");
        tree.do.hotkey("previousSearchItem");
        expect(setFocusedItem).toHaveBeenCalledTimes(3);
        expect(setFocusedItem).nthCalledWith(3, "x112");
      });
    });
  });
});
