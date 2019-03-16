import Comment from './Comment';
import Doctype from './Doctype';
import Node from './Node';
import Element from './Element';
import Fragment from './Fragment';
import Text from './Text';

// weak map of the parents of NodeLists
const parents = new WeakMap();

/**
* @name NodeList
* @class
* @extends Array
* @classdesc Create a new {@link NodeList}.
* @param {Object} parent - Parent containing the current {@link NodeList}.
* @param {...Node} nodes - {@link Node}s belonging to the current {@link NodeList}.
* @returns {NodeList}
*/
class NodeList extends Array {
	constructor (parent, ...nodes) {
		super();

		parents.set(this, parent);

		if (nodes.length) {
			this.push(...nodes);
		}
	}

	/**
	* Remove and return the last {@link Node} in the {@link NodeList}.
	* @returns {Node}
	*/
	pop () {
		const [ remove ] = this.splice(this.length - 1, 1);

		return remove;
	}

	/**
	* Add {@link Node}s to the end of the {@link NodeList} and return the new length of the {@link NodeList}.
	* @returns {Number}
	*/
	push (...nodes) {
		const parent = parents.get(this);
		const inserts = nodes.filter(node => node !== parent);

		this.splice(this.length, 0, ...inserts);

		return this.length;
	}

	/**
	* Remove and return the first {@link Node} in the {@link NodeList}.
	* @returns {Node}
	*/
	shift () {
		const [ remove ] = this.splice(0, 1);

		return remove;
	}

	/**
	* Add and remove {@link Node}s to and from the {@link NodeList}.
	* @returns {Array}
	*/
	splice (start, ...opts) {
		const parent = parents.get(this);
		const deleteCount = opts.length ? opts[0] : this.length - start;
		const inserts = getNodeListArray(opts.slice(1).filter(node => node !== parent));

		for (let insert of inserts) {
			insert.remove();

			insert.parent = parent;
		}

		const removes = Array.prototype.splice.call(this, start, deleteCount, ...inserts);

		for (let remove of removes) {
			delete remove.parent;
		}

		return removes;
	}

	/**
	* Add {@link Node}s to the beginning of the {@link NodeList} and return the new length of the {@link NodeList}.
	* @returns {Number}
	*/
	unshift (...nodes) {
		const parent = parents.get(this);
		const inserts = nodes.filter(node => node !== parent);

		this.splice(0, 0, ...inserts);

		return this.length;
	}

	/**
	* Return the current {@link NodeList} as a String.
	* @returns {String}
	* @example
	* nodeList.toString() // returns ''
	*/
	toString () {
		return this.join('');
	}

	/**
	* Return the current {@link NodeList} as an Array.
	* @returns {Array}
	* @example
	* nodeList.toJSON() // returns []
	*/
	toJSON () {
		return [].concat(
			...this.map(node => node.toJSON())
		);
	}

	/**
	* Return a new {@link NodeList} from an object.
	* @param {Array|Node} nodes - An array or object of nodes.
	* @returns {NodeList} A new {@link NodeList}
	* @example <caption>Return a NodeList from an array of text.</caption>
	* NodeList.from([ 'test' ]) // returns NodeList [ Text { data: 'test' } ]
	*/

	static from (nodes) {
		return new NodeList(new Fragment(), ...getNodeListArray(nodes));
	}
}

export default NodeList;

/**
* Return an NodeList-compatible array from an array.
* @private
*/

function getNodeListArray (nodes) {
	const nodeTypes = {
		comment: Comment,
		doctype: Doctype,
		element: Element,
		fragment: Fragment,
		text: Text
	};

	// coerce nodes into an array
	return Array.prototype.filter.call(
		nodes === Object(nodes) ? nodes : [],
		// nodes may be a string, an existing node, or a node-like object
		node => {
			return node instanceof Node || typeof node === 'string' || node === Object(node) && node.type in nodeTypes;
		}
	).map(
		node => node instanceof Node
			// Nodes are unchanged
			? node
		: typeof node === 'string'
			// Strings are converted into Text nodes
			? new Text({ data: node })
		// Node-like Objects with recognized types are normalized
		: new nodeTypes[node.type](node)
	);
}
