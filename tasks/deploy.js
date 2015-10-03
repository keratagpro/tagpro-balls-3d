import gulp from 'gulp';
import ghPages from 'gh-pages';
import path from 'path';
import gitConfig from 'git-config';

gulp.task('deploy', function(done) {
	ghPages.publish('./build', {
		user: gitConfig.sync('.git/config').user,
		clone: '.publish'
	}, done);
});