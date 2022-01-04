import { print } from '@underspare/dev-utils';

import compileTS from './compileTS';
import { build as buildStyle } from './compileStyle';
import webpackConfig from '../../../config/webpack/conponent';
import webpackWithPromise from '../../utils/webpackWithPromise';
import { CWD, DIR_NAME_CJS, DIR_NAME_ESM } from '../../../constant';

const DIR_PATH_ESM = `${CWD}/${DIR_NAME_ESM}`;
const DIR_PATH_CJS = `${CWD}/${DIR_NAME_CJS}`;

const buildESM = () => {
  return compileTS({ outDir: DIR_PATH_ESM, type: 'esm' });
};

const buildCJS = () => {
  return compileTS({ outDir: DIR_PATH_CJS, type: 'cjs' });
};

const buildUMD = () => {
  print.info('[block-scripts]', 'Start to build dist module...');
  return webpackWithPromise(webpackConfig).then(
    () => print.success('[block-scripts]', 'Build dist module success!'),
    (error) => {
      throw error;
    }
  );
};

const buildCSS = () => {
  print.info('[block-scripts]', 'Start to build css...');
  return buildStyle().then(
    () => print.success('[block-scripts]', 'Build css success!'),
    (error) => {
      throw error;
    }
  );
};

const build = () => { };

export default {
  buildESM,
  buildCJS,
  buildUMD,
  buildCSS,
  build,
  dev: () => {

  }
}