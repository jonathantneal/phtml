module.exports = {
	plugins: [
		[
			'@phtml/image-alt',
			{
				alts: {
					'image.jpg': 'test image with generated alt'
				}
			}
		]
	]
};
