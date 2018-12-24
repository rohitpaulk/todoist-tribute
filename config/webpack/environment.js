const { environment } = require('@rails/webpacker')

environment.loaders.append('ts', {
    test: function(path) {
        let isTest = (path.substr(path.length - 8) == '.spec.ts');
        let isTypescript = (path.substr(path.length - 3) == '.ts');

        return isTypescript && !isTest;
    },
    use: 'ts-loader'
})

module.exports = environment
