import type { Compiler } from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';

export class FixDoctypePlugin {
  apply(compiler: Compiler) {
    compiler.hooks.compilation.tap('FixDoctypePlugin', (compilation) => {
      const hooks = HtmlWebpackPlugin.getHooks(compilation);

      hooks.beforeEmit.tap('FixDoctypePlugin', (data) => {
        // Only fixes malformed doctypes at the head of the document: <!DOCTYPE >
        // Captures and preserves the line break (or lack thereof) immediately after it.
        const malformed = /^<!DOCTYPE\s*>([ \t]*\r?\n)?/i;
        if (malformed.test(data.html)) {
          data.html = data.html.replace(malformed, (_m, trailingNewline?: string) => {
            return `<!DOCTYPE html>${trailingNewline ?? ''}`;
          });
        }
        // Do nothing if the doctype is missing or already correct
        return data;
      });
    });
  }
}

export default FixDoctypePlugin;
