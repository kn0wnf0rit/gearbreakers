import { SKILL_TREES, getSkillTreesForCharacter, getSkillById } from '../../src/data/skills.js';

describe('Skill trees', () => {
  test('12 skill trees total (3 per character)', () => {
    expect(Object.keys(SKILL_TREES)).toHaveLength(12);
  });

  test('each tree has exactly 5 nodes', () => {
    for (const tree of Object.values(SKILL_TREES)) {
      expect(tree.nodes).toHaveLength(5);
    }
  });

  test('each node has required fields', () => {
    for (const tree of Object.values(SKILL_TREES)) {
      for (const node of tree.nodes) {
        expect(node.id).toBeDefined();
        expect(node.name).toBeDefined();
        expect(node.description).toBeDefined();
        expect(typeof node.chargeCost).toBe('number');
        expect(node.target).toBeDefined();
        expect(node.type).toBeDefined();
        expect(node.effect).toBeDefined();
      }
    }
  });

  test('passive skills have 0 charge cost', () => {
    for (const tree of Object.values(SKILL_TREES)) {
      for (const node of tree.nodes) {
        if (node.type === 'passive') {
          expect(node.chargeCost).toBe(0);
        }
      }
    }
  });

  test('all skill IDs are unique', () => {
    const ids = new Set();
    for (const tree of Object.values(SKILL_TREES)) {
      for (const node of tree.nodes) {
        expect(ids.has(node.id)).toBe(false);
        ids.add(node.id);
      }
    }
  });
});

describe('getSkillTreesForCharacter', () => {
  test('returns 3 trees for each character', () => {
    for (const charId of ['sable', 'rook', 'pip', 'vesper']) {
      const trees = getSkillTreesForCharacter(charId);
      expect(trees).toHaveLength(3);
      trees.forEach(tree => expect(tree.character).toBe(charId));
    }
  });
});

describe('getSkillById', () => {
  test('finds existing skill', () => {
    const skill = getSkillById('ignite');
    expect(skill).toBeDefined();
    expect(skill.name).toBe('Ignite');
    expect(skill.treeId).toBe('pyrokinetic');
  });

  test('returns null for nonexistent skill', () => {
    expect(getSkillById('nonexistent')).toBeNull();
  });
});
