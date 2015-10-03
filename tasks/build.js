import gulp from 'gulp';
import header from 'gulp-header';
import browserify from 'browserify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import fs from 'fs';
import project from '../package.json';

gulp.task('build', function() {
	var b = browserify({
		entries: './src/index.js'
	}).transform({
		global: true,
		ignore: ['**/src/**/*'] // Minify only external dependencies
	}, 'uglifyify');

	return b.bundle()
		.pipe(source('tagpro-balls-3d.user.js'))
		.pipe(buffer())
		.pipe(header(fs.readFileSync('./src/header-globals.js', 'utf8')))
		.pipe(header(fs.readFileSync('./src/header.js', 'utf8'), { version: project.version }))
		.pipe(gulp.dest('./build'));
});