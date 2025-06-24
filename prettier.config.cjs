const shopifyConfig = require('@shopify/prettier-config')

module.exports = {
  ...shopifyConfig,
  plugins: ['prettier-plugin-tailwindcss'],
  semi: false,
  singleQuote: true,
  printWidth: 140,
  tabWidth: 2,
}
