/* eslint-disable @typescript-eslint/no-require-imports */
import { classNames, formatDate, isString } from 'mn-tools';
import {
  Spinner,
  HorizontalStack,
  Checkbox,
  VerticalStack,
  TextInput,
  Button,
  Table,
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
  ITableHeadRow,
  TTableHeaderSortOrder,
} from 'mn-toolkit';
import { IReplaceMatrix } from '../yugipedia';
import { IYuginewsCardData } from '../yuginews';
import { ICard } from '../card';

type TWebsite = 'yugipedia' | 'yuginews';

type TCardsDataSortOption = 'theme' | 'id' | 'name' | 'set' | 'added' | 'pageOrder';

export interface ICardImportDialogResult {}

interface ICardImportDialogProps extends IAbstractPopupProps<ICardImportDialogResult> {}

interface ICardImportDialogState extends IAbstractPopupState {
  step: number;
  website: TWebsite;
  import: string;
  importing: boolean;
  useFr: boolean;
  generatePasscode: boolean;
  replaceMatrixes: IReplaceMatrix[];
  importArtworks: boolean;
  yuginewsImporting: boolean;
  yuginewsUrl: string;
  cardsData: IYuginewsCardData[];
  selectedCards: { [cardUuid: string]: boolean };
  selectedCardsNum: number;
  cardsDataSortOption: TCardsDataSortOption;
  cardsDataSortOrder: TTableHeaderSortOrder;
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
  private yuginewsLogo = require(`assets/images/yuginewsLogo.png`);

