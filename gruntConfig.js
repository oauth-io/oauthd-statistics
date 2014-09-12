'use strict';

module.exports = function(gruntConf) {
	gruntConf.coffee['oauthd_plugin_stats'] = {
		expand: true,
		cwd: __dirname,
		src: ['*.coffee'],
		dest: __dirname + '/bin',
		ext: '.js',
		options: {
			bare: true
		}
	};
	gruntConf.watch['oauthd_plugin_stats'] = {
		files: [
			__dirname + '/**/*.coffee'
		],
		tasks: ['coffee:oauthd_plugin_stats']
	};

	return function() {

	}
}