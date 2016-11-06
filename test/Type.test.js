import test from 'ava';
import { hasMany } from '../src';
import Type from '../src/Type';

test('should compile relationships immediately', async t => {
  const user = new Type('user', {
    attributes: {
      name: true,
    },
    relationships: {
      blogs: hasMany('blog', 'author'),
    },
  });

  const requiredKeys = ['inverse', 'relation', 'name', 'field'];

  user.relationships.forEach(relationship => {
    const actualKeys = Object.keys(relationship).filter(key => requiredKeys.includes(key));

    t.is(typeof relationship, 'object');
    t.is(requiredKeys.sort().join(), actualKeys.sort().join());
  });

  t.truthy(user.attribute('name'));
  t.truthy(user.hasAttribute('name'));
  t.truthy(user.hasRelationship('blogs'));
});

test('should hydrate the inverse', async t => {
  const user = new Type('user', {
    attributes: {},
    relationships: {
      blogs: hasMany('blog', 'author'),
    },
  });

  t.deepEqual(user.relationship('blogs').inverse, {
    name: null,
    relation: null,
    field: 'author',
  });

  user.hydrateInverse('blogs', {
    name: 'user',
    relation: 'belongsTo',
  });

  t.deepEqual(user.relationship('blogs').inverse, {
    name: 'user',
    relation: 'belongsTo',
    field: 'author',
    isHydrated: true,
  });
});
