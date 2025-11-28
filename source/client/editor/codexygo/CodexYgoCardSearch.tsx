import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { VerticalStack, Typography, Spinner, Masonry, HorizontalStack, ClassicPager } from 'mn-toolkit';
import { classNames, debounce, isArray, preloadImage } from 'mn-tools';
import { IQuerySearchVectorOptions, TAbstractEntity, IAbstractTable } from 'api/main';
import { CodexYgoCardListAdvancedOptions } from './CodexYgoCardListAdvancedOptions';
import { CodexYgoCardDisplay } from './CodexYgoCardDisplay';
import {
  ICodexYgoCardEntity,
  ICodexYgoCardListAdvancedOptions,
  ICodexYgoCardListOptions,
  TCodexYgoCardLanguage,
  TCodexYgoCardTableVectorIndexes,
} from './interfaces';

// Returns "strict" only if EVERY token is made of problematic characters (punctuation inside the token).
// If at least one "normal" token (letters/digits only) exists, stays "fuzzy".
export function decideSearchMode(
  search: string
): IQuerySearchVectorOptions<TAbstractEntity, IAbstractTable>['searchMode'] {
  // Trim and short-circuit
  const q = (search ?? '').trim();
  if (!q) return 'fuzzy';

  // Split on whitespace into tokens
  const rawTokens = q.split(/\s+/).filter(Boolean);
  if (!rawTokens.length) return 'fuzzy';

  // Helper: strip leading/trailing punctuation to avoid false positives like "D/D/D," or "(C++)"
  const stripEdges = (t: string) => t.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');

  // A "normal" token = only letters/digits (Unicode), no internal punctuation
  const isNormalToken = (t: string) => /^[\p{L}\p{N}]+$/u.test(t);

  // A "problematic" token = contains any non-alphanumeric character after edge-stripping
  const isProblematicToken = (t: string) => /[^\p{L}\p{N}]/u.test(t);

  let hasNormal = false;
  let allProblematic = true;

  for (const tok of rawTokens) {
    const core = stripEdges(tok);
    if (!core) continue; // empty after stripping → ignore

    if (isNormalToken(core)) {
      hasNormal = true;
      allProblematic = false;
      // Early exit: one normal token is enough to stay in fuzzy
      break;
    }
    if (!isProblematicToken(core)) {
      // Shouldn't happen (covered by isNormalToken), but keep for safety
      allProblematic = false;
    }
  }

  // Enforce "strict" only when every meaningful token is problematic (e.g., "D/D", "C++", "v1.2.3")
  if (!hasNormal && allProblematic) return 'strict';

  // Default: fuzzy
  return 'fuzzy';
}

interface ICodexYgoCardSearchProps {
  onSelectionChange: (cards: ICodexYgoCardEntity[]) => void;
  initialLanguage: TCodexYgoCardLanguage;
  onLanguageChange: (language: TCodexYgoCardLanguage) => void;
  importArtworks: boolean;
  onImportArtworksChange: (importArtworks: boolean) => void;
  withSetId: boolean;
  onWithSetIdChange: (withSetId: boolean) => void;
}

interface ICardWithImageUrl {
  card: ICodexYgoCardEntity;
  imageUrl?: string;
}

const PAGE_SIZE = 8;

/**
 * Main search component with left panel for options and right panel for results
 * Applies debounce to API calls
 */
