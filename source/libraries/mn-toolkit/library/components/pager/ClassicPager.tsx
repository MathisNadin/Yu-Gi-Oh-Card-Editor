import { classNames } from 'mn-tools';
import { TBackgroundColor, TJSXElementChild } from '../../system';
import { Container, HorizontalStack, IContainerProps, IContainerState } from '../container';
import { Icon } from '../icon';
import { Typography } from '../typography';
import { Button } from '../button';

export type TClassicPagerShape = 'round' | 'square';

interface IClassicPagerProps extends IContainerProps<HTMLElement> {
  maxLineLength: number;
  outlined: boolean;
  shape: TClassicPagerShape;
  color: TBackgroundColor;
  showFirstButton?: boolean;
  showLastButton?: boolean;
  hidePreviousButton?: boolean;
  hideNextButton?: boolean;
  pageSize: number;
  total: number;
  position: number;
  onChange: (position: number) => void | Promise<void>;
}

interface IClassicPagerState extends IContainerState {}

export class ClassicPager extends Container<IClassicPagerProps, IClassicPagerState, HTMLElement> {
  public static override get defaultProps(): Omit<IClassicPagerProps, 'position' | 'total' | 'pageSize' | 'onChange'> {
    return {
      ...super.defaultProps,
      layout: 'horizontal',
      gutter: true,
      verticalItemAlignment: 'middle',
      maxLineLength: 7,
      outlined: false,
      shape: 'square',
      color: 'primary',
    };
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-classic-pager'] = true;
    if (this.props.outlined) classes['outlined'] = true;
    if (this.props.shape) classes[`${this.props.shape}-shape`] = true;
    if (this.props.color) classes[`mn-color-${this.props.color}`] = true;
    return classes;
  }

  public override render(): TJSXElementChild {
    if (this.nbPages < 2) return null;
    return (
      <nav ref={this.base} {...this.renderAttributes()}>
        {this.inside}
      </nav>
    );
  }

  public override get children() {
    return [
      (this.props.showFirstButton || !this.props.hidePreviousButton) && (
        <HorizontalStack key='left-icons' className='left-icons' itemAlignment='center' verticalItemAlignment='middle'>
          {this.props.showFirstButton && (
            <Icon
              key='go-first-btn'
              disabled={this.props.position === 0}
              icon='toolkit-double-angle-left'
              onTap={() => this.props.onChange(0)}
            />
          )}
          {!this.props.hidePreviousButton && (
            <Icon
              key='go-previous-btn'
              disabled={this.isFirstPage}
              icon='toolkit-angle-left'
              onTap={() => this.props.onChange(this.props.position - 1)}
            />
          )}
        </HorizontalStack>
      ),

      <HorizontalStack key='pages' className='pages' gutter='small'>
        {this.pagesToDisplay}
      </HorizontalStack>,

      (!this.props.hideNextButton || this.props.showLastButton) && (
        <HorizontalStack
          key='right-icons'
          className='right-icons'
          itemAlignment='center'
          verticalItemAlignment='middle'
        >
          {!this.props.hideNextButton && (
            <Icon
              key='go-next-btn'
              disabled={this.isLastPage}
              icon='toolkit-angle-right'
              onTap={() => this.props.onChange(this.props.position + 1)}
            />
          )}

          {this.props.showLastButton && (
            <Icon
              key='go-last-btn'
              disabled={this.isLastPage}
              icon='toolkit-double-angle-right'
              onTap={() => this.props.onChange(this.nbPages - 1)}
            />
          )}
        </HorizontalStack>
      ),
    ];
  }

