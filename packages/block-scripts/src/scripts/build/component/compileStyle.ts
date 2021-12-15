import fs from 'fs-extra';
import path from 'path';
import glob from 'glob';
import chokidar from 'chokidar';
import gulp from 'gulp';
import gulpIf from 'gulp-if';
import rename from 'gulp-rename';
import replace from 'gulp-replace';
import cleanCSS from 'gulp-clean-css';
import mergeStream from 'merge-stream';
import { print } from '@underspare/dev-utils';

import handleStyleJSEntry from './handleStyleJSEntry';
import styleConfig from '../../../config/style.config';
import { BUILD_ENV_MODE } from '../../../constant';

const { css: cssConfig, asset: assetConfig } = styleConfig;

/**
 * Output less compilation errors, and avoid the program from exiting due to errors
 * @param stream 
 * @returns 
 */
const notifyLessCompileResult = (stream) => {
  let hasError = false;
  return stream
    .on('error', function (error) {
      hasError = true;
      print.error('[block-scripts]', 'Failed to update style');
      console.error(error);
      this.emit('end');
    })
    .on('end', () => {
      !hasError && print.info('[block-scripts]', `Style updated at ${new Date().toLocaleString()}`);
    });
};

/**
 * Copy the files that need to be monitored to the esm/lib directory
 * @returns 
 */
function copyFileWatched() {
  const patternArray = cssConfig.watch;
  const destDirs = [cssConfig.output.esm, cssConfig.output.cjs].filter((path) => !!path);

  if (destDirs.length) {
    return new Promise((resolve, reject) => {
      let stream: NodeJS.ReadWriteStream = mergeStream(
        patternArray.map((pattern) =>
          gulp.src(pattern, { allowEmpty: true, base: cssConfig.watchBase[pattern] })
        )
      );

      destDirs.forEach((dir) => {
        stream = stream.pipe(gulp.dest(dir));
      });

      stream.on('end', resolve).on('error', (error) => {
        print.error('[block-scripts]', 'Failed to build css, error in copying files');
        console.error(error);
        reject(error);
      });
    });
  }

  return Promise.resolve(null);
}

/**
 * Dist all less files to dist
 * @param cb 
 */
function distLess(cb) {
  const { path: distPath, rawFileName } = cssConfig.output.dist;
  let entries = [];

  cssConfig.entry.forEach((e) => {
    entries = entries.concat(glob.sync(e));
  });

  if (entries.length) {
    const texts = [];

    entries.forEach((entry) => {
      // Remove the first level directory
      const esEntry = cssConfig.output.esm + entry.slice(entry.indexOf('/'));
      const relativePath = path.relative(distPath, esEntry);
      const text = `@import "${relativePath}";`;

      if (esEntry.startsWith(`${cssConfig.output.esm}/style`)) {
        texts.unshift(text);
      } else {
        texts.push(text);
      }
    });

    fs.outputFileSync(`${distPath}/${rawFileName}`, texts.join('\n'));
  }

  cb();
}

/**
 * Compile less, and output css to at esm/lib
 * @returns 
 */
function compileLess() {
  const destDirs = [cssConfig.output.esm, cssConfig.output.cjs].filter((path) => path);

  if (destDirs.length) {
    let stream = gulp
      .src(cssConfig.entry, { allowEmpty: true })
      .pipe(cssConfig.compiler(cssConfig.compilerOptions))
      .pipe(cleanCSS());

    destDirs.forEach((dir) => {
      stream = stream.pipe(gulp.dest(dir));
    });

    return stream.on('error', (error) => {
      print.error('[block-scripts]', 'Failed to build css, error in compiling less');
      console.error(error);
    });
  }

  return Promise.resolve(null);
}

/**
 * Compile the packaged less into css
 * @param isDev 
 * @returns 
 */
function distCss(isDev: boolean) {
  const { path: distPath, rawFileName, cssFileName } = cssConfig.output.dist;
  const needCleanCss = !isDev && (!BUILD_ENV_MODE || BUILD_ENV_MODE === 'production');

  const stream = gulp
    .src(`${distPath}/${rawFileName}`, { allowEmpty: true })
    .pipe(cssConfig.compiler(cssConfig.compilerOptions));

  // Errors should be thrown, otherwise it will cause the program to exit
  if (isDev) {
    notifyLessCompileResult(stream);
  }

  return stream
    .pipe(
      // The less file in the /dist is packaged from the less file in /esm, so its static resource path must start with ../esm
      replace(
        new RegExp(`(\.{2}\/)+${cssConfig.output.esm}`, 'g'),
        path.relative(cssConfig.output.dist.path, assetConfig.output)
      )
    )
    .pipe(gulpIf(needCleanCss, cleanCSS()))
    .pipe(rename(cssFileName))
    .pipe(gulp.dest(distPath))
    .on('error', (error) => {
      print.error('[block-scripts]', 'Failed to build css, error in dist all css');
      console.error(error);
    });
}

/**
 * Match the resource that matches the entry glob and copy it to the /asset
 * @returns Stream
 */
function copyAsset() {
  return gulp.src(assetConfig.entry, { allowEmpty: true }).pipe(gulp.dest(assetConfig.output));
}

/**
 * Watch style
 */
export function watch() {
  const cwd = process.cwd();

  const fastBuild = gulp.parallel(
    copyAsset,
    gulp.series(copyFileWatched, distLess, () => {
      distCss(true);
    })
  );

  // First build
  fastBuild(null);

  const watcher = chokidar.watch(cssConfig.watch, {
    ignoreInitial: true,
  });

  watcher.on('all', (event, fullPath) => {
    const relPath = fullPath.replace(cwd, '');
    print.info(`[${event}] ${relPath}`);
    try {
      fastBuild(null);
    } catch { }
  });
}

/**
 * Build style
 * @returns 
 */
export function build() {
  return new Promise<void>((resolve) => {
    gulp.series(
      gulp.parallel(copyAsset, copyFileWatched, compileLess, handleStyleJSEntry),
      gulp.parallel(distLess, distCss.bind(null, false)),
      gulp.parallel(() => resolve(null))
    )(null);
  });
}
