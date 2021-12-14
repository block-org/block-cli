import path from 'path';
import fs from 'fs-extra';
import tsc from 'node-typescript-compiler';
import { print } from '@underspare/dev-utils'
import { BUILD_ENV_TS_COMPILER, CWD } from '../../../constant';
import tscConfig from '../../../config/tsc.config';


interface CompileOptions {
  type: 'esm' | 'cjs';
  outDir: string;
  watch?: boolean;
}

/**
 * Get config from root project tsconfig.json
 * @param tsconfigPath 
 * @param subConfig 
 * @returns 
 */
const getTSConfig = (
  tsconfigPath = path.resolve(CWD, 'tsconfig.json'),
  subConfig = { compilerOptions: {} }
) => {
  if (fs.pathExistsSync(tsconfigPath)) {
    const config = fs.readJsonSync(tsconfigPath);
    const compilerOptions = (config && config.compilerOptions) || {};
    const subCompilerOptions = (subConfig && subConfig.compilerOptions) || {};

    // Avoid overwriting of the compilation options of subConfig
    subConfig.compilerOptions = { ...compilerOptions, ...subCompilerOptions };
    Object.assign(config, subConfig);

    if (config.extends) {
      return getTSConfig(path.resolve(path.dirname(tsconfigPath), config.extends), config);
    }

    return config;
  }
  return { ...subConfig };
};


async function withBabel({  }: CompileOptions) {

}

/**
 * Build TS with TSC
 * @param param0 
 * @returns 
 */
function withTSC({ type, outDir, watch }: CompileOptions) {
  const { compilerOptions } = getTSConfig();
  let module = type === 'esm' ? 'es6' : 'commonjs';

  // Read module filed from the default configuration (es6 / es2020 / esnext)
  if (type === 'esm') {
    const regexpESM = /^esm/i;

    if (
      typeof tscConfig.module === 'string' &&
      regexpESM.test(tscConfig.module)
    ) {
      module = tscConfig.module;
    } else if (
      typeof compilerOptions?.module === 'string' &&
      regexpESM.test(compilerOptions.module)
    ) {
      module = compilerOptions.module;
    }
  }

  return tsc.compile({
    ...tscConfig,
    module,
    outDir,
    watch: !!watch,
    declaration: type === 'esm',
  });
}

/**
 * Compile typescript surport TSC and Babel and more ...
 * @param options 
 * @returns 
 */
const compileTS = (options: CompileOptions) => {
  print.info('[block-scripts]', `Start to build ${options.type} module...`);

  return (
    BUILD_ENV_TS_COMPILER === 'babel'
      ?
      withBabel(options)
      :
      withTSC(options)
  ).then(
    () => print.success('[block-scripts]', `Build ${options.type} module success!`),
    (error) => {
      throw error;
    }
  );
};

export default compileTS