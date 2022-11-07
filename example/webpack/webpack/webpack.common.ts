import path from 'path'
import serverlessWebpack from 'serverless-webpack'
import { Configuration } from 'webpack'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'

const config: Configuration = {
  stats: 'minimal',
  context: path.resolve(process.cwd()),
  entry: serverlessWebpack.lib.entries,
  resolve: {
    extensions: ['.js', '.json', '.ts'],
  },
  plugins: [],
  target: 'node',
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
        },
      },
    ],
  },
}

if (process.env.ANALYZE) {
  config.plugins?.push(
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
    }),
  )
}

export default config
