import { IDataItem } from './typings';
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
type TraverseCallbackFn<T> = (data: T, depth: number, cancel: () => void) => void;
type PredicateFn<T> = (data: T, depth: number) => boolean;
export default class DataSource<T = IDataItem> {
    private tree;
    private root;
    private readonly valuePropName;
    private readonly childrenPropName;
    constructor(data?: T[] | DataSourceConfig);
    /**
     * 判断 dataSource 中是否无任何数据
     */
    get isEmpty(): boolean;
    /**
     * 返回 DataSource 的所有节点数量
     */
    get size(): number;
    /**
     * 获取指定 value 所在节点的树的深度
     * @param value
     */
    depth(value?: any): number;
    /**
     * 解析树状数据
     * @param data
     */
    parse(data: T[]): void;
    private toDataItem;
    /**
     * 遍历整个树节点
     * @param callback
     * @param first
     */
    traverse(callback: TraverseCallbackFn<T>, first?: 'depth' | 'breadth'): void;
    /**
     * 查找指定值的节点
     * @param value
     */
    find(value: PredicateFn<T> | any): T | undefined;
    /**
     * 过滤指定值
     * @param predicate
     */
    filter(predicate: PredicateFn<T>): T[];
    /**
     * 获取指定值节点的兄弟节点数据
     * @param value
     * @param pos
     */
    siblings(value: any, pos?: 'left' | 'right' | 'all'): T[];
    /**
     * 返回指定值节点的所有孩子节点数据
     * @param value
     */
    children(value?: any): T[] | undefined;
    /**
     * 返回节点的所有组件节点(由近及远)
     * @param value
     */
    parents(value: any): T[];
    /**
     * 为指定值的节点插入新的孩子节点数据
     * @param data
     * @param parentValue
     * @param pos
     */
    insertChild(data: T, parentValue?: any, pos?: 'leading' | 'trailing'): boolean;
    /**
     * 在指定值的节点之前插入新节点
     * @param data
     * @param siblingNodeValue
     */
    insertBefore(data: T, siblingNodeValue: any): boolean;
    /**
     * 在指定值的接地啊年之后插入新节点
     * @param data
     * @param siblingNodeValue
     */
    insertAfter(data: T, siblingNodeValue: any): boolean;
    /**
     * 转换树的节点数据，为 DataSource 可以输出的节点数据
     * @param node
     * @private
     */
    private transform;
    /**
     * 移除指定值的节点
     * @param value
     */
    remove(value: any): boolean;
    /**
     * 清空树
     */
    clear(): void;
    /**
     * 以指定的树状结构输出
     */
    toData(): T[];
    private transformData;
    /**
     * 将 DataSource 对象上所有的树形结构的扁平化数据
     * @param parentPropName
     */
    flatten<K>(parentPropName?: string): Array<K & T>;
}
export {};
