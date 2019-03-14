import HTMLParser from 'parse5/lib/parser';
import treeAdapter from './parseHTMLTreeAdapter';
import Tokenizer from './parseHTMLTokenizer';

function parseLoose(html, parseOpts) {
	this.tokenizer = new Tokenizer(this.options);
	const document = treeAdapter.createDocumentFragment();
	const template = treeAdapter.createDocumentFragment();
	this._bootstrap(document, template);
	this._pushTmplInsertionMode('IN_TEMPLATE_MODE');
	this._initTokenizerForFragmentParsing();
	this._insertFakeRootElement();
	this.tokenizer.write(html, true);
	this._runParsingLoop(null);

	document.childNodes = filter(document.childNodes, parseOpts);

	return document;
}

export default function parseHTML(input, parseOpts) {
	const htmlParser = new HTMLParser({
		treeAdapter,
		sourceCodeLocationInfo: true
	});

	return parseLoose.call(htmlParser, input, parseOpts);
}

// filter out generated elements
function filter(childNodes, parseOpts) {
	return childNodes.reduce(
		(nodes, childNode) => {
			const isVoidElement = parseOpts.voidElements.includes(childNode.nodeName);

			const grandChildNodes = childNode.childNodes
				? filter(childNode.childNodes, parseOpts)
			: [];

			// filter child nodes
			if (isVoidElement) {
				delete childNode.childNodes;
			} else {
				childNode.childNodes = grandChildNodes;
			}

			// push nodes with source
			if (childNode.sourceCodeLocation) {
				nodes.push(childNode);
			}

			if (!childNode.sourceCodeLocation || !childNode.childNodes) {
				nodes.push(...grandChildNodes);
			}

			return nodes;
		},
		[]
	);
}
