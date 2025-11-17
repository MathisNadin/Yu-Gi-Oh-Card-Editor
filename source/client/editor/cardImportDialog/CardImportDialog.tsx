/* eslint-disable @typescript-eslint/no-require-imports */
import { classNames } from 'mn-tools';
import {
  HorizontalStack,
  Checkbox,
  VerticalStack,
  TextInput,
  Button,
  Typography,
  Progress,
  TextAreaInput,
  Icon,
  FilePathInput,
  AbstractPopup,
  IAbstractPopupState,
  IAbstractPopupProps,
  StepProgress,
  Image,
  IButtonProps,
} from 'mn-toolkit';
import { IReplaceMatrix } from '../yugipedia';
import { ICard } from '../card';

type TWebsite = 'yugipedia' | 'codexygo';

export interface ICardImportDialogResult {}

interface ICardImportDialogProps extends IAbstractPopupProps<ICardImportDialogResult> {}

interface ICardImportDialogState extends IAbstractPopupState {
  step: number;
  website: TWebsite;
  yugipediaImport: string;
  codexYgoImport: string;
  importing: boolean;
  useFr: boolean;
  generatePasscode: boolean;
  replaceMatrixes: IReplaceMatrix[];
  importArtworks: boolean;
  artworkSaveDirPath: string;
  cardsToImport: number;
  cardsImported: number;
}

export class CardImportDialog extends AbstractPopup<
  ICardImportDialogResult,
  ICardImportDialogProps,
  ICardImportDialogState
