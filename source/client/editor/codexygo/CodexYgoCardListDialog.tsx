import { plural } from 'mn-tools';
import { AbstractPopup, Button, HorizontalStack, IAbstractPopupProps, IAbstractPopupState, Progress } from 'mn-toolkit';
import { ICard } from '../card';
import { WikitextCardParser } from '../yugipedia';
import { CodexYgoCardSearch } from './CodexYgoCardSearch';
import { ICodexYgoCardEntity, TCodexYgoCardLanguage } from './interfaces';

interface ICodexYgoCardListDialogProps extends IAbstractPopupProps<void> {}

interface ICodexYgoCardListDialogState extends IAbstractPopupState {
  codexCards: ICodexYgoCardEntity[];
  language: TCodexYgoCardLanguage;
  importArtworks: boolean;
  withSetId: boolean;
  importing?: { progress: number; total: number; currentCard: string };
}

export class CodexYgoCardListDialog extends AbstractPopup<
  void,
  ICodexYgoCardListDialogProps,
  ICodexYgoCardListDialogState
> {
  public static async show(options: ICodexYgoCardListDialogProps = {}) {
    options.title = options.title || 'Recherche de cartes depuis CodexYGO';
    options.width = options.width || (app.$device.isSmallScreen ? '100%' : '85%');
    options.height = options.height || (app.$device.isSmallScreen ? '100%' : '90%');
    return await app.$popup.show({
      type: 'codexygo-card-list-options',
      Component: CodexYgoCardListDialog,
      componentProps: options,
    });
  }

  protected override onInitializePopup() {
    this.setState({ codexCards: [], language: 'fr_fr', importArtworks: false, withSetId: false });
    return Promise.resolve();
  }

  protected override renderFooter() {
    const { codexCards, importing } = this.state;
    return (
      <HorizontalStack key='footer' className='mn-popup-footer' bg='2' padding gutter itemAlignment='right'>
        {!!importing && (
          <Progress progress={importing.progress} total={importing.total} message={importing.currentCard} />
        )}

        {!importing && (
          <Button
            disabled={!codexCards.length}
            name='Valider'
            label='Valider'
            color='primary'
            onTap={() => this.importCards()}
          />
        )}
      </HorizontalStack>
    );
  }

  private async importCards() {
    const { language, codexCards, importArtworks, withSetId } = this.state;
    if (!codexCards.length) return;

    const cards: ICard[] = [];

    let importPath: string | undefined;
    if (importArtworks && app.$device.isElectron(window)) {
      try {
        const { defaultImgImportPath } = app.$settings.settings;
        if (
          defaultImgImportPath &&
          (await window.electron.ipcRenderer.invoke('checkFileExists', defaultImgImportPath))
        ) {
          importPath = defaultImgImportPath;
        } else {
          importPath = await window.electron.ipcRenderer.invoke('getDirectoryPath');
        }
      } catch (e) {
        app.$errorManager.trigger(e as Error);
      }
    }

    let numOfError = 0;
    let i = 0;
    for (const codexCard of codexCards) {
      const cardName =
        codexCard.translations.fr_fr?.name || codexCard.translations.en_us?.name || `${codexCard.konamiId}`;

      try {
        await this.setStateAsync({
          importing: { progress: i, total: codexCards.length, currentCard: cardName },
        });

        const card = app.$codexygo.getCardFromCodexCard(codexCard, language);

        const imageUrl = app.$codexygo.getFileUrl(codexCard.image);
        if (imageUrl && importPath) {
          try {
            const filePath = await app.$card.importArtwork(imageUrl, importPath);

            if (filePath) {
              card.artwork.url = filePath;
              if (card.rush) card.dontCoverRushArt = true;

              // These are not full artworks
              if (await app.$card.isImageFullCard(filePath)) {
                if (card.rush) {
                  card.dontCoverRushArt = true;
                  card.artwork = { ...card.artwork, ...app.$card.getFullRushCardPreset() };
                } else if (card.pendulum) {
                  card.artwork = { ...card.artwork, ...app.$card.getFullPendulumCardPreset() };
                } else {
                  card.artwork = { ...card.artwork, ...app.$card.getFullCardPreset() };
                }
              }
            }
          } catch (e) {
            app.$errorManager.trigger(e as Error);
          }
        }

        if (withSetId) {
          const yugipediaCardPage = await app.$yugipedia.getCardPage({
            cardDbId: codexCard.konamiId,
            isRush: !!codexCard.rush,
            enCardName: codexCard.translations.en_us?.name,
          });

          if (yugipediaCardPage) {
            const yugipediaCard = new WikitextCardParser(yugipediaCardPage).parse();

            if (yugipediaCard) {
              const editorYugipediaCard = app.$yugipedia.buildEditorCard(yugipediaCard, language === 'fr_fr');
              card.cardSet = editorYugipediaCard.cardSet;
            }
          }
        }

        cards.push(card);
      } catch (e) {
        numOfError++;
        console.error(new Error(`Could not import card ${codexCard.oid} (${cardName}): ${(e as Error).message}`));
      } finally {
        i++;
      }
    }

    if (numOfError) {
      app.$toaster.error(`Une erreur s'est produite sur ${plural(numOfError, '', '%% carte', '%% cartes')}`);
    }

    await app.$card.importCards(cards);
    await this.close();
  }

  protected override get scrollInContent(): boolean {
    return false;
  }

  protected override renderContent() {
    const { language, importArtworks, withSetId } = this.state;
    return [
      <CodexYgoCardSearch
        key='card-search'
        onSelectionChange={this.onSelectionChange}
        initialLanguage={language}
        onLanguageChange={this.onLanguageChange}
        importArtworks={importArtworks}
        onImportArtworksChange={this.onImportArtworksChange}
        withSetId={withSetId}
        onWithSetIdChange={this.onWithSetIdChange}
      />,
    ];
  }

  private onSelectionChange = (codexCards: ICodexYgoCardEntity[]) => {
    this.setState({ codexCards });
  };

  private onLanguageChange = (language: TCodexYgoCardLanguage) => {
    this.setState({ language });
  };

  private onImportArtworksChange = (importArtworks: boolean) => {
    this.setState({ importArtworks });
  };

  private onWithSetIdChange = (withSetId: boolean) => {
    this.setState({ withSetId });
  };
}
