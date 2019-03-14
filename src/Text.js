import Node from './Node';

/**
* @name Text
* @class
* @extends Node
* @classdesc Create a new {@link Text} {@link Node}.
* @param {Object} settings - Custom settings applied to the {@link Text}.
* @param {String} settings.data - Content of the {@link Text}.
* @param {Object} settings.source - Source mapping of the {@link Text}.
* @return {Text}
* @example
* new Text({ data: 'Hello World' })
*/
class Text extends Node {
	constructor (settings) {
		super();

		Object.assign(this, {
			type: 'text',
			name: '#text',
			data: String(Object(settings).data || ''),
			source: Object(Object(settings).source)
		});
	}

	/**
	* Return a clone of the current {@link Text}.
	* @param {Object} settings - Custom settings applied to the cloned {@link Text}.
	* @returns {Text} - The cloned {@link Text}
	* @example
	* text.clone()
	* @example <caption>Clone the current text with new source.</caption>
	* text.clone({ source: { input: 'modified source' } })
	*/
	clone (settings) {
		return new Text(Object.assign({}, this, settings, {
			source: Object.assign({}, this.source, Object(settings).source)
		}));
	}

	/**
	* Return the current {@link Text} as a String.
	* @returns {String}
	* @example
	* text.toString() // returns ''
	*/
	toString () {
		return String(this.data);
	}

	/**
	* Return the current {@link Text} as a String.
	* @returns {String}
	* @example
	* text.toJSON() // returns ''
	*/
	toJSON () {
		return String(this.data);
	}
}

export default Text;
