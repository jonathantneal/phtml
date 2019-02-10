import Benchmark from 'benchmark';
import PHTML from '.';
import postHTML from 'posthtml';
import reshape from 'reshape';

const suite = new Benchmark.Suite();

const basicHTML = '<p>Hello World</p>';

suite
.add('pHTML', {
	defer: true,
	fn(deferred) {
		PHTML.process(basicHTML).then(
			result => {
				deferred.resolve();
			}
		);
	}
})
.add('PostHTML', {
	defer: true,
	fn(deferred) {
		postHTML().process(basicHTML).then(
			result => {
				deferred.resolve();
			}
		);
	}
})
.add('Reshape', {
	defer: true,
	fn(deferred) {
		reshape().process(basicHTML).then(
			result => {
				deferred.resolve();
			}
		);
	}
})
.on('complete', () => {
	suite.forEach(test => {
		const { cycles, hz, name, times } = test;
		const results = [ Math.floor(hz), cycles, times.elapsed ].map(result => String(result));
		const padding = results.reduce((length, result) => Math.max(length, String(result).length), 0);
	
		console.log(`${name}:`);
		console.log(`${results[0].padStart(padding)} operations per second`);
		console.log(`${results[1].padStart(padding)} cycles performed`);
		console.log(`${results[2].padStart(padding)} seconds elapsed`);
	});
}).run();
