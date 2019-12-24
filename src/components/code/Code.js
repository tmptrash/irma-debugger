import React from 'react';
import './Code.scss';
import Store from './../../Store';
import {Actions} from './../../Actions';
import Bytes2Code from 'irma/src/irma/Bytes2Code';

class Code extends React.Component {
  constructor() {
    super();
    const state    = Store.getState();
    this.state     = {code: state.code, line: 0};
    this._map      = this._cmdMap();
    this._linesMap = {};
  }

  componentDidMount() {
    this.unsubscribe = Store.subscribe(() => {
      const state = Store.getState();
      this.setState({code: state.code, line: state.line});
    });
  }

  componentWillUnmount() {this.unsubscrube()}

  render () {
    const validCls = this._isValid(this.state.code) ? '' : 'error';
    const onChange = this._onChange.bind(this);
    const errMsg   = validCls ? 'Invalid code' : '';
    const value    = this.state.code;
    const onScroll = this._onScroll.bind(this);
    const lines    = this._lines(value);
    const curLine  = this.state.line;

    return (
      <div className="code">
        <div className="rows">{lines.map((line,i) => <div key={i} className={lines[i] === curLine ? 'line' : ''}>{line}</div>)}</div>
        <textarea title={errMsg} className={validCls} value={value} onChange={onChange} onScroll={onScroll}></textarea>
      </div>
    );
  }

  _isValid() {
    if (this.state.code === '') {return true}
    const code = this.state.code.split('\n');
    const map  = this._map;

    for (let i = 0, len = code.length; i < len; i++) {
      const line = code[i].trim();
      if (map[code[i]] === undefined && line[0] !== '#' && line !== '') {return false}
    }

    return true;
  }

  _onChange(e) {
    Store.dispatch(Actions.code(e.target.value));
  }

  _onScroll(e) {
    const target = e.nativeEvent.target;
    target.parentNode.firstChild.scrollTop = target.scrollTop;
  }

  _cmdMap() {
    const map       = Bytes2Code.MAP;
    const revertMap = {};
    const keys      = Object.keys(map);

    for (let i = 0, len = keys.length; i < len; i++) {
      revertMap[map[keys[i]][0]] = +keys[i];
    }

    return revertMap;
  }

  _lines(code) {
    const splitted = code.split('\n');
    const len      = splitted.length;
    const lines    = new Array(len);
    let   line     = -1;

    for (let i = 0; i < len; i++) {
      const ln = splitted[i].trim();
      lines[i] = ln[0] === '#' || ln === '' ? '\u0000' : ++line;
    }

    return lines;
  }
}

export default Code;