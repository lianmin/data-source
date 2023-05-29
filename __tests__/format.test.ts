import DataSource from '../src';
import treeData from './data/tree';
import streetData from './data/streets';
import nonStandardData from './data/non-standard-data';

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

describe('格式化', () => {
  test('操作节点后, 获取最新的树状结构数据', () => {
    const ds = genDs();

    ds.remove('2');

    const data = ds.toData();

    expect(data).toHaveLength(2);
    expect(data[0].label).not.toBe(undefined);
    expect(data[0].value).not.toBe(undefined);
  });

  test('操作节点后, 获取扁平化后的数据', () => {
    const ds = genDs();

    ds.remove('2');

    const flattenData = ds.flatten<{ parentValue?: string }>();

    expect(flattenData).toHaveLength(9);
    expect(flattenData.find((data) => data.value === '3')).not.toBe(undefined);
    expect(flattenData.find((data) => data.value === '2')).toBe(undefined);
    expect(flattenData.find((data) => data.value === '2-1')).toBe(undefined);
    expect(flattenData.find((data) => data.parentValue === '1')).not.toBe(
      undefined,
    );

    ds.insertChild({
      label: '4',
      value: '4',
    });

    expect(ds.flatten()).toHaveLength(10);
  });

  test('输出标准的 dataSource 数据', () => {
    const ds = new DataSource<any>({
      childrenPropName: 'children',
      valuePropName: 'code',
    });
    ds.parse(streetData);

    const dataSourceArr = ds.toDataSource();

    expect(dataSourceArr[0]).toHaveProperty('originalData');
    expect(dataSourceArr[0].value).not.toBe(null);
    expect(dataSourceArr[0].children.length).toBeGreaterThan(0);
  });

  test('非标准树状结构结构输出 DataSource 数据', () => {
    const ds = new DataSource<any>({
      childrenPropName: 'employee',
      valuePropName: 'id',
    });

    ds.parse(nonStandardData);

    const dataSourceArr = ds.toDataSource();

    expect(dataSourceArr[0]).toHaveProperty('originalData');
    expect(dataSourceArr[0]).toHaveProperty('value');
    expect(dataSourceArr[0]).toHaveProperty('children');
  });

  test('非标准树状结构结构输出原始结构', () => {
    const ds = new DataSource<any>({
      childrenPropName: 'employee',
      valuePropName: 'id',
    });

    ds.parse(nonStandardData);

    const dataSourceArr = ds.toData();

    expect(dataSourceArr[0]).toHaveProperty('id');
    expect(dataSourceArr[0]).toHaveProperty('employee');
    expect(dataSourceArr[0]).toHaveProperty('name');
  });
});
