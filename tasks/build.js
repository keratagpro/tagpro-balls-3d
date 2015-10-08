import gulp from 'gulp';
import concat from 'gulp-concat';
import template from 'gulp-template';
import rollup from 'rollup';

import { version } from '../package.json';
var rootUrl = "keratagpro.github.io/tagpro-balls-3d";

export default function build() {
	return rollup.rollup({
		entry: './src/index.js',
		external: ['jquery', 'three', 'pixi.js']
	}).then(function(bundle) {
		var output = bundle.generate({
			format: 'iife'
		});

		return gulp.src(['./src/meta.tpl.js', './src/userscript.tpl.js'])
			.pipe(template({
				version,
				rootUrl,
				script: output.code
			}, { interpolate: /{{([\s\S]+?)}}/g }))
			.pipe(concat('tagpro-balls-3d.user.js'))
			.pipe(gulp.dest('./build'));
	});
}