  /**
   * Returns an ordered list of page numbers (1-based), plus placeholders "…"
   * in case of non-adjacent pages.
   */
  private get pagesToDisplay(): TJSXElementChild[] {
    const totalPages = this.nbPages; // total number of pages (1-based)
    const currentPage = this.props.position + 1; // current page in 1-based numbering
    const maxLineLength = this.props.maxLineLength; // how many items we can show at once

    // --- 1) Simple case: all pages fit on one line
    if (totalPages <= maxLineLength) {
      // e.g. if totalPages=5 and maxLineLength=7 => [1, 2, 3, 4, 5]
      return this.buildPages([...Array.from({ length: totalPages }, (_, i) => i + 1)]);
    }

    // --- 2) Complex case
    // We want:
    //   - Always [1, 2] on the left side
    //   - Always [totalPages - 1, totalPages] on the right side
    //   - A middle portion of size 'middleSize' that includes the currentPage
    //     (centered around it as much as possible)
    //   - Merges/expansions if the middle portion touches or overlaps the edges

    const leftFixed = [1, 2];
    const rightFixed = [totalPages - 1, totalPages];

    // We'll reserve 'middleSize' spots for the middle block
    let middleSize = maxLineLength - 4; // subtract 4 because we have 2 pages on each side
    if (middleSize < 1) middleSize = 1;

    // Center 'middleSize' around the current page
    // Example: if currentPage=10, middleSize=5 => we want [8, 9, 10, 11, 12]
    const half = Math.floor(middleSize / 2);
    let midStart = currentPage - half;
    let midEnd = midStart + middleSize - 1;

    // If middleSize is even, currentPage might shift slightly to the left,
    // but that's typically okay. If you want it perfectly centered for even lengths,
    // you could adjust the math here.

    // --- Clamp so the middle portion stays within [3 … totalPages-2]
    if (midStart < 3) {
      midStart = 3;
      midEnd = midStart + middleSize - 1;
    }
    if (midEnd > totalPages - 2) {
      midEnd = totalPages - 2;
      midStart = midEnd - middleSize + 1;
    }

    // Create the middle block [midStart..midEnd]
    const middleBlock: number[] = [];
    for (let p = midStart; p <= midEnd; p++) {
      middleBlock.push(p);
    }

    // --- Merge if there's overlap with leftFixed (i.e. if midStart <= 2)
    // e.g. if midStart=2, we want to unify the middle with the left side
    let mergedLeft: number[] = [...leftFixed];
    if (midStart <= 3) {
      // Merge them => [1, 2, 3, 4, ...]
      // But be careful with duplicates
      mergedLeft = [1, 2];
      for (let p = 3; p <= midEnd; p++) {
        if (!mergedLeft.includes(p)) {
          mergedLeft.push(p);
        }
      }
    }

    // --- Merge if there's overlap with rightFixed (i.e. if midEnd >= totalPages-1)
    // e.g. if midEnd=totalPages-1, unify with [totalPages-1, totalPages]
    let mergedRight: number[] = [...rightFixed];
    if (midEnd >= totalPages - 2) {
      // Merge them => [..., totalPages-2, totalPages-1, totalPages]
      mergedRight = [];
      for (let p = midStart; p <= totalPages; p++) {
        // We'll start from midStart up to last page
        if (!mergedRight.includes(p)) {
          mergedRight.push(p);
        }
      }
    }

    // Now decide how to join everything:
    // - If we fully merged left & right, we may already have the whole set
    // - Otherwise we combine (mergedLeft + middleBlock + mergedRight)
    //   and remove duplicates.
    let combined: number[];

    const leftMerged = midStart <= 3;
    const rightMerged = midEnd >= totalPages - 2;

    if (leftMerged && rightMerged) {
      // Everything is basically covered in one big block
      combined = [];
      for (let p = 1; p <= totalPages; p++) {
        combined.push(p);
      }
    } else if (leftMerged) {
      combined = [...mergedLeft];
      // add the right block if not included
      for (const p of rightFixed) {
        if (!combined.includes(p)) {
          combined.push(p);
        }
      }
    } else if (rightMerged) {
      // merge midBlock with right
      combined = [...leftFixed];
      for (const p of middleBlock) {
        if (!combined.includes(p)) {
          combined.push(p);
        }
      }
      for (const p of mergedRight) {
        if (!combined.includes(p)) {
          combined.push(p);
        }
      }
    } else {
      // normal scenario: left side + middle + right side
      combined = [...leftFixed];
      for (const p of middleBlock) {
        if (!combined.includes(p)) {
          combined.push(p);
        }
      }
      for (const p of rightFixed) {
        if (!combined.includes(p)) {
          combined.push(p);
        }
      }
    }

    // --- 4) If we still have fewer than maxLineLength pages, we can "expand" from either side
    // (if they haven't already merged).
    // This step tries to fill up to maxLineLength if there's still a gap.
    // In practice, you might already have enough pages, but let's be safe:
    let extraNeeded = maxLineLength - combined.length;
    while (extraNeeded > 0) {
      // We'll expand left if possible and not merged, or expand right if possible.
      // This logic can be improved if you want to expand equally on both sides, etc.

      // Attempt expanding left (if we haven't merged with page 3, for example).
      const firstVal = combined[0]!; // should be 1
      if (firstVal > 1) {
        // not likely with the logic above, but let's keep the structure
        combined.unshift(firstVal - 1);
        extraNeeded--;
        continue;
      }

      // Attempt expanding right
      const lastVal = combined.at(-1)!; // might be totalPages
      if (lastVal < totalPages) {
        combined.push(lastVal + 1);
        extraNeeded--;
        continue;
      }

      // If we can't expand at all, break the loop
      break;
    }

    // Finally, remove duplicates and sort in ascending order, just to be safe
    const uniqueSorted = Array.from(new Set(combined)).sort((a, b) => a - b);

    // Convert the array of page numbers into an array that uses "…" where there's a gap
    return this.buildPages(uniqueSorted);
  }

