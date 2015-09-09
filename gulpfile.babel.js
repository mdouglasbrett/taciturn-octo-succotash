/**
 *
 *  Web Starter Kit
 *  Copyright 2015 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */

// This gulpfile makes use of new JavaScript features.
// Babel handles this without us having to do anything. It just works.
// You can read more about the new JavaScript features here:
// https://babeljs.io/docs/learn-es2015/

import fs from 'fs';
import path from 'path';
import gulp from 'gulp';
import del from 'del';
import runSequence from 'run-sequence';
import browserSync from 'browser-sync';
import gulpLoadPlugins from 'gulp-load-plugins';
import pkg from './package.json';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

// Lint JavaScript
gulp.task('jshint', () => {
    return gulp.src('app/scripts/main.js')
        .pipe(reload({stream: true, once: true}))
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'))
        .pipe($.if(!browserSync.active, $.jshint.reporter('fail')));
});

// Run Babel for es6 goodness
gulp.task('babel', () => {
      return gulp.src('app/scripts/main.js')
      .pipe($.babel())
      .pipe(gulp.dest('app/scripts/'));
});

// Compile and automatically prefix stylesheets
gulp.task('styles', () => {
    const AUTOPREFIXER_BROWSERS = [
        'ie >= 10',
        'ie_mob >= 10',
        'ff >= 30',
        'chrome >= 34',
        'safari >= 7',
        'opera >= 23',
        'ios >= 7',
        'android >= 4.4',
        'bb >= 10'
    ];

return gulp.src([
    'app/styles/*.scss'
])
    .pipe($.sourcemaps.init())
    .pipe($.sass({
        precision: 10
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest('app/styles'))
    //concatenate and minify styles
    .pipe($.minifyCss())
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('dist/styles'))
    .pipe($.size({title: 'styles'}));
});


//Concatenate and minify scripts
gulp.task('scripts', () => {
    const assets = $.useref.assets();

    return gulp.src('app/index.html')
      .pipe(assets)
      .pipe($.uglify())
      .pipe(assets.restore())
      .pipe($.useref())
      .pipe(gulp.dest('dist'))
});


// Clean output directory
gulp.task('clean', cb => del(['.tmp', 'dist/*', '!dist/.git'], {dot: true}, cb));

// Watch files for changes & reload
gulp.task('serve', ['styles'], () => {
    browserSync({
        notify: false,
        // Customize the BrowserSync console logging prefix
        logPrefix: 'WSK',
        // Run as an https by uncommenting 'https: true'
        // Note: this uses an unsigned certificate which on first access
        //       will present a certificate warning in the browser.
        // https: true,
        server: ['app']
    });

gulp.watch(['app/**/*.html'], reload);
gulp.watch(['app/styles/**/*.{scss,css}'], ['styles', reload]);
gulp.watch(['app/scripts/**/*.js'], ['jshint', 'babel']);
});


// Build and serve the output from the dist build
gulp.task('serve:dist', ['default'], () => {
    browserSync({
        notify: false,
        logPrefix: 'WSK',
        // Run as an https by uncommenting 'https: true'
        // Note: this uses an unsigned certificate which on first access
        //       will present a certificate warning in the browser.
        // https: true,
        server: 'dist',
        baseDir: 'dist'
    });
});

// Build production files, the default task
gulp.task('default', ['clean'], cb => {
    runSequence(
        'styles',
            ['jshint', 'babel', 'scripts'],
            cb
    );
});
