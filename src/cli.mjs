import fs from 'fs';
import path from 'path';
import PHTML from '.';

const argo = getArgo();
const configPath = argo.config === true ? 'phtml.config.js' : argo.config ? String(argo.config) : false;

(argo.from === '<stdin>' ? getStdin() : readFile(argo.from))
.then(html => {
	try {
		const config = configPath ? safeRequire(configPath) : {};

		config.plugins = [].concat(config.plugins || []).map(
			plugin => {
				const normalizedPlugin = Array.isArray(plugin)
					? plugin.length > 1
						? safeRequire(plugin[0])(plugin[1])
					: safeRequire(plugin[0])
				: typeof plugin === 'string'
					? safeRequire(plugin)
				: plugin;

				return normalizedPlugin;
			}
		);

		return { config, html };
	} catch (error) {
		console.log('something went ahh!', error);
	}

	return { config: {}, html };
})
.then(({ config, html }) => {
	if (argo.from === '<stdin>' && !html) {
		logInstructions();

		process.exit(0);
	}

	const processOptions = Object.assign({
		from: argo.from,
		to: argo.to || argo.from
	}, argo.map ? {
		map: JSON.parse(argo.map)
	} : {}, config.options);

	const plugins = [].concat(config.plugins || []);

	return PHTML.use(plugins).process(html, processOptions).then(result => {
		if (argo.to === '<stdout>') {
			return result.html;
		} else {
			return writeFile(argo.to, result.html).then(
				() => `HTML has been written to "${argo.to}"`
			)
		}
	});
}).catch(
	error => {
		if (Object(error).errno === -2) {
			throw new Error(`Sorry, "${error.path}" could not be read.`);
		}

		throw error;
	}
).then(
	result => {
		console.log(result);

		process.exit(0);
	},
	error => {
		console.error(Object(error).message || 'Something bad happened and we don’t even know what it was.');

		process.exit(1);
	}
);

function getArgo () {
	return process.argv.slice(2).reduce(
		(object, arg, i, args) => { // eslint-disable-line max-params
			const dash = /^--([^\s]+)$/;

			if (dash.test(arg)) {
				object[arg.replace(dash, '$1')] = i + 1 in args ? args[i + 1] : true;
			} else if (!dash.test(args[i - 1])) {
				if (object.from === '<stdin>') {
					object.from = arg;
				} else if (object.to === '<stdout>') {
					object.to = arg;
				}
			}

			return object;
		},
		{
			from: '<stdin>',
			to: '<stdout>',
			plugins: ''
		}
	);
}

function getStdin () {
	return new Promise(resolve => {
		let data = '';

		if (process.stdin.isTTY) {
			resolve(data);
		} else {
			process.stdin.setEncoding('utf8');

			process.stdin.on('readable', () => {
				let chunk;

				while (chunk = process.stdin.read()) {
					data += chunk;
				}
			});

			process.stdin.on('end', () => {
				resolve(data);
			});
		}
	});
}

function readFile (pathname) {
	return new Promise((resolve, reject) => {
		fs.readFile(pathname, 'utf8', (error, data) => {
			if (error) {
				reject(error);
			} else {
				resolve(data);
			}
		});
	});
}

function writeFile (pathname, data) {
	return new Promise((resolve, reject) => {
		fs.writeFile(pathname, data, (error, content) => {
			if (error) {
				reject(error);
			} else {
				resolve(content);
			}
		});
	});
}

function logInstructions () {
	console.log([
		'pHTML\n',
		'  Transform HTML with JavaScript\n',
		'Usage:\n',
		'  phtml SOURCE.html TRANSFORMED.html',
		'  phtml --from=SOURCE.html --to=TRANSFORMED.html',
		'  echo "<title>html</title>" | phtml\n'
	].join('\n'));
}

function safeRequire(pathname, filename) {
	try {
		return require(pathname);
	} catch (error) {
		try {
			return require(path.resolve(pathname));
		} catch (error2) {
			if (filename) {
				return require(path.resolve(pathname, filename));
			} else {
				throw error2;
			}
		}
	}
}
