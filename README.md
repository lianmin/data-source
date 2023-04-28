# @xtree/data-source

JS 中树状结构数组的常用处理方法。如添加、删除子树，查找、遍历(先序、后序、层级)。

## Install

```bash
$ npm i @xtree/data-source --save
```

## Usage

```js
import DataSource from '@xtree/data-source';

const ds = new DataSource([]);

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

几个约定

- 默认 value/id 是全局唯一的, 否则在遍历，查找等场景可能返回结果异常
