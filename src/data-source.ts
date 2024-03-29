import Tree, { TreeNode } from '@xtree/tree';
import { IDataItem, IDataSource } from './typings';

const isNil = (value: any) => value == null;

interface DataSourceConfig {
  /**
   * 自定义的 value 属性名
   */
  valuePropName?: string;
  /**
   * 自定义的孩子节点属性名
   */
  childrenPropName?: string;
}

type TraverseCallbackFn<T> = (
  data: T,
  depth: number,
  cancel: () => void,
) => void;
type PredicateFn<T> = (data: T, depth: number) => boolean;

export default class DataSource<T = IDataItem> {
  private tree: Tree = new Tree();
  private root: TreeNode = this.tree.root;
  private readonly valuePropName: string = 'value';
  private readonly childrenPropName: string = 'children';

  constructor(data?: T[] | DataSourceConfig) {
    if (!data) return;

    if (Array.isArray(data)) {
      this.parse(data);
    } else {
      const { childrenPropName, valuePropName } = data;

      if (valuePropName) {
        this.valuePropName = valuePropName;
      }
      if (childrenPropName) {
        this.childrenPropName = childrenPropName;
      }
    }
  }

  /**
   * 判断 dataSource 中是否无任何数据
   */
  get isEmpty() {
    return this.size === 0;
  }

  /**
   * 返回 DataSource 的所有节点数量
   */
  get size(): number {
    if (this.root.isLeaf) {
      return 0;
    }

    return this.tree.size(this.root.left);
  }

  /**
   * 获取指定 value 所在节点的树的深度
   * @param value
   */
  depth(value?: any) {
    if (isNil(value)) {
      return 0;
    }

    const node = this.tree.find(value);
    return this.tree.depth(node);
  }

  /**
   * 解析树状数据
   * @param data
   */
  parse(data: T[]) {
    const nodes = data.map((item) => this.parseDataToNode(item));

    this.tree.clear();

    nodes
      .filter((node) => !!node)
      .forEach((node) => this.tree.insertChild(node, this.root, 'trailing'));
  }

  /**
   * 树形数据转换成二叉树
   * @param data 树形结构数据
   */
  parseDataToNode(data: any): TreeNode | undefined {
    if (!data?.[this.valuePropName]) {
      return undefined;
    }

    const node = new TreeNode(data[this.valuePropName], data);

    if (
      Array.isArray(data?.[this.childrenPropName]) &&
      data[this.childrenPropName]?.length > 0
    ) {
      let leftNode = this.parseDataToNode(data[this.childrenPropName][0]);
      node.left = leftNode;
      leftNode.parent = node;

      let cur = leftNode;

      for (let i = 1; i < data[this.childrenPropName].length; i++) {
        let rightNode = this.parseDataToNode(data[this.childrenPropName][i]);
        cur.right = rightNode;
        rightNode.parent = node;
        cur = rightNode;
      }
    }

    return node;
  }

  /**
   * 遍历整个树节点
   * @param callback
   * @param first
   */
  traverse(callback: TraverseCallbackFn<T>, first?: 'depth' | 'breadth') {
    this.tree.traverse((node: TreeNode, cancel) => {
      const { originalData } = node;

      callback(originalData, this.tree.depth(node), cancel);
    }, first);
  }

  /**
   * 查找指定值的节点
   * @param value
   */
  find(value: PredicateFn<T> | any): T | undefined {
    if (isNil(value)) {
      return undefined;
    }

    const node = this.tree.find((node: TreeNode) => {
      if (typeof value !== 'function') {
        return node.value === value;
      }
      return value(this.transform(node) as T, this.tree.depth(node));
    });

    return this.transform(node);
  }

  /**
   * 过滤指定值
   * @param predicate
   */
  filter(predicate: PredicateFn<T>): T[] {
    if (!predicate) {
      return [];
    }

    const nodes = this.tree.filter((node) => {
      return predicate(this.transform(node), this.tree.depth(node));
    });

    return nodes.map((node) => this.transform(node));
  }

  /**
   * 获取指定值节点的兄弟节点数据
   * @param value
   * @param pos
   */
  siblings(value: any, pos: 'left' | 'right' | 'all' = 'all'): T[] {
    if (isNil(value)) {
      return [];
    }

    const node = this.tree.find(value);
    const siblingNodes = this.tree.siblings(node, pos);

    return siblingNodes.map(this.transform);
  }

