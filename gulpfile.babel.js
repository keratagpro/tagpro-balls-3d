import { sync as glob } from 'glob';

glob('./tasks/**/*.js').forEach(file => require(file));
