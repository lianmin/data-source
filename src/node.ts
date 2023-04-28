export default class Node {
  // 节点的值
  public value: any;
  // 节点的原始数据
  public data: any;
  // 父节点
  public parent: Node;
  // 子节点（子树集合）
  public children?: Node[];

  constructor(value: any, data: any) {
    this.value = value;
    this.data = data;
    this.children = [];
  }

  /**
   * 是否为根节点（__ROOT__ 为保留的 value 值）
   */
  get isRoot() {
    return this.value === '__ROOT__';
  }

  /**
   * 是否为叶子节点
   */
  get isLeaf() {
    return this.children.length === 0;
  }
}