> {
  private yugipediaLogo = require(`assets/images/yugipediaLogo.png`);
  private codexygoLogo = require(`assets/images/codexygoLogo.png`);

  public static async show(options: ICardImportDialogProps = {}) {
    options.title = options.title || 'Importer depuis un site';
    options.width = options.width || '70%';
    options.height = options.height || '80%';
    return await app.$popup.show<ICardImportDialogResult, ICardImportDialogProps>({
      type: 'card-import',
      Component: CardImportDialog,
      componentProps: options,
    });
  }

  public constructor(props: ICardImportDialogProps) {
    super(props);
    this.state = {
      ...this.state,
      loaded: true,
      step: 0,
      website: undefined!,
      yugipediaImport: '',
      codexYgoImport: '',
      importing: false,
      useFr: false,
      generatePasscode: false,
      replaceMatrixes: [],
      importArtworks: false,
      artworkSaveDirPath: `${app.$settings.settings.defaultImgImportPath}`,
      cardsImported: 0,
      cardsToImport: 0,
    };
  }

  public override componentDidMount() {
    super.componentDidMount();
    app.$card.addListener(this);
  }

  public override componentWillUnmount() {
    super.componentWillUnmount();
    app.$card.removeListener(this);
  }

  public cardImported(_newCard: ICard) {
    if (!this.state.importing) return;
    this.setState({ cardsImported: this.state.cardsImported + 1 }, () => {
      if (this.state.cardsImported !== this.state.cardsToImport) return;
      this.setState({ importing: false });
    });
  }

  private addReplaceMatrix() {
    const replaceMatrixes = [...this.state.replaceMatrixes];
    replaceMatrixes.push({ toReplace: '', newString: '' });
    this.setState({ replaceMatrixes });
  }

  private updateReplaceMatrix(index: number, toReplace: string, newString: string) {
    const replaceMatrixes = [...this.state.replaceMatrixes];
    replaceMatrixes[index] = { toReplace, newString };
    this.setState({ replaceMatrixes });
  }

  private removeReplaceMatrix(index: number) {
    const replaceMatrixes = [...this.state.replaceMatrixes];
    replaceMatrixes.splice(index, 1);
    this.setState({ replaceMatrixes });
  }

  private async doYugipediaImport() {
    if (this.state.importing || !this.state.yugipediaImport) return;
    await this.setStateAsync({ importing: true });

    const newCards: ICard[] = [];
    const importLinks = this.state.yugipediaImport.split('\n');
    const batches = importLinks.filter((l) => l.includes('yugipedia.com/wiki/')).chunk(10);

    for (const batch of batches) {
      const cardsBatch = await Promise.all(
        batch.map((importLink) => {
          const splitImport = importLink.split('yugipedia.com/wiki/');
          return app.$yugipedia.importCard({
            titles: splitImport[splitImport.length - 1]!,
            useFr: this.state.useFr,
            generatePasscode: this.state.generatePasscode,
            replaceMatrixes: this.state.replaceMatrixes,
            importArtwork: this.state.importArtworks,
            artworkDirectoryPath: this.state.artworkSaveDirPath,
          });
        })
      );

      for (const newCard of cardsBatch) {
        if (newCard) newCards.push(newCard);
      }
    }

    if (!newCards.length) return await this.setStateAsync({ importing: false, yugipediaImport: '' });

    await this.setStateAsync({ cardsToImport: newCards.length });
    await app.$card.importCards(newCards);
    await this.close();
  }

  private async doCodexYgoImport() {
    if (this.state.importing || !this.state.codexYgoImport) return;
    await this.setStateAsync({ importing: true });

    const newCards: ICard[] = [];
    const importLinks = this.state.codexYgoImport.split('\n').filter((l) => l.includes(app.$codexygo.baseUrl));

    for (const link of importLinks) {
      try {
        const cardsData = await app.$codexygo.getCodexCardsFromArticle(link);
        for (const cardData of cardsData) {
          if (cardData.imageUrl && this.state.importArtworks && this.state.artworkSaveDirPath) {
            try {
              const filePath = await app.$card.importArtwork(cardData.imageUrl, this?.state.artworkSaveDirPath);
              if (!filePath) return;

              cardData.card.artwork.url = filePath;
              if (cardData.card.rush) cardData.card.dontCoverRushArt = true;

              // These are not full artworks
              if (await app.$card.isImageFullCard(filePath)) {
                if (cardData.card.rush) {
                  cardData.card.dontCoverRushArt = true;
                  cardData.card.artwork = { ...cardData.card.artwork, ...app.$card.getFullRushCardPreset() };
                } else if (cardData.card.pendulum) {
                  cardData.card.artwork = { ...cardData.card.artwork, ...app.$card.getFullPendulumCardPreset() };
                } else {
                  cardData.card.artwork = { ...cardData.card.artwork, ...app.$card.getFullCardPreset() };
                }
              }
            } catch (e) {
              app.$errorManager.trigger(e as Error);
            }
          }

          newCards.push(cardData.card);
        }
      } catch (e) {
        app.$errorManager.trigger(e as Error);
      }
    }

    if (!newCards.length) return await this.setStateAsync({ importing: false, codexYgoImport: '' });

    await this.setStateAsync({ cardsToImport: newCards.length });
    await app.$card.importCards(newCards);
    await this.close();
  }

  private async selectArtworkSaveDirPath() {
    if (!app.$device.isElectron(window)) return;
    const artworkSaveDirPath = await window.electron.ipcRenderer.invoke(
      'getDirectoryPath',
      this.state.artworkSaveDirPath
    );
    if (!artworkSaveDirPath) return;
    await this.setStateAsync({ artworkSaveDirPath });
  }

  private onSelectWesite(website: TWebsite) {
    this.setState({ website, step: 1 });
  }

  private getWebsiteDesc() {
    switch (this.state.website) {
      case 'yugipedia':
        return 'Yugipedia';
      case 'codexygo':
        return 'CodexYGO';
      default:
        return 'Choisissez un site pour importer des cartes';
    }
  }

  private getWebsiteParamsDesc() {
    switch (this.state.website) {
      case 'yugipedia':
        return 'Collez les liens des cartes';
      case 'codexygo':
        return 'Collez les liens des articles';
      default:
        return '';
    }
  }

  protected get buttons(): IButtonProps[] {
    const { step, website, importing, yugipediaImport, codexYgoImport } = this.state;
    if (!step) return [];
    switch (website) {
      case 'yugipedia':
        return [
          {
            disabled: importing || !yugipediaImport,
            name: 'Importer',
            label: 'Importer',
            color: 'positive',
            onTap: () => this.doYugipediaImport(),
          },
        ];

      case 'codexygo':
        return [
          {
            disabled: importing || !codexYgoImport,
            name: 'Importer',
            label: 'Importer',
            color: 'positive',
            onTap: () => this.doCodexYgoImport(),
          },
        ];

      default:
        return [];
    }
  }

  protected get contentScroll() {
    return false;
  }

  public renderContent() {
    const { step, website } = this.state;
    return [
      <StepProgress<number>
        key='step-progress'
        color='1'
        progress={website ? 1 : 0}
        currentStep={step}
        onChange={(step) => this.setState({ step })}
        items={[
          { id: 0, label: 'Site', description: this.getWebsiteDesc() },
          { id: 1, label: 'Paramétrage', description: this.getWebsiteParamsDesc() },
        ]}
      />,
      step === 0 && this.renderWebsitesTab(),
      step === 1 && website === 'yugipedia' && this.renderYugipediaTab(),
      step === 1 && website === 'codexygo' && this.renderCodexYgoTab(),
    ];
  }

  private renderWebsitesTab() {
    return (
      <VerticalStack
        key='websites'
        className='card-import-dialog-content websites'
        scroll
        gutter
        itemAlignment='center'
      >
        <Image
          key='codexygo-logo'
          className={classNames('logo', 'codexygo', { selected: this.state.website === 'codexygo' })}
          margin='small'
          padding
          src={this.codexygoLogo}
          alt='codexygo-logo'
          onTap={() => this.onSelectWesite('codexygo')}
        />
        <Image
          key='yugipedia-logo'
          className={classNames('logo', 'yugipedia', { selected: this.state.website === 'yugipedia' })}
          margin='small'
          padding
          src={this.yugipediaLogo}
          alt='yugipedia-logo'
          onTap={() => this.onSelectWesite('yugipedia')}
        />
      </VerticalStack>
    );
  }

  private renderYugipediaTab() {
    if (!this.state) return null;
    const { yugipediaImport, cardsImported, cardsToImport, importing, useFr, generatePasscode, replaceMatrixes } =
      this.state;
    return (
      <VerticalStack key='yugipedia' className='card-import-dialog-content yugipedia' fill scroll gutter>
        <Typography
          variant='help'
          content='Collez les liens Yugipedia de cartes (revenir à la ligne entre chaque lien)'
        />

        <TextAreaInput
          minRows={5}
          maxRows={15}
          autoGrow
          value={yugipediaImport}
          onChange={(yugipediaImport) => this.setState({ yugipediaImport })}
        />

        <HorizontalStack verticalItemAlignment='middle' gutter>
          <Checkbox label='Textes français' value={useFr} onChange={(useFr) => this.setState({ useFr })} />
          <Checkbox
            label='Si absent, générer un code'
            value={generatePasscode}
            onChange={(generatePasscode) => this.setState({ generatePasscode })}
          />
          {this.renderUrlImporter()}
        </HorizontalStack>

        <VerticalStack itemAlignment='center' gutter fill>
          <Button
            size='small'
            color='neutral'
            name='Ajouter un terme à remplacer dans les textes de la carte'
            label='Ajouter un terme à remplacer dans les textes de la carte'
            onTap={() => this.addReplaceMatrix()}
          />

          {!!replaceMatrixes.length && (
            <VerticalStack gutter scroll fill>
              {replaceMatrixes.map((m, i) => (
                <HorizontalStack key={`replace-matrix-${i}`} gutter verticalItemAlignment='middle'>
                  <TextInput
                    fill
                    value={m.toReplace}
                    onChange={(value) => this.updateReplaceMatrix(i, value, m.newString)}
                  />
                  <Typography variant='help' content='devient' />
                  <TextInput
                    fill
                    value={m.newString}
                    onChange={(value) => this.updateReplaceMatrix(i, m.toReplace, value)}
                  />
                  <Icon size={24} icon='toolkit-minus' color='negative' onTap={() => this.removeReplaceMatrix(i)} />
                </HorizontalStack>
              ))}
            </VerticalStack>
          )}

          {!!importing && (
            <HorizontalStack margin itemAlignment='center'>
              <Progress
                fill
                showPercent
                color='positive'
                message='Import en cours...'
                progress={cardsImported}
                total={cardsToImport}
              />
            </HorizontalStack>
          )}
        </VerticalStack>
      </VerticalStack>
    );
  }

  private renderCodexYgoTab() {
    if (!this.state) return null;
    const { codexYgoImport, cardsImported, cardsToImport, importing, generatePasscode } = this.state;
    return (
      <VerticalStack key='codexygo' className='card-import-dialog-content codexygo' fill scroll gutter>
        <Typography
          variant='help'
          content='Collez les liens des articles CodexYGO (revenir à la ligne entre chaque lien)'
        />
        <TextAreaInput
          minRows={5}
          maxRows={15}
          autoGrow
          value={codexYgoImport}
          onChange={(codexYgoImport) => this.setState({ codexYgoImport })}
        />
        <Typography
          variant='help'
          fontSize='tiny'
          content="Cela n'importera que les cartes qui sont affichées en entier dans les articles, pas celles uniquement mentionnées dans du texte."
        />

        <HorizontalStack verticalItemAlignment='middle' gutter>
          <Checkbox
            label='Si absent, générer un code'
            value={generatePasscode}
            onChange={(generatePasscode) => this.setState({ generatePasscode })}
          />
          {this.renderUrlImporter()}
        </HorizontalStack>

        <VerticalStack itemAlignment='center' gutter fill>
          {!!importing && (
            <HorizontalStack margin itemAlignment='center'>
              <Progress
                fill
                showPercent
                color='positive'
                message='Import en cours...'
                progress={cardsImported}
                total={cardsToImport}
              />
            </HorizontalStack>
          )}
        </VerticalStack>
      </VerticalStack>
    );
  }

  private renderUrlImporter() {
    if (!app.$device.isElectron(window)) return undefined;
    return (
      <HorizontalStack fill gutter>
        <Checkbox
          label='Importer les images'
          value={this.state.importArtworks}
          onChange={(importArtworks) => this.setState({ importArtworks })}
        />
        {this.state.importArtworks && (
          <FilePathInput
            fill
            value={this.state.artworkSaveDirPath}
            onChange={(artworkSaveDirPath) => this.setState({ artworkSaveDirPath })}
            overrideOnTapIcon={() => this.selectArtworkSaveDirPath()}
          />
        )}
      </HorizontalStack>
    );
  }
}
