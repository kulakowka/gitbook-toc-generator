# gitbook-toc-generator

Default it is utility for generate table of contents for [feathers.js](http://feathersjs.com/) [documentation](http://docs.feathersjs.com/).

But it can be used to create the table of contents of any other [gitbooks](https://www.gitbook.com/).

### First step. 

This creates a file `data.json` containing the table of contents scheme.

```
npm run createJsonTree
```

### Two step.

This creates a file `contents.md` containing the table of contents in markdown syntax.

```
npm run createMarkdown
```


### Create the table of contents for custom gitbook

Here's how you can make a table of contents for your gitbook. 

```
GITBOOK_URL=https://kulakowka.gitbooks.io/feathers-api-demo/content npm run createJsonTree
```


