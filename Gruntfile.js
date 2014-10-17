
module.exports = function(grunt) {
	grunt.initConfig({
		coffee: {
			default: {
				expand: true,
				cwd: __dirname,
				src: ['*.coffee'],
				dest: 'bin',
				ext: '.js',
				options: {
					bare: true
				}
			},
			back: {
				expand: true,
				cwd: __dirname + '/src/back',
				src: ['**/*.coffee'],
				dest: 'bin',
				ext: '.js',
				options: {
					bare: true
				}
			},
			front: {
				expand: true,
				cwd: __dirname + '/src/front',
				src: ['**/*.coffee'],
				dest: 'public',
				ext: '.js',
				options: {
					bare: true
				}
			}
		},
		browserify: {
			js: {
				src: 'public/src/app.js',
				dest: 'public/src/browserify-app.js'
			}
		},
		copy: {
			all: {
				expand: true,
				cwd: './src/front',
				src: ['**', '!**/*.coffee', '!**/*.less'],
				dest: 'public'
			}
		},
		less: {
			production: {
				options: {
					paths: ["assets/css"],
					cleancss: true
				},
				files: {
					"public/style/main.css": "src/front/style/main.less"
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-coffee');
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-less');

	grunt.registerTask('default', ['coffee', 'browserify', 'copy:all', 'less']);
};