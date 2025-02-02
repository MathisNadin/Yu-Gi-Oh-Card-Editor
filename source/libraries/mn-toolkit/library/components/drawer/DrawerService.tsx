import { Observable, uuid } from 'mn-tools';
import { TJSXElementChild } from '../../system';
import { Drawer, IDrawerProps } from './Drawer';
import { IDrawerListener, IDrawerShowOptions } from '.';

interface IDrawerData {
  id: string;
  element: TJSXElementChild;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ref: Drawer<any> | null;
}

export class DrawerService extends Observable<IDrawerListener> {
  public drawers: IDrawerData[];

  public constructor() {
    super();
    this.drawers = [];
    app.$device.addListener({
      deviceBackButton: () => app.$drawer.removeLast(),
    });
  }

  public left(options: IDrawerProps) {
    options.orientation = 'left';
    return this.show({
      Component: Drawer,
      componentProps: options,
    });
  }

  public right(options: IDrawerProps) {
    options.orientation = 'right';
    return this.show({
      Component: Drawer,
      componentProps: options,
    });
  }

  public top(options: IDrawerProps) {
    options.orientation = 'top';
    return this.show({
      Component: Drawer,
      componentProps: options,
    });
  }

  public bottom(options: IDrawerProps) {
    options.orientation = 'bottom';
    return this.show({
      Component: Drawer,
      componentProps: options,
    });
  }

  public show<P extends IDrawerProps>(options: IDrawerShowOptions<P>) {
    const { Component, componentProps } = options;
    const id = `${componentProps.orientation}-drawer-${this.drawers.length + 1}-${uuid()}`;
    const drawer: IDrawerData = { id, element: null, ref: null };
    drawer.element = (
      <Component
        {...componentProps}
        ref={(instance) => {
          if (!instance) return;
          if (componentProps.onRef) componentProps.onRef(instance);
          drawer.ref = instance;
        }}
        key={id}
        id={id}
      />
    );
    this.drawers.push(drawer);
    this.dispatch('drawersChanged');
    return id;
  }

  public remove(id: string) {
    this.drawers = this.drawers.filter((p) => p.id !== id);
    this.dispatch('drawersChanged');
  }

  public removeLast() {
    this.drawers.pop();
    this.dispatch('drawersChanged');
  }

  public removeAll() {
    this.drawers = [];
    this.dispatch('drawersChanged');
  }

  public async close(id: string) {
    if (!this.drawers.length) return;
    const drawer = this.drawers.find((p) => p.id === id);
    if (!drawer) return;

    if (drawer?.ref && typeof drawer.ref.close === 'function') {
      await drawer.ref.close();
    } else {
      this.remove(id);
    }
  }

  public async closeLast() {
    if (!this.drawers.length) return;
    const lastDrawer = this.drawers[this.drawers.length - 1];
    if (lastDrawer?.ref && typeof lastDrawer.ref.close === 'function') {
      await lastDrawer.ref.close();
    } else {
      this.removeLast();
    }
  }
}
