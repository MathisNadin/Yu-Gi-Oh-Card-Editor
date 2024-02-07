import { Component } from 'react';

interface Error404State { }

interface Error404Props { }

export class Error404 extends Component<Error404Props, Error404State> {

  public render() {
    return <div>not found {location.pathname}</div>;
  }

}
