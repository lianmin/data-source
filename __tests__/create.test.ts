import DataSource from '../src/index';
import streetData from './data/streets';
import treeData from './data/tree';

type DataItemType = {
  value: string;
  label: string;
  children?: DataItemType[];
};

const genDs = () => {
  const ds = new DataSource<DataItemType>();
  ds.parse(treeData);
  return ds;
};

describe('创建', () => {
  test('空数据', () => {
    const ds = new DataSource<{ labelNo: string; [key: string]: any }>();
    expect(ds.isEmpty).toBe(true);
    expect(ds.size).toBe(0);

    const ds2 = new DataSource([]);
    expect(ds2.isEmpty).toBe(true);
    expect(ds2.size).toBe(0);
  });

  test('创建非标准格式的 DataSource', () => {
    const ds = new DataSource<{ code: string; [key: string]: any }>({
      valuePropName: 'code',
      childrenPropName: 'children',
    });
    ds.parse(streetData);
    expect(ds.isEmpty).toBe(false);
    expect(ds.size).toBe(44708);
  });

  test('树的深度', () => {
    const ds = new DataSource<{ code: string; [key: string]: any }>({
      valuePropName: 'code',
    });
    ds.parse(streetData);

    expect(ds.depth('33')).toBe(1);
    expect(ds.depth('330424101')).toBe(4);
    expect(ds.depth('88888888')).toBe(0);
    expect(ds.depth()).toBe(0);
  });

  test('尺寸', () => {
    const ds = genDs();
    const size = ds.size;

    expect(size).toBe(20);
  });
});
