import compileTS from './compileTS';
import { CWD, DIR_NAME_CJS, DIR_NAME_ESM } from '../../../constant';


const DIR_PATH_ESM = `${CWD}/${DIR_NAME_ESM}`;
const DIR_PATH_CJS = `${CWD}/${DIR_NAME_CJS}`;


const buildESM = () => {
  return compileTS({ outDir: DIR_PATH_ESM, type: 'esm' });
};

const buildCJS = () => {
  return compileTS({ outDir: DIR_PATH_CJS, type: 'cjs' });
};

const buildUMD = () => { };

const buildCSS = () => { };

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