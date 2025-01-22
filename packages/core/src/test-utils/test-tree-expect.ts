import { TestTree } from "./test-tree";

export class TestTreeExpect<T> {
  constructor(private tree: TestTree<T>) {}
}
