/* eslint-disable no-else-return */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-unreachable */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable prefer-const */
/* eslint-disable import/order */
/* eslint-disable no-undef */
/* eslint-disable no-param-reassign */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable lines-between-class-members */
/* eslint-disable global-require */
/* eslint-disable class-methods-use-this */
/* eslint-disable react/self-closing-comp */
/* eslint-disable react/default-props-match-prop-types */
/* eslint-disable react/sort-comp */
/* eslint-disable react/static-property-placement */
/* eslint-disable no-use-before-define */
/* eslint-disable react/require-default-props */
/* eslint-disable no-useless-constructor */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable import/prefer-default-export */
/* eslint-disable react/prefer-stateless-function */
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */

import './styles.css';
import { IContainableState, Containable } from 'mn-toolkit/containable/Containable';
import { VerticalStack } from 'mn-toolkit/container/VerticalStack';
import { Spinner } from 'mn-toolkit/spinner/Spinner';
import { IDialogProps } from 'mn-toolkit/popup/PopupService';
import { EventTargetWithValue } from 'mn-toolkit/container/Container';
import { classNames } from 'mn-toolkit/tools';
import { ICard } from 'renderer/card/card-interfaces';
import { IReplaceMatrix } from 'renderer/media-wiki/MediaWikiService';
import { HorizontalStack } from 'mn-toolkit/container/HorizontalStack';
import { TabbedPane } from 'mn-toolkit/tabs/TabbedPane';
import { TabPane } from 'mn-toolkit/tabs/TabPane';
import { IYuginewsCardData } from 'renderer/yuginews/YuginewsService';

type TTabIndex = 'yugipedia' | 'yuginews';

type TCardsDataSortOption =
  'theme' | 'id' | 'name' | 'set' |
  'theme-reverse' | 'id-reverse' | 'name-reverse' | 'set-reverse';

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
  cardsDataSortOption: TCardsDataSortOption;
  artworkSaveDirPath: string;
}

export class CardImportDialog extends Containable<ICardImportDialogProps, ICardImportDialogState> {

