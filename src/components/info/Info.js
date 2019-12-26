import React from 'react';
import './Info.scss';
import BioVM from './../../BioVM'; 
import Store from './../../Store';
import Mutations from 'irma/src/irma/Mutations';

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
    if (!this._debug) {return (<div className="info">Press "Step" to start debug</div>)}

    const org = BioVM.getVM().orgs.get(0);
    return (
      <div className="info">
        <div className="regs">ax: {org.ax} bx: {org.bx} ret: {org.ret}</div>
        <div className="mem">{Array.from(org.mem).map((m, i) => <span key={i} className={org.memPos === i ? 'active' : ''}>{m} </span>)}</div>
        <div className="age">age: {org.age}</div>
        <div className="probs">{Array.from(org.probs).map((p, i) => <span key={i}>{Mutations.NAMES[i]}: {p} </span>)}</div>
        <div className="period">period: {org.period}</div>
        <div className="percent">percent: {org.percent}</div>
      </div>
    );
  }
}

export default Info;