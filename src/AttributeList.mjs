/**
* @name AttributeList
* @class
* @extends Array
* @classdesc Return a new list of {@link Element} attributes.
* @param {...Array} attrs - An array or object of attributes.
* @return {AttributeList}
* @example
* new AttributeList({ name: 'class', value: 'foo' }, { name: 'id': value: 'bar' })
*/
class AttributeList extends Array {
	constructor (attrs) {
		super();

		this.push(...getAttributeListArray(attrs));
	}

	/**
	* Add an attribute or attributes to the current {@link AttributeList}.
	* @param {String} name_or_attrs - The name of the attribute or attributes object being added.
	* @param {String} [value] - The value of the attribute being added.
	* @returns {Boolean} - Whether the attribute or attributes were added to the current {@link AttributeList}.
	* @example <caption>Add an empty "id" attribute.</caption>
	* attrs.add('id')
	* @example <caption>Add an "id" attribute with a value of "bar".</caption>
	* attrs.add('id', 'bar')
	* @example
	* attrs.add({ id: 'bar' })
	* @example
	* attrs.add([{ name: 'id', value: 'bar' }])
	*/
	add (nameOrAttrs, ...args) {
		const isObject = nameOrAttrs === Object(nameOrAttrs);
		const attrs = isObject ? getAttributeListArray(nameOrAttrs) : [{
			name: String(nameOrAttrs),
			value: normalizeAttrValue(args[0]),
			source: {}
		}];

		return this.toggle(attrs, true);
	}

	/**
	* Return a new clone of the current {@link AttributeList} while conditionally applying additional attributes.
	* @param {...Array} attrs - Additional attributes to be added to the new {@link AttributeList}.
	* @returns {Element} - Cloned Element.
	* @example
	* attrs.clone()
	* @example <caption>Clone the current attribute and add an "id" attribute with a value of "bar".</caption>
	* attrs.clone({ name: 'id', value: 'bar' })
	*/
	clone (...attrs) {
		return new AttributeList(...Array.from(this).concat(getAttributeListArray(attrs)));
	}

	/**
	* Return whether an attribute or attributes exists in the current {@link AttributeList}.
	* @param {String} name - The name or attribute object being accessed.
	* @returns {Boolean} - Whether the attribute exists.
	* @example <caption>Return whether there is an "id" attribute.</caption>
	* attrs.contains('id')
	* @example
	* attrs.contains({ id: 'bar' })
	* @example <caption>Return whether there is an "id" attribute with a value of "bar".</caption>
	* attrs.contains([{ name: 'id': value: 'bar' }])
	*/
	contains (name) {
		return this.indexOf(name) !== -1;
	}

	/**
	* Return an attribute value by name from the current {@link AttributeList}.
	* @param {String} name - The name of the attribute being accessed.
	* @returns {String|Null|Boolean} - The value of the attribute (a string or null) or false (if the attribute does not exist).
	* @example <caption>Return the value of "id" or `false`.</caption>
	* attrs.get('id')
	*/
	get (name) {
		const target = this.find(attr => attr.name === String(name));

		return target ? target.value : false;
	}

	/**
	* Return the position of an attribute by name or attribute object in the current {@link AttributeList}.
	* @param {String} name - The name or attributes object being accessed.
	* @returns {Number} - The index of the attribute or -1.
	* @example <caption>Return the index of "id".</caption>
	* attrs.indexOf('id')
	*/
	indexOf (name) {
		const isObject = name === Object(name);

		if (isObject) {
			const hasName = 'name' in name.name;
			const hasValue = 'value' in name.value;
			const stringName = hasName && String(name.name);
			const stringValue = hasValue && String(name.value);

			return (hasName || hasValue) && this.findIndex(
				attr => (!hasName || attr.name === stringName) && (!hasValue || attr.value === stringValue)
			);
		}

		return this.findIndex(attr => attr.name === String(name));
	}

	/**
	* Remove an attribute or attributes from the current {@link AttributeList}.
	* @param {String} name_or_attrs - The name of the attribute or attributes object being removed.
	* @param {String} [value] - The value of the attribute being removed.
	* @returns {Boolean} - Whether the attribute or attributes were removed from the {@link AttributeList}.
	* @example <caption>Remove the "id" attribute.</caption>
	* attrs.remove('id')
	* @example <caption>Remove the "id" attribute with a value of "bar".</caption>
	* attrs.remove('id', 'bar')
	* @example
	* attrs.remove({ id: 'bar' })
	* @example
	* attrs.remove([{ name: 'id', value: 'bar' }])
	*/
	remove (nameOrAttrs, ...args) {
		const isObject = nameOrAttrs === Object(nameOrAttrs);
		const attrs = isObject ? getAttributeListArray(nameOrAttrs) : [{
			name: String(nameOrAttrs),
			value: normalizeAttrValue(args[0]),
			source: {}
		}];

		return !this.toggle(attrs, false);
	}

