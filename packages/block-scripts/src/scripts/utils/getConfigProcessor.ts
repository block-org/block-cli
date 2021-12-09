import fs from 'fs-extra';
import { print } from '@underlinen/dev-utils';
import { CWD } from '../../constant';

/**
 * Get project .config/ processor
 * @param configType 
 * @returns 
 */
export default function getConfigProcessor<T = Function>(
  configType: 'jest' | 'webpack' | 'babel' | 'docgen' | 'style' | 'tsc'
): T {
  const configFilePath = `${CWD}/.config/${configType}.config.js`;
  let processor = null;
  if (fs.existsSync(configFilePath)) {
    try {
      processor = require(configFilePath);
    } catch (error) {
      print.error('[block-scripts]', `Failed to extend configuration from ${configFilePath}`);
      console.error(error);
      process.exit(1);
    }
  }
  return processor;
}
