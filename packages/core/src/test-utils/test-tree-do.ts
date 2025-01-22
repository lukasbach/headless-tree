import { TestTree } from "./test-tree";

export class TestTreeDo<T> {
  private itemProps(itemId: string) {
    return this.tree.instance.getItemInstance(itemId).getProps();
  }

  constructor(private tree: TestTree<T>) {}

  selectItem(id: string) {
    this.itemProps(id).onClick({});
  }

  shiftSelectItem(id: string) {
    this.itemProps(id).onClick({ shiftKey: true });
  }

  ctrlSelectItem(id: string) {
    this.itemProps(id).onClick({ ctrlKey: true });
  }
}
