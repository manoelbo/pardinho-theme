// Gulp and package
const { src, dest, series, parallel, watch } = require('gulp');

// Plugins
const chokidar = require('chokidar');
const del = require('del');
const sourcemaps = require('gulp-sourcemaps');
const terser = require('gulp-terser');
const sass = require('gulp-sass')(require('sass'));
const rename = require('gulp-rename');

// Paths
const assetsPath = 'assets/';
const srcPaths = {
  js: 'src/scripts/**/*.js',
  styles: 'src/styles/',
  css: 'src/styles/**/*.css',
  scss: 'src/styles/**/*.scss',
};

function scripts() {
  return src(srcPaths.js)
    .pipe(sourcemaps.init())
    .pipe(
      terser({
        mangle: true,
      })
    )
    .pipe(dest(assetsPath));
}

function minifyScript(path) {
  return src(path)
    .pipe(sourcemaps.init())
    .pipe(
      terser({
        mangle: true,
      })
    )
    .pipe(
      rename(function (path) {
        path.dirname = '';
      })
    )
    .pipe(dest(assetsPath));
}

function styles() {
  return src(srcPaths.scss)
    .pipe(
      sass({
        outputStyle: 'compressed',
      })
    )
    .pipe(dest(assetsPath));
}

function minifyStyle(path) {
  return src(path)
    .pipe(
      sass({
        outputStyle: 'compressed',
      })
    )
    .pipe(
      rename(function (path) {
        path.dirname = '';
      })
    )
    .pipe(dest(assetsPath));
}

// Generate distribution theme
const generateAssets = parallel(scripts, styles);

// Watch
function watchPaths() {
  chokidar.watch(srcPaths.js).on('change', (path) => {
    console.log(`Changed: ${path}`);
    minifyScript(path);
  });
  chokidar.watch(srcPaths.scss).on('change', (path) => {
    console.log(`Changed: ${path}`);
    minifyStyle(path);
  });
}

exports.default = series(generateAssets, watchPaths);

exports.watch = series(watchPaths);

exports.build = series(generateAssets);

function changeSrcCSSExtensions() {
  return src(srcPaths.css)
    .pipe(
      rename(function (path) {
        path.extname = '.scss';
      })
    )
    .pipe(dest(srcPaths.styles));
}

function clearSrcCSS() {
  return del([srcPaths.css]);
}

exports.css_to_scss = series(changeSrcCSSExtensions, clearSrcCSS);
