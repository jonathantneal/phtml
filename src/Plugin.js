import Node from './Node';
import Result from './Result';
import observe, { getPluginsAndVisitors } from './observe'

/**
* @name Plugin
* @class
* @classdesc Create a new Plugin.
* @param {String} name - Name of the Plugin.
* @param {Function} pluginFunction - Function executed by the Plugin during initialization.
* @return {Plugin}
* @example
* new Plugin('phtml-test', pluginOptions => {
*   // initialization logic
*
*   return {
*     Element(element, result) {
*       // runtime logic, do something with an element
*     },
*     Root(root, result) {
*       // runtime logic, do something with the root
*     }
*   }
* })
* @example
* new Plugin('phtml-test', pluginOptions => {
*   // initialization logic
*
*   return (root, result) => {
*     // runtime logic, do something with the root
*   }
* })
*/
class Plugin extends Function {
	constructor (name, pluginFunction) {
		return Object.defineProperties(pluginFunction, {
			constructor: {
				value: Plugin,
				configurable: true
			},
			type: {
				value: 'plugin',
				configurable: true
			},
			name: {
				value: String(name || 'phtml-plugin'),
				configurable: true
			},
			pluginFunction: {
				value: typeof pluginFunction === 'function' ?
					pluginFunction
				: () => pluginFunction,
				configurable: true
			},
			process: {
				value(...args) {
					return Plugin.prototype.process.apply(this, args);
				},
				configurable: true
			}
		});
	}

	/**
	* Process input with options and plugin options and return the result.
	* @param {String} input - Source being processed.
	* @param {Object} processOptions - Custom settings applied to the Result.
	* @param {Object} pluginOptions - Options passed to the Plugin.
	* @return {Result}
	* @example
	* plugin.process('some html', processOptions, pluginOptions)
	*/
	async process (input, processOptions, pluginOptions) {
		const result = new Result(input, processOptions);

		const initializedPlugin = this.pluginFunction(pluginOptions);

		const { visitors } = getPluginsAndVisitors([ initializedPlugin ]);

		Object.assign(Node.prototype, {
			async observe() {
				return observe(this, result, visitors);
			}
		});

		if (typeof initializedPlugin === 'function') {
			await initializedPlugin(result.root, result);
		} else {
			await observe(result.root, result, initializedPlugin);
		}

		return result;
	}
}

export default Plugin;
