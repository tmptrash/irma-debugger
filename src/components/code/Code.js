/**
 * Module, which is responsible for code editor based on very powerful Monaco editor 
 * component.
 * 
 * @author flatline
 */
import React from 'react';
import ReactDOM from 'react-dom';
import './Code.scss';
import {ControlledEditor} from '@monaco-editor/react';
import { monaco } from '@monaco-editor/react';
import Monaco from './Monaco';
import Constants from './../../Constants';
import Helpers from './../../common/Helpers';
import Store from './../../Store';
import {Actions} from './../../Actions';
import Bytes2Code from 'irma/src/irma/Bytes2Code';
import IrmaConfig from 'irma/src/Config';
import BioVM from './../../BioVM';

const CLS_BP    = 'bp';
const CLS_ROW   = 'ln';
const CLS_LINE  = 'line';
const CLS_MOL   = 'mol';
const CLS_WRITE = 'write';
const CLS_ERROR = 'error';

class Code extends React.Component {
    constructor() {
        super();
        const code        = Store.getState().code;
        const sCode       = !code ? IrmaConfig.LUCAS[0].code : code;
        const bCode       = Bytes2Code.toByteCode(sCode);
        // TODO: refactor this to use separate reducer
        this.state        = {code: sCode, bCode, line: 0};
        this._linesMap    = {};
        this._rendered    = false;
        this._breakpoints = {};
        this._run         = false;
        this._visualize   = false;
        this._editor      = null;
        // TODO: refactor this to use separate reducer
        this._line        = 0;
        Store.dispatch(Actions.code(sCode, bCode));
        // 
        // Configuration of line language for Monaco editor
        //
        monaco.init().then(Monaco.init);
    }

    componentDidMount() {
        this._updateByteCode();
        this._unsubscribe = Store.subscribe(() => {
            const state = Store.getState();
            switch (state.type) {
                case Constants.CODE: this.setState({code: Store.getState().code}); break;
                case Constants.LINE: this.setState({line: Store.getState().line}); break;
                case Constants.RUN : this._onRunUpdate(); break;
                default: break;
            }           
            this._visualize = state.visualize;
        });
    }

    componentWillUnmount() {this._unsubscribe()}

    componentDidUpdate() {
        if (this.state.line === this._line) {return}

        const rootEl  = ReactDOM.findDOMNode(this);
        const lineEl  = rootEl.querySelector(`.${CLS_LINE}`);
        const rowsEl  = lineEl.parentNode;
        const pos     = lineEl.offsetTop - rowsEl.scrollTop;
        if ((pos >= (rowsEl.clientHeight - 20) || pos <= 0) && this._editor) {
            this._editor.setScrollPosition({scrollTop: lineEl.parentNode.scrollTop += (pos - 30)});
        }
        this._line    = this.state.line;
    }

    render () {
        const validCls = this._isValid(this.state.code) ? '' : CLS_ERROR;
        const errMsg   = validCls ? 'Invalid code' : '';
        const value    = this.state.code;
        const lines    = this._lines(value);
        const map      = this._linesMap;
        const curLine  = map[this.state.line];
        const org      = this._rendered ? BioVM.getVM().orgs.get(0) : {};
        const mol      = (lines[map[org.mol      || 0]] || [0,0])[1];
        const molWrite = (lines[map[org.molWrite || 0]] || [0,0])[1];
        const options  = {
            selectOnLineNumbers: true,
            lineNumbers: 'off',
            scrollBeyondLastLine: false
          };

        this._rendered = true;

        return (
            <div className="code">
                <div className="rows">
                    {lines.map((line,i) => <div key={i} className="row" onClick={this._onBreakpoint.bind(this)}>
                        <div className={this._onLine(i, line, curLine)}>{line[0]}</div>
                        <div className={line[1] === molWrite ? CLS_WRITE  : (line[1] === mol ? CLS_MOL : '')} title={line[1] === molWrite ? 'write head' : (line[1] === mol ? 'molecule head' : '')}>{line[1]}</div>
                    </div>)}
                </div>
                <ControlledEditor
                    width="700px"
                    height="662px"
                    language="line"
                    theme="lineTheme"
                    value={value}
                    options={options}
                    onChange={this._onChange.bind(this)}
                    editorDidMount={this.editorDidMount.bind(this)}
                />
            </div>
        );
    }

