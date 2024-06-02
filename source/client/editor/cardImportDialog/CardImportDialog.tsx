import { ICard } from 'client/editor/card/card-interfaces';
import { IReplaceMatrix } from 'client/editor/mediaWiki';
import { IYuginewsCardData } from 'client/editor/yuginews';
import {
  TableColumnSortOrder,
  Spinner,
  ITableColumn,
  HorizontalStack,
  CheckBox,
  VerticalStack,
  TextInput,
  Button,
  Table,
  Typography,
  Progress,
  TextAreaInput,
  Icon,
  FileInput,
  AbstractPopup,
  IAbstractPopupState,
  IAbstractPopupProps,
  StepProgress,
  Image,
  IButtonProps,
} from 'mn-toolkit';
import { classNames, isEmpty, isString } from 'mn-tools';

type TWebsite = 'yugipedia' | 'yuginews';

type TCardsDataSortOption = 'theme' | 'id' | 'name' | 'set';

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
  importArtwork: boolean;
  yuginewsImporting: boolean;
  yuginewsUrl: string;
  cardsData: IYuginewsCardData[];
  selectedCards: { [cardUuid: string]: boolean };
  selectedCardsNum: number;
  cardsDataSortOption: TCardsDataSortOption;
  cardsDataSortOrder: TableColumnSortOrder;
  artworkSaveDirPath: string;
  cardsToImport: number;
  cardsImported: number;
}

export class CardImportDialog extends AbstractPopup<
  ICardImportDialogResult,
  ICardImportDialogProps,
  ICardImportDialogState
