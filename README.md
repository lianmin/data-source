# @xtree/data-source

![](https://img.shields.io/npm/v/@xtree/data-source)
![](https://img.shields.io/codecov/c/github/lianmin/data-source)
![](https://img.shields.io/github/license/lianmin/data-source)

JS 中常用语如组件 DataSource 的树状结构数组的常用处理方法。如添加、删除子树，查找、遍历。

## 安装

```bash
$ npm i @xtree/data-source --save
```

## 示例

```js
import DataSource from '@xtree/data-source';

const ds = new DataSource();
ds.parse([
  {
    value: '1',
    chilren: [
      {
        value: '1-1',
      },
    ],
  },
]);
```

也可自定义传入树形结构的数据类型

```ts
interface DataItem {
  id: string;
  name: string;
  employees?: DataItem[];
}

const ds = new DataSource<DataItem>({
  valuePropName: 'id',
  childrenPropName: 'employees',
});

ds.parse([
  {
    id: '1',
    name: '张三',
    employees: [
      {
        id: '2',
        name: '李四',
      },
    ],
  },
]);
```

## 使用

推荐(默认支持)的数据格式：

```typescript
type DataItem = {
  //  节点值，推荐使用 string/number 并且需要保持在树中值唯一
  value: any;
  children?: DataItem[];
  // 其他
  [key: string]: any;
};
```

### 方法

#### constructor(options);

初始化 DataSource 对象

```typescript
import DataSource from './data-source';

interface DataItem {
  label: string;
  value: string;
  children?: DataItem[];
}

// 指定节点的 值 和 孩子 的属性名
const ds = new DataSource<DataItem>({
  valuePropName: 'value',
  childrenPropName: 'children',
});
```

#### parse(data) 解析数据

解析树形结构数据，此操作会清空原有的所有数据

```typescript
const data: DataItem[] = [
  {
    label: '浙江省',
    value: '33',
    childen: [
      {
        label: '杭州市',
        value: '3301',
      },
      //...
    ],
  },
];

ds.parse(data);
```

#### get `size()`

返回当前的总节点数

```ts
console.log(ds.size);
```

#### get `isEmpty()`

判断当前的总结点数是否为 `0`

```ts
console.log(ds.isEmpty); // boolean;
```

#### find(`value`) 查找指定值的数据

查找并返回第一个当前实例化 `DataSource` 对象中指定值的节点数据，如果没有，则返回 `undefined`;
value 可为函数类型 `(data:T)=>boolean`

```typescript
ds.find('33'); // {label:'浙江省', value:'33', children:[...]}
ds.find((data) => data.value === '33');
```

#### filter(predicate: (data:T, depth:number)=>boolean)

根据条件超找并过滤所有符合条件的数据

```ts
// 过滤所有深度为 1 的节点
ds.filter((data, depth) => {
  return depth === 1;
});
```

#### traverse(`callback`: `(node, depth, cancel)=>void`)

遍历所有节点，并执行回调.

```ts
ds.traverse((data, depth, cancel) => {
  // 根据适当条件可结束遍历
  if (condition) {
    cancel();
  }
});
```

#### depth(value: `any`)

返回 value 所在节点的深度

#### children(value?: any)

返回 value 对应节点的孩子节点，未传入 value 则返回树的第一层节点。

#### parents(value)

返回 value 所在节点的父级节点的路径数组（由近及远）

#### siblings(value, pos:`'left'|'right'|'all'`)

返回值为 `value` 的节点的兄弟节点数据，可单独指定做 `左/右兄弟节点`

#### insertChild(data, parentValue: `any`, pos: `'leading'|'trailing'`)

在指定的 `parentValue` 对应的节点的孩子节点上插入 `data`。 位置可选， `leading` - 头，`trailing` - 尾(默认)

#### insertBefore(data, parentValue)

在指定的 `parentValue` 对应节点前插入 `data`

#### insertAfter(data, parentValue)

在指定的 `parentValue` 对应节点后插入 `data`

#### remove(value)

移除 `value` 对应的节点

#### clear()

清空当前 DataSource 实例的所有节点数据

#### toData()

返回当前 DataSource 实例的最新树状结构数据

```ts
ds.toData(); //
```

#### flatten(parentValue)

返回当前 DataSource 实例对应的树状数据的扁平化数据

```ts
// 前述实例，扁平化后为
ds.flatten('pValue'); // [{label:'浙江省', value:'33', pValue: undefined}, {label:'杭州市', value:'3301', pValue:'33'}, ... ]
```

## 其他

### 几个约定

- `value` 是 **全局唯一的**, 否则在遍历，查找等场景可能返回结果异常
- `value` 推荐使用 `string` 或 `number` 类型
