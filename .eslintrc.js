/* Note: To use ESlint, global install eslint, eslint-plugin-vue, and eslint-config-vue
   
   `sudo npm install -g eslint eslint-plugin-vue eslint-config-vue`

   You'll want to set up your editor with the official eslint plugin as well.

   */

module.exports = {
    "env": {
      "browser": true,
      "es6": true
    },
    // Global variables set via webpack.ProvidePlugin
    //"globals": {
    //  "$": false,
    //  "jQuery": false,
    //  "window.jQuery": false,
    //  "Tether": false
    //},
    //"plugins": [
    //  "vue"
    //],
    //"extends": [
    //  "vue"
    //],
    "parserOptions": {
      "sourceType": "module",
		"ecmaFeatures": {
			"experimentalObjectRestSpread": true
		}
    },
    "rules": {
      "indent": [
          "error",
          "tab"
      ],
      "linebreak-style": 0,
	  "quotes": [
		  "error",
		  "single"
	  ],
      "semi": [
        "error",
        "always"
      ],
      "no-mixed-spaces-and-tabs": [2, "smart-tabs"],
      "camelcase": 0,
      "no-use-before-define": 0,
      "no-plusplus": 0,
      "consistent-return": 0,
      "no-underscore-dangle": 0,
      "arrow-body-style": 0,
      "no-console": 0,
      "object-curly-spacing": 0,
      "no-multiple-empty-lines": 0,
      "spaced-comment": 0
    }
};