  /**
   * 返回指定值节点的所有孩子节点数据
   * @param value
   */
  children(value?: any): T[] | undefined {
    let node = isNil(value) ? this.root : this.tree.find(value);

    if (!node) {
      return undefined;
    }

    return this.tree.children(node).map((node) => this.transform(node));
  }

  /**
   * 返回节点的所有组件节点(由近及远)
   * @param value
   */
  parents(value: any): T[] {
    if (isNil(value)) {
      return [];
    }

    const node = this.tree.find(value);

    if (!node || node.isRoot) {
      return [];
    }

    return this.tree
      .parents(node)
      .filter((node) => !node.isRoot)
      .map(this.transform);
  }

  /**
   * 为指定值的节点插入新的孩子节点数据
   * @param data
   * @param parentValue
   * @param pos
   */
  insertChild(
    data: T,
    parentValue?: any,
    pos: 'leading' | 'trailing' = 'trailing',
  ): boolean {
    const parentNode = parentValue ? this.tree.find(parentValue) : this.root;

    if (!data || !parentNode) {
      return false;
    }

    // @ts-ignore
    const newNode = new TreeNode(data[this.valuePropName], data);

    this.tree.insertChild(newNode, parentNode, pos);

    return true;
  }

  /**
   * 在指定值的节点之前插入新节点
   * @param data
   * @param siblingNodeValue
   */
  insertBefore(data: T, siblingNodeValue: any): boolean {
    const siblingNode = this.tree.find(siblingNodeValue);

    if (!siblingNode) {
      return false;
    }

    // @ts-ignore
    const newNode = new TreeNode(data[this.valuePropName], data);
    this.tree.insertBefore(newNode, siblingNode);

    return false;
  }

  /**
   * 在指定值的接地啊年之后插入新节点
   * @param data
   * @param siblingNodeValue
   */
  insertAfter(data: T, siblingNodeValue: any): boolean {
    const siblingNode = this.tree.find(siblingNodeValue);

    if (!siblingNode) {
      return false;
    }

    // @ts-ignore
    const newNode = new TreeNode(data[this.valuePropName], data);
    this.tree.insertAfter(newNode, siblingNode);
    return false;
  }

  /**
   * 转换树的节点数据，为 DataSource 可以输出的节点数据
   * @param node
   * @private
   */
  private transform(node: TreeNode) {
    if (node) {
      return {
        ...node.originalData,
      };
    }
  }

  /**
   * 移除指定值的节点
   * @param value
   */
  remove(value: any): boolean {
    if (isNil(value)) {
      return false;
    }

    // 特殊情况处理，如果传入了根节点值，则清空树
    if (value === TreeNode.ROOT_VALUE) {
      this.clear();
      return true;
    }

    const node = this.tree.find(value);

    if (node) {
      this.tree.remove(node);
      return true;
    }

    return true;
  }

  /**
   * 清空树
   */
  clear() {
    this.tree.clear();
  }

  /**
   * 以原有的树状结构输出
   */
  toData() {
    return this.tree.format((data) => {
      const { value, children, originalData } = data;
      return {
        ...originalData,
        [this.valuePropName]: value,
        [this.childrenPropName]: children,
      };
    });
  }

  /**
   * 自定义返回格式
   * @param callback
   */
  format(
    callback: (
      data: IDataItem & { originalData: { [key: string]: any } },
    ) => any,
  ) {
    return this.tree.format(callback);
  }

  /**
   * 以标准的 DataSource 数据类型返回
   * 形如：[{value:string, children:[...]}]
   * 对当前的树形数据执行格式化输出
   */
  toDataSource(): IDataSource {
    return this.tree.format((data) => data);
  }

  /**
   * 将 DataSource 对象上所有的树形结构的扁平化数据
   * @param parentPropName
   */
  flatten<K>(parentPropName: string = 'parentValue'): Array<K & T> {
    const items = this.tree.flatten(this.root, parentPropName);

    return items.map((item: any) => {
      const { value, children, parentValue, ...others } = item;

      return {
        [this.valuePropName]: value,
        [parentPropName]:
          parentValue === TreeNode.ROOT_VALUE ? undefined : parentValue,
        ...others,
      };
    });
  }
}
