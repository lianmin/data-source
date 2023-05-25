import DataSource from '../src';
import treeData from './data/tree';

type DataItemType = {
  value: string;
  label: string;
  children?: DataItemType[];
};

const genTree = () => {
  const ds = new DataSource<DataItemType>();
  ds.parse(treeData);
  return ds;
};

describe('格式化', () => {
  test('操作节点后, 获取最新的树状结构数据', () => {
    const ds = genTree();

    ds.remove('2');

    const data = ds.toData();

    expect(data).toHaveLength(2);
    expect(data[0].label).not.toBe(undefined);
    expect(data[0].value).not.toBe(undefined);
  });

  test('操作节点后, 获取扁平化后的数据', () => {
    const ds = genTree();

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
});
