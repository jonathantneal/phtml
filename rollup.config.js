import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

const isBrowser = String(process.env.NODE_ENV).includes('browser');
const isBrowserDev = String(process.env.NODE_ENV).includes('browserdev');
const isCli = String(process.env.NODE_ENV).includes('cli');

const pathname = isCli ? 'cli' : 'index';
const input = `src/${pathname}.mjs`;
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
const targets = isBrowser ? { node: 6 } : { node: 6 };
const plugins = [
	babel({
		plugins: [
			'@babel/proposal-class-properties',
			'async-to-promises',
			'transform-for-of-as-array'
		],
		presets: [
			['@babel/env', {
				loose: true,
				modules: false,
				targets,
				useBuiltIns: 'entry'
			}]
		]
	})
].concat(
	isBrowser ? [
		nodeResolve(),
		commonjs(),
		babel({
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
	isBrowserDev ? [] : terser(),
	isCli ? [] : []
);

export default { input, output, plugins };

function modernUMD(name, exportName) {
	const replacee = `module.exports = ${exportName}`;
	const replacer = `"object"==typeof self?self.${name}=${exportName}:"object"==typeof module&&module.exports&&(module.exports=${exportName})`;

	return {
		name: 'modern-umd',
		renderChunk(code) {
			return `!function(){${
				code
				.replace(/'use strict';\n*/, '')
				.replace(replacee, replacer)
			}}()`;
		}
	};
}

function addHashBang() {
	return {
		name: 'add-hash-bang',
		renderChunk(code) {
			const updatedCode = `#!/usr/bin/env node\n\n${code}`;

			return updatedCode;
		}
	};
}
