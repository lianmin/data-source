import DataSource from '../src';
import streets from './data/streets';

interface DataItemType {
  code: string;
  name: string;
  children?: DataItemType[];
  [key: string]: any;
}

const genTree = () => {
  const ds = new DataSource<DataItemType>({
    valuePropName: 'code',
    childrenPropName: 'children',
  });
  ds.parse(streets);
  return ds;
};

describe('查找和遍历', () => {
  test('指定节点前插入', () => {
    const ds = genTree();
    // 浙江省的城市
    const cities = ds.children('33');

    ds.insertBefore(
      {
        code: '3300-1',
        name: '新城市',
      },
      '3301',
    );

    const newCities = ds.children('33');

    expect(newCities[0].name).toBe('新城市');
    expect(ds.children('33')!.length).toBe(cities.length + 1);

    const insertResult = ds.insertBefore(
      { code: 'new value', name: '新城市' },
      '-1',
    );
    expect(insertResult).toBe(false);
  });

  test('指定节点后插入', () => {
    const ds = genTree();
    // 浙江省的城市
    const cities = ds.children('33');

    ds.insertAfter(
      {
        code: '3300-1',
        name: '新城市',
      },
      '3301',
    );

    const newCities = ds.children('33');

    expect(newCities[1].name).toBe('新城市');
    expect(ds.children('33')!.length).toBe(cities.length + 1);

    const insertResult = ds.insertAfter(
      { code: 'new value', name: '新城市' },
      '-1',
    );
    expect(insertResult).toBe(false);
  });

  test('作为为首个孩子节点插入', () => {
    const ds = genTree();
    // 浙江省的城市
    const cities = ds.children('33');

    ds.insertChild(
      {
        code: '3300-1',
        name: '新城市',
      },
      '33',
    );

    const newCities = ds.children('33');
    expect(newCities[0].name).toBe('新城市');
    expect(ds.children('33')!.length).toBe(cities.length + 1);

    // 无效的插入
    const insertResult = ds.insertChild(
      {
        code: 'xxx',
        name: 'xxx',
      },
      '-1',
    );

    expect(insertResult).toBe(false);
  });
  test('作为最后一个孩子节点插入', () => {
    const ds = genTree();
    // 浙江省的城市
    const cities = ds.children('33');

    ds.insertChild(
      {
        code: '3300-1',
        name: '新城市',
      },
      '33',
      'trailing',
    );

    const newCities = ds.children('33');

    expect(newCities.at(-1).name).toBe('新城市');
    expect(ds.children('33')!.length).toBe(cities.length + 1);
  });

  test('移除指定节点', () => {
    const ds = genTree();

    // 无效的
    ds.remove('');
    ds.remove(null);

    // 移除杭州市
    ds.remove('3301');

    const cities = ds.children('33');

    expect(cities.find((item) => item.name === '杭州市')).toBe(undefined);

    const size = ds.size;

    // 不存在的节点
    ds.remove('-1');

    expect(ds.size).toBe(size);

    ds.remove('__ROOT__');
    expect(ds.size).toBe(0);
  });

  test('清空数据', () => {
    const ds = genTree();

    expect(ds.size).not.toBe(0);

    ds.clear();

    expect(ds.size).toBe(0);
  });
});