  public static async show(options: ICardImportDialogProps = {}) {
    options.title = options.title || 'Importer depuis un site';
    options.width = options.width || '70%';
    options.height = options.height || '80%';
    return await app.$popup.show<ICardImportDialogResult, ICardImportDialogProps>({
      type: 'import',
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
      import: '',
      importing: false,
      useFr: false,
      generatePasscode: false,
      replaceMatrixes: [],
      importArtworks: false,
      yuginewsUrl: '',
      cardsData: [],
      selectedCards: {},
      selectedCardsNum: 0,
      cardsDataSortOption: 'added',
      cardsDataSortOrder: 'desc',
      artworkSaveDirPath: `${app.$settings.settings.defaultImgImportPath}`,
      yuginewsImporting: false,
      cardsImported: 0,
      cardsToImport: 0,
    };
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
    if (this.state.importing || !this.state.import) return;
    await this.setStateAsync({ importing: true });

    const newCards: ICard[] = [];
    const importLinks = this.state.import.split('\n');
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

    if (!newCards.length) return await this.setStateAsync({ importing: false, import: '' });

    await this.setStateAsync({ cardsToImport: newCards.length });
    await app.$card.importCards(newCards);
    await this.close();
  }

  private async getYuginewsCards() {
    if (!this.state.yuginewsUrl) return;
    await this.setStateAsync({ cardsData: [], yuginewsImporting: true });

    const cardsData = await app.$yuginews.getPageCards(this.state.yuginewsUrl);

    if (cardsData.length) {
      if (this.state.cardsDataSortOption === 'added' && !cardsData[0]!.added) {
        await this.setStateAsync({ cardsDataSortOption: 'pageOrder' });
      } else if (this.state.cardsDataSortOption === 'pageOrder' && cardsData[0]!.added) {
        await this.setStateAsync({ cardsDataSortOption: 'added' });
      } else if (this.state.cardsDataSortOption === 'theme' && !cardsData[0]!.theme?.length) {
        await this.setStateAsync({ cardsDataSortOption: 'id' });
      } else if (this.state.cardsDataSortOption === 'set' && cardsData[0]!.theme?.length) {
        await this.setStateAsync({ cardsDataSortOption: 'theme' });
      }
    }

    await this.sortCardsData(cardsData);
    await this.setStateAsync({ yuginewsImporting: false });
  }

  private async doYuginewsImport() {
    const selectedCards = this.state.cardsData.filter((c) => this.state.selectedCards[c.uuid!]);
    if (!selectedCards?.length) return;

    await this.setStateAsync({ importing: true, selectedCards: {}, selectedCardsNum: 0 });
    const newCards = await app.$yuginews.importFromCardData({
      cardsData: selectedCards,
      importArtworks: this.state.importArtworks,
      artworkDirectoryPath: this.state.artworkSaveDirPath,
    });

    if (newCards.length) {
      await this.setStateAsync({ cardsToImport: newCards.length });
      await app.$card.importCards(newCards);
      await this.close();
    } else {
      await this.setStateAsync({ importing: false });
    }
  }

  private toggleSelectCard(cardUuid: string) {
    const selectedCards = { ...this.state.selectedCards };
    selectedCards[cardUuid] = !selectedCards[cardUuid];
    const selectedCardsNum = selectedCards[cardUuid]
      ? this.state.selectedCardsNum + 1
      : this.state.selectedCardsNum - 1;
    this.setState({ selectedCards, selectedCardsNum });
  }

  private toggleAll() {
    let { selectedCards, selectedCardsNum, cardsData } = this.state;
    if (selectedCardsNum === cardsData.length) {
      selectedCardsNum = 0;
      selectedCards = {};
    } else {
      selectedCardsNum = cardsData.length;
      cardsData.forEach((card) => (selectedCards[card.uuid as string] = true));
    }
    this.setState({ selectedCards: { ...selectedCards }, selectedCardsNum });
  }

  private async onChangeOrder(cardsDataSortOption: TCardsDataSortOption) {
    let { cardsDataSortOrder } = this.state;
    if (this.state.cardsDataSortOption === cardsDataSortOption) {
      switch (cardsDataSortOrder) {
        case 'asc':
          cardsDataSortOrder = 'desc';
          break;

        case 'desc':
          cardsDataSortOrder = 'asc';
          break;

        default:
          break;
      }
    } else {
      cardsDataSortOrder = 'asc';
    }
    await this.setStateAsync({ cardsDataSortOption, cardsDataSortOrder });
    await this.sortCardsData();
  }

  private async sortCardsData(cardsData: IYuginewsCardData[] = this.state.cardsData) {
    const { cardsDataSortOption, cardsDataSortOrder } = this.state;
    switch (cardsDataSortOption) {
      case 'theme':
        if (cardsDataSortOrder === 'asc') cardsData.sort((a, b) => (a.theme || '').localeCompare(b.theme || ''));
        else cardsData.sort((a, b) => (b.theme || '').localeCompare(a.theme || ''));
        break;

      case 'set':
        if (cardsDataSortOrder === 'asc') cardsData.sort((a, b) => (a.setId || '').localeCompare(b.setId || ''));
        else cardsData.sort((a, b) => (b.setId || '').localeCompare(a.setId || ''));
        break;

      case 'name':
        if (cardsDataSortOrder === 'asc') cardsData.sort((a, b) => (a.nameFR || '').localeCompare(b.nameFR || ''));
        else cardsData.sort((a, b) => (b.nameFR || '').localeCompare(a.nameFR || ''));
        break;

      case 'id':
        cardsData.sort((a, b) => {
          const aIsString = isString(a.id);
          const bIsString = isString(b.id);
          let result = 0;
          if (aIsString && bIsString) {
            result = (a.id as string).localeCompare(b.id as string);
          } else if (aIsString && !bIsString) {
            result = 1;
          } else if (!aIsString && bIsString) {
            result = -1;
          } else {
            result = ((a.id as number) || 0) - ((b.id as number) || 0);
          }
          if (cardsDataSortOrder === 'asc') return result;
          else return -1 * result;
        });
        break;

      case 'added':
        if (cardsDataSortOrder === 'asc') {
          cardsData.sort((a, b) => {
            const dateA = a.added ? a.added.getTime() : 0;
            const dateB = b.added ? b.added.getTime() : 0;
            return dateA - dateB;
          });
        } else {
          cardsData.sort((a, b) => {
            const dateA = a.added ? a.added.getTime() : 0;
            const dateB = b.added ? b.added.getTime() : 0;
            return dateB - dateA;
          });
        }
        break;

      case 'pageOrder':
        if (cardsDataSortOrder === 'asc') {
          cardsData.sort((a, b) => {
            const orderA = a.pageOrder ?? Number.NEGATIVE_INFINITY;
            const orderB = b.pageOrder ?? Number.NEGATIVE_INFINITY;
            return orderB - orderA;
          });
        } else {
          cardsData.sort((a, b) => {
            const orderA = a.pageOrder ?? Number.POSITIVE_INFINITY;
            const orderB = b.pageOrder ?? Number.POSITIVE_INFINITY;
            return orderA - orderB;
          });
        }
        break;

      default:
        break;
    }
    await this.setStateAsync({ cardsDataSortOption, cardsDataSortOrder, cardsData: [...cardsData] });
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
      case 'yuginews':
        return 'YugiNews';
      default:
        return 'Choisissez un site pour importer des cartes';
    }
  }

