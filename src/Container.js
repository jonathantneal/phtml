import Node from './Node';

/**
* @name Container
* @class
* @extends Node
* @classdesc Return a new {@link Container} {@link Node}.
* @returns {Container}
*/
class Container extends Node {
	/**
	* Return the first child {@link Node} of the current {@link Container}, or `null` if there is none.
	* @returns {Node|Null}
	* @example
	* container.first // returns a Node or null
	*/
	get first () {
		return this.nodes && this.nodes[0] || null;
	}

	/**
	* Return the first child {@link Element} of the current {@link Container}, or `null` if there is none.
	* @returns {Node|Null}
	* @example
	* container.firstElement // returns an Element or null
	*/
	get firstElement () {
		return this.nodes && this.nodes.find(hasNodes) || null;
	}

	/**
	* Return the last child {@link Node} of the current {@link Container}, or `null` if there is none.
	* @returns {Node|Null}
	* @example
	* container.last // returns a Node or null
	*/
	get last () {
		return this.nodes && this.nodes[this.nodes.length - 1] || null;
	}

	/**
	* Return the last child {@link Element} of the current {@link Container}, or `null` if there is none.
	* @returns {Node|Null}
	* @example
	* container.lastElement // returns an Element or null
	*/
	get lastElement () {
		return this.nodes && this.nodes.slice().reverse().find(hasNodes) || null;
	}

	/**
	* Return a child {@link Element} {@link NodeList} of the current {@link Container}.
	* @returns {Array}
	* @example
	* container.elements // returns an array of Elements
	*/
	get elements () {
		return this.nodes && this.nodes.filter(hasNodes) || [];
	}

	/**
	* Return the innerHTML of the current {@link Container} as a String.
	* @returns {String}
	* @example
	* container.innerHTML // returns a string of innerHTML
	*/
	get innerHTML () {
		return String(this.nodes);
	}

	/**
	* Return the outerHTML of the current {@link Container} as a String.
	* @returns {String}
	* @example
	* container.outerHTML // returns a string of outerHTML
	*/
	get outerHTML () {
		return String(this);
	}

	/**
	* Return a child {@link Node} of the current {@link Container} by last index, or `null` if there is none.
	* @returns {Node|Null}
	* @example
	* container.lastNth(0) // returns a Node or null
	*/
	lastNth (index) {
		return this.nodes && this.nodes.slice().reverse()[index] || null;
	}

	/**
	* Return a child {@link Element} of the current {@link Container} by last index, or `null` if there is none.
	* @returns {Element|Null}
	* @example
	* container.lastNthElement(0) // returns an Element or null
	*/
	lastNthElement (index) {
		return this.nodes && this.elements.reverse()[index] || null;
	}

	/**
	* Return a child {@link Node} of the current {@link Container} by index, or `null` if there is none.
	* @returns {Node|Null}
	* @example
	* container.nth(0) // returns a Node or null
	*/
	nth (index) {
		return this.nodes && this.nodes[index] || null;
	}

	/**
	* Return an {@link Element} child of the current Container by index, or `null` if there is none.
	* @returns {Element|Null}
	* @example
	* container.nthElement(0) // returns an Element or null
	*/
	nthElement (index) {
		return this.nodes && this.elements[index] || null;
	}

	/**
	* Replace all of the children of the current {@link Container}.
	* @param {...Node} nodes - Any nodes replacing the current children of the {@link Container}.
	* @returns {Container} - The current {@link Container}.
	* @example
	* container.replaceAll(new Text({ data: 'Hello World' }))
	*/
	replaceAll (...nodes) {
		if (this.nodes) {
			this.nodes.splice(0, this.nodes.length, ...nodes);
		}

		return this;
	}

	/**
	* Traverse the descendant {@link Node}s of the current {@link Container} with a callback function.
	* @param {Function|String|RegExp} callback_or_filter - A callback function, or a filter to reduce {@link Node}s the callback is applied to.
	* @param {Function|String|RegExp} callback - A callback function when a filter is also specified.
	* @returns {Container} - The current {@link Container}.
	* @example
	* container.walk(node => {
	*   console.log(node);
	* })
	* @example
	* container.walk('*', node => {
	*   console.log(node);
	* })
	* @example <caption>Walk only "section" {@link Element}s.</caption>
	* container.walk('section', node => {
	*   console.log(node); // logs only Section Elements
	* })
	* @example
	* container.walk(/^section$/, node => {
	*   console.log(node); // logs only Section Elements
	* })
	* @example
	* container.walk(
	*   node => node.name.toLowerCase() === 'section',
	*   node => {
	*   console.log(node); // logs only Section Elements
	* })
	* @example <caption>Walk only {@link Text}.</caption>
	* container.walk('#text', node => {
	*   console.log(node); // logs only Text Nodes
	* })
	*/
	walk () {
		const [ cb, filter ] = getCbAndFilterFromArgs(arguments);

		walk(this, cb, filter);

		return this;
	}
}

function walk (node, cb, filter) {
	if (typeof cb === 'function' && node.nodes) {
		node.nodes.slice(0).forEach(child => {
			if (child.parent === node) {
				if (testWithFilter(child, filter)) {
					cb(child); // eslint-disable-line callback-return
				}

				if (child && child.nodes) {
					walk(child, cb, filter);
				}
			}
		});
	}
}

function getCbAndFilterFromArgs (args) {
	const [ cbOrFilter, onlyCb ] = args;
	const cb = onlyCb || cbOrFilter;
	const filter = onlyCb ? cbOrFilter : undefined;

	return [cb, filter];
}

function testWithFilter (node, filter) {
	if (!filter) {
		return true;
	} else if (filter === '*') {
		return Object(node).constructor.name === 'Element';
	} else if (typeof filter === 'string') {
		return node.name === filter;
	} else if (filter instanceof RegExp) {
		return filter.test(node.name);
	} else if (filter instanceof Function) {
		return filter(node);
	} else {
		return false;
	}
}

function hasNodes (node) {
	return node.nodes;
}

export default Container;
