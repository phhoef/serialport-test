const ExtractTextPlugin = require('extract-text-webpack-plugin')
const path = require('path');

module.exports = {

    watch: true,

    target: 'electron-renderer',

    entry: {
        // order is important, otherwise the styles.css is ignored
        appWindow: [
            './app/src/windows/appWindow.js'
        ]
    },

    output: {
        path: __dirname + '/app/build',
        publicPath: 'build/',
    },

    module: {
        rules: [
            {
                test: /\.(jsx|js)$/,
                loader: 'babel-loader',
                exclude: path.resolve(__dirname, 'node_modules'),
                options: {
                    presets: ['@babel/preset-react'],
                    plugins: ['transform-class-properties', '@babel/plugin-proposal-class-properties']
                }
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract({
                    loader: 'css-loader',
                    options: {
                        modules: true
                    }
                })
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                loader: 'file-loader',
                query: {
                    name: '[name].[ext]?[hash]'
                }
            }
        ]
    },

    plugins: [
        new ExtractTextPlugin({
            filename: 'bundle.css',
            disable: false,
            allChunks: true
        })
    ],

    resolve: {
        extensions: ['.js', '.json', '.jsx']
    }

}
