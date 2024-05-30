import { integer } from 'mn-tools';
import { Containable, IContainableProps, IContainableState } from '../containable';
import { HorizontalStack } from '../container';
import { Icon } from '../icon';
import { Select } from '../select';
import { Spacer } from '../spacer';
import { Typography } from '../typography';

interface IPagerProps extends IContainableProps {
  position?: number;
  total?: number;
  pageSize?: number;
  showFirstButton?: boolean;
  showLastButton?: boolean;
  onChange?: (position: number, pageSize: number) => void | Promise<void>;
}

interface IPagerState extends IContainableState {
  total: number;
  position: number;
  pageSize: number;
}

export class Pager extends Containable<IPagerProps, IPagerState> {
  public static get defaultProps(): Partial<IPagerProps> {
    return {
      ...super.defaultProps,
      pageSize: 10,
    };
  }

  public constructor(props: IPagerProps) {
    super(props);
    this.state = {
      ...this.state,
      total: props.total!,
      position: props.position!,
      pageSize: props.pageSize!,
    };
  }

  public componentDidUpdate(prevProps: IPagerProps) {
    if (prevProps !== this.props) {
      this.setState({
        total: this.props.total!,
        position: this.props.position!,
        pageSize: this.props.pageSize!,
      });
    }
  }

  private changePageSize(value: number) {
    this.setState({ pageSize: value });
    if (this.props.onChange) {
      app.$errorManager.handlePromise(this.props.onChange(this.state.position, this.state.pageSize));
    }
  }

  private changePosition(value: number) {
    this.setState({ position: value });
    if (this.props.onChange) {
      app.$errorManager.handlePromise(this.props.onChange(this.state.position, this.state.pageSize));
    }
  }

  public render() {
    if (this.nbPages() < 2) return null!;
    return (
      <HorizontalStack className='mn-pager' gutter>
        <Spacer />

        <Select
          items={[
            { id: 5, label: '5' },
            { id: 10, label: '10' },
            { id: 25, label: '25' },
            { id: 50, label: '50' },
            { id: 100, label: '100' },
          ]}
          defaultValue={this.state.pageSize}
          onChange={(value) => this.changePageSize(integer(value))}
        />

        <Typography content={`Page ${this.state.position + 1} sur ${this.nbPages()}`} />

        <HorizontalStack>
          {this.props.showFirstButton && (
            <Icon
              disabled={this.state.position === 0}
              iconId='toolkit-double-angle-left'
              onTap={() => this.changePosition(0)}
            />
          )}

          <Icon
            disabled={this.isFirstPage()}
            iconId='toolkit-angle-left'
            onTap={() => this.changePosition(this.state.position - 1)}
          />

          <Icon
            disabled={this.isLastPage()}
            iconId='toolkit-angle-right'
            onTap={() => this.changePosition(this.state.position + 1)}
          />

          {this.props.showLastButton && (
            <Icon
              disabled={this.isLastPage()}
              iconId='toolkit-double-angle-right'
              onTap={() => this.changePosition(Math.round(this.state.total / this.state.pageSize))}
            />
          )}
        </HorizontalStack>
      </HorizontalStack>
    );
  }

  private getLastRow(): number {
    let i = (this.state.position + 1) * this.state.pageSize - 1;
    if (i > this.state.total) i = this.state.total - 1;
    return i;
  }

  private getFirstRow(): number {
    return this.state.position * this.state.pageSize;
  }

  private isLastPage(): boolean {
    return this.getLastRow() >= this.state.total - 1;
  }

  private nbPages(): number {
    return Math.ceil(this.state.total / this.state.pageSize);
  }

  private isFirstPage(): boolean {
    return this.getFirstRow() === 0;
  }
}
