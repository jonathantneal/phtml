# pHTML [<img src="https://phtmlorg.github.io/phtml/logo.svg" alt="pHTML" width="90" height="90" align="right">][pHTML]

[![NPM Version][npm-img]][npm-url]
[![Build Status][cli-img]][cli-url]
[![Support Chat][git-img]][git-url]

[pHTML] is a tool for transforming HTML with JavaScript. Its plugin system
can lint your HTML, support variables and mixins, transpile future HTML syntax,
inline images, and more.

```js
import pHTML from 'phtml';

const html = `<component class="main">
  <title>Super Title</title>
  <text>Awesome Text</text>
</component>`;

pHTML.process(html, { from: 'component.html' }).then(console.log);

/* Result {
  from: 'component.html',
  to: 'component.html',
  root: Fragment {
    name: '#document-fragment',
    nodes: [
      Element {
        name: "component",
        attrs: {
          class: "main"
        },
        nodes: [
          Text "\n  ",
          Element {
            name: "title",
            nodes: [
              Text "Super Title"
            ]
          },
          Text "\n  ",
          Element {
            name: "text",
            nodes: [
              Text "Awesome Text"
            ]
          },
          Text "\n"
        ]
      }
    ]
  }
}
```

## Usage

Add [pHTML] to your build tool:

```bash
npm install phtml --save-dev
```

#### Node

Use [pHTML] to process your CSS:

```js
import pHTML from 'phtml';

pHTML.process(YOUR_HTML, /* processOptions */, /* pluginOrPlugins */);
```

#### Plugins

Add a [pHTML] Plugin to your build tool:

```bash
npm install phtml-some-thing --save-dev
```

```js
import pHTML from 'phtml';
import postHtmlSomeThing from 'phtml-some-thing';

pHTML.use(
  postHtmlSomeThing(/* pluginOptions */)
).process(YOUR_HTML);
```

#### Plugin Creation

```js
import { Plugin } from 'phtml';

export default new Plugin('phtml-plugin-name', pluginOptions => {
  // initialization logic

  return {
    Element(node, root) {
      // runtime logic
    }
  };
});
```

```js
import { Plugin } from 'phtml';

export default new Plugin('phtml-plugin-name', pluginOptions => {
  // initialization logic

  return (root, result) => {
    // runtime logic
  };
});
```

[cli-img]: https://img.shields.io/travis/phtmlorg/phtml.svg
[cli-url]: https://travis-ci.org/phtmlorg/phtml
[git-img]: https://img.shields.io/badge/support-chat-blue.svg
[git-url]: https://gitter.im/postcss/postcss
[npm-img]: https://img.shields.io/npm/v/phtml.svg
[npm-url]: https://www.npmjs.com/package/phtml

[pHTML]: https://github.com/phtmlorg/phtml
