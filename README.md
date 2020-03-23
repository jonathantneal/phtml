# phtml [<img src="https://phtml.io/logo.svg" alt="phtml" width="90" height="90" align="right">][phtml]

[![NPM Version][npm-img]][npm-url]
[![Build Status][cli-img]][cli-url]
[![Support Chat][git-img]][git-url]

[phtml] is a tool for transforming HTML with JavaScript.

It fully embraces the HTML language, and aims to help you write and maintain
HTML that you _and future you_ feel good about.

phtml helps you compose [reusable templates and components](https://github.com/phtmlorg/phtml-template),
or automate [image size attributes](https://github.com/phtmlorg/phtml-image-size)
and [schema.org microdata](https://github.com/phtmlorg/phtml-schema) and [heading levels](https://github.com/phtmlorg/phtml-h-element),
or transform modern [CSS with PostCSS](https://github.com/phtmlorg/phtml-css)
and [JS with Babel](https://github.com/phtmlorg/phtml-js).

It works in the command line and Node, but also [Grunt], [Gulp],
[<abbr title="Eleventy">11ty</abbr>][11ty], [Webpack], [Rollup], and even
[the browser itself][browser].

## Usage

Transform HTML files directly from the command line:

```bash
npx phtml source.html output.html
```

Include plugins directly from the command line:

```bash
npx phtml source.html output.html -p @phtml/markdown,@phtml/image-alt
```

Transform strings from the command line:

```bash
echo "<h1 md>phtml **Markdown**</h1>" | npx phtml -p @phtml/markdown

# <h1>phtml <strong>Markdown</strong></h1>
```

### Node

Add [phtml] to your build tool:

```bash
npm install phtml --save-dev
```

Use [phtml] to process your CSS:

```js
const phtml = require('phtml');

phtml.process(YOUR_HTML, /* processOptions */, /* pluginOrPlugins */);
```

#### Node Example

```js
const phtml = require('phtml');

const html = `<my-component class="main">
  <title>Super Title</title>
  <text>Awesome Text</text>
</my-component>`;

phtml.process(html, { from: 'my-component.html' }).then(console.log);

/* Result {
  from: 'component.html',
  to: 'component.html',
  root: Fragment {
    name: '#document-fragment',
    nodes: NodeList [
      Element {
        name: "my-component",
        attrs: AttributeList [
          { name: "class", value: "main" }
        ],
        nodes: NodeList [
          Text "\n  ",
          Element {
            name: "title",
            nodes: NodeList [
              Text "Super Title"
            ]
          },
          Text "\n  ",
          Element {
            name: "text",
            nodes: NodeList [
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

#### Using Plugins in Node

Add a [phtml] Plugin to your build tool:

```bash
npm install phtml-some-thing --save-dev
```

```js
const phtml = require('phtml');
const postHtmlSomeThing = require('phtml-some-thing');

phtml.use(
  postHtmlSomeThing(/* pluginOptions */)
).process(YOUR_HTML);
```

## Plugins

You can find phtml plugins on npm.

https://www.npmjs.com/search?q=keywords:phtml-plugin

### Plugin Creation

Create plugins directly from the command line:

```bash
npm init phtml-plugin

# Plugin Name: Example (becomes `phtml Hello` / `phtml-hello`)
# Keywords: awesome,blossom (added to package.json keywords)
```

Once the command finishes, a new plugin is fully scaffolded with bare
functionality, documentation, and tests. Within the plugin directory,
functionality is added to `src/index.js`.

#### Advanced Plugin Creation

Create plugins using a new `Plugin` class:

```js
import phtml from 'phtml';

export default new phtml.Plugin('phtml-hello', pluginOptions => {
	// initialization logic

  return {
    Element(element, result) {
      // runtime logic, do something with an element
    },
    Root(root, result) {
      // runtime logic, do something with the root
    }
  };
});
```

The runtime plugin can visit nodes as they are entered or exited.

## Browser Usage

phtml works in the browser, which may be great for experimentation:

```html
<script src="https://unpkg.com/phtml"></script>
<script>
const html = `<my-component class="main">
  <title>Super Title</title>
  <text>Awesome Text</text>
</my-component>`;

phtml.process(html, { from: 'my-component.html' }).then(console.log);
</script>
```

Note that the browser version of phtml is 52 kB because it includes its own
HTML parser, [parse5].

[cli-img]: https://img.shields.io/travis/phtmlorg/phtml.svg
[cli-url]: https://travis-ci.org/phtmlorg/phtml
[git-img]: https://img.shields.io/badge/support-chat-blue.svg
[git-url]: https://gitter.im/postcss/postcss
[npm-img]: https://img.shields.io/npm/v/phtml.svg
[npm-url]: https://www.npmjs.com/package/phtml

[11ty]: https://github.com/phtmlorg/phtml-11ty
[browser]: https://unpkg.com/phtml/
[Grunt]: https://github.com/phtmlorg/grunt-phtml
[Gulp]: https://github.com/phtmlorg/gulp-phtml
[parse5]: https://github.com/inikulin/parse5
[phtml]: https://github.com/phtmlorg/phtml
[Rollup]: https://github.com/phtmlorg/rollup-plugin-phtml
[Webpack]: https://github.com/phtmlorg/phtml-loader