  private getWebsiteParamsDesc() {
    switch (this.state.website) {
      case 'yugipedia':
        return 'Collez les liens des cartes';
      case 'yuginews':
        return "Collez le lien de l'article";
      default:
        return '';
    }
  }

  protected get buttons(): IButtonProps[] {
    const { step, website, importing, cardsData } = this.state;
    if (!step) return [];
    switch (website) {
      case 'yugipedia':
        return [{ disabled: importing, label: 'Importer', color: 'positive', onTap: () => this.doYugipediaImport() }];

      case 'yuginews':
        if (!cardsData?.length) return [];
        return [{ disabled: importing, label: 'Importer', color: 'positive', onTap: () => this.doYuginewsImport() }];

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
      step === 1 && website === 'yuginews' && this.renderYuginewsTab(),
      step === 1 && website === 'yugipedia' && this.renderYugipediaTab(),
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
          key='yuginews-logo'
          className={classNames('logo', 'yuginews', { selected: this.state.website === 'yuginews' })}
          src={this.yuginewsLogo}
          alt='yuginews-logo'
          onTap={() => this.onSelectWesite('yuginews')}
        />
        <Image
          key='yugipedia-logo'
          className={classNames('logo', 'yugipedia', { selected: this.state.website === 'yugipedia' })}
          src={this.yugipediaLogo}
          alt='yugipedia-logo'
          onTap={() => this.onSelectWesite('yugipedia')}
        />
      </VerticalStack>
    );
  }

