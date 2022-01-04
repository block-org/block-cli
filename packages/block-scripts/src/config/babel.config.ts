import babelConfig from '@block-org/block-babel-config';
import getConfigProcessor from '../scripts/utils/getConfigProcessor';

let config = babelConfig;

const processor = getConfigProcessor('babel');
if (processor) {
  config = processor(config) || config;
}

export default config;
