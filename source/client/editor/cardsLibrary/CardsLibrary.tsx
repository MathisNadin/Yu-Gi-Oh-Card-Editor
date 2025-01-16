import { MouseEvent } from 'react';
import {
  IContainerProps,
  IContainerState,
  Container,
  Spinner,
  Table,
  HorizontalStack,
  Typography,
  Icon,
  Spacer,
  Progress,
  Button,
  TTableHeaderSortOrder,
} from 'mn-toolkit';
import { classNames, deepClone } from 'mn-tools';
import { ICard, ICardListener } from '../card';

export type TCardSortOption = 'game' | 'name' | 'modified';

interface ICardsLibraryProps extends IContainerProps {}

interface ICardsLibraryState extends IContainerState {
  localCards: ICard[];
  sortOption: TCardSortOption;
  sortOrder: TTableHeaderSortOrder;
  current: string;
  edited: string;
  selectAllMode: boolean;
  selectedCardsNum: number;
  selectedCards: { [cardUuid: string]: boolean };
  cardsRendered: number;
  cardsToRender: number;
}

export class CardsLibrary extends Container<ICardsLibraryProps, ICardsLibraryState> implements Partial<ICardListener> {
  public static get defaultProps(): ICardsLibraryProps {
    return {
      ...super.defaultProps,
      fill: true,
      layout: 'vertical',
    };
  }

  public constructor(props: ICardsLibraryProps) {
    super(props);
    this.state = {
      ...this.state,
      loaded: true,
      current: app.$card.tempCurrentCard?.uuid as string,
      edited: app.$card.tempCurrentCard?.uuid as string,
      sortOption: 'modified',
      sortOrder: 'desc',
      localCards: app.$card.localCards,
      selectAllMode: true,
      selectedCardsNum: 0,
      selectedCards: {},
      cardsRendered: 0,
      cardsToRender: 0,
    };
    app.$card.addListener(this);
    this.sort(undefined, true);
  }

  public override componentWillUnmount() {
    super.componentWillUnmount();
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
        this.setState({
          selectedCards: {},
          selectedCardsNum: 0,
          cardsToRender: 0,
          cardsRendered: 0,
          selectAllMode: true,
        });
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

  private sort(localCards: ICard[] = this.state.localCards, initial?: boolean) {
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
        if (sortOrder === 'asc')
          localCards.sort((a, b) => (a.modified as Date).getTime() - (b.modified as Date).getTime());
        else localCards.sort((a, b) => (b.modified as Date).getTime() - (a.modified as Date).getTime());
        break;

      default:
        break;
    }

    if (initial) this.state = { ...this.state, localCards, sortOption, sortOrder };
    else this.setState({ sortOption, sortOrder, localCards }, () => this.forceUpdate());
  }

  private formatDate(date: Date | undefined) {
    if (!date) return 'Inconnu';

    let day = `${date.getDate()}`;
    if (day.length < 2) day = `0${day}`;

    let month = `${date.getMonth() + 1}`;
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

    let cards = this.state.localCards.filter((c) => this.state.selectedCards[c.uuid as string]);
    if (!cards.length) return;

    this.setState({ cardsToRender: cards.length, cardsRendered: 0 });
    await app.$card.renderCards(cards);
  }

  public renderClasses() {
    const classes = super.renderClasses();
    classes['cards-library'] = true;
    return classes;
  }

  public get children() {
    if (!this.state.localCards?.length) return <Spinner />;
    const { cardsToRender, cardsRendered, selectAllMode, selectedCardsNum, localCards, sortOption, sortOrder } =
      this.state;
    return [
      <Table
        key='cards-table'
        headers={[
          {
            cells: [
              {
                content: <Typography bold content='Format' contentType='text' variant='help' />,
                sortOrder: sortOption === 'game' ? sortOrder : undefined,
                onChangeOrder: () => this.onChangeOrder('game'),
              },
              {
                content: <Typography bold content='Nom' contentType='text' variant='help' />,
                sortOrder: sortOption === 'name' ? sortOrder : undefined,
                onChangeOrder: () => this.onChangeOrder('name'),
              },
              {
                content: <Typography bold content='Modifiée' contentType='text' variant='help' />,
                sortOrder: sortOption === 'modified' ? sortOrder : undefined,
                onChangeOrder: () => this.onChangeOrder('modified'),
              },
              {
                content: '',
              },
              {
                content: '',
              },
            ],
          },
        ]}
        rows={localCards.map((card) => {
          const uuid = card.uuid!;
          const isEdited = this.state.edited === uuid;
          const isCurrent = this.state.current === uuid;
          return {
            className: classNames({ current: isCurrent, selected: this.state.selectedCards[uuid] }),
            cells: [
              {
                onTap: () => this.toggleSelectCard(uuid),
                content: <Typography content={card.rush ? 'Rush' : 'Master'} contentType='text' variant='help' />,
              },
              {
                onTap: () => this.toggleSelectCard(uuid),
                align: 'left',
                content: <Typography content={card.name} contentType='text' variant='help' />,
              },
              {
                onTap: () => this.toggleSelectCard(uuid),
                content: <Typography content={this.formatDate(card.modified)} contentType='text' variant='help' />,
              },
              {
                content: (
                  <Icon
                    icon={isEdited ? 'toolkit-check-mark' : 'toolkit-pen'}
                    onTap={() => (isEdited ? this.saveEdit() : this.startEdit(card))}
                  />
                ),
              },
              {
                content: (
                  <Icon
                    icon={isEdited ? 'toolkit-close' : 'toolkit-trash'}
                    onTap={() => (isEdited ? this.abordEdit() : this.deleteCard(card))}
                  />
                ),
              },
            ],
          };
        })}
      />,

      <Spacer key='spacer' />,

      !!cardsToRender && (
        <HorizontalStack key='render-progress' margin itemAlignment='center'>
          <Progress
            fill
            showPercent
            color='neutral'
            message='Rendu en cours...'
            progress={cardsRendered}
            total={cardsToRender}
          />
        </HorizontalStack>
      ),

      !cardsToRender && (
        <HorizontalStack key='buttons' padding gutter itemAlignment='center'>
          {selectAllMode && (
            <Button icon='toolkit-check-mark' color='positive' label='Tout' onTap={() => this.selectAll()} />
          )}
          {!selectAllMode && (
            <Button icon='toolkit-check-mark' color='negative' label='Tout' onTap={() => this.unselectAll()} />
          )}
          <Button
            fill
            disabled={!selectedCardsNum}
            color='neutral'
            label='Rendu'
            onTap={() => app.$errorManager.handlePromise(this.renderSelectedCards())}
          />
          <Button
            fill
            color='primary'
            label='Importer'
            onTap={() => app.$errorManager.handlePromise(app.$card.showImportDialog())}
          />
        </HorizontalStack>
      ),
    ];
  }
}
