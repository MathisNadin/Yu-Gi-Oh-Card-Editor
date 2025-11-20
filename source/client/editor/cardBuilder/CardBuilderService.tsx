import { Fragment, JSX } from 'react';
import { classNames } from 'mn-tools';

export type TTextAdjustState = 'unknown' | 'growingFont' | 'shrinkingFont' | 'growingLineHeight';

interface ITextAdjustResult {
  fit: boolean;
  adjustState: TTextAdjustState;
  fontSize?: number;
  lineHeight?: number;
}

export class CardBuilderService {
  public get specialCharsRegex() {
    return /([^a-zA-Z0-9éäöüçñàèùâêîôûÉÄÖÜÇÑÀÈÙÂÊÎÔÛ\s.,;:'"/?!+-/&"'()`_^=])/;
  }

  public static readonly MIN_FONT_SIZE = 5;
  public static readonly MAX_FONT_SIZE = 30;
  public static readonly FONT_STEP = 0.1;

  public static readonly MAX_LINE_HEIGHT = 1.2;
  public static readonly LINE_HEIGHT_STEP = 0.01;

  // Minimum line-height depends on font size (hard-coded thresholds)
  public getMinLineHeightForFontSize(fontSize: number): number {
    // For small text, a compact line-height is fine
    if (fontSize < 25) return 1.05;
    if (fontSize < 28) return 1.1;
    return 1.15;
  }

  public getNameSpecialCharClass(part: string, tcgAt: boolean) {
    return classNames('special-char-span', {
      'tcg-at': tcgAt && part === '@',
      // These specific characters are absent from the special-char font
      hash: part === '#',
      plusminus: part === '±',
      'small-pi': part === 'π',
      'capital-delta': part === 'Δ',
      'capital-omega': part === 'Ω',
    });
  }

  public predictSizes(options: { lines: string[]; maxWidth: number; maxHeight: number }): {
    fontSize: number;
    lineHeight: number;
  } {
    const { lines, maxWidth, maxHeight } = options;

    if (!lines.length) {
      return { fontSize: CardBuilderService.MAX_FONT_SIZE, lineHeight: CardBuilderService.MAX_LINE_HEIGHT };
    }

    let fontSize = CardBuilderService.MAX_FONT_SIZE;
    const minFont = CardBuilderService.MIN_FONT_SIZE;
    const step = CardBuilderService.FONT_STEP;

    // Helper to estimate number of lines and text height
    const estimateHeight = (fontSize: number, lineHeight: number) => {
      const averageCharWidth = fontSize * 0.5; // heuristic approximation
      const charsPerLine = Math.max(1, Math.floor(maxWidth / averageCharWidth));

      let lineCount = 0;
      for (const line of lines) {
        const length = line.length || 1;
        lineCount += Math.ceil(length / charsPerLine);
      }

      const estimatedHeight = lineCount * fontSize * lineHeight;
      return estimatedHeight;
    };

    let bestFontSize: number | null = null;
    let bestLineHeight: number | null = null;

    // Phase 1: find largest font size that fits with its minimal line-height
    while (fontSize >= minFont) {
      const minLH = this.getMinLineHeightForFontSize(fontSize);
      const height = estimateHeight(fontSize, minLH);

      if (height <= maxHeight) {
        bestFontSize = fontSize;
        bestLineHeight = minLH;
        break; // we are going from big to small, so first fit is the best font size
      }

      fontSize = Math.round((fontSize - step) * 10) / 10;
    }

    // If nothing fits, fallback to minimal font size and its minimal line-height
    if (bestFontSize === null || bestLineHeight === null) {
      const fallbackFont = minFont;
      const fallbackLH = this.getMinLineHeightForFontSize(fallbackFont);
      return { fontSize: fallbackFont, lineHeight: fallbackLH };
    }

    // Phase 2: increase line-height step by step until we reach the limit or overflow
    let testLH = bestLineHeight + CardBuilderService.LINE_HEIGHT_STEP;
    while (testLH <= CardBuilderService.MAX_LINE_HEIGHT + 0.0001) {
      const roundedTestLH = Math.min(CardBuilderService.MAX_LINE_HEIGHT, Math.round(testLH * 100) / 100);

      const height = estimateHeight(bestFontSize, roundedTestLH);
      if (height <= maxHeight) {
        bestLineHeight = roundedTestLH;
        if (roundedTestLH >= CardBuilderService.MAX_LINE_HEIGHT - 0.0001) break;
        testLH += CardBuilderService.LINE_HEIGHT_STEP;
      } else {
        // Overflow: last working value was bestLineHeight
        break;
      }
    }

    return { fontSize: bestFontSize, lineHeight: bestLineHeight };
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
        // Split the part on specific chars while keeping the symbols
        const modifiedPart = part.split(/(@|#|±|π|Δ|Ω)/).map((token, subIndex) => {
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
          if (token === 'π') {
            return (
              <span key={`pm-${index}-${i}-${subIndex}`} className='small-pi-char'>
                π
              </span>
            );
          }
          if (token === 'Δ') {
            return (
              <span key={`pm-${index}-${i}-${subIndex}`} className='capital-delta-char'>
                Δ
              </span>
            );
          }
          if (token === 'Ω') {
            return (
              <span key={`pm-${index}-${i}-${subIndex}`} className='capital-omega-char'>
                Ω
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
  }): ITextAdjustResult {
    let { currentAdjustState, currentFontSize, currentLineHeight } = options;
    const { container } = options;

    const minFont = CardBuilderService.MIN_FONT_SIZE;
    const maxFont = CardBuilderService.MAX_FONT_SIZE;
    const fontStep = CardBuilderService.FONT_STEP;

    const maxLH = CardBuilderService.MAX_LINE_HEIGHT;
    const lhStep = CardBuilderService.LINE_HEIGHT_STEP;

    // Get paragraph-like children
    const texts = container.childNodes as NodeListOf<HTMLParagraphElement>;
    if (!texts?.length || currentFontSize === 0) {
      return { fit: true, adjustState: 'unknown' };
    }

    // Measure total text height
    let textHeight = 0;
    texts.forEach((text) => {
      textHeight += text.clientHeight;
    });

    const containerHeight = container.clientHeight;

    const epsilon = 0.5; // pixels
    const taller = textHeight > containerHeight;
    const shorter = textHeight + epsilon < containerHeight;

    // Helper to clamp font size
    const clampFont = (value: number) => Math.max(minFont, Math.min(maxFont, value));

    // Helper to clamp line-height
    const clampLH = (fontSize: number, value: number) => {
      const minLH = this.getMinLineHeightForFontSize(fontSize);
      const clamped = Math.max(minLH, Math.min(maxLH, value));
      return Math.round(clamped * 100) / 100;
    };

    // ================================
    // State: unknown (initial check)
    // ================================
    if (currentAdjustState === 'unknown') {
      // 1.B - Text is too tall: start shrinking font
      if (taller) {
        if (currentFontSize <= minFont + 0.001) {
          // Cannot shrink further, try enforcing minimal line-height for this font
          const minLH = this.getMinLineHeightForFontSize(currentFontSize);
          if (currentLineHeight > minLH + 0.001) {
            return {
              fit: false,
              adjustState: 'shrinkingFont',
              lineHeight: minLH,
            };
          }
          return { fit: true, adjustState: 'unknown' };
        }

        const newFont = clampFont(currentFontSize - fontStep);
        const newLH = this.getMinLineHeightForFontSize(newFont);
        return {
          fit: false,
          adjustState: 'shrinkingFont',
          fontSize: Math.round(newFont * 10) / 10,
          lineHeight: newLH,
        };
      }

      // 1.A - Text is too short: start growing font
      if (shorter) {
        if (currentFontSize >= maxFont - 0.001) {
          // Already at max font: go directly to line-height growing phase
          if (currentLineHeight < maxLH - 0.001) {
            const newLH = clampLH(currentFontSize, currentLineHeight + lhStep);
            return {
              fit: false,
              adjustState: 'growingLineHeight',
              lineHeight: newLH,
            };
          }
          return { fit: true, adjustState: 'unknown' };
        }

        const newFont = clampFont(currentFontSize + fontStep);
        const newLH = this.getMinLineHeightForFontSize(newFont);
        return {
          fit: false,
          adjustState: 'growingFont',
          fontSize: Math.round(newFont * 10) / 10,
          lineHeight: newLH,
        };
      }

      // Text height is close enough to container: we accept it as is
      return { fit: true, adjustState: 'unknown' };
    }

    // ================================
    // State: growingFont (phase 1.A)
    // ================================
    if (currentAdjustState === 'growingFont') {
      // Overflow detected: step back one font-size and start line-height phase
      if (taller) {
        const prevFont = clampFont(currentFontSize - fontStep);
        const minLH = this.getMinLineHeightForFontSize(prevFont);
        return {
          fit: false,
          adjustState: 'growingLineHeight',
          fontSize: Math.round(prevFont * 10) / 10,
          lineHeight: minLH,
        };
      }

      // Still shorter than container: continue growing font if possible
      if (shorter) {
        if (currentFontSize >= maxFont - 0.001) {
          // Cannot grow font further: switch to line-height phase
          if (currentLineHeight < maxLH - 0.001) {
            const newLH = clampLH(currentFontSize, currentLineHeight + lhStep);
            return {
              fit: false,
              adjustState: 'growingLineHeight',
              lineHeight: newLH,
            };
          }
          return { fit: true, adjustState: 'unknown' };
        }

        const newFont = clampFont(currentFontSize + fontStep);
        const newLH = this.getMinLineHeightForFontSize(newFont);
        return {
          fit: false,
          adjustState: 'growingFont',
          fontSize: Math.round(newFont * 10) / 10,
          lineHeight: newLH,
        };
      }

      // Height is close to the container: switch to line-height phase
      if (currentLineHeight < maxLH - 0.001) {
        const newLH = clampLH(currentFontSize, currentLineHeight + lhStep);
        return {
          fit: false,
          adjustState: 'growingLineHeight',
          lineHeight: newLH,
        };
      }

      return { fit: true, adjustState: 'unknown' };
    }

    // ================================
    // State: shrinkingFont (phase 1.B)
    // ================================
    if (currentAdjustState === 'shrinkingFont') {
      // Still too tall: keep shrinking font if possible
      if (taller) {
        if (currentFontSize <= minFont + 0.001) {
          const minLH = this.getMinLineHeightForFontSize(currentFontSize);
          if (currentLineHeight > minLH + 0.001) {
            return {
              fit: false,
              adjustState: 'shrinkingFont',
              lineHeight: minLH,
            };
          }
          return { fit: true, adjustState: 'unknown' };
        }

        const newFont = clampFont(currentFontSize - fontStep);
        const newLH = this.getMinLineHeightForFontSize(newFont);
        return {
          fit: false,
          adjustState: 'shrinkingFont',
          fontSize: Math.round(newFont * 10) / 10,
          lineHeight: newLH,
        };
      }

      // First font-size that does not overflow: fix font, now try line-height phase
      if (currentLineHeight < maxLH - 0.001) {
        const newLH = clampLH(currentFontSize, currentLineHeight + lhStep);
        return {
          fit: false,
          adjustState: 'growingLineHeight',
          lineHeight: newLH,
        };
      }

      return { fit: true, adjustState: 'unknown' };
    }

    // ================================
    // State: growingLineHeight (phase 2)
    // ================================
    if (currentAdjustState === 'growingLineHeight') {
      // If overflow occurs, step back one line-height and finish
      if (taller) {
        const prevLH = clampLH(currentFontSize, currentLineHeight - lhStep);
        return {
          fit: true,
          adjustState: 'unknown',
          lineHeight: prevLH,
        };
      }

      // If still clearly shorter and not at max line-height, increase it
      if (shorter && currentLineHeight < maxLH - 0.001) {
        const newLH = clampLH(currentFontSize, currentLineHeight + lhStep);
        if (newLH > currentLineHeight + 0.0001) {
          return {
            fit: false,
            adjustState: 'growingLineHeight',
            lineHeight: newLH,
          };
        }
      }

      // Height is close enough or line-height is max: we are done
      return { fit: true, adjustState: 'unknown' };
    }

    // Fallback: consider the text fitted
    return { fit: true, adjustState: 'unknown' };
  }
}
