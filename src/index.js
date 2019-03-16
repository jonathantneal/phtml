import AttributeList from './AttributeList';
import Comment from './Comment';
import Container from './Container';
import Doctype from './Doctype';
import Element from './Element';
import Fragment from './Fragment';
import Node from './Node';
import NodeList from './NodeList';
import Plugin from './Plugin';
import Result from './Result';
import Text from './Text';

/**
* @name PHTML
* @class
* @classdesc Create a new instance of {@link PHTML}.
* @param {Array|Plugin|Function} plugins - Plugin or plugins being added.
* @returns {PHTML}
* @example
* new PHTML(plugin)
* @example
* new PHTML([ somePlugin, anotherPlugin ])
*/
class PHTML {
	constructor (pluginOrPlugins) {
		Object.assign(this, { plugins: [] });

		this.use(pluginOrPlugins);
	}

	/**
	* Process input using plugins and return the result
	* @param {String} input - Source being processed.
	* @param {Object} processOptions - Custom settings applied to the Result.
	* @returns {ResultPromise}
	* @example
	* phtml.process('some html', processOptions)
	*/
	process (input, processOptions) {
		const result = new Result(input, { visitors: this.plugins, ...Object(processOptions) });

		// dispatch visitors and promise the result
		return result.visit();
	}

	/**
	* Add plugins to the existing instance of PHTML
	* @param {Array|Plugin|Function} plugins - Plugin or plugins being added.
	* @returns {PHTML}
	* @example
	* phtml.use(plugin)
	* @example
	* phtml.use([ somePlugin, anotherPlugin ])
	*/
	use (pluginOrPlugins) {
		const plugins = Array.isArray(pluginOrPlugins)
			? pluginOrPlugins.filter(
				plugin => typeof plugin === 'function' || Object(plugin) === plugin && Object.keys(plugin).length
			)
		: typeof pluginOrPlugins === 'function' || Object(pluginOrPlugins) === pluginOrPlugins && Object.keys(pluginOrPlugins).length
			? [pluginOrPlugins]
		: [];

		this.plugins.push(...plugins);

		return this;
	}

	/**
	* Process input and return the new {@link Result}
	* @param {Object} [processOptions] - Custom settings applied to the {@link Result}.
	* @param {Array|Plugin|Function} [plugins] - Custom settings applied to the {@link Result}.
	* @returns {ResultPromise}
	* @example
	* PHTML.process('some html', processOptions)
	* @example <caption>Process HTML with plugins.</caption>
	* PHTML.process('some html', processOptions, plugins) // returns a new PHTML instance
	*/
	static process (input, processOptions, pluginOrPlugins) {
		const phtml = new PHTML(pluginOrPlugins);

		return phtml.process(input, processOptions);
	}

	/**
	* Return a new {@link PHTML} instance which will use plugins
	* @param {Object} pluginOrPlugins - Plugin or plugins being added.
	* @returns {PHTML} - New {@link PHTML} instance
	* @example
	* PHTML.use(plugin) // returns a new PHTML instance
	* @example
	* PHTML.use([ somePlugin, anotherPlugin ]) // return a new PHTML instance
	*/
	static use (pluginOrPlugins) {
		return new PHTML(pluginOrPlugins);
	}

	static AttributeList = AttributeList;
	static Comment = Comment;
	static Container = Container;
	static Doctype = Doctype;
	static Element = Element;
	static Fragment = Fragment;
	static Node = Node;
	static NodeList = NodeList;
	static Plugin = Plugin;
	static Result = Result;
	static Text = Text;
}

export default PHTML;
