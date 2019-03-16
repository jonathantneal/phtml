import AttributeList from './AttributeList';
import Container from './Container';
import Node from './Node';
import NodeList from './NodeList';

/**
* @name Element
* @class
* @extends Container
* @classdesc Create a new {@link Element} {@Link Node}.
* @param {Object} settings - Custom settings applied to the {@link Element}.
* @param {String} settings.name - Tag name of the {@link Element}.
* @param {Boolean} settings.isSelfClosing - Whether the {@link Element} is self-closing.
* @param {Boolean} settings.isVoid - Whether the {@link Element} is void.
* @param {Boolean} settings.isisWithoutEndTagVoid - Whether the {@link Element} uses a closing tag.
* @param {Array|AttributeList|Object} settings.attrs - Attributes applied to the {@link Element}.
* @param {Array|NodeList} settings.nodes - Nodes appended to the {@link Element}.
* @param {Object} settings.source - Source mapping of the {@link Element}.
* @returns {Element} A new {@link Element} {@Link Node}
* @example
* new Element({ name: 'p' }) // returns an element representing <p></p>
*
* new Element({
*   name: 'input',
*   attrs: [{ name: 'type', value: 'search' }],
*   isVoid: true
* }) // returns an element representing <input type="search">
*/
class Element extends Container {
	constructor (settings) {
		super();

		Object.assign(this, {
			type: 'element',
			name: String('name' in Object(settings) ? settings.name : 'span'),
			isSelfClosing: Boolean(Object(settings).isSelfClosing),
			isVoid: Boolean(Object(settings).isVoid),
			isWithoutEndTag: Boolean(Object(settings).isWithoutEndTag),
			attrs: AttributeList.from(Object(settings).attrs),
			nodes: null,
			source: Object(Object(settings).source)
		});

		// Nodes appended to the Element
		this.nodes = Object(settings).nodes === Object(Object(settings).nodes)
			? Object(settings).nodes instanceof NodeList
				? new NodeList(this, ...settings.nodes.splice(0, settings.nodes.length))
			: Object(settings).nodes instanceof Array
				? new NodeList(this, ...settings.nodes)
			: Object(settings).nodes instanceof Node
				? new NodeList(this, settings.nodes)
			: new NodeList(this)
		: new NodeList(this);
	}

	/**
	* Return the stringified innerHTML from the source input.
	* @returns {String}
	*/
	get sourceInnerHTML () {
		return this.isSelfClosing || this.isVoid || typeof Object(this.source.input).html !== 'string'
			? ''
		: this.source.input.html.slice(
			this.source.startInnerOffset,
			this.source.endInnerOffset
		);
	}

	/**
	* Return the stringified outerHTML from the source input.
	* @returns {String}
	*/
	get sourceOuterHTML () {
		return typeof Object(this.source.input).html !== 'string'
			? ''
		: this.source.input.html.slice(
			this.source.startOffset,
			this.source.endOffset
		);
	}

	/**
	* Return a clone the current {@link Element}.
	* @param {Object} settings - Custom settings applied to the cloned {@link Element}.
	* @param {Boolean} isDeep - Whether the descendants of the current {@link Element} should also be cloned.
	* @returns {Element} - The cloned {@link Element}.
	* @example <caption>Clone the current {@link Element} and add an "id" attribute with a value of "bar".</caption>
	* element.clone({ attrs: { name: 'id', value: 'bar' } })
	* @example <caption>Clone the current {@link Element} and append a {@link Text} node.</caption>
	* element.clone({ nodes: [ "Hello World"] })
	*/
	clone (settings, isDeep) {
		const clone = new Element(Object.assign({}, this, { nodes: [] }, settings));

		if (isDeep && this.nodes && this.nodes.length) {
			const additionalNodes = Array.isArray(Object(settings).nodes) ? settings.nodes : [];

			clone.nodes = new NodeList(clone, ...this.nodes.map(node => node.clone({}, isDeep)).concat(additionalNodes));
		}

		return clone;
	}

	/**
	* Return the stringified Element.
	* @returns {String}
	*/
	toString () {
		return `<${this.name}${this.attrs}${this.source.before || ''}>${this.nodes || ''}${
			this.isSelfClosing || this.isVoid || this.isWithoutEndTag
				? ''
			: `</${this.name}${this.source.after || ''}>`
		}`;
	}

	/**
	* Return the Element as a unique Object.
	* @returns {Object}
	*/
	toJSON () {
		const object = { name: this.name };

		// conditionally disclose whether the Element is self-closing
		if (this.isSelfClosing) {
			object.isSelfClosing = true;
		}

		// conditionally disclose whether the Element is void
		if (this.isVoid) {
			object.isVoid = true;
		}

		// conditionally disclose Attributes applied to the Element
		if (this.attrs.length) {
			object.attrs = this.attrs.toJSON();
		}

		// conditionally disclose Nodes appended to the Element
		if (!this.isSelfClosing && !this.isVoid && this.nodes.length) {
			object.nodes = this.nodes.toJSON();
		}

		return object;
	}
}

export default Element;
