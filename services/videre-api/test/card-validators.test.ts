import assert from 'node:assert/strict';
import test from 'node:test';

import { normalizeCardRarity } from '../src/db/validators/cards.ts';

test('card rarity validation uses generated catalog values plus API syntax aliases', () => {
  assert.equal(normalizeCardRarity('m'), 'mythic');
  assert.equal(normalizeCardRarity('mythic-rare'), 'mythic');
  assert.equal(normalizeCardRarity('basic'), 'basic land');
  assert.equal(normalizeCardRarity('token'), 'token');
  assert.equal(normalizeCardRarity('nonsense'), undefined);
});
