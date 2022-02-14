module.exports = {
  webpack: (config) => {
    //"react/jsx-runtime": "react/jsx-runtime.js"
    config.resolve ??= {}
    config.resolve.alias = {
      ...config.resolve.alias,
      'react/jsx-dev-runtime': 'react/jsx-dev-runtime.js',
      'react/jsx-runtime': 'react/jsx-runtime.js',
    }

    console.log(config)
    return config
  },
}
