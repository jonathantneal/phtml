/**
* @name Node
* @class
* @extends Node
* @classdesc Create a new {@link Node}.
* @return {Node}
*/
class Node {
	/**
	* The position of the current {@link Node} from its parent.
	* @returns {Number}
	* @example
	* node.index // returns the index of the node or -1
	*/
	get index () {
		if (this.parent === Object(this.parent) && this.parent.nodes && this.parent.nodes.length) {
			return this.parent.nodes.indexOf(this);
		}

		return -1;
	}

	/**
	* The next {@link Node} after the current {@link Node}, or `null` if there is none.
	* @returns {Node|Null} - The next Node or null.
	* @example
	* node.next // returns null
	*/
	get next () {
		const index = this.index;

		if (index !== -1) {
			return this.parent.nodes[index + 1] || null;
		}

		return null;
	}

	/**
	* The next {@link Element} after the current {@link Node}, or `null` if there is none.
	* @returns {Element|Null}
	* @example
	* node.nextElement // returns an element or null
	*/
	get nextElement () {
		const index = this.index;

		if (index !== -1) {
			return this.parent.nodes.slice(index).find(hasNodes);
		}

		return null;
	}

	/**
	* The previous {@link Node} before the current {@link Node}, or `null` if there is none.
	* @returns {Node|Null}
	* @example
	* node.previous // returns a node or null
	*/
	get previous () {
		const index = this.index;

		if (index !== -1) {
			return this.parent.nodes[index - 1] || null;
		}

		return null;
	}

	/**
	* The previous {@link Element} before the current {@link Node}, or `null` if there is none.
	* @returns {Element|Null}
	* @example
	* node.previousElement // returns an element or null
	*/
	get previousElement () {
		const index = this.index;

		if (index !== -1) {
			return this.parent.nodes.slice(0, index).reverse().find(hasNodes);
		}

		return null;
	}

	/**
	* The top-most ancestor from the current {@link Node}.
	* @returns {Node}
	* @example
	* node.root // returns the top-most node or the current node itself
	*/
	get root () {
		let parent = this;

		while (parent.parent) {
			parent = parent.parent;
		}

		return parent;
	}

	/**
	* Insert one ore more {@link Node}s after the current {@link Node}.
	* @param {...Node|String} nodes - Any nodes to be inserted after the current {@link Node}.
	* @returns {Node} - The current {@link Node}.
	* @example
	* node.after(new Text({ data: 'Hello World' }))
	*/
	after (...nodes) {
		if (nodes.length) {
			const index = this.index;

			if (index !== -1) {
				this.parent.nodes.splice(index + 1, 0, ...nodes);
			}
		}

		return this;
	}

	/**
	* Append Nodes or new Text Nodes to the current {@link Node}.
	* @param {...Node|String} nodes - Any nodes to be inserted after the last child of the current {@link Node}.
	* @returns {Node} - The current {@link Node}.
	* @example
	* node.append(someOtherNode)
	*/
	append (...nodes) {
		if (this.nodes) {
			this.nodes.splice(this.nodes.length, 0, ...nodes);
		}

		return this;
	}

	/**
	* Append the current {@link Node} to another Node.
	* @param {Container} parent - The {@link Container} for the current {@link Node}.
	* @returns {Node} - The current {@link Node}.
	*/
	appendTo (parent) {
		if (parent && parent.nodes) {
			parent.nodes.splice(parent.nodes.length, 0, this);
		}

		return this;
	}

	/**
	* Insert Nodes or new Text Nodes before the Node if it has a parent.
	* @param {...Node|String} nodes - Any nodes to be inserted before the current {@link Node}.
	* @returns {Node}
	* @example
	* node.before(new Text({ data: 'Hello World' })) // returns the current node
	*/
	before (...nodes) {
		if (nodes.length) {
			const index = this.index;

			if (index !== -1) {
				this.parent.nodes.splice(index, 0, ...nodes);
			}
		}

		return this;
	}

	/**
	* Prepend Nodes or new Text Nodes to the current {@link Node}.
	* @param {...Node|String} nodes - Any nodes inserted before the first child of the current {@link Node}.
	* @returns {Node} - The current {@link Node}.
	* @example
	* node.prepend(someOtherNode)
	*/
	prepend (...nodes) {
		if (this.nodes) {
			this.nodes.splice(0, 0, ...nodes);
		}

		return this;
	}

	/**
	* Remove the current {@link Node} from its parent.
	* @returns {Node}
	* @example
	* node.remove() // returns the current node
	*/
	remove () {
		const index = this.index;

		if (index !== -1) {
			this.parent.nodes.splice(index, 1);
		}

		return this;
	}

	/**
	* Observe the node and its descendants using the currently enabled plugins.
	* @returns {Promise}
	* @example
	* // return a promise that resolved after nodes are observed
	* // or throw an error if plugins are yet enabled
	* node.observe()
	*/
	observe () {
		throw new Error('Observe may not be used without plugins');
	}

	/**
	* Replace the current {@link Node} with another Node or Nodes.
	* @param {...Node} nodes - Any nodes replacing the current {@link Node}.
	* @returns {Node} - The current {@link Node}
	* @example
	* node.replaceWith(someOtherNode) // returns the current node
	*/
	replaceWith (...nodes) {
		const index = this.index;

		if (index !== -1) {
			this.parent.nodes.splice(index, 1, ...nodes);
		}

		return this;
	}

	/**
	* Add a warning from the current {@link Node}.
	* @param {Result} result - The {@link Result} the warning is being added to.
	* @param {String} text - The message being sent as the warning.
	* @param {Object} [opts] - Additional information about the warning.
	* @example
	* node.warn(result, 'Something went wrong')
	* @example
	* node.warn(result, 'Something went wrong', {
	*   node: someOtherNode,
	*   plugin: someOtherPlugin
	* })
	*/
	warn (result, text, opts) {
		const data = Object.assign({ node: this }, opts);

		return result.warn(text, data);
	}
}

function hasNodes (node) {
	return node.nodes;
}

export default Node;
