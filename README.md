# @xtree/data-source

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
    label: '标签',
    value: 1,
  },
]);

ds.isEmpty();
ds.find();
ds.traverse();
ds.insert();
ds.remove();
ds.parents();
ds.siblings();
ds.firstLeaf();
ds.filter();

ds.toData();
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

推荐使用的数据格式

```js
const data = [
  {
    label: '浙江省',
    value: '1',
    childen: [
      {
        label: '杭州市',
        value: '12',
      },
      //...
    ],
  },
];
```

### 几个约定

- 默认 value/id 是全局唯一的, 否则在遍历，查找等场景可能返回结果异常
