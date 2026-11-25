// Works in the browser (window.Calc) and in Node (require) so it can be unit-tested.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Calc = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  function check(attended, total, target) {
    if (![attended, total, target].every(Number.isFinite)) throw new Error('Numbers required');
    if (attended < 0 || total < 0 || attended > total) throw new Error('Invalid attendance counts');
    if (target <= 0 || target > 100) throw new Error('Target must be between 1 and 100');
  }

  function percentage(attended, total) {
    return total === 0 ? 0 : (attended / total) * 100;
  }

  // Classes you must attend IN A ROW to reach the target. Closed-form, no loop.
  function classesToRecover(attended, total, target = 75) {
    check(attended, total, target);
    if (percentage(attended, total) >= target) return 0;
    if (target === 100) return null; // impossible once a class is missed
    return Math.ceil((target * total - 100 * attended) / (100 - target));
  }

  // Classes you can still skip and stay at/above the target.
  function classesCanSkip(attended, total, target = 75) {
    check(attended, total, target);
    if (percentage(attended, total) < target) return 0;
    return Math.floor((100 * attended - target * total) / target);
  }

  return { percentage, classesToRecover, classesCanSkip };
});
