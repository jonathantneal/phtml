async function observe (node, result, on) {
	// get node types
	const type = getTypeFromNode(node);
	const subType = getSubTypeFromNode(node);
	const beforeType = `before${type}`;
	const beforeSubType = `before${subType}`;

	// fire "before" observers
	if (on.beforeNode) {
		await runAll(on.beforeNode, node, result);
	}

	if (on[beforeType]) {
		await runAll(on[beforeType], node, result);
	}

	if (on[beforeSubType] && on[beforeSubType] !== on[beforeType]) {
		await runAll(on[beforeSubType], node, result);
	}

	// dispatch before root event
	if (node === result.root && on.beforeRoot) {
		await runAll(on.beforeRoot, node, result);
	}

	// walk children
	if (node.nodes instanceof Array) {
		await node.nodes.slice(0).reduce(
			(promise, child) => promise.then(
				() => observe(child, result, on)
			),
			Promise.resolve()
		);
	}

	// fire "after" observers
	if (on.Node) {
		await runAll(on.Node, node, result);
	}

	if (on[type]) {
		await runAll(on[type], node, result);
	}

	if (on[subType] && on[subType] !== on[type]) {
		await runAll(on[subType], node, result);
	}

	// dispatch root event
	if (node === result.root && on.Root) {
		await runAll(on.Root, node, result);
	}
}

export async function runAll (rawplugins, node, result) {
	const plugins = [].concat(rawplugins || []);

	for (const plugin of plugins) {
		// update the current plugin
		result.currentPlugin = plugin;

		// run the current plugin
		await plugin(node, result);

		// clear the current plugin
		result.currentPlugin = null;
	}
}

export function getPluginsAndVisitors (rawplugins) {
	const plugins = [];
	const visitors = {};

	// initialize plugins and observer plugins
	rawplugins.forEach(plugin => {
		const initializedPlugin = plugin.type === 'plugin' ? plugin() : plugin;

		if (initializedPlugin instanceof Function) {
			plugins.push(initializedPlugin);
		} else if (Object(initializedPlugin) === initializedPlugin && Object.keys(initializedPlugin).length) {
			Object.keys(initializedPlugin).forEach(key => {
				const fn = initializedPlugin[key];

				if (fn instanceof Function) {
					if (!visitors[key]) {
						visitors[key] = [];
					}

					visitors[key].push(initializedPlugin[key]);
				}
			});
		}
	});

	return { plugins, visitors };
}

function getTypeFromNode (node) {
	return {
		'comment': 'Comment',
		'text': 'Text',
		'doctype': 'Doctype',
		'fragment': 'Fragment'
	}[node.type] || 'Element';
}

function getSubTypeFromNode (node) {
	return {
		'#comment': 'Comment',
		'#text': 'Text',
		'doctype': 'Doctype',
		'fragment': 'Fragment'
	}[node.type] || (
		!node.name
			? 'FragmentElement'
		: `${node.name[0].toUpperCase()}${node.name.slice(1)}Element`
	);
}

export default observe;
