const noteModules = []
require('fs').readdirSync(__dirname).forEach(function(file) {
	if (file.match(/\.md$/) !== null && file !== 'README.md') {
		const name = file.replace('.md', '');
		noteModules.push(name);
	}
});
module.exports = [
	"/pages/algorithm/",
	...noteModules
];
