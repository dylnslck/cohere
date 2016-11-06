const ensureValidArgs = (name, inverse, options) => {
  if (typeof name !== 'string') {
    throw new TypeError('Argument "name" must be a string.');
  }

  if (typeof inverse !== 'string') {
    throw new TypeError('Argument "inverse" must be a string.');
  }

  if (typeof options !== 'object') {
    throw new TypeError('Argument "options" must be an object.');
  }
};

export const relationship = (relation) => (name, inverse, options = {}) => {
  if (!['belongsTo', 'hasOne', 'hasMany'].includes(relation)) {
    throw new Error(
      'Argument "relation" must be either "belongsTo", "hasOne", or "hasMany", instead got ' +
      `"${relation}"`
    );
  }

  ensureValidArgs(name, inverse, options);

  return (field) => ({
    ...options,
    inverse: { name: null, relation: null, field: inverse },
    relation,
    name,
    field,
  });
};

export const hasMany = relationship('hasMany');
export const belongsTo = relationship('belongsTo');
export const hasOne = relationship('hasOne');
