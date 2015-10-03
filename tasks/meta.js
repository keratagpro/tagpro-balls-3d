import gulp from 'gulp';
import template from 'gulp-template';
import rename from 'gulp-rename';
import fs from 'fs';

import project from '../package.json';

gulp.task('meta', function() {
	return gulp.src('./src/header.js')
		.pipe(template({ version: project.version }))
		.pipe(rename('tagpro-balls-3d.meta.js'))
		.pipe(gulp.dest('./build'));
});