import PHTML from '.';
import test from './.tape.test';

const { Comment, Element, Fragment, Node, NodeList, Plugin, Result, Text } = PHTML;

async function tests() {
	const processOptions = { from: 'test.html' };
	const html = `<section>
	<h1>Hello World</h1>
	<p class="foo" bar-qux="lorem" />
</section><section>
	<h1>Hello World</h1>
	<p class="foo" bar-qux="lorem" />
</section><section>
	<h1>Hello World</h1>
	<p class="foo" bar-qux="lorem" />
</section>`;

	const fragment = (new Result(html, processOptions)).root;

	/* Test Container
	/* ====================================================================== */

	await test('Container#append is a Function', () => fragment.append instanceof Function);
	await test('Container#replaceAll is a Function', () => fragment.replaceAll instanceof Function);
	await test('Container#first is a Node', () => fragment.first instanceof Node);
	await test('Container#firstElement is an Element', () => fragment.firstElement instanceof Element);
	await test('Container#last is a Node', () => fragment.last instanceof Node);
	await test('Container#lastElement is an Element', () => fragment.lastElement instanceof Element);
	await test('Container#nth is a Function', () => fragment.nth instanceof Function);
	await test('Container#lastNth is a Function', () => fragment.lastNth instanceof Function);
	await test('Container#nthElement is a Function', () => fragment.nthElement instanceof Function);
	await test('Container#lastNthElement is a Function', () => fragment.lastNthElement instanceof Function);
	await test('Container#walk is a Function', () => fragment.walk instanceof Function);
	await test('Node#before is a Function', () => fragment.before instanceof Function);
	await test('Node#after is a Function', () => fragment.after instanceof Function);
	await test('Container#nodes is a NodeList', () => fragment.nodes instanceof NodeList);
	await test('Container#nodes is an Array', () => fragment.nodes instanceof Array);
	await test('Container#elements is a NodeList', () => fragment.elements instanceof NodeList);
	await test('Container#elements is an Array', () => fragment.elements instanceof Array);
	await test('Container#nth(0) is Container#first', () => fragment.nth(0) === fragment.first);
	await test('Container#lastNth(0) is Container#last', () => fragment.lastNth(0) === fragment.last);
	await test('Container#nthElement(0) is Container#firstElement', () => fragment.nthElement(0) === fragment.firstElement);
	await test('Container#lastElement(0) is Container#lastElement', () => fragment.lastNth(0) === fragment.lastElement);

	let expectedNodes = 0;
	fragment.walk(el => {
		++expectedNodes;
	});
	await test('Container#walk works as expected', () => expectedNodes === 21);

	let expectedElements = 0;
	fragment.walk('*', el => {
		++expectedElements;
	});
	await test('Container#walk "*" filter works as expected', () => expectedElements === 9);

	let expectedWalks = 0;
	fragment.walk('section', el => {
		++expectedWalks;
	});
	await test('Container#walk "section" works as expected', () => expectedWalks === 3);

	let expectedHP = 0;
	fragment.walk(/h|p/, el => {
		++expectedHP;
	});
	await test('Container#walk /h|p/ works as expected', () => expectedHP === 6);

	let expectedSections = 0;
	fragment.walk(el => el.name === 'section', el => {
		++expectedSections;
	});
	await test('Container#walk (el => el.name === "section") works as expected', () => expectedSections === 3);

	/* Test Comment
	/* ====================================================================== */

	const comment = (new Result(`<!--test   -->`, processOptions)).root.first;

	await test('Comment', () => comment instanceof Comment);
	await test('Comment#comment', () => comment.comment === 'test   ');
	await test('Comment#innerHTML', () => comment.innerHTML === 'test   ');
	await test('Comment#outerHTML', () => comment.outerHTML === '<!--test   -->');
	await test('Comment#sourceInnerHTML', () => comment.sourceInnerHTML === 'test   ');
	await test('Comment#sourceOuterHTML', () => comment.sourceOuterHTML === '<!--test   -->');

	/* Test Element
	/* ====================================================================== */

	const selfClosing = (new Result(`<section ...{weird}   />`, processOptions).root).first;

	await test('Element(selfClosing)#isSelfClosing', () => selfClosing.isSelfClosing === true);
	await test('Element(selfClosing)#innerHTML', () => selfClosing.innerHTML === '');
	await test('Element(selfClosing)#outerHTML', () => selfClosing.outerHTML === '<section ...{weird}   />');
	await test('Element(selfClosing)#sourceInnerHTML', () => selfClosing.sourceInnerHTML === '');
	await test('Element(selfClosing)#sourceOuterHTML', () => selfClosing.sourceOuterHTML === '<section ...{weird}   />');

	await test('Element(selfClosing)#isSelfClosing', () => selfClosing.isSelfClosing === true);

	const duplicateAttributes1 = (new Result('<section class class />', processOptions).root).first;
	const duplicateAttributes2 = (new Result('<section class="foo" class="bar" />', processOptions).root).first;

	await test('Element(duplicateAttributes) contains duplicate attributes', () => duplicateAttributes1.attrs.length === 2 && duplicateAttributes1.attrs[0].value === duplicateAttributes1.attrs[1].value);
	await test('Element(duplicateAttributes) contains duplicate attributes', () => duplicateAttributes2.attrs.length === 2 && duplicateAttributes2.attrs[0].value === 'foo' && duplicateAttributes2.attrs[1].value === 'bar');

	const mutatedAttributes1 = (new Result('<section class="foo" />', processOptions).root).first;
	const mutatedAttributes1OriginalAttr = mutatedAttributes1.attrs[0];
	const mutatedAttributes1OriginalAttrValue = mutatedAttributes1OriginalAttr.value;

	mutatedAttributes1.attrs.add({ id: 'foo', class: 'bar' });

	await test('Element(mutatedAttributes) mutated attributes', () => mutatedAttributes1.attrs.length === 2);
	await test('Element(mutatedAttributes) mutated a specific attribute', () => mutatedAttributes1OriginalAttr.value !== mutatedAttributes1OriginalAttrValue);

	mutatedAttributes1.attrs.toggle('id');

	await test('Element(mutatedAttributes) toggled a specific attribute off', () => mutatedAttributes1.attrs.length === 1 && mutatedAttributes1.attrs.contains('id') === false);

	mutatedAttributes1.attrs.toggle('id', 'foo');

	await test('Element(mutatedAttributes) toggled a specific attribute on', () => mutatedAttributes1.attrs.length === 2 && mutatedAttributes1.attrs.contains('id') === true);

	const original = (new Result(`<p>Hello World</p>`, processOptions)).root;
	const clone = original.clone(true);

	/* Test Container Clone
	/* ====================================================================== */

	await test('Container(clone) is not the original', () => original !== clone);
	await test('Container(clone) matches the original', () => original.outerHTML === clone.outerHTML && original.innerHTML === clone.innerHTML);

	await test('Container(clone).first.first is Text', () => clone.first.first instanceof Text);
	await test('set Container(clone).first.first.data', () => clone.first.first.data = 'Goodbye Earth');
	await test('get Container(clone).outerHTML', () => clone.outerHTML === '<p>Goodbye Earth</p>');

	/* Test Process
	/* ====================================================================== */

	const pHTML1 = new PHTML();
	const result1 = await pHTML1.process(html);

	await test('new PHTML().process() returns a Result', () => result1 instanceof Result);
	await test('new PHTML().process().html returns a String', () => typeof result1.html === 'string');
	await test('new PHTML().process().root returns a Fragment', () => result1.root instanceof Fragment);

	const result2 = await PHTML.process(html);

	await test('PHTML.process() returns a Result', () => result2 instanceof Result);
	await test('PHTML.process().html returns a String', () => typeof result2.html === 'string');
	await test('PHTML.process().root returns a Fragment', () => result2.root instanceof Fragment);

	/* Test Plugins
	/* ====================================================================== */

	let pHTMLPluginTest1 = false;
	let pHTMLPluginTest2 = false;

	const pHTMLTestPlugin1 = new Plugin('phtml-test', opt => {
		pHTMLPluginTest1 = opt;

		return () => {
			pHTMLPluginTest2 = opt;
		}
	});

	await pHTMLTestPlugin1.process(html, {}, true);

	await test('Plugin: Plugin#process', () => pHTMLPluginTest1 === true && pHTMLPluginTest2 === true);

	pHTMLPluginTest1 = false;
	pHTMLPluginTest2 = false;

	const pHTMLInstanceWithPlugin = new PHTML([
		pHTMLTestPlugin1(true)
	]);

	await test('Plugin: Pre-Process', () => pHTMLPluginTest1 === true && pHTMLPluginTest2 !== true);

	await pHTMLInstanceWithPlugin.process(html);

	await test('Plugin: Post-Process', () => pHTMLPluginTest1 === true && pHTMLPluginTest2 === true);

	/* Test Plugins
	/* ====================================================================== */

	let working = false;
	const pHTML3 = new PHTML([
		root => {
			working = null;
		},
		root => {
			working = working === null ? true : working;
		}
	]);
	const result3 = await pHTML3.process(html);

	await test('pHTML Plugins are run in order', () => working === true);

	/* Test Result Current Plugin
	/* ====================================================================== */

	let isCurrentPluginCurrentPlugin = false;

	const plugin4 = (root, result) => {
		isCurrentPluginCurrentPlugin = result.currentPlugin === plugin4;
	};

	const pHTML4 = new PHTML([ plugin4 ]);

	await pHTML4.process(html);

	await test('Plugin: result.currentPlugin', () => isCurrentPluginCurrentPlugin);

	/* Test Plugin Warnings
	/* ====================================================================== */

	const plugin5 = (root, result) => {
		root.warn(result, 'Something went wrong');
		root.warn(result, 'Something else went wrong');
	};

	const pHTML5 = new PHTML([ plugin5 ]);

	const result = await pHTML5.process(html);

	await test('Plugin: Node#warn, Result: warnings', () => result.warnings.length === 2);

	/* Test Plugin Object
	/* ====================================================================== */

	let remainingObservers6 = 13;

	const plugin6 = {
		beforeElement() {
			--remainingObservers6;
		},
		PElement(element) {
			--remainingObservers6;
		},
		Root() {
			--remainingObservers6;
		}
	};

	const pHTML6 = new PHTML([ plugin6 ]);

	const result6 = await pHTML6.process(html);

	await test('Plugin: Element with Observers', () => !remainingObservers6);

	/* Test Plugin Object
	/* ====================================================================== */

	let remainingObservers7 = 13;

	const plugin7a = {
		beforeElement(node) {
			--remainingObservers7;
		},
		PElement(element) {
			--remainingObservers7;
		},
		Root() {
			--remainingObservers7;
		}
	};

	const plugin7b = async root => {
		if (remainingObservers7) {
			throw new Error('incorrect observer count');
		} else {
			remainingObservers7 = 13;
		}

		await root.observe();
	};

	const pHTML7 = new PHTML([ plugin7a, plugin7b ]);

	const result7 = await pHTML7.process(html);

	await test('Plugin: Element with Observers and Functions', () => !remainingObservers7);
}

tests();
