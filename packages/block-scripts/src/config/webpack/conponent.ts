import chalk from 'chalk';
import webpack from 'webpack';
import ProgressBarPlugin from 'progress-bar-webpack-plugin';

import { CWD, DIR_NAME_COMPONENT_LIBRARY, DIR_NAME_UMD, BUILD_ENV_DIST_FILENAME_JS, BUILD_ENV_MODE } from "../../constant";
import getConfigProcessor from '../../scripts/utils/getConfigProcessor';

import babelConfig from '../babel.config';
import tscConfig from '../tsc.config';

import { webpackExternalForBlock, getUse } from '../utils'

const { name: packageName, version } = require(`${CWD}/package.json`);
const packageNameWithoutScope = packageName.replace(/^@[^\/]+\//, '');]
// todo
// const version = '0.0.1'
// const packageName = '@block-org/block-ui'
// const packageNameWithoutScope = 'block-ui';

const lessRegex = /\.less$/;
const lessModuleRegex = /\.module\.less$/;

function getTSLoaderOptions() {
  const options: { [key: string]: any } = {
    // Just for simplicity, not all the values in tscConfig are compilerOptions
    compilerOptions: { ...tscConfig },
  }

  if (tscConfig.project) {
    options.configFile = tscConfig.project;
  }

  return options;
}

let config = {
  mode: 'production',
  // https://webpack.js.org/configuration/entry-context/#entry
  entry: {
    block: `${CWD}/${DIR_NAME_COMPONENT_LIBRARY}/index.tsx`,
  },
  // https://webpack.js.org/configuration/output/
  output: {
    path: `${CWD}/${DIR_NAME_UMD}`,
    publicPath: `https://unpkg.com/${packageName}/@latest/${DIR_NAME_UMD}`,
    fileName: '[name].min.js',
    library: '[name]',
    // perfer type
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclues: /node_modules/,
        use: [
          {
            loader: 'balel-loder',
            options: babelConfig,
          },
          {
            loader: 'ts-lodaer',
            options: getTSLoaderOptions(),
          },
        ],
      },
      {
        test: lessRegex,
        exclude: lessModuleRegex,
        use: getUse(false),
      },
      {
        test: /\.css$/,
        sideEffects: true,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
        ],
      },
      {
        test: /\.(png|jpg|gif|ttf|eot|woff|woff2)$/,
        loader: 'file-loader',
        options: {
          esModule: false,
        },
      },
      {
        // https://www.npmjs.com/package/@svgr/webpack
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      },
      {
        test: lessModuleRegex,
        use: getUse(true),
      },
    ]
  },
  externals: [
    // https://webpack.js.org/configuration/externals/#object
    {
      react: {
        root: 'React',
        commonjs2: 'react',
        commonjs: 'react',
        amd: 'react',
      },
      'react-dom': {
        root: 'ReactDOM',
        commonjs2: 'react-dom',
        commonjs: 'react-dom',
        amd: 'react-dom',
      },
    },
    // https://webpack.js.org/configuration/externals/#function
    webpackExternalForBlock,
  ],
  // https://webpack.js.org/configuration/resolve/#resolve
  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  // https://webpack.js.org/configuration/resolve/#resolveloader
  resolveLoader: {
    modules: ['node_modules/@block-org/block-ui/node_modules', 'node_modules'],
  },
  plugins: [
    // https://www.npmjs.com/package/progress-bar-webpack-plugin
    new ProgressBarPlugin({
      format: `[block-scripts]: [:bar] ${chalk.green.bold(':percent')} (:elapsed seconds)`,
    }),
    // https://webpack.js.org/plugins/banner-plugin/#root
    new webpack.BannerPlugin({
      banner: `${packageNameWithoutScope} v${version}\n\nCopyright 2021-present, block-org, Inc.\nAll rights reserved.\n`,
    }),
  ],
}

const processor = getConfigProcessor<Function | { component: Function }>('webpack');
// When webpack.config.js directly exposes a function, it defaults to the configuration of component webpack
const realProcessor =
  typeof processor === 'function'
    ? processor
    : processor && processor.component
      ? processor.component
      : null;

if (realProcessor) {
  config = realProcessor(config) || config;
}

// Compatible, avoid the outer layer directly set the entry as a string
if (typeof config.entry === 'string') {
  config.entry = {
    block: config.entry,
  };
}

// 通过 Node Env 传递而来的参数具有最高优先级
if (BUILD_ENV_MODE) {
  config.mode = BUILD_ENV_MODE;
}
if (BUILD_ENV_DIST_FILENAME_JS) {
  config.output.fileName = BUILD_ENV_DIST_FILENAME_JS;
}

export default config;