  private renderYuginewsTab() {
    if (!this.state) return null;

    const {
      cardsDataSortOption,
      cardsDataSortOrder,
      yuginewsUrl,
      yuginewsImporting,
      importing,
      cardsData,
      cardsImported,
      cardsToImport,
      selectedCardsNum,
    } = this.state;
    const showTheme = !!cardsData.length && !!cardsData[0]!.theme?.length;
    const showAdded = !!cardsData.length && !!cardsData[0]!.added;
    const headers: ITableHeadRow = {
      cells: [
        {
          content: <Checkbox value={selectedCardsNum === cardsData.length} onChange={() => this.toggleAll()} />,
        },
      ],
    };
    if (showTheme) {
      headers.cells.push({
        align: 'left',
        content: 'Thème',
        sortOrder: cardsDataSortOption === 'theme' ? cardsDataSortOrder : undefined,
        onChangeOrder: () => this.onChangeOrder('theme'),
      });
    } else {
      headers.cells.push({
        align: 'left',
        content: 'Set',
        sortOrder: cardsDataSortOption === 'set' ? cardsDataSortOrder : undefined,
        onChangeOrder: () => this.onChangeOrder('set'),
      });
    }
    headers.cells.push({
      align: 'left',
      content: 'ID',
      sortOrder: cardsDataSortOption === 'id' ? cardsDataSortOrder : undefined,
      onChangeOrder: () => this.onChangeOrder('id'),
    });
    headers.cells.push({
      align: 'left',
      content: 'Nom',
      sortOrder: cardsDataSortOption === 'name' ? cardsDataSortOrder : undefined,
      onChangeOrder: () => this.onChangeOrder('name'),
    });
    if (showAdded) {
      headers.cells.push({
        align: 'left',
        content: 'Ajouté le',
        sortOrder: cardsDataSortOption === 'added' ? cardsDataSortOrder : undefined,
        onChangeOrder: () => this.onChangeOrder('added'),
      });
    } else {
      headers.cells.push({
        align: 'left',
        content: "Ordre dans l'article",
        sortOrder: cardsDataSortOption === 'pageOrder' ? cardsDataSortOrder : undefined,
        onChangeOrder: () => this.onChangeOrder('pageOrder'),
      });
    }

    return (
      <VerticalStack key='yuginews' className='card-import-dialog-content yuginews' scroll gutter>
        <HorizontalStack gutter verticalItemAlignment='middle'>
          <TextInput
            fill
            placeholder="Lien de l'article"
            value={yuginewsUrl}
            onChange={(value) => this.setState({ yuginewsUrl: value })}
          />
          <Button color='neutral' label='Rechercher' onTap={() => this.getYuginewsCards()} />
        </HorizontalStack>

        {yuginewsImporting && <Spinner />}

        {!!cardsData?.length && this.renderUrlImporter('yuginews')}

        {!!cardsData?.length && (
          <Table
            className='yuginews-cards-table'
            headers={[headers]}
            rows={cardsData.map((card) => ({
              className: classNames('yuginews-card-row', this.getCardDataStyle(card), {
                selected: this.state.selectedCards[card.uuid!],
              }),
              onTap: () => this.toggleSelectCard(card.uuid!),
              cells: [
                {
                  content: <Checkbox value={this.state.selectedCards[card.uuid!] ?? false} onChange={() => {}} />,
                },
                {
                  align: 'left',
                  content: <Typography content={showTheme ? card.theme : card.setId || '-'} variant='help' />,
                },
                {
                  align: 'left',
                  content: <Typography content={`${card.id ?? '-'}`} variant='help' />,
                },
                {
                  align: 'left',
                  content: <Typography content={card.nameFR} variant='help' />,
                },
                {
                  align: 'left',
                  content: (
                    <Typography
                      content={
                        showAdded ? (card.added ? formatDate(card.added, '%d/%M/%Y') : '-') : `${card.pageOrder || '-'}`
                      }
                      variant='help'
                    />
                  ),
                },
              ],
            }))}
          />
        )}

        {!!importing && (
          <HorizontalStack itemAlignment='center'>
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
          </HorizontalStack>
        )}
      </VerticalStack>
    );
  }

  private renderYugipediaTab() {
    if (!this.state) return null;
    const { cardsImported, cardsToImport, importing, useFr, generatePasscode, replaceMatrixes } = this.state;
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
          value={this.state.import}
          onChange={(value) => this.setState({ import: value })}
        />

        <HorizontalStack verticalItemAlignment='middle' gutter>
          <Checkbox label='Textes français' value={useFr} onChange={(useFr) => this.setState({ useFr })} />
          <Checkbox
            label='Si absent, générer un code'
            value={generatePasscode}
            onChange={(generatePasscode) => this.setState({ generatePasscode })}
          />
          {this.renderUrlImporter('yugipedia')}
        </HorizontalStack>

        <VerticalStack itemAlignment='center' gutter fill>
          <Button
            color='neutral'
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

  private renderUrlImporter(website: TWebsite) {
    if (!app.$device.isElectron(window)) return undefined;
    return (
      <HorizontalStack fill={website === 'yugipedia'} gutter>
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

  private getCardDataStyle(cardsData: IYuginewsCardData): string {
    if (cardsData.cardType) {
      if (cardsData.cardType === '2') {
        return 'Magie';
      } else if (cardsData.cardType === '3') {
        return 'Piège';
      } else if (cardsData.abilities?.length) {
        return cardsData.abilities.join(' ');
      }
    }
    return '';
  }
}
