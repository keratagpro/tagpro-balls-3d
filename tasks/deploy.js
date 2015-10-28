import ghPages from 'gh-pages';
import gitConfig from 'git-config';

import project from '../package.json';

export default function deploy(done) {
	ghPages.publish('./build', {
		user: gitConfig.sync('.git/config').user,
		clone: '.publish',
		message: `Update to ${project.version}`
	}, done);
}