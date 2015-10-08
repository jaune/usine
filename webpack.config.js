module.exports = {
    entry: {
        'usine': './usine.js'
    },
//    devtool: 'source-map',
    output: {
        filename: '[name].bundle.js',
    },
    module: {
        loaders: [
        ]
    },
    externals: {
        'pixi.js': 'PIXI'
    },
    resolve: {
        extensions: ['', '.js']
    }
}

