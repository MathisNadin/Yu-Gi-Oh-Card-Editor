import './styles.scss';
import { IContainableState, Containable } from 'libraries/mn-toolkit/containable/Containable';
import { VerticalStack } from 'libraries/mn-toolkit/container/VerticalStack';
import { Spinner } from 'libraries/mn-toolkit/spinner/Spinner';
import { IDialogProps } from 'libraries/mn-toolkit/popup/PopupService';
import { classNames, isString } from 'libraries/mn-tools';
import { ICard } from 'renderer/card/card-interfaces';
import { IReplaceMatrix } from 'renderer/media-wiki/MediaWikiService';
import { HorizontalStack } from 'libraries/mn-toolkit/container/HorizontalStack';
import { TabbedPane } from 'libraries/mn-toolkit/tabs/TabbedPane';
import { TabPane } from 'libraries/mn-toolkit/tabs/TabPane';
import { IYuginewsCardData } from 'renderer/yuginews/YuginewsService';
import { Typography } from 'libraries/mn-toolkit/typography/Typography';
import { TextAreaInput } from 'libraries/mn-toolkit/text-area-input/TextAreaInput';
import { CheckBox } from 'libraries/mn-toolkit/checkbox/Checkbox';
import { TextInput } from 'libraries/mn-toolkit/text-input/TextInput';
import { FileInput } from 'libraries/mn-toolkit/file-input/FileInput';
import { Button, ButtonIcon } from 'libraries/mn-toolkit/button';
import { Table } from 'libraries/mn-toolkit/table/Table';
import { ITableColumn, TableColumnSortOrder } from 'libraries/mn-toolkit/table/interfaces';
import { Progress } from 'libraries/mn-toolkit/progress';

type TTabIndex = 'yugipedia' | 'yuginews';

type TCardsDataSortOption = 'theme' | 'id' | 'name' | 'set';

export interface ICardImportDialogResult {}

interface ICardImportDialogProps extends IDialogProps<ICardImportDialogResult> {
}

interface ICardImportDialogState extends IContainableState {
  tabIndex: TTabIndex;
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

export class CardImportDialog extends Containable<ICardImportDialogProps, ICardImportDialogState> /* implements Partial<ICardListener> */ {

  public static async show() {
    return await app.$popup.show<ICardImportDialogResult>({
      id: 'import-popup',
      title: 'Importer depuis un site',
      innerHeight: 'auto',
      innerWidth: '70%',
      content: <CardImportDialog />,
    });
  }

