'use strict';

const PLUGIN_NAME = "HtmlLoadingWebpackPlugin";
const warn = msg => console.warn(`\u001b[33m[${PLUGIN_NAME}] ${msg}\u001b[39m`);
const error = msg => {
  console.error(`\u001b[31mERROR: [${PLUGIN_NAME}] ${msg}\u001b[39m`);
  throw new Error(msg);
};

class HtmlLoadingWebpackPlugin {
  constructor(options = {}) {
    this._options = {
      processHtml: /<!--\s*skeleton\s*-->/,
      css: undefined,
      htmlPluginName: options.htmlPluginName || 'html-webpack-plugin',
    };
    if (typeof options.processHtml !== 'undefined') {
      if (
        typeof options.processHtml !== 'string' &&
        typeof options.processHtml !== 'object' &&
        typeof options.processHtml !== 'function'
      ) {
        warn("options.processHtml expected to be string or RegExp or function!");
      } else {
        this._options.processHtml = options.processHtml;
      }
    }
    if (typeof options.css !== 'undefined') {
      if (typeof options.css !== 'string' && typeof options.css !== 'function') {
        warn("options.css expected to be string or function!");
      } else {
        this._options.css = options.css;
      }
    }
  }

  apply(compiler) {
    compiler.hooks.compilation.tap(PLUGIN_NAME, compilation => {
      // Hook into the html-webpack-plugin processing
      const onBeforeHtmlProcessing = (htmlPluginData, callback) => {
        let { css, header, left, processHtml } = this._options;
        
        const skeletonHtml = `
  <div class="pdr-page-loading hr1-pos-r" style="height: 100vh;">
    <div class="hr1-modal hr1-loading">
      <div class="hr1-loading-inner loader-inner ball-beat">
        <div class="hr1-theme-bg"></div>
        <div class="hr1-theme-bg"></div>
        <div class="hr1-theme-bg"></div>
      </div>
    </div>
  </div>
`;
        let { html } = htmlPluginData;
        if (css) {
          html = html.replace(/\n*([ \t]*)<\/head>/, `
<style type="text/css">
  ${css}
</style>
$1</head>`);
        }
        if (typeof processHtml === 'function') {
          html = processHtml(html, skeletonHtml);
        } else {
          html = html.replace(processHtml, skeletonHtml);
        }
        htmlPluginData.html = html;
        if (callback) {
          callback(null, htmlPluginData);
        } else {
          return Promise.resolve(htmlPluginData);
        }
      };

      if (compilation.hooks.htmlWebpackPluginBeforeHtmlProcessing) {
        compilation.hooks.htmlWebpackPluginBeforeHtmlProcessing.tapAsync(PLUGIN_NAME, onBeforeHtmlProcessing);
      } else {
        const HtmlWebpackPlugin = require(this._options.htmlPluginName);
        if (HtmlWebpackPlugin.getHooks) {
          const hooks = HtmlWebpackPlugin.getHooks(compilation);
          const htmlPlugins = compilation.options.plugins.filter(plugin => plugin instanceof HtmlWebpackPlugin);
          if (htmlPlugins.length === 0) {
            const message = "Error running html-loading-webpack-plugin, are you sure you have html-webpack-plugin before it in your webpack config's plugins?";
            error(message);
          }
          hooks.htmlWebpackPluginBeforeHtmlProcessing.tapAsync(PLUGIN_NAME, onBeforeHtmlProcessing);
        } else {
          const message = "Error running html-loading-webpack-plugin, are you sure you have html-webpack-plugin before it in your webpack config's plugins?";
          error(message);
        }
      }
    });
  }
}

module.exports = HtmlLoadingWebpackPlugin;
