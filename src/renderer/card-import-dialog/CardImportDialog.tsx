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
import { IReplaceMatrix } from 'mn-toolkit/media-wiki/MediaWikiService';
import { HorizontalStack } from 'mn-toolkit/container/HorizontalStack';

export interface ICardImportDialogResult {}

interface ICardImportDialogProps extends IDialogProps<ICardImportDialogResult> {
}

interface ICardImportDialogState extends IContainableState {
  import: string;
  importing: boolean;
  useFr: boolean;
  replaceMatrixes: IReplaceMatrix[];
}

export class CardImportDialog extends Containable<ICardImportDialogProps, ICardImportDialogState> {

  public constructor(props: ICardImportDialogProps) {
    super(props);
    this.state = {
      loaded: true,
      import: '',
      importing: false,
      useFr: false,
      replaceMatrixes: [],
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

  private async doImport() {
    if (!this.state.importing && this.state.import) {
      this.setState({ importing: true });
      const importLinks = this.state.import.split('\n');
      let newCards: ICard[] = [];
      for (let importLink of importLinks) {
        const splitImport = importLink.split('/');
        const newCard = await app.$mediaWiki.getCardInfo(splitImport[splitImport.length-1], this.state.useFr, this.state.replaceMatrixes);
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
  }

  public render() {
    if (!this.state?.loaded) return <Spinner />;
    return this.renderAttributes(<VerticalStack>
      <HorizontalStack className='label-and-use-fr'>
        <p className='import-label'>Collez les liens Yugipedia de cartes (revenir à la ligne entre chaque lien)</p>

        <HorizontalStack className='use-fr'>
          <input type='checkbox' className='use-fr-input' checked={this.state.useFr} onChange={() => this.setState({ useFr: !this.state.useFr })} />
          <p className='use-fr-label'>Textes français</p>
        </HorizontalStack>
      </HorizontalStack>

      <textarea spellCheck={false} className='import-input' value={this.state.import} onInput={e => this.setState({ import: (e.target as EventTargetWithValue).value })} />

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

      <button type='button' className={classNames('import-btn', { 'disabled': this.state.importing })} onClick={() => app.$errorManager.handlePromise(this.doImport())}>
        {this.state.importing ? 'Import en cours...' : 'Importer'}
      </button>
    </VerticalStack>, 'card-import-dialog');
  }
}
