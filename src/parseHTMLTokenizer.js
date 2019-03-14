import Tokenizer from 'parse5/lib/tokenizer';

// patch _createDoctypeToken to support loose doctype nodes
Tokenizer.prototype._createDoctypeToken = function _createDoctypeToken() {
	const doctypeRegExp = /^(doctype)(\s+)(html)(?:(\s+)(public\s+(["']).*?\6))?(?:(\s+)((["']).*\9))?(\s*)/i;
	const doctypeStartRegExp = /doctype\s*$/i;
	const offset = this.preprocessor.html.slice(0, this.preprocessor.pos).match(doctypeStartRegExp, '')[0].length;
	const innerHTML = this.preprocessor.html.slice(this.preprocessor.pos - offset);
	const [, doctype, before, name, beforePublicId, publicId, , beforeSystemId, systemId, , after] = Object(innerHTML.match(doctypeRegExp));

	this.currentToken = {
		type: Tokenizer.COMMENT_TOKEN,
		data: {
			doctype,
			name,
			publicId,
			systemId,
			source: {
				before,
				beforePublicId,
				beforeSystemId,
				after
			}
		},
		forceQuirks: false,
		publicId: null,
		systemId: null
	};
};

// patch _createAttr to include the start offset position for name
Tokenizer.prototype._createAttr = function _createAttr(attrNameFirstCh) {
	this.currentAttr = {
		name: attrNameFirstCh,
		value: '',
		startName: this.preprocessor.pos
	};
};

// patch _leaveAttrName to support duplicate attributes
Tokenizer.prototype._leaveAttrName = function _leaveAttrName(toState) {
	const startName = this.currentAttr.startName;
	const endName = this.currentAttr.endName = this.preprocessor.pos;

	this.currentToken.attrs.push(this.currentAttr);

	const before = this.preprocessor.html.slice(0, startName).match(/\s*$/)[0];

	this.currentAttr.raw = {
		name: this.preprocessor.html.slice(startName, endName),
		value: null,
		source: { startName, endName, startValue: null, endValue: null, before, quote: '' }
	};

	this.state = toState;
};

// patch _leaveAttrValue to include the offset end position for value
Tokenizer.prototype._leaveAttrValue = function _leaveAttrValue(toState) {
	const startValue = this.currentAttr.endName + 1;
	const endValue = this.preprocessor.pos;
	const quote = endValue - this.currentAttr.value.length === startValue
		? ''
	: this.preprocessor.html[startValue];

	this.currentAttr.raw.value = this.currentAttr.value;
	this.currentAttr.raw.source.startValue = startValue;
	this.currentAttr.raw.source.endValue = endValue;
	this.currentAttr.raw.source.quote = quote;

	this.state = toState;
};

// patch TAG_OPEN_STATE to support jsx-style fragments
const originalTAG_OPEN_STATE = Tokenizer.prototype.TAG_OPEN_STATE;

Tokenizer.prototype.TAG_OPEN_STATE = function TAG_OPEN_STATE(cp) {
	const isReactOpeningElement = this.preprocessor.html.slice(this.preprocessor.pos - 1, this.preprocessor.pos + 1) === '<>';
	const isReactClosingElement = this.preprocessor.html.slice(this.preprocessor.pos - 1, this.preprocessor.pos + 2) === '</>';

	if (isReactOpeningElement) {
		this._createStartTagToken();
		this._reconsumeInState('TAG_NAME_STATE');
	} else if (isReactClosingElement) {
		this._createEndTagToken();
		this._reconsumeInState('TAG_NAME_STATE');
	} else {
		originalTAG_OPEN_STATE.call(this, cp);
	}
};

export default Tokenizer;
