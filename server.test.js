const test = require('node:test');
const assert = require('node:assert/strict');
const { searchUsers } = require('./server');

test('returns users matching every supplied criterion', () => {
  assert.deepEqual(searchUsers({ team: 'engineering', firstName: 'pi' }), [
    {
      lastName: 'Wisniewski',
      firstName: 'Piotr',
      team: 'Engineering',
      landlineNumber: '+48 22 100 10 12',
      mobileNumber: '+48 600 100 102',
      internalExtension: '201',
    },
  ]);
});

test('returns all users for an empty search', () => {
  assert.equal(searchUsers({}).length, 5);
});

test('supports searches against phone fields', () => {
  assert.equal(searchUsers({ internalExtension: '30' })[0].firstName, 'Tomasz');
});
