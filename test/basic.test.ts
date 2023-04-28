import DataSource from '../src/index';

describe('初始化', () => {
  const dsTree = new DataSource([]);

  test('转换数组', () => {
    const arr = dsTree.toData();
    expect(arr!.length).toBe(0);
  });

  test('判断空', () => {
    const isEmpty = dsTree.isEmpty();
    expect(isEmpty).toBe(true);
  });

  test('插入节点', () => {
    dsTree.insert({
      value: 1,
      label: 1,
    });

    const arr = dsTree.toData();
    expect(arr!.length).toBe(1);
  });

  test('判断非空', () => {
    expect(dsTree.isEmpty()).toBe(false);
  });

  test('转换数组, 得到具体值', () => {
    const arr = dsTree.toData();
    expect(arr!.length).toBe(1);
  });
});
