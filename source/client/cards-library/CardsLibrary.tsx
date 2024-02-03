import './styles.css';
import { IContainableProps, IContainableState, Containable } from 'libraries/mn-toolkit/containable/Containable';
import { VerticalStack } from 'libraries/mn-toolkit/container/VerticalStack';
import { ICardListener } from 'renderer/card/CardService';
import { deepClone } from 'libraries/mn-tools';
import { MouseEvent } from 'react';
import { ICard } from 'renderer/card/card-interfaces';
import { Table } from 'libraries/mn-toolkit/table/Table';
import { Spinner } from 'libraries/mn-toolkit/spinner/Spinner';
import { Icon } from 'libraries/mn-toolkit/icon';
import { TableColumnSortOrder } from 'libraries/mn-toolkit/table/interfaces';
import { HorizontalStack } from 'libraries/mn-toolkit/container/HorizontalStack';
import { Typography } from 'libraries/mn-toolkit/typography/Typography';
import { Button } from 'libraries/mn-toolkit/button';
import { Spacer } from 'libraries/mn-toolkit/spacer/Spacer';
import { Progress } from 'libraries/mn-toolkit/progress';

export type TCardSortOption = 'game' | 'name' | 'modified';

interface ICardsLibraryProps extends IContainableProps {}

interface ICardsLibraryState extends IContainableState {
  localCards: ICard[];
  sortOption: TCardSortOption;
  sortOrder: TableColumnSortOrder;
  current: string;
  edited: string;
  selectAllMode: boolean;
  selectedCardsNum: number;
  selectedCards: { [cardUuid: string]: boolean };
  cardsRendered: number;
  cardsToRender: number;
}

export class CardsLibrary extends Containable<ICardsLibraryProps, ICardsLibraryState> implements Partial<ICardListener> {

  public constructor(props: ICardsLibraryProps) {
    super(props);
    this.state = {
      loaded: true,
      current: app.$card.tempCurrentCard?.uuid as string,
      edited: app.$card.tempCurrentCard?.uuid as string,
      sortOption: 'modified',
      sortOrder: 'asc',
      localCards: app.$card.localCards,
      selectAllMode: true,
      selectedCardsNum: 0,
      selectedCards: {},
      cardsRendered: 0,
      cardsToRender: 0,
    };
    app.$card.addListener(this);
    this.sort();
  }

  public componentWillUnmount() {
    app.$card.removeListener(this);
  }

  public localCardsLoaded(localCards: ICard[]) {
    this.sort(localCards);
  }

  public localCardsUpdated(localCards: ICard[]) {
    this.sort(localCards);
  }

  public tempCurrentCardLoaded(tempCurrentCard: ICard) {
    this.setState({ edited: tempCurrentCard.uuid as string, current: tempCurrentCard.uuid as string });
  }

  public cardRenderer(cardUuid: string) {
    let { cardsRendered, selectedCards, selectedCardsNum } = this.state;
    selectedCards[cardUuid] = false;
    selectedCardsNum--;
    cardsRendered++;
    this.setState({ cardsRendered, selectedCards, selectedCardsNum }, () => {
      if (this.state.cardsRendered === this.state.cardsToRender) {
        this.setState({ selectedCards: {}, selectedCardsNum: 0, cardsToRender: 0, cardsRendered: 0 }, () => this.forceUpdate());
      } else {
        this.forceUpdate();
      }
    });
  }

  public menuSaveTempToLocal() {
    this.setState({ edited: '', current: '' });
  }

  private async onChangeOrder(sortOption: TCardSortOption) {
    let { sortOrder } = this.state;
    if (this.state.sortOption === sortOption) {
      switch (sortOrder) {
        case 'asc':
          sortOrder = 'desc';
          break;

        case 'desc':
          sortOrder = 'asc';
          break;

        default:
          break;
      }
    } else {
      sortOrder = 'asc';
    }
    this.setState({ sortOption, sortOrder }, () => this.sort());
  }

  private sort(localCards: ICard[] = this.state.localCards) {
    let { sortOption, sortOrder } = this.state;
    switch (sortOption) {
      case 'game':
        localCards.sort((a, b) => {
          let aScore = a.rush ? 0 : 1;
          let bScore = b.rush ? 0 : 1;
          return sortOrder === 'asc' ? aScore - bScore : bScore - aScore;
        });
        break;

      case 'name':
        if (sortOrder === 'asc') localCards.sort((a, b) => a.name.localeCompare(b.name));
        else localCards.sort((a, b) => b.name.localeCompare(a.name));
        break;

      case 'modified':
        if (sortOrder === 'asc') localCards.sort((a, b) => (a.modified as Date).getTime() - (b.modified as Date).getTime());
        else localCards.sort((a, b) => (b.modified as Date).getTime() - (a.modified as Date).getTime());
        break;

      default:
        break;
    }
    this.setState({ sortOption, sortOrder, localCards }, () => this.forceUpdate());
  }

  private formatDate(date: Date | undefined) {
    if (!date) return 'Inconnu';

    let day = `${date.getDate()}`;
    if (day.length < 2) day = `0${day}`;

    let month = `${date.getMonth()}`;
    if (month.length < 2) month = `0${month}`;

    return `${day}-${month}-${date.getFullYear()}`;
  }

  private async saveEdit(event?: MouseEvent) {
    if (this.state.cardsToRender) return;
    if (event) event.stopPropagation();
    this.setState({ edited: '', current: '' });
    await app.$card.saveTempCurrentToLocal();
  }

  private async startEdit(card: ICard, event?: MouseEvent) {
    if (this.state.cardsToRender) return;
    if (event) event.stopPropagation();
    this.setState({ edited: card.uuid as string, current: card.uuid as string });
    await app.$card.saveTempCurrentCard(deepClone(card));
  }

