# redink-schema
Simple class for building Redink schemas.
```js
import schema, { hasMany, hasOne, belongsTo } from 'redink-schema';

const user = schema('user', {
  attributes: {
    name: true,
    email: true,
  },
  relationships: {
    blogs: hasMany('blog', 'author'),
  },
});

const blog = schema('blog', {
  attributes: {
    title: true,
    content: true,
    createdOn: true,
  },
  relationships: {
    author: belongsTo('user', 'blogs'),
  },
});
```
