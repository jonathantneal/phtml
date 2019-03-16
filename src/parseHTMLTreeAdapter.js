import defaultTreeAdapter from 'parse5/lib/tree-adapters/default';

// patch defaultTreeAdapter.isElementNode to support element fragments
defaultTreeAdapter.isElementNode = node => 'tagName' in node;

// patch defaultTreeAdapter.createCommentNode to support doctype nodes
defaultTreeAdapter.createCommentNode = function createCommentNode (data) {
	return typeof data === 'string' ? {
		nodeName: '#comment',
		data,
		parentNode: null
	} : Object.assign({
		nodeName: '#documentType',
		name: data
	}, data);
}

export default defaultTreeAdapter;
