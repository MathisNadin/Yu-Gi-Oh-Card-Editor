import { IYugipediaGetPageByTitleApiResponse } from '..';

export class AbstractWikitextParser {
  protected page: IYugipediaGetPageByTitleApiResponse;
  protected wikitextLines: string[];
  protected pageTitle?: string;

  public constructor(page: AbstractWikitextParser['page']) {
    this.page = page;
    this.wikitextLines = this.getWikitextLines();
  }

  /**
   * Extracts the raw wikitext lines from the page.
   */
  protected getWikitextLines(): AbstractWikitextParser['wikitextLines'] {
    if (!this.page?.query?.pages) return [];

    const pageKeys = Object.keys(this.page.query.pages);
    if (!pageKeys?.length) return [];

    const pageInfo = this.page.query.pages[pageKeys[0]];
    if (!pageInfo?.revisions?.length) return [];

    this.pageTitle = pageInfo.title;

    const wikitext = pageInfo.revisions[0]['*'];
    return wikitext ? wikitext.split('\n') : [];
  }

  /**
   * Utility method to remove wiki markup and extract plain text.
   */
  protected parseWikitextLore(text: string): string {
    text = text.slice(text.indexOf('= ') + 2);
    text = text.replaceAll(/\[\[([^\]]+)\]\]/g, (_, content) => {
      const lastIndex = content.lastIndexOf('|');
      return lastIndex !== -1 ? content.substring(lastIndex + 1) : content;
    });
    text = text.replaceAll(/\[\[|\]\]/g, '');
    text = text.replaceAll(/(\[\[?\w+)(?:\|[\w\s-]+)?(\]\]?)/g, (_, before, after) => before + after);
    text = text.replaceAll(/\s+/g, ' ');
    text = text.replaceAll(/<br\s*\/?>/gi, '\n');
    text = text.replaceAll("''", '');
    // Simple line-by-line cleanup (HTML stripping could be added if needed)
    return text
      .split('\n')
      .map((line) => line.replace(/\u00A0/g, ' ').trim())
      .join('\n');
  }

  /**
   * Utility method to get the value after "= "
   */
  protected getMetadataLineValue(line: string) {
    return line.slice(line.indexOf('= ') + 1).trim();
  }
}
