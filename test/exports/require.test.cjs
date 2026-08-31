const assert = require('assert');
const c8 = require('tsds-c8');

describe('exports .cjs', () => {
  it('defaults', () => {
    assert.equal(typeof c8, 'function');
  });
});
