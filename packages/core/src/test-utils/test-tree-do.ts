import { TestTree } from "./test-tree";

export class TestTreeDo<T> {
  protected itemInstance(itemId: string) {
    return this.tree.instance.getItemInstance(itemId);
  }

  protected itemProps(itemId: string) {
    return this.itemInstance(itemId).getProps();
  }

  constructor(protected tree: TestTree<T>) {}

  selectItem(id: string) {
    this.itemProps(id).onClick({});
  }

  shiftSelectItem(id: string) {
    this.itemProps(id).onClick({ shiftKey: true });
  }

  ctrlSelectItem(id: string) {
    this.itemProps(id).onClick({ ctrlKey: true });
  }

  ctrlShiftSelectItem(id: string) {
    this.itemProps(id).onClick({ shiftKey: true, ctrlKey: true });
  }
}
