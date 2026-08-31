import assert from 'assert';
import c8 from 'tsds-c8';

describe('exports .mjs', () => {
  it('defaults', () => {
    assert.equal(typeof c8, 'function');
  });
});
