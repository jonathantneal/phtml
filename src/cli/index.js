import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import PHTML from '.';

const argo = getArgo();
const configPath = argo.config === true ? 'phtml.config.js' : argo.config ? String(argo.config) : false;

(argo.from === '<stdin>' ? getStdin() : readFile(argo.from))
.then(html => {
	try {
		const config = configPath ? safeRequire(configPath) : {};
		const plugins = [].concat(config.plugins || []).concat(argo.plugins && typeof argo.plugins === 'string' ? argo.plugins.split(',') : []);

		config.plugins = plugins.map(
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
		console.log('Something went wrong!');
		console.log(Object(error).message || error);
	}

	return { config: {}, html };
})
.then(({ config, html }) => {
	if (argo.from === '<stdin>' && !html) {
		logInstructions();

		process.exit(0);
	}

	const processOptions = { from: argo.from, to: argo.to || argo.from };

	if (typeof argo.map === 'string') {
		processOptions.map = JSON.parse(argo.map);
	}

	Object.assign(processOptions, config.options);

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

			if (dash.test(getArgName(arg))) {
				object[getArgName(arg).replace(dash, '$1')] = i + 1 in args ? args[i + 1] : true;
			} else if (!dash.test(getArgName(args[i - 1]))) {
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

	function getArgName(arg) {
		return {
			'-c': '--config',
			'-i': '--from',
			'-o': '--to',
			'-p': '--plugins',
		}[arg] || arg;
	}
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
		'  phtml source.html ouput.html',
		'  phtml --from source.html --to ouput.html',
		'  phtml --from source.html --to ouput.html --plugins @phtml/markdown',
		'  phtml -i source.html -o ouput.html -p @phtml/markdown',
		'  echo "<title>html</title>" | phtml -p @phtml/markdown'
	].join('\n') + '\n');
}

function safeRequire(id) {
	try {
		// 1st, attempt to require the id as a package or filepath
		return require(id);
	} catch (error) {
		try {
			// 2nd, attempt to require the id as a resolved filepath
			return require(path.resolve(id));
		} catch (error2) {
			try {
				// 3rd, attempt to install and require the id as a package
				pipeExec(`npm install --no-save ${id}`);

				return require(id);
			} catch (error3) {
				// otherwise, throw the original error
				throw error;
			}
		}
	}
}

function pipeExec(cmd, opts) {
	return execSync(cmd, {
		stdio: ['pipe', 'pipe', process.stderr],
		...opts
	});
}
