var runSequence = require('run-sequence');
var gulp = require('gulp');
var less = require('gulp-less');
var concat = require('gulp-concat');
var autoprefixer = require('gulp-autoprefixer');
var pug = require('gulp-pug');
var inheritance = require('gulp-pug-inheritance');
var cached = require('gulp-cached');
var gulpif = require('gulp-if');
var filter = require('gulp-filter');
var rename = require('gulp-rename');
var fs = require('fs');
var data = require('gulp-data');
var spritesmith = require('gulp.spritesmith');

gulp.task('copy', function() {
	gulp.src(['app/resources/**/*', '!sprite/**/*'])
		.pipe(gulp.dest('dist/assets'));
});

gulp.task('sprite', function() {
	var spriteData = 
		gulp.src('app/resources/sprite/*.png')
			.pipe(spritesmith({
				imgName: 'sprite.png',
				imgPath: '../images/sprite.png',
				cssName: 'sprite.less',
				cssFormat: 'less',
				algorithm: 'binary-tree',
				cssTemplate: 'less.template.mustache',
				cssVarMap: function(sprite) {
					sprite.name = 'icon-' + sprite.name;
				}
			}));

	spriteData.img.pipe(gulp.dest('dist/assets/images'));
	spriteData.css.pipe(gulp.dest('app/styles/helpers'));
});

gulp.task('styles', function() {
	return gulp.src('app/styles/*.less')
		.pipe(less({
			plugins: [require('less-plugin-glob')] 
		}))
		.pipe(autoprefixer())
		.pipe(concat('app.css'))
		.pipe(gulp.dest('dist/assets/css'));
	});

gulp.task('templates', function() {
	return gulp.src('app/**/*.pug')
		.pipe(gulpif(global.isWatching, cached('pug')))
		.pipe(inheritance({basedir: 'app'}))
		.pipe(filter(function (file) {return /app[\\\/]pages/.test(file.path);}))
		.pipe(data(function(file) {
			return {
				'data': JSON.parse(fs.readFileSync('app/data.json')),
			};
		}))
		.pipe(pug({pretty: '\t'}))
		.pipe(rename({dirname: '.'}))
		.pipe(gulp.dest('dist'));
});

gulp.task('watch', function () {
	gulp.watch('app/{blocks,styles}/**/*.less',['styles']);
	gulp.watch('app/{blocks,pages}/**/*.pug',['templates']);
	gulp.watch('app/resources/**/*',['copy']);

});

gulp.task('default', function () {
		runSequence(['copy', 'sprite', 'templates', 'styles', 'watch']);
});