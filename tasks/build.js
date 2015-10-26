import _ from 'lodash';
import { rollup } from 'rollup';
import replace from 'rollup-plugin-replace';
import babel from 'rollup-plugin-babel';
import fs from 'fs';

import { version } from '../package.json';

export default function build() {
	var optionsHtml = fs.readFileSync('./src/components/options.html', 'utf8');
	var optionsCss = fs.readFileSync('./src/components/options.css', 'utf8');

	return rollup({
		entry: './src/index.js',
		external: ['jquery', 'three', 'pixi.js', 'ractive'],
		plugins: [
			replace({
				OPTIONS_HTML: optionsHtml,
				OPTIONS_CSS: optionsCss
			}),
			babel({ sourceMap: true })
		]
	}).then(function(bundle) {
		var meta = _.template(fs.readFileSync('./src/meta.tpl.js', 'utf8'));

		return bundle.write({
			format: 'iife',
			banner: meta({ version }),
			dest: './build/tagpro-balls-3d.user.js'
		});
	});
}