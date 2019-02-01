import babel from 'rollup-plugin-babel';
import { terser } from "rollup-plugin-terser";

export default {
	input: 'src/index.mjs',
	output: [
		{ file: 'index.js', format: 'cjs' },
		{ file: 'index.mjs', format: 'esm' },
		{ file: 'browser.js', format: 'iife', name: 'posthtml' }
	],
	plugins: [
		babel({
			plugins: [
				'@babel/proposal-class-properties',
				'async-to-promises',
				'transform-for-of-as-array'
			],
			presets: [
				['@babel/env', { modules: false, targets: { node: 6 } }]
			]
		}),
		terser()
	]
};
