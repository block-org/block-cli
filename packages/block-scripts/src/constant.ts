interface ProcessEnv {
  BUILD_ENV_MODE?: 'development' | 'production';
  BUILD_ENV_TS_COMPILER?: 'tsc' | 'babel';
  BUILD_ENV_DIST_FILENAME_JS?: string;
  BUILD_ENV_DIST_FILENAME_CSS?: string;
}

export const {
  BUILD_ENV_MODE,
  BUILD_ENV_TS_COMPILER,
  BUILD_ENV_DIST_FILENAME_JS,
  BUILD_ENV_DIST_FILENAME_CSS,
} = process.env as ProcessEnv;

export const CWD = process.cwd();

export const DIR_NAME_ESM = 'esm';

export const DIR_NAME_CJS = 'lib';

export const DIR_NAME_UMD = 'dist';