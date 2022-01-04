import webpack from 'webpack'
import { print } from '@underlinen/dev-utils'

export default (config, callback?) => {
  return new Promise<void>((resolve, reject) => {
    webpack(config, (error, stats) => {
      // Cacllback first
      callback && callback(error, stats);

      if (error) {
        print.error(error.stack || error)
      }

      // https://webpack.js.org/configuration/stats/
      print(stats.toString({
        assets: true,
        colors: true,
        warnings: true,
        errors: true,
        errorDetails: true,
        entrypoints: true,
        version: true,
        hash: false,
        timings: true,
        chunks: false,
        chunkModules: false,
        children: false,
      }))

      if (stats.hasErrors()) {
        reject();
      } else {
        resolve(null);
      }
    })
  })
}