  public constructor(props: ICardImportDialogProps) {
    super(props);
    this.state = {
      loaded: true,
      import: '',
      importing: false,
      useFr: false,
      generatePasscode: false,
      replaceMatrixes: [],
      tabIndex: 'yugipedia',
      importArtwork: false,
      yuginewsUrl: '',
      cardsData: [],
      selectedCards: {},
      cardsDataSortOption: 'theme',
      artworkSaveDirPath: '',
      yuginewsImporting: false,
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
    let newCards: ICard[] = [];
    for (let importLink of importLinks) {
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
    this.setState({ cardsData: [], yuginewsImporting: true });
    let cardsData = await app.$yuginews.getPageCards(this.state.yuginewsUrl);

    let cardsDataSortOption = this.state.cardsDataSortOption;
    if (cardsData.length) {
      if (cardsDataSortOption === 'theme' || cardsDataSortOption === 'theme-reverse' && !cardsData[0].theme?.length) {
        cardsDataSortOption = 'id';
      } else if (cardsDataSortOption === 'set' || cardsDataSortOption === 'set-reverse' && cardsData[0].theme?.length) {
        cardsDataSortOption = 'theme';
      }
    }

    this.sortCardsData(cardsData, cardsDataSortOption);
    this.setState({ yuginewsImporting: false });
  }

  private async doYuginewsImport() {
    let selectedCards = this.state.cardsData.filter(c => this.state.selectedCards[c.uuid as string]);
    if (!selectedCards?.length) return;

    this.setState({ importing: true, selectedCards: {} });
    let newCards = await app.$yuginews.importFromCardData(selectedCards, this.state.importArtwork, this.state.artworkSaveDirPath);
    if (newCards.length) {
      await app.$card.importCards(newCards);
      if (this.props.popupId) {
        app.$popup.remove(this.props.popupId);
      }
    } else {
      this.setState({ importing: false });
    }
  }

  private toggleSelectCard(cardUuid: string) {
    let selectedCards = this.state.selectedCards;
    selectedCards[cardUuid] = !selectedCards[cardUuid];
    this.setState({ selectedCards });
  }

  private sortCardsData(cardsData: IYuginewsCardData[], cardsDataSortOption: TCardsDataSortOption) {
    cardsDataSortOption = cardsDataSortOption || this.state?.cardsDataSortOption;
    cardsData = cardsData || this.state?.cardsData;
    switch (cardsDataSortOption) {
      case 'theme':
        cardsData.sort((a, b) => ((a.theme) as string || '').localeCompare(((b.theme) as string || '')) || (a.id as number) - (b.id as number));
        break;

      case 'theme-reverse':
        cardsData.sort((a, b) => ((b.theme) as string || '').localeCompare(((a.theme) as string || '')) || (a.id as number) - (b.id as number));
        break;

      case 'id':
        cardsData.sort((a, b) => {
          const aIsString = typeof a.id === 'string';
          const bIsString = typeof b.id === 'string';
          if (aIsString && bIsString) {
            return (a.id as string).localeCompare(((b.id) as string));
          } else if (aIsString && !bIsString) {
            return 1;
          } else if (!aIsString && bIsString) {
            return -1;
          } else {
            return ((a.id as number) || 0) - ((b.id as number) || 0);
          }
        });
        break;

      case 'id-reverse':
        cardsData.sort((a, b) => {
          const aIsString = typeof a.id === 'string';
          const bIsString = typeof b.id === 'string';
          if (aIsString && bIsString) {
            return (b.id as string).localeCompare(((a.id) as string));
          } else if (aIsString && !bIsString) {
            return -1;
          } else if (!aIsString && bIsString) {
            return 1;
          } else {
            return ((b.id as number) || 0) - ((a.id as number) || 0);
          }
        });
        break;

      case 'name':
        cardsData.sort((a, b) => ((a.nameFR) as string || '').localeCompare(((b.nameFR) as string || '')));
        break;

      case 'name-reverse':
        cardsData.sort((a, b) => ((b.nameFR) as string || '').localeCompare(((a.nameFR) as string || '')));
        break;

      case 'set':
        cardsData.sort((a, b) => ((a.setId) as string || '').localeCompare(((b.setId) as string || '')));
        break;

      case 'set-reverse':
        cardsData.sort((a, b) => ((b.setId) as string || '').localeCompare(((a.setId) as string || '')));
        break;

      default:
        break;
    }
    this.setState({ cardsData, cardsDataSortOption });
    this.forceUpdate();
  }

  private async selectartworkSaveDirPath() {
    const artworkSaveDirPath = await window.electron.ipcRenderer.getDirectoryPath();
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

        <TabPane id='yugipedia' fill={false} label='Yugipedia' gutter>
          {this.renderYugipediaTab()}
        </TabPane>

        <TabPane id='yuginews' fill={false} label='YugiNews' gutter>
          {this.renderYuginewsTab()}
        </TabPane>

    </TabbedPane>, 'card-import-dialog');
  }

  private renderYugipediaTab() {
    return this.renderAttributes(<VerticalStack>
      <p className='import-label'>Collez les liens Yugipedia de cartes (revenir à la ligne entre chaque lien)</p>

      <textarea spellCheck={false} className='import-input' value={this.state.import} onInput={e => this.setState({ import: (e.target as EventTargetWithValue).value })} />

      <HorizontalStack className='import-options'>
        <HorizontalStack className='import-option use-fr'>
          <input
            type='checkbox'
            className='import-option-input use-fr-input'
            checked={this.state.useFr}
            onChange={() => this.setState({ useFr: !this.state.useFr })}
          />
          <p className='import-option-label use-fr-label'>Textes français</p>
        </HorizontalStack>

        <HorizontalStack className='import-option generate-passcode'>
          <input
            type='checkbox'
            className='import-option-input generate-passcode-input'
            checked={this.state.generatePasscode}
            onChange={() => this.setState({ generatePasscode: !this.state.generatePasscode })}
          />
          <p className='import-option-label generate-passcode-label'>Si absent, générer un code</p>
        </HorizontalStack>

        {this.renderUrlImporter('yugipedia')}
      </HorizontalStack>

      {!!this.state.replaceMatrixes.length && this.state.replaceMatrixes.map((m, i) =>
        <HorizontalStack className='replace-matrix'>
          <input
            type='text'
            className='replace-matrix-input to-replace-input'
            value={m.toReplace}
            onInput={e => this.updateReplaceMatrix(i, (e.target as EventTargetWithValue).value, m.newString)}
          />

          <input
            type='text'
            className='replace-matrix-input new-string-input'
            value={m.newString}
            onInput={e => this.updateReplaceMatrix(i, m.toReplace, (e.target as EventTargetWithValue).value)}
          />

          <button type='button' className='remove-replace-matrix-btn' onClick={() => this.removeReplaceMatrix(i)}>-</button>
        </HorizontalStack>
      )}
      <button type='button' className='add-replace-matrix-btn' onClick={() => this.addReplaceMatrix()}>Ajouter un terme à remplacer dans les textes de la carte</button>

      <button type='button' className={classNames('import-btn', { 'disabled': this.state.importing })} onClick={() => app.$errorManager.handlePromise(this.doYugipediaImport())}>
        {this.state.importing ? 'Import en cours...' : 'Importer'}
      </button>
    </VerticalStack>, 'card-import-dialog-content yugipedia');
  }

  private renderYuginewsTab() {
    return this.renderAttributes(<VerticalStack>
      {this.renderUrlImporter('yuginews')}

      <VerticalStack className='yuginews-url' gutter>
        <p className='yuginews-url-label'>Entrez le lien de l'article</p>

        <HorizontalStack className='yuginews-url-import'>
          <input type='text' className='yuginews-url-import-input' value={this.state.yuginewsUrl} onInput={e => this.setState({ yuginewsUrl: (e.target as EventTargetWithValue).value })} />
          <button type='button' className='yuginews-url-import-btn' onClick={() => app.$errorManager.handlePromise(this.getYuginewsCards())}>Valider</button>
        </HorizontalStack>
      </VerticalStack>

      {this.state.yuginewsImporting && <Spinner />}

      {!!this.state.cardsData?.length && <VerticalStack fill scroll className='table-container'>
        <table className='table'>
          <thead>
            <tr>
              {this.state.cardsData[0].theme?.length
                ? <th
                  className={classNames('card-theme', 'cursor-pointer', {
                    'sorted-asc': this.state.cardsDataSortOption === 'theme',
                    'sorted-desc': this.state.cardsDataSortOption === 'theme-reverse'
                  })}
                  onClick={() => this.sortCardsData(this.state.cardsData, this.state.cardsDataSortOption === 'theme' ? 'theme-reverse' : 'theme')}
                >Thème</th>
                : <th
                  className={classNames('card-set', 'cursor-pointer', {
                    'sorted-asc': this.state.cardsDataSortOption === 'set',
                    'sorted-desc': this.state.cardsDataSortOption === 'set-reverse'
                  })}
                  onClick={() => this.sortCardsData(this.state.cardsData, this.state.cardsDataSortOption === 'set' ? 'set-reverse' : 'set')}
                >Set</th>
              }
              <th
                className={classNames('card-id', 'cursor-pointer', {
                  'sorted-asc': this.state.cardsDataSortOption === 'id',
                  'sorted-desc': this.state.cardsDataSortOption === 'id-reverse'
                })}
                onClick={() => this.sortCardsData(this.state.cardsData, this.state.cardsDataSortOption === 'id' ? 'id-reverse' : 'id')}
              >ID</th>
              <th
                className={classNames('card-name', 'cursor-pointer', {
                  'sorted-asc': this.state.cardsDataSortOption === 'name',
                  'sorted-desc': this.state.cardsDataSortOption === 'name-reverse'
                })}
                onClick={() => this.sortCardsData(this.state.cardsData, this.state.cardsDataSortOption === 'name' ? 'name-reverse' : 'name')}
              >Nom</th>
            </tr>
          </thead>
          <tbody>
            {this.state.cardsData.map(card => {
              return <tr key={card.uuid} className={classNames('yuginews-card-row', this.getCardDataStyle(card), { 'selected': this.state.selectedCards[card.uuid as string] })}>
              {this.state.cardsData[0].theme?.length
                ? <td className='card-theme' onClick={() => this.toggleSelectCard(card.uuid as string)}>{card.theme}</td>
                : <td className='card-set' onClick={() => this.toggleSelectCard(card.uuid as string)}>{card.setId}</td>
              }
                <td className='card-id' onClick={() => this.toggleSelectCard(card.uuid as string)}>{card.id}</td>
                <td className='card-name' onClick={() => this.toggleSelectCard(card.uuid as string)}>{card.nameFR}</td>
              </tr>;
            })}
          </tbody>
        </table>
      </VerticalStack>}

      {!!this.state.cardsData?.length &&
        <button type='button' className={classNames('import-btn', { 'disabled': this.state.importing })} onClick={() => app.$errorManager.handlePromise(this.doYuginewsImport())}>
          {this.state.importing ? 'Import en cours...' : 'Importer'}
        </button>
      }
    </VerticalStack>, 'card-import-dialog-content yuginews');
  }

  private renderUrlImporter(origin: string) {
    return <HorizontalStack className={classNames('import-option', 'artwork-importer', origin)}>
      <input
        type='checkbox'
        className='import-option-input artwork-importer-input'
        checked={this.state.importArtwork}
        onChange={() => this.setState({ importArtwork: !this.state.importArtwork })}
      />
      <p className='import-option-label artwork-importer-label'>Importer les images</p>

      {this.state.importArtwork && <HorizontalStack className='artwork-path'>
        <input
          type='text'
          className='path-text-input'
          value={this.state.artworkSaveDirPath}
          placeholder='Choisissez un dossier où enregistrer les images'
          onInput={e => this.setState({ artworkSaveDirPath: (e.target as EventTargetWithValue).value })}
        />
        <button type='button' className='path-btn' onClick={() => app.$errorManager.handlePromise(this.selectartworkSaveDirPath())}>...</button>
      </HorizontalStack>}
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
