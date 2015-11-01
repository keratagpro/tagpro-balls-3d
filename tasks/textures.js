import _ from 'lodash';
import glob from 'glob';
import { posix as path } from 'path';
import fs from 'fs';

const ROOT_URL = 'https://keratagpro.github.io/tagpro-balls-3d/textures';

export default function textures(done) {
	process.chdir('assets');

	glob('textures/**/*.*', function(err, files) {
		var result = _(files).map(f => {
			var file = path.relative('textures', f);

			return {
				name: path.basename(file, path.extname(file)),
				tag: path.dirname(file),
				path: path.join(ROOT_URL, file)
			};
		});

		fs.writeFile('./textures.json', JSON.stringify(result, null, '\t'), done);
	});
}