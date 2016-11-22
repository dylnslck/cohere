import Type from './Type';

export default class Schema {
  isCompiled = false
  _types = {}

  constructor(name = '') {
    this.name = name;
  }

  defineType(name, fields) {
    if (Object.keys(this.types).includes(name)) {
      throw new Error(`The "${name}" type has already been defined.`);
    }

    this._types[name] = new Type(name, fields);
    return this;
  }

  compile() {
    // hydrate every inverse
    this.types.forEach(type => {
      const { name } = type;

      type.relationships.forEach(relationship => {
        const { inverse, relation, field, name: relatedName } = relationship;

        if (!this.types[relatedName]) {
          throw new Error(
            `Could not compile the schema, because the "${name}" type's "${field}" ` +
            `relationship has a name "${relatedName}", which has not been defined. Try running ` +
            `schema.defineType(${relatedName}, { ... }).`
          );
        }

        this.types[relatedName].hydrateInverse(inverse.field, {
          name: relatedName,
          relation,
        });
      });
    });

    // link types together
    this.types.forEach(type => {
      type.relationships.forEach(relationship => {
        relationship.type = this.types[relationship.name]; // eslint-disable-line
      });
    });

    this.isCompiled = true;
    return this;
  }

  get types() {
    const types = this._types;

    return {
      ...types,

      forEach(fn) {
        Object.keys(types).forEach(name => fn(types[name]));
      },

      reduce(fn, initialValue) {
        return Object.keys(types).reduce((init, name) => fn(init, types[name]), initialValue);
      },

      ...['map', 'some', 'every', 'filter', 'find'].reduce((accumulator, iterator) => ({
        ...accumulator,
        [iterator]: (fn) => (
          Object.keys(types)[iterator]((name, ...args) => fn(types[name], ...args))
        ),
      }), {}),
    };
  }
}