  /**
   * Utility to insert "…" whenever two consecutive numbers in `pages` are not adjacent.
   * E.g. [1, 2, 5, 6, 7, 9, 10] -> [1, "…", 5, 6, 7, "…", 10]
   */
  private buildPages(pages: number[]): TJSXElementChild[] {
    if (pages.length <= 1) return pages.map((p, i) => this.renderPage(p, i));

    const result: TJSXElementChild[] = [];
    result.push(this.renderPage(pages[0]!, 0));

    for (let i = 1; i < pages.length; i++) {
      const prev = pages[i - 1]!;
      const current = pages[i]!;
      const next = pages[i + 1]!;

      // if there's a gap > 1 on second, push dots instead
      if (i === 1 && current < next - 1) {
        result.push(this.renderDots(i));
      }
      // if there's a gap > 1 on second-to-last, push dots instead
      else if (i === pages.length - 2 && current > prev + 1) {
        result.push(this.renderDots(i));
      }
      // else, push page number
      else {
        result.push(this.renderPage(current, i));
      }
    }

    return result;
  }

  private renderPage(number: number, index: number) {
    const position = number - 1;
    return (
      <Button
        key={index}
        className={classNames('page', 'number', { current: position === this.props.position })}
        size='small'
        name={`Aller à la page N°${number}`}
        label={`${number}`}
        onTap={() => this.props.onChange(position)}
      />
    );
  }

  private renderDots(index: number) {
    return (
      <Typography
        key={index}
        className='page dots'
        alignment='center'
        variant='document'
        contentType='text'
        content='…'
      />
    );
  }

  private get isFirstPage(): boolean {
    return this.firstRow === 0;
  }

  private get isLastPage(): boolean {
    return this.lastRow >= this.props.total - 1;
  }

  private get firstRow(): number {
    return this.props.position * this.props.pageSize;
  }

  private get lastRow(): number {
    let i = (this.props.position + 1) * this.props.pageSize - 1;
    if (i > this.props.total) i = this.props.total - 1;
    return i;
  }

  private get nbPages(): number {
    return Math.ceil(this.props.total / this.props.pageSize);
  }
}