  public constructor(props: ICardImportDialogProps) {
    super(props);
    this.state = {
      loaded: true,
      import: '',
      importing: false,
      useFr: false,
      generatePasscode: false,
      replaceMatrixes: [],
      tabIndex: 'yuginews',
      importArtwork: false,
      yuginewsUrl: '',
      cardsData: [],
      selectedCards: {},
      selectedCardsNum: 0,
      cardsDataSortOption: 'theme',
      cardsDataSortOrder: 'asc',
      artworkSaveDirPath: app.$settings.settings.defaultImgImportPath,
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
    if (this.state.importing) {
      this.setState({ cardsImported: this.state.cardsImported + 1 }, () => {
        if (this.state.cardsImported === this.state.cardsToImport) {
          this.setState({ importing: false });
        }
      });
    }
  }

  private addReplaceMatrix() {
    let replaceMatrixes = this.state.replaceMatrixes;
    replaceMatrixes.push({ toReplace: '', newString: '' });
    this.setState({ replaceMatrixes });
  }

  private updateReplaceMatrix(index: number, toReplace: string, newString: string) {
    let replaceMatrixes = this.state.replaceMatrixes;
    replaceMatrixes[index] = { toReplace, newString };
    this.setState({ replaceMatrixes });
  }

  private removeReplaceMatrix(index: number) {
    let replaceMatrixes = this.state.replaceMatrixes;
    replaceMatrixes.splice(index, 1);
    this.setState({ replaceMatrixes });
  }

  private async doYugipediaImport() {
    if (this.state.importing || !this.state.import) return;
    this.setState({ importing: true });
    const importLinks = this.state.import.split('\n');
    const newCards: ICard[] = [];
    for (const importLink of importLinks) {
      const splitImport = importLink.split('/');
      const newCard = await app.$mediaWiki.getCardInfo(
        splitImport[splitImport.length-1],
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
      if (this.props.popupId) {
        app.$popup.remove(this.props.popupId);
      }
    } else {
      this.setState({ importing: false, import: '' });
    }
  }

  private async getYuginewsCards() {
    if (!this.state.yuginewsUrl) return;
    this.setState({ cardsData: [], yuginewsImporting: true }, async () => {
      const cardsData = await app.$yuginews.getPageCards(this.state.yuginewsUrl);

      let cardsDataSortOption = this.state.cardsDataSortOption;
      if (cardsData.length) {
        if (cardsDataSortOption === 'theme' && !cardsData[0].theme?.length) {
          cardsDataSortOption = 'id';
        } else if (cardsDataSortOption === 'set' && cardsData[0].theme?.length) {
          cardsDataSortOption = 'theme';
        }
      }

      this.setState({ cardsDataSortOption }, () => {
        this.sortCardsData(cardsData);
        this.setState({ yuginewsImporting: false });
      });
    });
  }

  private async doYuginewsImport() {
    let selectedCards = this.state.cardsData.filter(c => this.state.selectedCards[c.uuid as string]);
    if (!selectedCards?.length) return;

    this.setState({ importing: true, selectedCards: {}, selectedCardsNum: 0 });
    let newCards = await app.$yuginews.importFromCardData(selectedCards, this.state.importArtwork, this.state.artworkSaveDirPath);
    if (newCards.length) {
      this.setState({ cardsToImport: newCards.length });
      await app.$card.importCards(newCards);
      if (this.props.popupId) {
        app.$popup.remove(this.props.popupId);
      }
    } else {
      this.setState({ importing: false });
    }
  }

  private toggleSelectCard(cardUuid: string) {
    const selectedCards = this.state.selectedCards;
    selectedCards[cardUuid] = !selectedCards[cardUuid];
    const selectedCardsNum = selectedCards[cardUuid] ? this.state.selectedCardsNum + 1 : this.state.selectedCardsNum - 1;
    this.setState({ selectedCards, selectedCardsNum }, () => this.forceUpdate());
  }

  private toggleAll() {
    let { selectedCards, selectedCardsNum, cardsData } = this.state;
    if (selectedCardsNum === cardsData.length) {
      selectedCardsNum = 0;
      selectedCards = {};
    } else {
      selectedCardsNum = cardsData.length;
      cardsData.forEach(card => selectedCards[card.uuid as string] = true);
    }
    this.setState({ selectedCards, selectedCardsNum }, () => this.forceUpdate());
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
    this.setState({ cardsDataSortOption, cardsDataSortOrder }, () => this.sortCardsData());
  }

  private sortCardsData(cardsData: IYuginewsCardData[] = this.state.cardsData) {
    const { cardsDataSortOption, cardsDataSortOrder } = this.state;
    switch (cardsDataSortOption) {
      case 'theme':
        if (cardsDataSortOrder === 'asc') cardsData.sort((a, b) => (a.theme || '').localeCompare((b.theme || '')));
        else cardsData.sort((a, b) => (b.theme || '').localeCompare((a.theme || '')));
        break;

      case 'set':
        if (cardsDataSortOrder === 'asc') cardsData.sort((a, b) => (a.setId || '').localeCompare((b.setId || '')));
        else cardsData.sort((a, b) => (b.setId || '').localeCompare((a.setId || '')));
        break;

      case 'name':
        if (cardsDataSortOrder === 'asc') cardsData.sort((a, b) => (a.nameFR || '').localeCompare((b.nameFR || '')));
        else cardsData.sort((a, b) => (b.nameFR || '').localeCompare((a.nameFR || '')));
        break;

      case 'id':
        cardsData.sort((a, b) => {
          const aIsString = isString(a.id);
          const bIsString = isString(b.id);
          let result = 0;
          if (aIsString && bIsString) {
            result = (a.id as string).localeCompare(((b.id) as string));
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
    this.setState({ cardsDataSortOption, cardsDataSortOrder, cardsData }, () => this.forceUpdate());
  }

  private async selectartworkSaveDirPath() {
    const artworkSaveDirPath = await window.electron.ipcRenderer.getDirectoryPath(this.state.artworkSaveDirPath);
    if (!artworkSaveDirPath) return;
    this.setState({ artworkSaveDirPath });
  }

  public render() {
    if (!this.state?.loaded) return <Spinner />;
    return this.renderAttributes(
      <TabbedPane
        tabPosition='top'
        defaultValue={this.state.tabIndex}
        onChange={value => this.setState({ tabIndex: value as TTabIndex })}
      >

        <TabPane id='yuginews' fill={false} label='YugiNews' gutter>
          {this.renderYuginewsTab()}
        </TabPane>

        <TabPane id='yugipedia' fill={false} label='Yugipedia' gutter>
          {this.renderYugipediaTab()}
        </TabPane>

    </TabbedPane>, 'card-import-dialog');
  }

  private renderYuginewsTab() {
    if (!this.state) return null;

    const { cardsDataSortOption, cardsDataSortOrder, yuginewsUrl, yuginewsImporting, importing, cardsData, cardsImported, cardsToImport, selectedCardsNum } = this.state;
    const showTheme = cardsData.length && cardsData[0].theme?.length;
    const columns: ITableColumn[] = [{
      label: <HorizontalStack fill verticalItemAlignment='middle' onTap={() => this.toggleAll()}>
        <CheckBox defaultValue={selectedCardsNum === cardsData.length} />
      </HorizontalStack>,
      width: '40px',
    }];
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
    columns.push(...[
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
    ]);

    return this.renderAttributes(<VerticalStack marginVertical gutter>
      {this.renderUrlImporter('yuginews')}

      <HorizontalStack gutter verticalItemAlignment='middle'>
        <TextInput fill placeholder="Lien de l'article" defaultValue={yuginewsUrl} onChange={value => this.setState({ yuginewsUrl: value })} />
        <Button color='positive' label='Valider' onTap={() => this.getYuginewsCards()} />
      </HorizontalStack>

      {yuginewsImporting && <Spinner />}

      {cardsData?.length && <Table
        scroll
        columns={columns}
        rows={cardsData.map(card => {
          const uuid = card.uuid as string;
          return {
            className: classNames('yuginews-card-row', this.getCardDataStyle(card), { 'selected': this.state.selectedCards[card.uuid as string] }),
            cells: [
              {
                value: <HorizontalStack fill verticalItemAlignment='middle' onTap={() => this.toggleSelectCard(uuid)}>
                  <CheckBox defaultValue={this.state.selectedCards[card.uuid as string]} />
                </HorizontalStack>
              },
              {
                value: <HorizontalStack fill verticalItemAlignment='middle' onTap={() => this.toggleSelectCard(uuid)}>
                  <Typography content={showTheme ? card.theme : card.setId || '-'} variant='help' />
                </HorizontalStack>
              },
              {
                value: <HorizontalStack fill verticalItemAlignment='middle' onTap={() => this.toggleSelectCard(uuid)}>
                  <Typography content={`${card.id || '-'}`} variant='help' />
                </HorizontalStack>
              },
              {
                value: <HorizontalStack fill verticalItemAlignment='middle' onTap={() => this.toggleSelectCard(uuid)}>
                  <Typography content={card.nameFR} variant='help' />
                </HorizontalStack>
              },
            ],
          }
        })}
      />}

      <HorizontalStack itemAlignment='center'>
        {!!cardsData?.length && !importing && <Button color='balanced' label='Importer' onTap={() => this.doYuginewsImport()} />}
        {!!importing && <HorizontalStack margin itemAlignment='center'>
          <Progress
            fill
            showPercent
            color='balanced'
            message='Import en cours...'
            progress={cardsImported}
            total={cardsToImport}
          />
        </HorizontalStack>}
      </HorizontalStack>
    </VerticalStack>, 'card-import-dialog-content yuginews');
  }

  private renderYugipediaTab() {
    if (!this.state) return null;
    const { cardsImported, cardsToImport, importing, useFr, generatePasscode, replaceMatrixes } = this.state;
    return this.renderAttributes(<VerticalStack fill gutter marginVertical>
      <Typography variant='help' content='Collez les liens Yugipedia de cartes (revenir à la ligne entre chaque lien)' />

      <TextAreaInput defaultValue={this.state.import} onChange={value => this.setState({ import: value })} />

      <HorizontalStack verticalItemAlignment='middle' gutter>
        <CheckBox label='Textes français' defaultValue={useFr} onChange={useFr => this.setState({ useFr })} />
        <CheckBox label='Si absent, générer un code' defaultValue={generatePasscode} onChange={generatePasscode => this.setState({ generatePasscode })} />
        {this.renderUrlImporter('yugipedia')}
      </HorizontalStack>

      <VerticalStack itemAlignment='center' gutter fill>
        {!!replaceMatrixes.length && replaceMatrixes.map((m, i) =>
          <HorizontalStack gutter verticalItemAlignment='middle'>
            <TextInput fill defaultValue={m.toReplace} onChange={value => this.updateReplaceMatrix(i, value, m.newString)} />
            <Typography variant='help' content="devient" />
            <TextInput fill defaultValue={m.newString} onChange={value => this.updateReplaceMatrix(i, m.toReplace, value)} />
            <ButtonIcon icon='toolkit-minus' color='assertive' onTap={() => this.removeReplaceMatrix(i)} />
          </HorizontalStack>
        )}

        <Button color='positive' label='Ajouter un terme à remplacer dans les textes de la carte' onTap={() => this.addReplaceMatrix()} />

        {!importing && <Button color='balanced' label='Importer' onTap={() => this.doYugipediaImport()} />}
        {!!importing && <HorizontalStack margin itemAlignment='center'>
          <Progress
            fill
            showPercent
            color='balanced'
            message='Import en cours...'
            progress={cardsImported}
            total={cardsToImport}
          />
        </HorizontalStack>}
      </VerticalStack>
    </VerticalStack>, 'card-import-dialog-content yugipedia');
  }

  private renderUrlImporter(origin: TTabIndex) {
    return <HorizontalStack minHeight={32} fill={origin === 'yugipedia'} gutter /* className={classNames('import-option', 'artwork-importer', origin)} */>
      <CheckBox label='Importer les images' defaultValue={this.state.importArtwork} onChange={importArtwork => this.setState({ importArtwork })} />
      {this.state.importArtwork && <FileInput
        fill
        defaultValue={this.state.artworkSaveDirPath}
        onChange={artworkSaveDirPath => this.setState({ artworkSaveDirPath })}
        overrideOnTap={() => this.selectartworkSaveDirPath()}
      />}
    </HorizontalStack>;
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
