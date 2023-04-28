import DataSource from '../src/index';
import province from './test-data/province';

describe('遍历', () => {
  const dsTree = new DataSource(province);

  test('遍历所有叶子节点', () => {
    const arr: any = [];
    dsTree.traverse((node) => {
      if (node.isLeaf) {
        arr.push(node);
      }
    });
    expect(arr.length).toBe(3275);
  });

  test('获取一级节点', () => {
    const arr: any = [];
    dsTree.traverse((node) => {
      if (dsTree.depth(node) === 2) {
        arr.push(node);
      }
    });
    expect(arr.length).toBe(province.length);
  });
});
