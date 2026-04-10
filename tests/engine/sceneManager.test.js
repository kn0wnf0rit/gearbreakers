import { SceneManager } from '../../src/engine/sceneManager.js';

describe('SceneManager', () => {
  let sm;

  beforeEach(() => {
    sm = new SceneManager();
  });

  function makeScene(name, opts = {}) {
    return {
      name,
      calls: [],
      transparent: opts.transparent || false,
      onEnter() { this.calls.push('enter'); },
      onExit() { this.calls.push('exit'); },
      onPause() { this.calls.push('pause'); },
      onResume() { this.calls.push('resume'); },
      update(dt) { this.calls.push('update'); },
      render(r) { this.calls.push('render'); }
    };
  }

  test('starts with no scenes', () => {
    expect(sm.current).toBeNull();
    expect(sm.size).toBe(0);
  });

  test('push adds scene and calls onEnter', () => {
    const scene = makeScene('test');
    sm.push(scene);
    expect(sm.current).toBe(scene);
    expect(sm.size).toBe(1);
    expect(scene.calls).toContain('enter');
  });

  test('push pauses previous scene', () => {
    const s1 = makeScene('s1');
    const s2 = makeScene('s2');
    sm.push(s1);
    sm.push(s2);
    expect(s1.calls).toContain('pause');
    expect(sm.current).toBe(s2);
  });

  test('pop removes top scene and calls lifecycle hooks', () => {
    const s1 = makeScene('s1');
    const s2 = makeScene('s2');
    sm.push(s1);
    sm.push(s2);
    const popped = sm.pop();
    expect(popped).toBe(s2);
    expect(s2.calls).toContain('exit');
    expect(s1.calls).toContain('resume');
    expect(sm.current).toBe(s1);
  });

  test('replace swaps top scene', () => {
    const s1 = makeScene('s1');
    const s2 = makeScene('s2');
    sm.push(s1);
    sm.replace(s2);
    expect(s1.calls).toContain('exit');
    expect(s2.calls).toContain('enter');
    expect(sm.current).toBe(s2);
    expect(sm.size).toBe(1);
  });

  test('update calls current scene update', () => {
    const scene = makeScene('test');
    sm.push(scene);
    scene.calls = [];
    sm.update(16, {});
    expect(scene.calls).toContain('update');
  });

  test('render calls current scene render', () => {
    const scene = makeScene('test');
    sm.push(scene);
    scene.calls = [];
    sm.render({});
    expect(scene.calls).toContain('render');
  });

  test('transparent scenes cause scenes below to render', () => {
    const s1 = makeScene('s1');
    const s2 = makeScene('s2', { transparent: true });
    sm.push(s1);
    sm.push(s2);
    s1.calls = [];
    s2.calls = [];
    sm.render({});
    expect(s1.calls).toContain('render');
    expect(s2.calls).toContain('render');
  });

  test('clear removes all scenes', () => {
    sm.push(makeScene('s1'));
    sm.push(makeScene('s2'));
    sm.clear();
    expect(sm.size).toBe(0);
    expect(sm.current).toBeNull();
  });
});
