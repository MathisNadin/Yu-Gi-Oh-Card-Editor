export * from './patch';
export * from './is';
export * from './objects';
export * from './misc';

export async function sleep(time: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), time);
  });
}

export function plural(count: number, none: string, single: string, multiple: string) {
  if (!count) return none;
  return (count === 1 ? single : multiple).replace('%%', count.toString());
}

export function formatList(a: string[]) {
  if (a.length === 1) return a[0];
  let last = a.pop();
  return `${a.join(', ')} et ${last}`;
}

export function markdownToHtml(input: string, noParagraph = false) {
  if (!input) return '';

  // on désactive du markup précédent
  input = input.replace(/[\<\>]/g, '');
  input = input.replace(/\\n/g, '\n\n');

  input = input.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  input = input.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  input = input.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  input = input.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
  input = input.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
  input = input.replace(/^###### (.*$)/gim, '<h6>$1</h6>');

  // Convertir gras, italique, souligné
  input = input.replace(/\*\*(.*)\*\*/gim, '<b>$1</b>');
  input = input.replace(/\*(.*)\*/gim, '<i>$1</i>');
  input = input.replace(/__(.*)__/gim, '<u>$1</u>');

  // Convertir les listes à puces
  input = input.replace(/^\* (.*$)/gim, '<ul>\n<li>$1</li>\n</ul>');

  // Convertir les listes numérotées
  input = input.replace(/^\d+\. (.*$)/gim, '<ol>\n<li>$1</li>\n</ol>');

  // Ajouter des sauts de ligne
  input = input.replace(/\n$/gim, '<br />');

  if (noParagraph) {
    input = input.replace(/^\s*\<p\>\s*/, '');
    input = input.replace(/\s*\<\/p\>\s*$/, '');
  }

  // on ajoute du nbsp devant les ?
  // FIXME on devrait aussi faire les ! et les :. Dans $locales ?
  input = input.replace(/\s+\?/g, '&nbsp;?');
  input = input.replace(/<a/g, '<a target="_blank"');
  // FIXME : manque an-emojies
  // input = shortnameToImage(input);
  return input;
}

interface IRemoveMarkdownOptions {
  listUnicodeChar: boolean;
  stripListLeaders: boolean;
  gfm: boolean;
  useImgAltText: boolean;
}

export function removeMarkdown(source: string, options?: IRemoveMarkdownOptions) {
  options = options || ({} as IRemoveMarkdownOptions);
  options.listUnicodeChar = options.hasOwnProperty('listUnicodeChar') ? options.listUnicodeChar : false;
  options.stripListLeaders = options.hasOwnProperty('stripListLeaders') ? options.stripListLeaders : true;
  options.gfm = options.hasOwnProperty('gfm') ? options.gfm : true;
  options.useImgAltText = options.hasOwnProperty('useImgAltText') ? options.useImgAltText : true;

  let output = source || '';

  // Remove horizontal rules (stripListHeaders conflict with this rule, which is why it has been moved to the top)
  output = output.replace(/^(-\s*?|\*\s*?|_\s*?){3,}\s*$/gm, '');

  try {
    if (options.stripListLeaders) {
      if (options.listUnicodeChar)
        output = output.replace(/^([\s\t]*)([\*\-\+]|\d+\.)\s+/gm, `${options.listUnicodeChar} \$1`);
      else output = output.replace(/^([\s\t]*)([\*\-\+]|\d+\.)\s+/gm, '$1');
    }
    if (options.gfm) {
      output = output
        // Header
        .replace(/\n={2,}/g, '\n')
        // Fenced codeblocks
        .replace(/~{3}.*\n/g, '')
        // Strikethrough
        .replace(/~~/g, '')
        // Fenced codeblocks
        .replace(/`{3}.*\n/g, '');
    }
    output = output
      // Remove HTML tags
      .replace(/<[^>]*>/g, '')
      // Remove setext-style headers
      .replace(/^[=\-]{2,}\s*$/g, '')
      // Remove footnotes?
      .replace(/\[\^.+?\](\: .*?$)?/g, '')
      .replace(/\s{0,2}\[.*?\]: .*?$/g, '')
      // Remove images
      .replace(/\!\[(.*?)\][\[\(].*?[\]\)]/g, options.useImgAltText ? '$1' : '')
      // Remove inline links
      .replace(/\[(.*?)\][\[\(].*?[\]\)]/g, '$1')
      // Remove blockquotes
      .replace(/^\s{0,3}>\s?/g, '')
      // Remove reference-style links?
      .replace(/^\s{1,2}\[(.*?)\]: (\S+)( ".*?")?\s*$/g, '')
      // Remove atx-style headers
      .replace(/^(\n)?\s{0,}#{1,6}\s+| {0,}(\n)?\s{0,}#{0,} {0,}(\n)?\s{0,}$/gm, '$1$2$3')
      // Remove emphasis (repeat the line to remove double emphasis)
      .replace(/([\*_]{1,3})(\S.*?\S{0,1})\1/g, '$2')
      .replace(/([\*_]{1,3})(\S.*?\S{0,1})\1/g, '$2')
      // Remove code blocks
      .replace(/(`{3,})(.*?)\1/gm, '$2')
      // Remove inline code
      .replace(/`(.+?)`/g, '$1')
      // Replace two or more newlines with exactly two? Not entirely sure this belongs here...
      .replace(/\n{2,}/g, '\n\n');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return source;
  }
  return output;
}
