import gulp from 'gulp';

import assets from './tasks/assets';
import build from './tasks/build';
import meta from './tasks/meta';
import deploy from './tasks/deploy';
import watch from './tasks/watch';
import textures from './tasks/textures';

gulp.task(assets);
gulp.task(build);
gulp.task(deploy);
gulp.task(meta);
gulp.task(watch);
gulp.task(textures);

gulp.task('default', gulp.parallel('build', 'meta'));