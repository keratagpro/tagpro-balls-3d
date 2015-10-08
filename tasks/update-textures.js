import _ from 'lodash';
import glob from 'glob';
import { posix as path } from 'path';
import fs from 'fs';

var texturesTemplate = `
export var textureMap = <%= map %>;

export default <%= array %>;
`;

export default function updateTextures(done) {
	glob('textures/**/*.*', function(err, files) {
		var result = _(files).map(f => {
			var file = path.relative('textures', f);

			return {
				name: path.basename(file, path.extname(file)),
				tag: path.dirname(file),
				path: file
			};
		});

		var grouped = _(result)
			.groupBy(val => _.camelCase(val.tag))
			.mapValues(vals => _(vals)
				.indexBy(val => _.camelCase(val.name))
				.mapValues('path')
				.value()
			)
			.value();

		var tpl = _.template(texturesTemplate);

		fs.writeFile('./src/lib/textures.js', tpl({
			array: JSON.stringify(result, null, '\t'),
			map: JSON.stringify(grouped, null, '\t')
		}), done);
	});
}