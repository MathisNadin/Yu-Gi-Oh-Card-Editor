import { Fragment, JSX } from 'react';
import { classNames } from 'mn-tools';

export type TTextAdjustState = 'unknown' | 'tooBig' | 'tooSmall';

export class CardBuilderService {
  public get specialCharsRegex() {
    return /([^a-zA-Z0-9éäöüçñàèùâêîôûÉÄÖÜÇÑÀÈÙÂÊÎÔÛ\s.,;:'"/?!+-/&"'()`_^=])/;
  }

  public getNameSpecialCharClass(part: string, tcgAt: boolean) {
    return classNames('special-char-span', {
      'tcg-at': tcgAt && part === '@',
      hash: part === '#',
      plusminus: part === '±',
    });
  }

  private adjustLineHeight(fontSize: number): number {
    const newLineHeight = Math.round((1 + (30 - fontSize) / 90) * 10) / 10;
    if (newLineHeight < 1.05) return 1.05;
    if (newLineHeight > 1.2) return 1.2;
    return newLineHeight;
  }

  public predictSizes(options: {
    lines: string[];
    fontSize: number;
    lineHeight: number;
    maxWidth: number;
    maxHeight: number;
  }) {
    let { lines, fontSize, lineHeight, maxWidth, maxHeight } = options;

    let estimatedWidth: number;
    let estimatedHeight: number;
    do {
      const averageCharWidth = fontSize * 0.5;
      const charsPerLine = Math.floor(maxWidth / averageCharWidth);
      let lineCount = 0;
      for (const line of lines) {
        lineCount += Math.ceil(line.length / charsPerLine);
      }

      estimatedWidth = charsPerLine * averageCharWidth;
      estimatedHeight = lineCount * lineHeight * fontSize;

      if (estimatedWidth > maxWidth || estimatedHeight > maxHeight) {
        fontSize = Math.round((fontSize - 0.1) * 10) / 10; // Diminuer la taille de la police
        lineHeight = this.adjustLineHeight(fontSize); // Ajuster l'interligne
      } else {
        break; // Taille acceptable trouvée
      }
    } while (fontSize > 5 && (estimatedWidth > maxWidth || estimatedHeight > maxHeight));

    return { fontSize, lineHeight };
  }

  public getProcessedText(options: { text: string; index: number; tcgAt: boolean; forceBulletAtStart?: boolean }) {
    const { text, index, tcgAt, forceBulletAtStart } = options;

    const parts = text.split(/(●|•)/).map((part) => part.trim() || '\u00A0');
    // If the first part is empty while there are multiple parts,
    // it means the text started with a bullet point
    if (parts.length > 1 && parts[0] === '\u00A0') parts.shift();

    let nextHasBullet = false;
    const processedText: JSX.Element[] = [];

    parts.forEach((part, i) => {
      if (part === '●' || part === '•') {
        nextHasBullet = true;
      } else {
        // Split the part on '@' and '±' while keeping the symbols
        const modifiedPart = part.split(/(@|#|±)/).map((token, subIndex) => {
          if (token === '@') {
            return (
              <span key={`at-${index}-${i}-${subIndex}`} className='at-char'>
                @
              </span>
            );
          }
          if (token === '#') {
            return (
              <span key={`pm-${index}-${i}-${subIndex}`} className='hash-char'>
                #
              </span>
            );
          }
          if (token === '±') {
            return (
              <span key={`pm-${index}-${i}-${subIndex}`} className='plusminus-char'>
                ±
              </span>
            );
          }
          // Regular text fragment
          return <Fragment key={`fragment-${index}-${i}-${subIndex}`}>{token}</Fragment>;
        });

        processedText.push(
          <span
            key={`processed-text-${index}-${i}`}
            className={classNames('span-text', {
              'with-bullet-point': nextHasBullet || (!i && forceBulletAtStart),
              'in-middle': i > 1,
              'with-tcg-at': tcgAt,
            })}
          >
            {modifiedPart}
          </span>
        );

        nextHasBullet = false;
      }
    });

    return processedText;
  }

  public checkTextSize(options: {
    container: HTMLDivElement;
    currentAdjustState: TTextAdjustState;
    currentFontSize: number;
    currentLineHeight: number;
  }): {
    fit: boolean;
    adjustState: TTextAdjustState;
    fontSize?: number;
    lineHeight?: number;
  } {
    const { container, currentFontSize, currentLineHeight, currentAdjustState } = options;

    // Get paragraph elements
    const texts = container.childNodes as NodeListOf<HTMLParagraphElement>;
    if (!texts?.length || currentFontSize === 0) {
      return { fit: true, adjustState: 'unknown' };
    }

    // Calculate dimensions
    let textHeight = 0;
    let textWidth = 0;
    texts.forEach((text) => {
      textHeight += text.clientHeight;
      if (text.clientWidth > textWidth) textWidth = text.clientWidth;
    });

    const containerHeight = container.clientHeight;
    const containerWidth = container.clientWidth;

    // If text is larger than container, we need to shrink it.
    if (textHeight > containerHeight || textWidth > containerWidth) {
      const newFontSize = Math.round((currentFontSize - 0.1) * 10) / 10;

      // If we can still shrink
      if (newFontSize >= 5) {
        return {
          fit: false,
          fontSize: newFontSize,
          lineHeight: this.adjustLineHeight(newFontSize),
          adjustState: 'tooBig',
        };
      } else {
        // Can't shrink further
        return { fit: true, adjustState: 'unknown' };
      }
    }

    // If text is smaller than container, maybe we can enlarge it or improve line spacing.
    if (textHeight < containerHeight || textWidth < containerWidth) {
      // If we previously shrank text ('tooBig'), try adjusting lineHeight slightly
      if (currentAdjustState === 'tooBig') {
        if (currentLineHeight < 1.2) {
          let newLineHeight = currentLineHeight + 0.1;
          if (newLineHeight > 1.2) newLineHeight = 1.2;
          return {
            fit: false,
            lineHeight: newLineHeight,
            adjustState: currentAdjustState,
          };
        } else {
          // We've hit our optimal line height limit
          return { fit: true, adjustState: 'unknown' };
        }
      } else {
        // Otherwise, try making the text bigger
        const newFontSize = Math.round((currentFontSize + 0.1) * 10) / 10;

        // Can we still enlarge?
        if (newFontSize <= 30) {
          return {
            fit: false,
            fontSize: newFontSize,
            lineHeight: this.adjustLineHeight(newFontSize),
            adjustState: 'tooSmall',
          };
        } else {
          // We've reached a max size limit
          return { fit: true, adjustState: 'unknown' };
        }
      }
    }

    // If we are here, it means text perfectly fits as is
    return { fit: true, adjustState: 'unknown' };
  }
}
