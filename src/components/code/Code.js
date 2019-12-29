import React from 'react';
import ReactDOM from 'react-dom';
import './Code.scss';
import Store from './../../Store';
import {Actions} from './../../Actions';
import Bytes2Code from 'irma/src/irma/Bytes2Code';
import IrmaConfig from 'irma/src/Config';
import BioVM from './../../BioVM';

class Code extends React.Component {
    constructor() {
        super();
        const code = Store.getState().code;
        // TODO: refactor this to use separate reducers
        this.state     = {code: !code ? Bytes2Code.toCode(IrmaConfig.LUCAS[0].code, false, false, false, false) : code, line: 0};
        this._oldCode  = this.state.code;
        this._map      = this._cmdMap();
        this._linesMap = {};
        this._changed  = false;
        // TODO: refactor this to use separate reducers
        this._line     = 0;
        Store.dispatch(Actions.code(this.state.code));
    }

    componentDidMount() {
        this.unsubscribe = Store.subscribe(() => {
            const state = Store.getState();
            //
            // If LUCA code has changed, then we have to update Code component
            // otherwise, it should store it's own code
            //
            if (this._oldCode !== state.code) {
                Store.dispatch(Actions.code(this._oldCode = state.code));
            }
            this.setState({code: state.code, line: state.line});
        });
    }

    componentWillUnmount() {this.unsubscribe()}

    componentDidUpdate() {
        if (this.state.line === this._line) {return}

        const rootEl = ReactDOM.findDOMNode(this);
        const lineEl = rootEl.querySelector('.line');
        const rowsEl = lineEl.parentNode;
        const pos    = lineEl.offsetTop - rowsEl.scrollTop;
        if (pos >= (rowsEl.clientHeight - 20) || pos <= 0) {
            rootEl.querySelector('textarea').scrollTop = (lineEl.parentNode.scrollTop += (pos - 30));
        }
        this._line = this.state.line;
    }

    render () {
        const validCls = this._isValid(this.state.code) ? '' : 'error';
        const onChange = this._onChange.bind(this);
        const errMsg   = validCls ? 'Invalid code' : '';
        const value    = this.state.code;
        const onScroll = this._onScroll.bind(this);
        const lines    = this._lines(value);
        const map      = this._linesMap;
        const curLine  = this.state.line;

        return (
            <div className="code">
                <div className="rows">{lines.map((line,i) => <div key={i} className={map[i] === curLine ? 'line' : ''}>{line}</div>)}</div>
                <textarea title={errMsg} className={validCls} value={value} onChange={onChange} onScroll={onScroll}></textarea>
            </div>
        );
    }

    _isValid() {
        if (this.state.code === '') {return true}
        const code = this.state.code.split('\n');
        const map  = this._map;

        for (let i = 0, len = code.length; i < len; i++) {
            const line = code[i].split('#')[0].trim();
            if (map[line] === undefined && line[0] !== '#' && line !== '' && !this._isNumeric(line)) {return false}
        }

        return true;
    }

    _isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    _onChange(e) {
        Store.dispatch(Actions.code(e.target.value));
        this._changed = true;
        BioVM.reset();
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
            if (ln[0] !== '#' && ln !== '') {
                this._linesMap[++line] = i;
                lines[i] = line;
            } else {
                lines[i] = '\u0000';
            }
        }

        return lines;
    }
}

export default Code;