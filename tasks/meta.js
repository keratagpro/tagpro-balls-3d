import gulp from 'gulp';
import template from 'gulp-template';
import rename from 'gulp-rename';

import project from '../package.json';

export default function meta() {
	return gulp.src('./src/meta.tpl.js')
		.pipe(template({
			version: project.version
		}, { interpolate: /{{([\s\S]+?)}}/g }))
		.pipe(rename('tagpro-balls-3d.meta.js'))
		.pipe(gulp.dest('./build'));
};