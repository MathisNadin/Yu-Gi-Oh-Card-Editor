import { JSX } from 'react';
import { classNames } from 'mn-tools';
import { TJSXElementChild } from '../../system';
import { Container, IContainerProps, IContainerState } from '../container';
import { Checkbox } from './Checkbox';

export interface ICheckboxTreeItem<ID = number> {
  id: ID;
  label: string;
  disabled?: boolean;
  children?: ICheckboxTreeItem<ID>[];
}

// To extend the corresponding Form Field props without parasitizing it with the base element's typing
export interface ICheckboxTreeSpecificProps<ID = number> {
  value: ID[];
  items: ICheckboxTreeItem<ID>[];
  onChange: (value: ID[]) => void | Promise<void>;
}

interface ICheckboxTreeProps<ID = number> extends ICheckboxTreeSpecificProps<ID>, IContainerProps<HTMLUListElement> {}

interface ICheckboxTreeState extends IContainerState {}

export class CheckboxTree<ID = number> extends Container<ICheckboxTreeProps<ID>, ICheckboxTreeState, HTMLUListElement> {
  public static get defaultProps(): Omit<ICheckboxTreeProps, 'items' | 'value' | 'onChange'> {
    return {
      ...super.defaultProps,
      gutter: true,
      layout: 'vertical',
    };
  }

  /**
   * Finds the path (list of items) leading to the item with the given `id`.
   * The first element of the returned array is the root where the item was found,
   * and the last element is the item itself.
   */
  private findPathById(
    items: ICheckboxTreeItem<ID>[],
    id: ID,
    path: ICheckboxTreeItem<ID>[] = []
  ): ICheckboxTreeItem<ID>[] | undefined {
    for (const item of items) {
      const newPath = [...path, item];
      if (item.id === id) return newPath;

      if (item.children) {
        const result = this.findPathById(item.children, id, newPath);
        if (result) return result;
      }
    }
    return undefined;
  }

  /**
   * Retrieves all descendant IDs (children, grandchildren, etc.) of a given item recursively.
   */
  private getAllDescendants(item: ICheckboxTreeItem<ID>) {
    const result: ID[] = [];
    if (item.children) {
      for (const child of item.children) {
        result.push(child.id);
        result.push(...this.getAllDescendants(child));
      }
    }
    return result;
  }

  /**
   * Handles the check/uncheck logic.
   * - Checking an item → checks all its descendants and checks its parents if necessary.
   * - Unchecking an item → unchecks all its descendants and unchecks the parents if no other child is checked.
   */
  private async onCheckItem(id: ID, checked: boolean) {
    const selected = new Set(this.props.value);

    // Finds the path from the root to the checked/unchecked item.
    const path = this.findPathById(this.props.items, id);
    if (!path) return; // ID not found in the tree

    const currentItem = path[path.length - 1];
    if (!currentItem) return;

    if (checked) {
      // 1) Check the item itself.
      selected.add(currentItem.id);

      // 2) Check all its descendants.
      const allDescendants = this.getAllDescendants(currentItem);
      for (const descendantId of allDescendants) {
        selected.add(descendantId);
      }

      // 3) Traverse up the parent chain to check them
      //    (without checking their other children).
      //    => The `path` array contains [rootParent, ..., directParent, currentItem].
      //    So we iterate from the second-to-last item up to the beginning.
      for (let i = path.length - 2; i >= 0; i--) {
        const ancestor = path[i]!;
        selected.add(ancestor.id);
      }
    } else {
      // 1) Uncheck the item itself.
      selected.delete(currentItem.id);

      // 2) Uncheck all its descendants.
      const allDescendants = this.getAllDescendants(currentItem);
      for (const descendantId of allDescendants) {
        selected.delete(descendantId);
      }

      // 3) Traverse up the parent chain to uncheck them if necessary,
      //    but only if they have no checked children left.
      for (let i = path.length - 2; i >= 0; i--) {
        const ancestor = path[i]!;
        const hasChildChecked = ancestor.children?.some((child) => selected.has(child.id));
        // If no child is checked, we can uncheck the parent...
        if (!hasChildChecked) {
          selected.delete(ancestor.id);
        } else {
          // ...otherwise, we stop here, as this parent remains checked.
          break;
        }
      }
    }

    // Updates the parent
    await this.props.onChange(Array.from(selected));
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-checkbox-tree'] = true;
    return classes;
  }

  public override render(): TJSXElementChild {
    return (
      <ul ref={this.base} {...this.renderAttributes()}>
        {this.inside}
      </ul>
    );
  }

  public override get children() {
    return this.renderItems(this.props.items);
  }

  private renderItems(items: ICheckboxTreeItem<ID>[], level: number = 0): JSX.Element[] {
    let paddingLeft = '';
    if (level) paddingLeft = app.$theme.getUnitString(app.$theme.settings.commons?.['default-spacing']) || '16px';

    const selected = new Set(this.props.value);
    return items.map((item) => {
      const hasChildren = !!item.children?.length;
      return (
        <li
          key={`${item.id}`}
          className={classNames('checkbox-tree-item', { 'has-children': hasChildren, 'mn-disabled': item.disabled })}
          style={{ paddingLeft }}
        >
          <Checkbox
            label={item.label}
            value={selected.has(item.id)}
            onChange={(checked) => this.onCheckItem(item.id, checked)}
          />

          {hasChildren && (
            <ul className='checkbox-tree-item-children'>{this.renderItems(item.children!, level + 1)}</ul>
          )}
        </li>
      );
    });
  }
}
