import Tree, { TreeNode } from '@xtree/tree';
const isNil = (value) => value == null;
export default class DataSource {
    tree = new Tree();
    root = this.tree.root;
    valuePropName = 'value';
    childrenPropName = 'children';
    constructor(data) {
        if (!data)
            return;
        if (Array.isArray(data)) {
            this.parse(data);
        }
        else {
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
    get size() {
        if (this.root.isLeaf) {
            return 0;
        }
        return this.tree.size(this.root.left);
    }
    /**
     * 获取指定 value 所在节点的树的深度
     * @param value
     */
    depth(value) {
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
    parse(data) {
        const newData = data.map((it) => this.toDataItem(it));
        const nodes = this.tree.parseDataToNodes(newData);
        this.tree.clear();
        nodes.forEach((node) => this.tree.insertChild(node, this.root, 'trailing'));
    }
    toDataItem(item) {
        if (typeof item?.[this.valuePropName] === 'undefined') {
            return {};
        }
        const rs = {
            ...item,
            value: item?.[this.valuePropName],
        };
        const children = (item?.[this.childrenPropName] || []).map((it) => this.toDataItem(it));
        if (Array.isArray(children) && children.length) {
            rs.children = children;
        }
        return rs;
    }
    /**
     * 遍历整个树节点
     * @param callback
     * @param first
     */
    traverse(callback, first) {
        this.tree.traverse((node, cancel) => {
            const { originalData } = node;
            callback(originalData, this.tree.depth(node), cancel);
        }, first);
    }
    /**
     * 查找指定值的节点
     * @param value
     */
    find(value) {
        if (isNil(value)) {
            return undefined;
        }
        const node = this.tree.find((node) => {
            if (typeof value !== 'function') {
                return node.value === value;
            }
            return value(this.transform(node), this.tree.depth(node));
        });
        return this.transform(node);
    }
    /**
     * 过滤指定值
     * @param predicate
     */
    filter(predicate) {
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
    siblings(value, pos = 'all') {
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
    children(value) {
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
    parents(value) {
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
    insertChild(data, parentValue, pos = 'trailing') {
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
    insertBefore(data, siblingNodeValue) {
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
    insertAfter(data, siblingNodeValue) {
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
    transform(node) {
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
    remove(value) {
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
     * 以指定的树状结构输出
     */
    toData() {
        const data = this.tree.toData();
        return data.map((it) => this.transformData(it));
    }
    transformData(data) {
        const { value, children, ...others } = data;
        const rs = {
            [this.valuePropName]: value,
        };
        if (children) {
            rs[this.childrenPropName] = data.children.map((d) => this.transformData(d));
        }
        return { ...others, ...rs };
    }
    /**
     * 将 DataSource 对象上所有的树形结构的扁平化数据
     * @param parentPropName
     */
    flatten(parentPropName = 'parentValue') {
        const items = this.tree.flatten(this.root, parentPropName);
        return items.map((item) => {
            const { value, children, parentValue, ...others } = item;
            return {
                [this.valuePropName]: value,
                [parentPropName]: parentValue === TreeNode.ROOT_VALUE ? undefined : parentValue,
                ...others,
            };
        });
    }
}
//# sourceMappingURL=data-source.js.map