import React from 'react';
import './Code.scss';
import Store from './../../Store';
import {Actions} from './../../Actions';
import Bytes2Code from 'irma/src/irma/Bytes2Code';
import IrmaConfig from 'irma/src/Config';

class Code extends React.Component {
  constructor() {
    super();
    this._oldCode  = IrmaConfig.LUCAS[0].code;
    this.state     = {code: Bytes2Code.toCode(this._oldCode, false, false, false, false), line: 0};
    this._map      = this._cmdMap();
    this._linesMap = {};
    this._changed  = false;
  }

  componentDidMount() {
    this.unsubscribe = Store.subscribe(() => {
      const state = Store.getState();
      //
      // If LUCA code has changed, then we have to update Code component
      // otherwise, it should store it's own code
      //
      if (!this._equal(this._oldCode, IrmaConfig.LUCAS[0].code)) {
        this._oldCode = state.config.LUCAS[0].code.slice();
        Store.dispatch(Actions.code(Bytes2Code.toCode(this._oldCode, false, false, false, false)));
      }
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

  _equal(code0, code1) {
    if (code0.length !== code1.length) {return false}
    for (let i = 0, len = code0.length; i < len; i++) {
      if (code0[i] !== code1[i]) {
        return false;
      }
    }

    return true;
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
    this._changed = true;
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