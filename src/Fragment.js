import Container from './Container';
import NodeList from './NodeList';

/**
* @name Fragment
* @class
* @extends Container
* @classdesc Create a new {@link Fragment} {@link Node}.
* @returns {Fragment}
*/
class Fragment extends Container {
	constructor (settings) {
		super();

		Object.assign(this, {
			type: 'fragment',
			name: '#document-fragment',
			nodes: new NodeList(this),
			source: Object(Object(settings).source)
		});

		// Nodes appended to the Element
		if (Object(settings).nodes === Object(Object(settings).nodes)) {
			this.nodes = settings.nodes instanceof NodeList
				? new NodeList(this, ...settings.nodes.splice(0, settings.nodes.length))
			: settings.nodes instanceof Array
				? new NodeList(this, ...settings.nodes)
			: settings.nodes instanceof Node
				? new NodeList(this, settings.nodes)
			: new NodeList(this);
		}
	}

	/**
	* Return a clone of the current {@link Fragment}.
	* @param {Boolean} isDeep - Whether the descendants of the current Fragment should also be cloned.
	* @returns {Fragment} - The cloned Fragment
	*/
	clone (isDeep) {
		const clone = new Fragment();

		if (isDeep && this.nodes && this.nodes.length) {
			clone.nodes = new NodeList(clone, ...this.nodes.map(node => node.clone({}, isDeep)));
		}

		return clone;
	}

	/**
	* Return the current {@link Fragment} as a String.
	* @returns {String}
	* @example
	* fragment.toJSON() // returns ''
	*/
	toString () {
		return String(this.nodes);
	}

	/**
	* Return the current {@link Fragment} as an Array.
	* @returns {Array}
	* @example
	* fragment.toJSON() // returns []
	*/
	toJSON () {
		return this.nodes.toJSON();
	}
}

export default Fragment;
