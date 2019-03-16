import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

const isBrowser = String(process.env.NODE_ENV).includes('browser');
const isBrowserDev = String(process.env.NODE_ENV).includes('browserdev');
const isCli = String(process.env.NODE_ENV).includes('cli');

const pathname = isCli ? 'cli/index' : 'index';
const input = `src/${pathname}.js`;
const output = isBrowserDev
	? { file: 'browser.development.js', format: 'cjs', sourcemap: true }
: isBrowser
	? { file: 'browser.js', format: 'cjs' }
: isCli
	? { file: 'cli.js', format: 'cjs' }
: [
	{ file: 'index.js', format: 'cjs', sourcemap: true },
	{ file: 'index.mjs', format: 'esm', sourcemap: true }
];
const plugins = [
	babel()
].concat(
	isBrowser ? [
		nodeResolve(),
		commonjs(),
		babel({
			babelrc: false,
			presets: [
				['@babel/env', {
					loose: true,
					modules: false,
					targets: 'last 2 chrome versions, last 2 edge versions, last 2 firefox versions, last 2 safari versions, last 2 ios versions',
					useBuiltIns: 'entry'
				}]
			]
		}),
		modernUMD('PHTML', 'PHTML')
	] : [],
	isBrowser && !isBrowserDev ? terser() : [],
	isCli ? [
		trimUseStrict(),
		addHashBang()
	] : []
);

export default { input, output, plugins };

function modernUMD (name, exportName) {
	const replacee = `module.exports = ${exportName}`;
	const replacer = `"object"==typeof self?self.${name}=${exportName}:"object"==typeof module&&module.exports&&(module.exports=${exportName})`;

	return {
		name: 'modern-umd',
		renderChunk (code) {
			return `!function(){${
				code
				.replace(/'use strict';\n*/, '')
				.replace(replacee, replacer)
			}}()`;
		}
	};
}

function addHashBang () {
	return {
		name: 'add-hash-bang',
		renderChunk (code) {
			return `#!/usr/bin/env node\n${code}`;
		}
	};
}

function trimUseStrict () {
	return {
		name: 'trim-use-strict',
		renderChunk (code) {
			return code.replace(/\s*('|")?use strict\1;\s*/, '');
		}
	};
}