export const CodexYgoCardSearch: FC<ICodexYgoCardSearchProps> = ({
  onSelectionChange,
  initialLanguage,
  onLanguageChange,
  importArtworks,
  onImportArtworksChange,
  withSetId,
  onWithSetIdChange,
}) => {
  // State management
  const [advancedListOptions, setAdvancedListOptions] = useState<ICodexYgoCardListAdvancedOptions>({
    language: initialLanguage,
    format: 'all',
    search: '',
    searchType: 'name',
  });
  const [page, setPage] = useState(0);

  const [cardsCount, setCardsCount] = useState(0);
  const [cards, setCards] = useState<ICardWithImageUrl[]>([]);
  const [selectedCards, setSelectedCards] = useState<Map<ICodexYgoCardEntity['oid'], ICodexYgoCardEntity>>(new Map());

  const [isLoading, setIsLoading] = useState(true);

  const performSearch = useCallback(async (options: ICodexYgoCardListAdvancedOptions, page: number) => {
    if (!options.search && Object.values(options).every((v) => !v || (isArray(v) && v.length === 0))) {
      setCards([]);
      setCardsCount(0);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const { format, search, searchType, ...advancedOptions } = options;

      const searchOptions: ICodexYgoCardListOptions = {
        public: true,
        rush: format === 'rush' ? true : format === 'master' ? false : undefined,
        pager: { count: PAGE_SIZE, from: page * PAGE_SIZE },
        sort: [{ field: 'created', order: 'desc' }],
        ...advancedOptions,
      };

      if (options.search) {
        let field: TCodexYgoCardTableVectorIndexes;
        switch (searchType) {
          case 'limitationText':
            field = 'limitationTextSearchVector';
            break;
          case 'pendulumEffect':
            field = 'pendEffectSearchVector';
            break;
          case 'description':
            field = 'descriptionSearchVector';
            break;
          case 'name':
          default:
            field = 'nameSearchVector';
            break;
        }

        searchOptions.searchVectors = [
          {
            field,
            search,
            dictionaries: ['simple', 'french', 'english'],
            searchMode: decideSearchMode(search),
            orderBy: 'desc',
          },
        ];
      }

      const [codexCardsCount, codexCards] = await Promise.all([
        app.$codexygo.countCards(searchOptions),
        app.$codexygo.listCards(searchOptions),
      ]);

      const cardsWithImages = await Promise.all(
        codexCards.map(async (card) => {
          const imageUrl = app.$codexygo.getFileUrl(card.image);
          if (imageUrl) await preloadImage(imageUrl);
          return { card, imageUrl };
        })
      );

      setCards(cardsWithImages);
      setCardsCount(codexCardsCount);
    } catch (error) {
      console.error('Error searching CodexYgo cards:', error);
      setCards([]);
      setCardsCount(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const debouncedSearch = useMemo(
    () =>
      debounce((options: ICodexYgoCardListAdvancedOptions) => {
        app.$errorManager.handlePromise(performSearch(options, 0));
      }, 500),
    [performSearch]
  );

  useEffect(() => {
    app.$errorManager.handlePromise(performSearch(advancedListOptions, page));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [performSearch]);

  useEffect(() => {
    onLanguageChange(advancedListOptions.language);
  }, [advancedListOptions.language, onLanguageChange]);

  const handleAdvancedOptionsChange = (next: ICodexYgoCardListAdvancedOptions) => {
    const prev = advancedListOptions;

    setAdvancedListOptions(next);

    const prevSansLang = { ...prev, language: undefined };
    const nextSansLang = { ...next, language: undefined };

    const isLanguageOnlyChange =
      prev.language !== next.language && JSON.stringify(prevSansLang) === JSON.stringify(nextSansLang);

    if (isLanguageOnlyChange) return;

    const emptySelection = new Map<ICodexYgoCardEntity['oid'], ICodexYgoCardEntity>();
    setSelectedCards(emptySelection);
    onSelectionChange([]);

    setPage(0);

    debouncedSearch(next);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    app.$errorManager.handlePromise(performSearch(advancedListOptions, newPage));
  };

  const toggleSelectCard = (card: ICodexYgoCardEntity) => {
    const newMap = new Map(selectedCards);
    if (newMap.has(card.oid)) {
      newMap.delete(card.oid);
    } else {
      newMap.set(card.oid, card);
    }
    setSelectedCards(newMap);
    onSelectionChange(Array.from(newMap.values()));
  };

  return (
    <HorizontalStack className='codexygo-card-search' gutter='large' maxHeight='100%'>
      <VerticalStack scroll minWidth='40%' maxWidth='40%'>
        <CodexYgoCardListAdvancedOptions
          options={advancedListOptions}
          onChange={handleAdvancedOptionsChange}
          importArtworks={importArtworks}
          onImportArtworksChange={onImportArtworksChange}
          withSetId={withSetId}
          onWithSetIdChange={onWithSetIdChange}
        />
      </VerticalStack>

      <VerticalStack gutter='small' fill>
        <VerticalStack fill bg='4' frame='shadow-0'>
          {isLoading && (
            <VerticalStack padding itemAlignment='center' verticalItemAlignment='middle'>
              <Spinner />
            </VerticalStack>
          )}

          {!isLoading && !cards.length && (
            <VerticalStack paddingY paddingX='large'>
              <Typography variant='label' content='Aucune carte' />
            </VerticalStack>
          )}

          {!isLoading && !!cards.length && (
            <Masonry
              masonryTemplateColumns={{
                small: {
                  kind: 'track-list',
                  segments: [
                    {
                      kind: 'repeat',
                      count: 'auto-fill',
                      track: {
                        kind: 'track',
                        size: {
                          kind: 'minmax',
                          min: '120px',
                          max: '1fr',
                        },
                      },
                    },
                  ],
                },
                xxlarge: {
                  kind: 'track-list',
                  segments: [
                    {
                      kind: 'repeat',
                      count: 'auto-fill',
                      track: {
                        kind: 'track',
                        size: {
                          kind: 'minmax',
                          min: '180px',
                          max: '1fr',
                        },
                      },
                    },
                  ],
                },
              }}
              scroll
              paddingX
              paddingY='small'
              gutter={false}
              gutterX='large'
              gutterY='small'
            >
              {cards.map((item, index) => (
                <VerticalStack
                  key={`${item.card.oid}-${index}`}
                  height='100%'
                  bg='1'
                  frame='shadow-1'
                  className={classNames('selectable-card', { selected: selectedCards.has(item.card.oid) })}
                  onTap={() => toggleSelectCard(item.card)}
                >
                  <CodexYgoCardDisplay
                    language={advancedListOptions.language}
                    card={item.card}
                    imageUrl={item.imageUrl}
                  />
                </VerticalStack>
              ))}
            </Masonry>
          )}
        </VerticalStack>

        <ClassicPager
          itemAlignment='right'
          position={page}
          total={cardsCount}
          pageSize={PAGE_SIZE}
          onChange={handlePageChange}
        />
      </VerticalStack>
    </HorizontalStack>
  );
};
