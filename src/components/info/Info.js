import React from 'react';
import './Info.scss';
import BioVM from './../../BioVM'; 
import Store from './../../Store';

class Info extends React.Component {
  constructor() {
    super();
    // TODO: refactor this to use separate reducers
    this._line  = 0;
    this._debug = false;
    this.state = {line: 0};
  }

  componentDidMount() {
    this._unsubscribe = Store.subscribe(() => {
      const state = Store.getState();
      if (this._line !== state.line) {
        this.setState({line: state.line});
        this._line  = state.line;
        this._debug = true;
      }
    });
  }

  componentWillUnmount() {this._unsubscribe()}

  render () {
    if (!this._debug) {
      return (<div className="info">Press "Step" to start debug</div>)
    }

    const org = BioVM.getVM().orgs.get(0);
    return (
      <div className="info">
        <div className="regs">registers:</div>
        <div>ax: {org.ax} bx: {org.bx}</div>
      </div>
    );
  }
}

export default Info;