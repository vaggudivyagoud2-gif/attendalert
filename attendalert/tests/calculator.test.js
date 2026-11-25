const Calc = require('../public/js/calculator');

describe('classesToRecover', () => {
  test('already above target -> 0', () => expect(Calc.classesToRecover(80, 100, 75)).toBe(0));
  test('10/20 to reach 75% needs 20', () => expect(Calc.classesToRecover(10, 20, 75)).toBe(20));
  test('result really reaches target', () => {
    const x = Calc.classesToRecover(31, 50, 75);
    expect(Calc.percentage(31 + x, 50 + x)).toBeGreaterThanOrEqual(75);
    expect(Calc.percentage(31 + x - 1, 50 + x - 1)).toBeLessThan(75);
  });
  test('target 100 after a miss is impossible', () => expect(Calc.classesToRecover(9, 10, 100)).toBeNull());
  test('no classes yet -> 0', () => expect(Calc.classesToRecover(0, 0, 75)).toBe(0));
  test('rejects attended > total', () => expect(() => Calc.classesToRecover(11, 10)).toThrow());
});

describe('classesCanSkip', () => {
  test('18/20 can skip 4', () => expect(Calc.classesCanSkip(18, 20, 75)).toBe(4));
  test('below target -> 0', () => expect(Calc.classesCanSkip(10, 20, 75)).toBe(0));
});
