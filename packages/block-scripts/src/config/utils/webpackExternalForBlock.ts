// https://webpack.js.org/configuration/externals/#function
const BLOCK_UI_PACKAGE = '@block-org/block-ui';
const BLOCK_UI_DIST = 'block';
const BLOCK_UI_ICON_DIST = 'blockicon';

export default function (context, request, callback) {
  // Compatible with webpack 5, its parameter is ({ context, request }, callback)
  if (typeof request === 'function' && context.request) {
    callback = request;
    request = context.request;
  }

  const getExternal = (packageName, dist, iconDist) => {
    if (request === packageName) {
      return {
        root: dist,
        commonjs: request,
        commonjs2: request,
      };
    }

    if (request === `${packageName}/icon`) {
      return {
        root: iconDist,
        commonjs: request,
        commonjs2: request,
      };
    }
  };

  const external = getExternal(BLOCK_UI_PACKAGE, BLOCK_UI_DIST, BLOCK_UI_ICON_DIST);

  if (external) {
    return callback(null, external);
  }

  callback();
}
