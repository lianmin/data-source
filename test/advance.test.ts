import DataSource, { Node } from '../src/index';
import provinceData from './test-data/province';

describe('高阶处理', () => {
  const dsTree = new DataSource(provinceData);

  test('查找任意节点', () => {
    const node = dsTree.find('110102');
    expect(node!.data!.label).toBe('西城区');
  });

  test('查找任意节点-fn', () => {
    const node = dsTree.find((node: Node) => {
      return node.data.label === '西城区';
    });
    expect(node!.data!.label).toBe('西城区');
  });

  test('获取父级节点', () => {
    const node = dsTree.find('110102');
    const parents = dsTree.parents(node);

    expect(parents[0].value).toBe('110100');
    expect(parents[1].value).toBe('110000');
  });
});
