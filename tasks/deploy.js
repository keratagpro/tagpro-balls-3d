import ghPages from 'gh-pages';
import gitConfig from 'git-config';

export default function deploy(done) {
	ghPages.publish('./build', {
		user: gitConfig.sync('.git/config').user,
		clone: '.publish'
	}, done);
}