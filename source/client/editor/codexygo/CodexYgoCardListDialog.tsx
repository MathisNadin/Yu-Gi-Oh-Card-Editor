import { AbstractPopup, Button, HorizontalStack, IAbstractPopupProps, IAbstractPopupState, Progress } from 'mn-toolkit';
import { CodexYgoCardSearch } from './CodexYgoCardSearch';
import { ICodexYgoCardEntity, TCodexYgoCardLanguage } from './interfaces';
import { ICard } from '../card';
import { plural } from 'mn-tools';

interface ICodexYgoCardListDialogProps extends IAbstractPopupProps<void> {}

interface ICodexYgoCardListDialogState extends IAbstractPopupState {
  codexCards: ICodexYgoCardEntity[];
  language: TCodexYgoCardLanguage;
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
    this.setState({ language: 'fr_fr', codexCards: [] });
    return Promise.resolve();
  }

  protected override renderFooter() {
    const { importing } = this.state;
    return (
      <HorizontalStack key='footer' className='mn-popup-footer' bg='2' padding gutter itemAlignment='right'>
        {!!importing && (
          <Progress progress={importing.progress} total={importing.total} message={importing.currentCard} />
        )}

        {!importing && <Button name='Valider' label='Valider' color='primary' onTap={() => this.importCards()} />}
      </HorizontalStack>
    );
  }

  private async importCards() {
    const { language, codexCards } = this.state;
    if (!codexCards.length) return await this.close();

    const cards: ICard[] = [];

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
        if (imageUrl) {
          try {
            const filePath = await app.$card.importArtwork(imageUrl);
            if (!filePath) return;

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
          } catch (e) {
            app.$errorManager.trigger(e as Error);
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

  private onLanguageChange = (language: TCodexYgoCardLanguage) => {
    this.setState({ language });
  };

  private onSelectionChange = (codexCards: ICodexYgoCardEntity[]) => {
    this.setState({ codexCards });
  };

  protected override renderContent() {
    return (
      <CodexYgoCardSearch
        initialLanguage={this.state.language}
        onLanguageChange={this.onLanguageChange}
        onSelectionChange={this.onSelectionChange}
      />
    );
  }
}
