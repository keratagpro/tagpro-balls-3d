import gulp from 'gulp';

export default function assets() {
	return gulp.src(['./assets/**/*'])
		.pipe(gulp.dest('./build/'));
}