    editorDidMount(_, editor) {
        this._editor = editor;
        editor.onDidScrollChange((e, n) => {
            ReactDOM.findDOMNode(this).querySelector('.rows').scrollTop = e.scrollTop;
        });
    }

    _onRunUpdate() {
        if (Store.getState().run && !this._run) {
            this._run = true;
            this._onRun();
        }
    }

    _onLine(i, line, curLine) {
        let cls = '';
        cls = (i === curLine ? CLS_LINE + ' ' + CLS_ROW : CLS_ROW);
        if (this._breakpoints[line[0]]) {
            cls += (' ' + CLS_BP);
        }
        return cls;
    }

    _onRun() {
        const vm  = BioVM.getVM();
        const org = vm.orgs.get(0);
        vm.run();
        Store.dispatch(Actions.iter(vm.iteration));
        if (this._visualize) {
            vm.world.canvas.update();
            const code = Bytes2Code.toCode(org.code, false, false, false, false);
            Store.dispatch(Actions.line(org.line));
            Store.dispatch(Actions.code(code, org.code));
        }
        if (this._breakpoints[org.line] || !Store.getState().run) {
            vm.world.canvas.update();
            const code = Bytes2Code.toCode(org.code, false, false, false, false);
            Store.dispatch(Actions.iter(vm.iteration));
            Store.dispatch(Actions.line(org.line));
            Store.dispatch(Actions.code(code, org.code));
            Store.dispatch(Actions.run(false));
            this._run = false;
            return;
        }
        setTimeout(this._onRun.bind(this), 0);
    }

    _onBreakpoint(event) {
        if (event.target.className.indexOf(CLS_ROW) !== -1) {
            const line = +event.target.innerText;
            if (this._breakpoints[line] === undefined) {
                this._breakpoints[line] = true;
                event.target.className += (' ' + CLS_BP);
            } else {
                delete this._breakpoints[line];
                event.target.className = CLS_ROW;
            }
        }
    }

    /**
     * Makes string code validation
     * @return {Boolean} Validation status
     */
    _isValid() {
        if (this.state.code === '') {return true}
        const code = this.state.code.split('\n');

        for (let i = 0, len = code.length; i < len; i++) {
            if (!Bytes2Code.valid(code[i])) {return false}
        }

        return true;
    }

    _isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    _onChange(newValue, e) {
        const oldCode = BioVM.getVM().orgs.get(0).code.slice();
        const bCode   = Bytes2Code.toByteCode(newValue);
        !Helpers.compare(oldCode, bCode) && Store.dispatch(Actions.code(Bytes2Code.toCode(bCode, false, false, false, false), bCode));
        BioVM.reset();
    }

    _lines(code) {
        const splitted = code.split('\n');
        const len      = splitted.length;
        const lines    = new Array(len + 1);
        let   line     = -1;
        let   mol      = 0;

        for (let i = 0; i < len; i++) {
            const ln = lines[i] = new Array(2);
            if (Bytes2Code.byte(splitted[i]) === null) {
                ln[0] = '\u0000';
                ln[1] = '\u0000';
            } else {
                this._linesMap[++line] = i;
                ln[0] = line;
                ln[1] = Bytes2Code.isMol(splitted[i]) ? mol++ : mol;
            }
        }
        lines[len] = [++line];
        this._linesMap[line] = len;

        return lines;
    }

    _updateByteCode() {
        const org = BioVM.getVM().orgs.get(0);
        org.code  = Store.getState().bCode.slice();
        org.compile();
    }
}

export default Code;