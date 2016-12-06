# Cohere
Declaratively define a schema with types and their associations with other types, then compile.

```js
import Schema, { hasMany, hasOne, belongsTo } from 'cohere';

export const schema = new Schema()

  // create the user type
  .defineType('user', {
    attributes: {
      name: true,
      email: true,
    },
    relationships: {
      blogs: hasMany('blog', 'author'),
    },
  })

  // create the blog type
  .defineType('blog', {
    attributes: {
      title: true,
      content: true,
      createdOn: true,
    },
    relationships: {
      author: belongsTo('user', 'blogs'),
    },
  })

  // link types together and hydrate every relationship's inverse
  .compile();
```
