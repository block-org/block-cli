export default function getUse(cssModule) {
  const options = cssModule ?
    {
      // https://webpack.js.org/loaders/css-loader/#modules
      modules: {
        localIdentName: '[local]-[hash:10]',
      }
    }
    : {};

  return [
    {
      loader: 'style-loader',
    },
    {
      loader: 'css-loader',
      options,
    },
    {
      loader: 'less-loader',
      options: {
        javascriptEnabled: true,
      },
    },
  ];
}