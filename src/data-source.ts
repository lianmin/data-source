import { IDataItem, IDataSource } from './typings';
import Node from './node';

interface DataSourceConfig {
  /**
   * 自定义的 value 属性名
   */
  valuePropName: string;
  /**
   * 自定义的孩子节点属性名
   */
  childrenPropName: string;
}

type CompareCallback = (node: IDataItem) => boolean;
type TraverseCallbackType = (node: Node) => void;

export default class DataSource<T> {
  private readonly valuePropName: string;
  private readonly childrenPropName: string;
  private readonly root: any;

  constructor(
    data?: IDataSource | IDataItem,
    config: DataSourceConfig = { valuePropName: 'value', childrenPropName: 'children' },
  ) {
    this.valuePropName = config.valuePropName;
    this.childrenPropName = config.childrenPropName;

    this.root = new Node('__ROOT__', { value: '__ROOT__' });

    if (Array.isArray(data)) {
      // 节点数组
      data.forEach((item) => {
        this.insert(item, this.root);
      });
    } else if (data) {
      // 单个节点数据
      this.insert(data as IDataItem, this.root);
    }
  }

  /**
   * 判断是否为空数据
   */
  isEmpty() {
    return this.root.isLeaf;
  }

  /**
   * 插入孩子节点
   * @param data
   * @param parentNode 父级节点； 若无，则默认添加给根节点
   */
  insert(data: IDataItem, parentNode?: Node): Node {
    const newNode = this.parseToTree(data);
    const pNode = parentNode || this.root;

    newNode.parent = pNode;
    pNode.children.push(newNode);

    return newNode;
  }

  /**
   * 移除节点
   * @param node
   * @returns
   */
  remove(node: Node) {
    if (node.isRoot) {
      console.warn('根节点无法移除');
      return;
    }

    const parent = node.parent;
    const index = parent.children.findIndex((n) => n === node);

    parent.children.splice(index, 1);
  }

  /**
   * 将数据转换为树状结构
   * @param data
   * @private
   */
  private parseToTree(data: any) {
    const node = new Node(data[this.valuePropName], data);
    const children = data[this.childrenPropName];

    if (Array.isArray(children) && children.length > 0) {
      children.forEach((child) => {
        const _node = this.parseToTree(child);

        _node.parent = node;

        node.children.push(_node);
      });
    }

    return node;
  }

  /**
   * 查找
   * @param value
   */
  find(value: any | CompareCallback): Node | null {
    let result = null;

    this.traverse((node) => {
      if (typeof value === 'function') {
        if (value(node) === true) {
          result = node;
        }
      } else if (node.value === value) {
        result = node;
      }
    });

    return result;
  }

  /**
   * 过滤每一个节点
   * @param callback 仅当返回为 true 时，认为差孩子哦啊
   */
  filter(callback: CompareCallback) {
    const result: Node[] = [];

    this.traverse((node) => {
      if (callback(node) === true) {
        result.push(node);
      }
    });

    return result;
  }

  /**
   * 对所有树节点进行遍历，支持三种模式：
   * 先序遍历、后序遍历、层级遍历
   * @param callback
   * @param strategy
   */
  traverse(callback: TraverseCallbackType, strategy?: 'pre' | 'post' | 'level'): void {
    switch (strategy) {
      case 'post':
        this.postOrder(this.root, callback);
        break;
      case 'level':
        this.levelOrder(this.root, callback);
        break;
      default:
        this.preOrder(this.root, callback);
    }
  }

  /**
   * 先序遍历
   * @param node
   * @param callback
   * @private
   */
  private preOrder(node: Node, callback: TraverseCallbackType) {
    if (!node) {
      return;
    }

    if (!node.isRoot) {
      callback(node);
    }

    node.children.forEach((childNode) => this.preOrder(childNode, callback));
  }

  /**
   * 后序遍历
   * @param node
   * @param callback
   * @private
   */
  private postOrder(node: Node, callback: TraverseCallbackType) {
    if (!node) {
      return;
    }

    node.children.forEach((childNode) => this.postOrder(childNode, callback));

    if (!node.isRoot) {
      callback(node);
    }
  }

  /**
   * 层序遍历(广度优先)
   * @param node
   * @param callback
   * @private
   */
  private levelOrder(node: Node, callback: TraverseCallbackType) {
    const queue = [];
    if (node) {
      queue.push(node);
    }

    while (queue.length > 0) {
      const curNode = queue.shift();

      if (!curNode.isRoot) {
        callback(curNode);
      }

      if (curNode.children.length > 0) {
        queue.push(...curNode.children);
      }
    }
  }

  /**
   * 获取节点的深度，不传则默认为构建的树或者森林的深度
   * @param node
   */
  depth(node?: Node): number {
    // todo: 还有些问题， node 和 root 的层级计算不准确
    return this.calNodeDepth(node || this.root);
  }

  /**
   * 计算指定节点的深度
   * @param node
   * @private
   */
  private calNodeDepth(node: Node): number {
    if (!node) {
      return 0;
    }

    const arr = node.children.map((childNode) => this.depth(childNode) + 1);

    return arr.length > 0 ? Math.max(...arr) : 0;
  }

  /**
   * 获取节点的父级节点
   * @param node
   */
  parents(node: Node): Node[] {
    if (!node || node.isRoot) {
      return [];
    }

    const queue = [];
    let tmp = node.parent;

    while (tmp && !tmp.isRoot) {
      queue.push(tmp);
      tmp = tmp.parent;
    }

    return queue;
  }

  /**
   * 获取节点的兄弟节点
   * @param node
   * @param pos 兄弟节点的位置
   * @returns
   */
  siblings(node: Node, pos?: 'all' | 'left' | 'right'): Node[] {
    if (!node) return [];

    const children = node.parent.children;
    const index = children.findIndex((n) => n === node);
    const leftSiblingNodes = children.slice(0, index);
    const rightSiblingNodes = children.slice(index + 1);

    switch (pos) {
      case 'right':
        return rightSiblingNodes;
      case 'left':
        return leftSiblingNodes;
      default:
        return [...leftSiblingNodes, ...rightSiblingNodes];
    }
  }

  /**
   * 第一个左叶子结点
   */
  firstLeaf(): Node | null {
    if (this.root.isLeaf) {
      // 无传入数据，则为空
      return null;
    }

    let node = this.root.children[0];

    while (!node.isLeaf) {
      node = node.children[0];
    }

    return node;
  }

  /**
   * 转化为标准 DataSource 格式数据
   */
  toData(node?: Node): IDataItem | IDataSource {
    if (!node) {
      // 对 root 转换的时候，移除虚拟 root 节点
      return this._toData(this.root).children || [];
    }

    return this._toData(node);
  }

  /**
   * 将节点的数据转换为数组
   * @param node
   * @private
   */
  private _toData(node: Node): IDataItem {
    let result = {
      ...node.data,
    };

    if (node.children.length > 0) {
      result.children = node.children.map((n) => {
        return this._toData(n);
      });
    }

    return result;
  }
}