  private async abordEdit(event?: MouseEvent) {
    if (this.state.cardsToRender) return;
    if (event) event.stopPropagation();
    this.setState({ edited: '', current: '' });
    await app.$card.saveTempCurrentCard(undefined);
  }

  private async deleteCard(card: ICard, event?: MouseEvent) {
    if (this.state.cardsToRender) return;
    if (event) event.stopPropagation();
    await app.$card.deleteLocalCard(card);
  }

  private toggleSelectCard(cardUuid: string) {
    if (this.state.cardsToRender) return;
    let { selectedCards, selectedCardsNum, selectAllMode, localCards } = this.state;
    selectedCards[cardUuid] = !selectedCards[cardUuid];

    if (selectedCards[cardUuid]) selectedCardsNum++;
    else selectedCardsNum--;

    if (selectedCardsNum === localCards.length) selectAllMode = false;
    else selectAllMode = true;
    this.setState({ selectedCards, selectedCardsNum, selectAllMode }, () => this.forceUpdate());
  }

  private selectAll() {
    if (this.state.cardsToRender) return;
    let { localCards, selectedCards, selectedCardsNum } = this.state;
    selectedCardsNum = 0;
    for (const card of localCards) {
      selectedCards[card.uuid as string] = true;
      selectedCardsNum++;
    }
    this.setState({ selectAllMode: false, selectedCards, selectedCardsNum });
  }

  private unselectAll() {
    if (this.state.cardsToRender) return;
    this.setState({ selectAllMode: true, selectedCards: {}, selectedCardsNum: 0 });
  }

  private async renderSelectedCards() {
    if (this.state.edited) return;

    let cards = this.state.localCards.filter(c => this.state.selectedCards[c.uuid as string]);
    if (!cards.length) return;

    this.setState({ cardsToRender: cards.length, cardsRendered: 0 });
    await app.$card.renderCards(cards);
  }

  public render() {
    if (!this.state?.localCards?.length) return <Spinner />;
    const { cardsToRender, cardsRendered, selectAllMode, selectedCardsNum, localCards, sortOption, sortOrder } = this.state;
    return this.renderAttributes(<VerticalStack fill>
      <Table scroll
        columns={[
          {
            label: 'Format',
            order: sortOption === 'game' ? sortOrder : undefined,
            width: '70px',
            onChangeOrder: () => this.onChangeOrder('game'),
          },
          {
            label: 'Nom',
            order: sortOption === 'name' ? sortOrder : undefined,
            onChangeOrder: () => this.onChangeOrder('name'),
          },
          {
            label: 'Modifiée',
            order: sortOption === 'modified' ? sortOrder : undefined,
            width: '90px',
            onChangeOrder: () => this.onChangeOrder('modified'),
          },
          {
            label: '',
            width: '25px',
          },
          {
            label: '',
            width: '25px',
          },
        ]}
        rows={localCards.map(card => {
          const uuid = card.uuid as string;
          const isEdited = this.state.edited === card.uuid;
          const isCurrent = this.state.current === card.uuid;
          return {
            className: isCurrent ? 'current' : '',
            selected: this.state.selectedCards[card.uuid as string],
            cells: [
              {
                value: <HorizontalStack fill verticalItemAlignment='middle' onTap={() => this.toggleSelectCard(uuid)}>
                  <Typography content={card.rush ? 'Rush' : 'Master'} variant='help' />
                </HorizontalStack>
              },
              {
                value: <HorizontalStack fill verticalItemAlignment='middle' onTap={() => this.toggleSelectCard(uuid)}>
                  <Typography content={card.name} variant='help' />
                </HorizontalStack>
              },
              {
                value: <HorizontalStack fill verticalItemAlignment='middle' onTap={() => this.toggleSelectCard(uuid)}>
                  <Typography content={this.formatDate(card.modified)} variant='help' />
                </HorizontalStack>
              },
              {
                value: <HorizontalStack fill itemAlignment='center' verticalItemAlignment='middle' onTap={() => isEdited ? this.saveEdit() : this.startEdit(card)}>
                  <Icon iconId={isEdited ? 'toolkit-check-mark' : 'toolkit-pen'} />
                </HorizontalStack>
              },
              {
                value: <HorizontalStack fill itemAlignment='center' verticalItemAlignment='middle' onTap={() => isEdited ? this.abordEdit() : this.deleteCard(card)}>
                  <Icon iconId={isEdited ? 'toolkit-close' : 'toolkit-trash'} />
                </HorizontalStack>
              },
            ],
          };
        })}
      />

      <Spacer />

      {!!cardsToRender && <HorizontalStack margin itemAlignment='center'>
        <Progress
          fill
          showPercent
          color='positive'
          message='Rendu en cours...'
          progress={cardsRendered}
          total={cardsToRender}
        />
      </HorizontalStack>}

      {!cardsToRender && <HorizontalStack margin gutter itemAlignment='center'>
        {selectAllMode && <Button
          icon='toolkit-check-mark'
          color='balanced'
          label='Tout'
          onTap={() => this.selectAll()}
        />}
        {!selectAllMode && <Button
          icon='toolkit-check-mark'
          color='assertive'
          label='Tout'
          onTap={() => this.unselectAll()}
        />}
        <Button
          fill
          disabled={!selectedCardsNum}
          color='positive'
          label='Rendu'
          onTap={() => app.$errorManager.handlePromise(this.renderSelectedCards())}
        />
        <Button
          fill
          color='energized'
          label='Importer'
          onTap={() => app.$errorManager.handlePromise(app.$card.showImportDialog())}
        />
      </HorizontalStack>}
    </VerticalStack>, 'cards-library');
  }
}
