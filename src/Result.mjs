import parseHTML from './parseHTML';
import treeAdapter from './parseHTMLTreeAdapter';
import Comment from './Comment';
import Doctype from './Doctype';
import Element from './Element';
import Fragment from './Fragment';
import Text from './Text';

/**
* @name Result
* @class
* @classdesc Create a new syntax tree {@link Result} from a processed input.
* @param {Object} processOptions - Custom settings applied to the {@link Result}.
* @param {String} processOptions.from - Source input location.
* @param {String} processOptions.to - Destination output location.
* @param {Array} processOptions.voidElements - Void elements.
* @return {Result}
*/
class Result {
	constructor (html, processOptions) {
		// the "to" and "from" locations are always string values
		const from = 'from' in Object(processOptions) && processOptions.from !== undefined && processOptions.from !== null
			? String(processOptions.from)
		: '';
		const to = 'to' in Object(processOptions) && processOptions.to !== undefined && processOptions.to !== null
			? String(processOptions.to)
		: from;
		const voidElements = 'voidElements' in Object(processOptions)
			? [].concat(Object(processOptions).voidElements || [])
		: defaultVoidElements;

		// prepare the result object
		Object.assign(this, {
			type: 'result',
			from,
			to,
			input: { html, from, to },
			root: null,
			voidElements,
			messages: []
		});

		// parse the html and transform it into nodes
		const documentFragment = parseHTML(html, { voidElements });

		this.root = transform(documentFragment, this);
	}

	/**
	* Return the current {@link Root} as an Object.
	* @returns {Object}
	*/
	toJSON () {
		return this.root.toJSON();
	}

	/**
	* Add a warning to the current {@link Root}.
	* @param {String} text - The message being sent as the warning.
	* @param {Object} [opts] - Additional information about the warning.
	* @example
	* result.warn('Something went wrong')
	* @example
	* result.warn('Something went wrong', {
	*   node: someNode,
	*   plugin: somePlugin
	* })
	*/
	warn (text, rawopts) {
		const opts = Object(rawopts);

		if (!opts.plugin) {
			if (Object(this.currentPlugin).name) {
				opts.plugin = this.currentPlugin.name
			}
		}

		this.messages.push({ type: 'warning', text, opts });
	}

	/**
	* Return the current {@link Root} as a String.
	* @returns {String}
	*/
	get html () {
		return String(this.root);
	}

	/**
	* Return the messages that are warnings.
	* @returns {String}
	*/
	get warnings () {
		return this.messages.filter(message => Object(message).type === 'warning');
	}
}

function transform (node, result) {
	const source = node.sourceCodeLocation === Object(node.sourceCodeLocation)
		? {
			startOffset: node.sourceCodeLocation.startOffset,
			endOffset: node.sourceCodeLocation.endOffset,
			startInnerOffset: Object(node.sourceCodeLocation.startTag).endOffset || node.sourceCodeLocation.startOffset,
			endInnerOffset: Object(node.sourceCodeLocation.endTag).startOffset || node.sourceCodeLocation.endOffset,
			input: result.input
		}
	: {
		startOffset: 0,
		startInnerOffset: 0,
		endInnerOffset: result.input.html.length,
		endOffset: result.input.html.length,
		input: result.input
	};

	if (Object(node.sourceCodeLocation).startTag) {
		source.before = result.input.html.slice(source.startOffset, source.startInnerOffset - 1).match(/\s*\/?$/)[0]
	}

	if (Object(node.sourceCodeLocation).endTag) {
		source.after = result.input.html.slice(source.endInnerOffset + 2 + node.nodeName.length, source.endOffset - 1)
	}

	const $node = treeAdapter.isCommentNode(node)
		? new Comment({ comment: node.data, source })
	: treeAdapter.isDocumentTypeNode(node)
		? new Doctype(Object.assign(node, { source: Object.assign({}, node.source, source) }))
	: treeAdapter.isElementNode(node)
		? new Element({
			name: result.input.html.slice(source.startOffset + 1, source.startOffset + 1 + node.nodeName.length),
			attrs: node.attrs.map(attr => attr.raw),
			nodes: node.childNodes instanceof Array ? node.childNodes.map(child => transform(child, result)) : null,
			isSelfClosing: /\//.test(source.before),
			isWithoutEndTag: !Object(node.sourceCodeLocation).endTag,
			isVoid: result.voidElements.includes(node.tagName),
			source
		})
	: treeAdapter.isTextNode(node)
		? new Text({ data: node.value, source })
	: new Fragment({
		nodes: node.childNodes instanceof Array ? node.childNodes.map(child => transform(child, result)) : null,
		source
	});

	return $node;
}

const defaultVoidElements = [
	'area',
	'base',
	'br',
	'col',
	'command',
	'embed',
	'hr',
	'img',
	'input',
	'keygen',
	'link',
	'meta',
	'param',
	'source',
	'track',
	'wbr'
];

export default Result;
