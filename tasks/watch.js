import _ from 'lodash';
import gulp from 'gulp';

import build from './build';
import meta from './meta';

export default function watch() {
	gulp.watch('./src/**/*.js', build);
	gulp.watch('./src/meta.tpl.js', meta);
};