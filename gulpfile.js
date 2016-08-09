/**
 * Welcome to the Gulpfile here to replace the Gruntfile for speed, effiency
 * maintainability, and did I mention speed?
 *
 * @author Michael Large @ dbs>Interactive
 * @since March 28, 2016
 *
 * @see https://css-tricks.com/gulp-for-beginners/
 * @see https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md
 * @see https://github.com/gulpjs/gulp/blob/master/docs/API.md
 * @see https://github.com/osscafe/gulp-cheatsheet
 */
(function(){
	'use strict';

	// DEPENDENCIES
	const gulp = require('gulp-help')(require('gulp')); // https://github.com/gulpjs/gulp/ and https://www.npmjs.com/package/gulp-help
	const sass = require('gulp-sass'); // https://www.npmjs.com/package/gulp-sass
	const autoprefixer = require('gulp-autoprefixer'); // https://github.com/sindresorhus/gulp-autoprefixer
	const sourcemaps = require('gulp-sourcemaps'); // https://www.npmjs.com/package/gulp-sourcemaps
	const cleancss = require('gulp-clean-css'); // https://github.com/scniro/gulp-clean-css
	const browserSync = require('browser-sync').create(); // https://www.browsersync.io/docs/gulp/
	const Grunticon = require( 'grunticon-lib' ); // https://github.com/filamentgroup/grunticon-lib
	const concat = require('gulp-concat');  // https://github.com/contra/gulp-concat
	const uglify = require('gulp-uglify'); //https://www.npmjs.com/package/gulp-uglify
	const shell = require('gulp-shell'); // https://www.npmjs.com/package/gulp-shell
	const glob = require('glob');
	const fs = require('fs');
	const path = require('path');
	const request = require('request');
	const tmpDir = require('os').tmpdir();

	// LOCATIONS
	const location = {
		"sass": "./_scss",
		"css": "./css",
		"js": "./js",
		"icons":"./library/icons",
		"local": "http://127.0.0.1:4000/"
	}

	/**
	 * Command: `gulp`
	 * Default Task.
	 */
	gulp.task('default', 'Process Sass and Javascript', ['sass','js', 'jekyll']);

	/**
	 * Command: `gulp sass`
	 * Sass Task
	 */
	gulp.task('sass', 'Process Sass, AutoPrefix, and Minify', function(){
		var sassOptions = {
			outputStyle: 'compressed'
		};

		var apOptions = {
			browsers: ['last 2 versions'],
			cascade: false
		};

		var cleancssOptions = {
			advanced: true,
			aggressiveMerging: true,
			benchmark: false,
			compatibility: 'ie8',
			debug: true,
			keepBreaks: false,
			keepSpecialComments: false,
			mediaMerging: true,
			restructuring: true,
			roundingPrecision: 5,
			semanticMerging: false
		};

		var browserOptions = {
			stream: true
		};

		var stream = gulp
			.src( location.sass + '/**/*.scss' )
			.pipe( sourcemaps.init() )
			.pipe( sass( sassOptions ).on('error', sass.logError ) )
			.pipe( autoprefixer( apOptions ) )
			.pipe( cleancss( cleancssOptions ) )
			.pipe( sourcemaps.write( '.' ) )
			.pipe( gulp.dest( location.css ) )
			.pipe( browserSync.reload( browserOptions ) );

		return stream;
	});

	gulp.task('browserSync', false, function(){
		browserSync.init({
			proxy: location.local
		});
	});

	gulp.task('sass:watch', 'Process Sass and Watch for changes', ['browserSync', 'sass', 'js'], function(){
		var sassWatch = gulp.watch( location.sass + '/**/*.scss', ['sass']);
		sassWatch.on('change', function(event){
			var path = event.path;
			console.log( path.substring(path.lastIndexOf('/')+1) + " was " + event.type );
		});
	});

	gulp.task('icons', 'Process Icons with Grunticon', function(done){
		var gulpiconOptions = {
			datasvgcss: "icons.data.svg.css",
			datapngcss: "icons.data.png.css",
			urlpngcss: "icons.fallback.css",
			previewhtml: "preview.html",
			loadersnippet: "grunticon.loader.js",
			enhanceSVG: true,
			corsEmbed: false,
			pngfolder: "png",
			cssprefix: ".icon-",
			defaultWidth: "350px",
			defaultHeight: "350px",
			dynamicColorOnly: true,
			cssbasepath: "/",
			compressPNG: true,
			dest: location.icons + "/dist",
			colors: {
				black: "#000000",
				white: "#FFFFFF",
				green: "#aaea51"
			}
		};

		const iconDir = location.icons + "/src/";

		var files = fs.readdirSync(iconDir).map(function (fileName) {
			return path.join(iconDir, fileName);
		});

		var grunticon = new Grunticon(files, location.icons + "/dist/", gulpiconOptions);
		grunticon.process(done);
	});

	gulp.task('js', 'Process and Minify JavaScript', function(){
		var stream = gulp
			.src([
				location.js + '/vendors/**/*.js',
				location.js + 'scripts.js'
			])
			.pipe(concat('global.min.js'))
			.pipe(gulp.dest(location.js))
			.pipe(uglify())
			.pipe(gulp.dest(location.js));

		return stream;
	});

	gulp.task('jekyll', function (gulpCallback){
		var spawn = require('child_process').spawn;
		var jekyll = spawn('jekyll', ['build'], {stdio: 'inherit'});

		jekyll.on('exit', function(code){
			gulpCallback(code === 0 ? null : 'ERROR: Jekyll Process exited with an error: ' + code);
		});
	});

})();