	/**
	* Toggle an attribute or attributes from the current {@link AttributeList}.
	* @param {String|Object} name_or_attrs - The name of the attribute being toggled, or an object of attributes being toggled.
	* @param {String|Boolean} [value_or_force] - The value of the attribute being toggled, or when attributes is a string whether the attribute should be forcibly toggled.
	* @param {Boolean} [force] - Whether the attribute should be forcably toggled.
	* @returns {Boolean} - Whether any attribute was added to the current {@link AttributeList}.
	* @example <caption>Toggle the "id" attribute.</caption>
	* attrs.toggle('id')
	* @example <caption>Toggle the "id" attribute with a value of "bar".</caption>
	* attrs.toggle('id', 'bar')
	* @example
	* attrs.toggle({ id: 'bar' })
	* @example
	* attrs.toggle([{ name: 'id', value: 'bar' }])
	*/
	toggle (nameOrAttrs, ...args) {
		const isObject = nameOrAttrs === Object(nameOrAttrs);
		const attrs = isObject ? getAttributeListArray(nameOrAttrs) : [{
			name: String(nameOrAttrs),
			value: normalizeAttrValue(args[0]),
			source: {}
		}];
		const force = isObject ? args[0] : args[1];
		const isNoForceDefined = force === undefined;
		let result = false;

		attrs.forEach(attr => {
			const { name, value } = attr;
			const index = this.findIndex(existing => existing.name === name);

			if (index === -1) {
				if (isNoForceDefined || force) {
					this.push({ name, value });

					result = true;
				}
			} else if (isNoForceDefined || !force) {
				this.splice(index, 1);
			} else {
				const isValueUndefined = value === undefined;

				this[index].value = isValueUndefined ? this[index].value : value;
			}
		});

		return result;
	}

	/**
	* Return the current {@link AttributeList} as a String.
	* @returns {String} A string version of the current {@link AttributeList}
	* @example
	* attrs.toString() // returns 'class="foo" data-foo="bar"'
	*/
	toString () {
		return this.length
			? `${this.map(
				attr => `${Object(attr.source).before || ' '}${attr.name}${attr.value === null ? '' : `=${Object(attr.source).quote || '"'}${attr.value}${Object(attr.source).quote || '"'}`}`
			).join('')}`
		: ''
	}

	/**
	* Return the current {@link AttributeList} as an Object.
	* @returns {Object} An object version of the current {@link AttributeList}
	* @example
	* attrs.toJSON() // returns { class: 'foo', dataFoo: 'bar' }
	*/
	toJSON () {
		return this.reduce(
			(object, attr) => Object.assign(
				object,
				{
					[getCamelCaseString(attr.name)]: attr.value
				}
			),
			{}
		);
	}

	/**
	* Return an normalized array of attributes from an object.
	* @param {String} attrs - An array or object of attributes.
	* @returns {Array} A normalized array of attributes
	* @example <caption>Return an array of attributes from a regular object.</caption>
	* AttributeList.from({ dataFoo: true }) // returns [{ name: 'data-foo', value: 'bar' }]
	* @example <caption>Return a normalized array of attributes from an impure array of attributes.</caption>
	* AttributeList.from([{ name: 'data-foo', value: 'bar', foo: true }]) // returns [{ name: 'data-foo', value: 'bar' }]
	*/

	/**
	* Return a new {@link AttributeList} from an array or object.
	* @param {Array|AttributeList|Object} nodes - An array or object of attributes.
	* @returns {AttributeList} A new {@link AttributeList}
	* @example <caption>Return an array of attributes from a regular object.</caption>
	* AttributeList.from({ dataFoo: 'bar' }) // returns AttributeList [{ name: 'data-foo', value: 'bar' }]
	* @example <caption>Return a normalized array of attributes from an impure array of attributes.</caption>
	* AttributeList.from([{ name: 'data-foo', value: true, foo: 'bar' }]) // returns AttributeList [{ name: 'data-foo', value: 'true' }]
	*/

	static from (attrs) {
		return new AttributeList(getAttributeListArray(attrs));
	}
}

export default AttributeList;

/**
* Return an AttributeList-compatible array from an array or object.
* @private
*/

function getAttributeListArray (attrs) {
	return Array.isArray(attrs)
		? Array.from(attrs).filter(attr => attr).map(attr => ({
			name: String(Object(attr).name),
			value: normalizeAttrValue(Object(attr).value),
			source: Object(Object(attr).source)
		}))
	: Object.keys(Object(attrs)).map(name => ({
		name: getKebabCaseString(name),
		value: normalizeAttrValue(attrs[name]),
		source: {}
	}));
}

/**
* Return a string formatted using camelCasing.
* @private
* @example
* getCamelCaseString('hello-world') // returns 'helloWorld'
*/

function getCamelCaseString (string) {
	return String(string).replace(/-[a-z]/g, $0 => $0.slice(1).toUpperCase());
}

/**
* Return a string formatted using kebab-casing.
* @private
* @example
* getKebabCaseString('helloWorld') // returns 'hello-world'
*/

function getKebabCaseString (string) {
	return String(string).replace(/[A-Z]/g, $0 => `-${$0.toLowerCase()}`)
}

/**
* Return a value normalized as an attribute value.
* @private
* @example
* normalizeAttrValue('bar') // returns 'bar'
* normalizeAttrValue(null) // returns null
* normalizeAttrValue('') // returns ''
* @example
* normalizeAttrValue(undefined) // returns ''
* normalizeAttrValue(['test']) // returns 'test'
*/

function normalizeAttrValue (attrValue) {
	return attrValue === null
		? null
	: attrValue === undefined
		? ''
	: String(attrValue);
}