> {
  private yugipediaLogo = require(`../../../assets/images/yugipediaLogo.png`);
  private yuginewsLogo = require(`../../../assets/images/yuginewsLogo.png`);

  public static async show(options: ICardImportDialogProps = {}) {
    options.title = options.title || 'Importer depuis un site';
    options.width = options.width || '70%';
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
      importArtwork: false,
      yuginewsUrl: '',
      cardsData: [],
      selectedCards: {},
      selectedCardsNum: 0,
      cardsDataSortOption: 'theme',
      cardsDataSortOrder: 'asc',
      artworkSaveDirPath: `${app.$settings.settings.defaultImgImportPath}`,
      yuginewsImporting: false,
      cardsImported: 0,
      cardsToImport: 0,
    };
    app.$card.addListener(this);
  }

  public componentWillUnmount() {
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
    const importLinks = this.state.import.split('\n');
    const newCards: ICard[] = [];
    for (const importLink of importLinks) {
      if (isEmpty(importLink)) continue;
      const splitImport = importLink.split('/');
      const newCard = await app.$mediaWiki.getCardInfo(
        splitImport[splitImport.length - 1],
        this.state.useFr,
        this.state.generatePasscode,
        this.state.replaceMatrixes,
        this.state.importArtwork,
        this.state.artworkSaveDirPath
      );

      if (newCard) {
        newCards.push(newCard);
      }
    }
    if (newCards.length) {
      this.setState({ cardsToImport: newCards.length });
      await app.$card.importCards(newCards);
      await this.close();
    } else {
      this.setState({ importing: false, import: '' });
    }
  }

  private async getYuginewsCards() {
    if (!this.state.yuginewsUrl) return;
    await this.setStateAsync({ cardsData: [], yuginewsImporting: true });

    const cardsData = await app.$yuginews.getPageCards(this.state.yuginewsUrl);

    let cardsDataSortOption = this.state.cardsDataSortOption;
    if (cardsData.length) {
      if (cardsDataSortOption === 'theme' && !cardsData[0].theme?.length) {
        cardsDataSortOption = 'id';
      } else if (cardsDataSortOption === 'set' && cardsData[0].theme?.length) {
        cardsDataSortOption = 'theme';
      }
    }

    await this.setStateAsync({ cardsDataSortOption });
    await this.sortCardsData(cardsData);
    await this.setStateAsync({ yuginewsImporting: false });
  }

  private async doYuginewsImport() {
    const selectedCards = this.state.cardsData.filter((c) => this.state.selectedCards[c.uuid as string]);
    if (!selectedCards?.length) return;

    await this.setStateAsync({ importing: true, selectedCards: {}, selectedCardsNum: 0 });
    const newCards = await app.$yuginews.importFromCardData(
      selectedCards,
      this.state.importArtwork,
      this.state.artworkSaveDirPath
    );

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

      default:
        break;
    }
    await this.setStateAsync({ cardsDataSortOption, cardsDataSortOrder, cardsData: [...cardsData] });
  }

  private async selectArtworkSaveDirPath() {
    const artworkSaveDirPath = await window.electron.ipcRenderer.getDirectoryPath(this.state.artworkSaveDirPath);
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
        active={step}
        defaultValue={website ? 1 : 0}
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
          onTap={() => this.onSelectWesite('yuginews')}
        />
        <Image
          key='yugipedia-logo'
          className={classNames('logo', 'yugipedia', { selected: this.state.website === 'yugipedia' })}
          src={this.yugipediaLogo}
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
    const showTheme = cardsData.length && cardsData[0].theme?.length;
    const columns: ITableColumn[] = [
      {
        label: (
          <HorizontalStack fill verticalItemAlignment='middle' onTap={() => this.toggleAll()}>
            <CheckBox defaultValue={selectedCardsNum === cardsData.length} />
          </HorizontalStack>
        ),
        width: '40px',
      },
    ];
    if (showTheme) {
      columns.push({
        label: 'Thème',
        width: '200px',
        order: cardsDataSortOption === 'theme' ? cardsDataSortOrder : undefined,
        onChangeOrder: () => this.onChangeOrder('theme'),
      });
    } else {
      columns.push({
        label: 'Set',
        width: '100px',
        order: cardsDataSortOption === 'set' ? cardsDataSortOrder : undefined,
        onChangeOrder: () => this.onChangeOrder('set'),
      });
    }
    columns.push(
      ...[
        {
          label: 'ID',
          width: '50px',
          order: cardsDataSortOption === 'id' ? cardsDataSortOrder : undefined,
          onChangeOrder: () => this.onChangeOrder('id'),
        },
        {
          label: 'Nom',
          order: cardsDataSortOption === 'name' ? cardsDataSortOrder : undefined,
          onChangeOrder: () => this.onChangeOrder('name'),
        },
      ]
    );

    return (
      <VerticalStack key='yuginews' className='card-import-dialog-content yuginews' scroll gutter>
        <HorizontalStack gutter verticalItemAlignment='middle'>
          <TextInput
            fill
            placeholder="Lien de l'article"
            defaultValue={yuginewsUrl}
            onChange={(value) => this.setState({ yuginewsUrl: value })}
          />
          <Button color='neutral' label='Rechercher' onTap={() => this.getYuginewsCards()} />
        </HorizontalStack>

        {yuginewsImporting && <Spinner />}

        {!!cardsData?.length && this.renderUrlImporter('yuginews')}

        {!!cardsData?.length && (
          <Table
            className='yuginews-cards-table'
            columns={columns}
            rows={cardsData.map((card) => {
              const uuid = card.uuid as string;
              return {
                className: classNames('yuginews-card-row', this.getCardDataStyle(card), {
                  selected: this.state.selectedCards[card.uuid as string],
                }),
                onTap: () => this.toggleSelectCard(uuid),
                cells: [
                  {
                    value: (
                      <HorizontalStack fill verticalItemAlignment='middle'>
                        <CheckBox defaultValue={this.state.selectedCards[uuid]} />
                      </HorizontalStack>
                    ),
                  },
                  {
                    value: (
                      <HorizontalStack fill verticalItemAlignment='middle'>
                        <Typography content={showTheme ? card.theme : card.setId || '-'} variant='help' />
                      </HorizontalStack>
                    ),
                  },
                  {
                    value: (
                      <HorizontalStack fill verticalItemAlignment='middle'>
                        <Typography content={`${card.id ?? '-'}`} variant='help' />
                      </HorizontalStack>
                    ),
                  },
                  {
                    value: (
                      <HorizontalStack fill verticalItemAlignment='middle'>
                        <Typography content={card.nameFR} variant='help' />
                      </HorizontalStack>
                    ),
                  },
                ],
              };
            })}
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
          defaultValue={this.state.import}
          onChange={(value) => this.setState({ import: value })}
        />

        <HorizontalStack verticalItemAlignment='middle' gutter>
          <CheckBox label='Textes français' defaultValue={useFr} onChange={(useFr) => this.setState({ useFr })} />
          <CheckBox
            label='Si absent, générer un code'
            defaultValue={generatePasscode}
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
                    defaultValue={m.toReplace}
                    onChange={(value) => this.updateReplaceMatrix(i, value, m.newString)}
                  />
                  <Typography variant='help' content='devient' />
                  <TextInput
                    fill
                    defaultValue={m.newString}
                    onChange={(value) => this.updateReplaceMatrix(i, m.toReplace, value)}
                  />
                  <Icon size={24} iconId='toolkit-minus' color='negative' onTap={() => this.removeReplaceMatrix(i)} />
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
    if (!app.$device.isDesktop) return undefined;
    return (
      <HorizontalStack fill={website === 'yugipedia'} gutter>
        <CheckBox
          label='Importer les images'
          defaultValue={this.state.importArtwork}
          onChange={(importArtwork) => this.setState({ importArtwork })}
        />
        {this.state.importArtwork && (
          <FileInput
            fill
            defaultValue={this.state.artworkSaveDirPath}
            onChange={(artworkSaveDirPath) => this.setState({ artworkSaveDirPath })}
            overrideOnTap={() => this.selectArtworkSaveDirPath()}
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
