const ensureUniqueFields = (attributes = {}, relationships = {}) => {
  const attributesFields = Object.keys(attributes);
  const relationshipsFields = Object.keys(relationships);

  if (attributesFields.some(field => relationshipsFields.includes(field))) {
    throw new Error('Attribute field names and relationship field names must be unique.');
  }
};

export default class Type {
  constructor(name, fields = {}) {
    if (typeof name !== 'string') {
      throw new TypeError('Argument "name" must be a valid string.');
    }

    if (!(fields && typeof fields === 'object')) {
      throw new TypeError('Argument "fields" must be a valid object.');
    }

    ensureUniqueFields(fields.attributes, fields.relationships);

    this.name = name;
    this.meta = fields.meta || {};
    this._attributes = fields.attributes || {};
    this._relationships = fields.relationships || {};

    this._relationships = Object.keys(this._relationships).reduce((prev, field) => {
      const relationship = this._relationships[field];

      if (typeof relationship !== 'function') {
        throw new TypeError(
          `Tried registering the "${name}" type's "${field}" relationship, but it wasn't a ` +
          'function. Please use either the "hasMany", "belongsTo", or "hasOne" relationship ' +
          'function.'
        );
      }

      return {
        ...prev,
        [field]: relationship(field),
      };
    }, {});
  }

  hasAttribute(field) {
    return this._attributes.hasOwnProperty(field);
  }

  hasRelationship(field) {
    return this._relationships.hasOwnProperty(field);
  }

  attribute(field) {
    return this.attributes[field] || null;
  }

  relationship(field) {
    return this.relationships[field] || null;
  }

  hydrateInverse(field, { name, relation }) {
    if (!this.relationship(field)) {
      throw new Error(
        `Tried to hydrate the "${this.name}" type's "${field}" inverse, but "${field}" is not a ` +
        'valid relationship.'
      );
    }

    const relationship = this.relationship(field);

    if (!relationship.inverse.isHydrated) {
      this._relationships[field].inverse = {
        ...relationship.inverse,
        isHydrated: true,
        name,
        relation,
      };
    }
  }

  get attributes() {
    const attributes = this._attributes;

    return {
      ...attributes,

      forEach(fn) {
        Object.keys(attributes).forEach(field => fn({
          type: attributes[field],
          field,
        }));
      },

      reduce(fn, initialValue) {
        return Object.keys(attributes).reduce((init, field) => fn(init, {
          type: attributes[field],
          field,
        }), initialValue);
      },

      ...['map', 'some', 'every', 'filter', 'find'].reduce((accumulator, iterator) => ({
        ...accumulator,
        [iterator]: (fn) => (
          Object.keys(attributes)[iterator]((field, ...args) =>
            fn(attributes[field], ...args))
        ),
      }), {}),
    };
  }

  get relationships() {
    const relationships = this._relationships;

    return {
      ...relationships,

      forEach(fn) {
        Object.keys(relationships).forEach(field => fn(relationships[field]));
      },

      reduce(fn, initialValue) {
        return Object.keys(relationships).reduce((init, field) =>
          fn(init, relationships[field]), initialValue);
      },

      ...['map', 'some', 'every', 'filter', 'find'].reduce((accumulator, iterator) => ({
        ...accumulator,
        [iterator]: (fn) => (
          Object.keys(relationships)[iterator]((field, ...args) =>
            fn(relationships[field], ...args))
        ),
      }), {}),
    };
  }
}
