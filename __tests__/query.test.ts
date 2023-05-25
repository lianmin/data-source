import DataSource from '../src';
import streets from './data/streets';

interface DataItemType {
  code: string;
  name: string;
  children?: DataItemType[];
  [key: string]: any;
}

describe('查找和遍历', () => {
  const ds = new DataSource<DataItemType>({
    valuePropName: 'code',
    childrenPropName: 'children',
  });
  ds.parse(streets);

  test('遍历首层数据', () => {
    const rs = [];

    ds.traverse((data, depth, cancel) => {
      if (depth === 1) {
        rs.push(data.name);
      }
    });

    expect(rs.length).toBe(31);
  });

  test('遍历并取消', () => {
    let counter = 0;
    let result = false;
    ds.traverse((data, depth, cancel) => {
      if (data.code === '33') {
        // 查找北京市
        result = true;
        cancel();
      }
      counter++;
    }, 'breadth');

    expect(result).toBe(true);
    // 广度优先遍历，北京位于第一层
    expect(counter).toBeLessThan(41351);
  });

  test('遍历叶子结点数据', () => {
    const rs = [];

    ds.traverse((data, depth, cancel) => {
      if (!data.children) {
        rs.push(data.name);
      }
    });

    expect(rs.length).toBe(41351);
  });

  test('查找指定值', () => {
    // 浙江省嘉兴市海盐县沈荡镇
    const item = ds.find('330424101');
    const invalidItem = ds.find(null);
    const notFoundItem = ds.find('330488888');
    const item2 = ds.find((data: DataItemType) => data.name === '上饶市');

    expect(item.name).toBe('沈荡镇');
    expect(item2.code).toBe('3611');
    expect(invalidItem).toBe(undefined);
    expect(notFoundItem).toBe(undefined);
  });

  test('过滤', () => {
    // 带有海的城市
    const cities = ds.filter((item: any, depth: number) => {
      return /海/.test(item.name) && depth === 2;
    });
    expect(cities.filter((data) => data.name === '威海市').length).toBe(1);
    expect(ds.filter(null).length).toBe(0);
    expect(ds.filter(undefined).length).toBe(0);
  });

  test('父级路径', () => {
    // 安徽省芜湖市弋江区白马街道
    const parentPaths = ds.parents('340209005');

    expect(
      parentPaths
        .reverse()
        .map((data) => data.name)
        .join(''),
    ).toBe('安徽省芜湖市弋江区');

    expect(ds.parents('')).toHaveLength(0);
    expect(ds.parents('-1')).toHaveLength(0);
    expect(ds.parents(undefined)).toHaveLength(0);
  });

  test('孩子节点', () => {
    // 浙江省下的所有地级市
    const cities = ds.children('33');
    expect(cities).toHaveLength(11);

    expect(ds.children('-1')).toBe(undefined);
    expect(ds.children()).toHaveLength(31);
  });

  test('兄弟节点', () => {
    // 浙江省
    const allSiblingProvinces = ds.siblings('33', 'all');
    const leftSiblingProvinces = ds.siblings('33', 'left');
    const rightSiblingProvinces = ds.siblings('33', 'right');

    expect(allSiblingProvinces.length).toBe(30);
    expect(allSiblingProvinces.length).toBe(
      leftSiblingProvinces.length + rightSiblingProvinces.length,
    );

    // 第一个子节点的左叶子节点为 []
    expect(ds.siblings('330102001', 'left')).toHaveLength(0);
    // 最后一个子节节点的左叶子节点为 []
    expect(ds.siblings('330102018', 'right')).toHaveLength(0);

    // 异常情况
    expect(ds.siblings('')).toHaveLength(0);
  });
});
