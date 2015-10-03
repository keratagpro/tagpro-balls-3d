import gulp from 'gulp';

gulp.task('assets', function() {
	return gulp.src(['./assets/**/*'])
		.pipe(gulp.dest('./build/'));
});