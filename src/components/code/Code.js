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
import Helper from 'irma/src/common/Helper';
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
        const code        = !Store.getState().code ? IrmaConfig.LUCAS[0].code : Store.getState().code;
        const bCode       = Bytes2Code.toByteCode(code);
        this.state        = {code, bCode, line: 0};

        this._linesMap    = null;    // {bCodeLineIdx: sCodeLineIdx}
        this._lines       = null;
        this._rendered    = false;
        this._breakpoints = {};
        this._run         = false;
        this._visualize   = false;
        this._editor      = null;
        this._line        = 0;

        [this._lines, this._linesMap] = this._getLines(code);
        Store.dispatch(Actions.code(code, bCode));
        monaco.init().then(Monaco.init);
    }

    componentDidMount() {
        this._updateOrgCode();

        this._onUpdateMetadataCb = this._onUpdateMetadata.bind(this);
        Helper.override(BioVM.getVM().orgs.get(0), 'updateMetadata', this._onUpdateMetadataCb);
        this._unsubscribeCode    = Store.subscribeTo(Constants.CODE,     () => this.setState({code: Store.getState().code}));
        this._unsubscribeLine    = Store.subscribeTo(Constants.LINE,     () => this.setState({line: Store.getState().line}));
        this._unsubscribeRun     = Store.subscribeTo(Constants.RUN,      this._onRunUpdate.bind(this));
        this._unsubscribeViz     = Store.subscribeTo(Constants.VIS,      () => this._visualize = Store.getState().visualize);
        this._unsubscribeCompile = Store.subscribeTo(Constants.COMPILE,  this._onCompileUpdate.bind(this));
    }

    componentWillUnmount() {
        this._unsubscribeCompile();
        this._unsubscribeViz();
        this._unsubscribeRun();
        this._unsubscribeLine();
        this._unsubscribeCode();
        Helper.unOverride(BioVM.getVM().orgs.get(0), 'updateMetadata', this._onUpdateMetadataCb);
    }

    componentDidUpdate() {
        this.state.line !== this._line && this._updateLine();
        this._updateValidation();
    }

    render () {
        const value    = this.state.code;
        const lines    = this._lines;
        const map      = this._linesMap;
        const curLine  = map[this.state.line];
        const org      = this._rendered ? BioVM.getVM().orgs.get(0) : {};
        const mol      = (lines[map[org.mol      || 0]] || [0,0])[1];
        const molWrite = (lines[map[org.molWrite || 0]] || [0,0])[1];
        this._rendered = true;

        return (
            <div className="code">
                <div className="rows"> {
                    lines.map((line,i) => <div key={i} className="row" onClick={this._onBreakpoint.bind(this)}>
                        <div className={this._onLine(i, line, curLine)}>{line[0]}</div>
                        <div className={line[1] === molWrite ? CLS_WRITE  : (line[1] === mol ? CLS_MOL : '')} title={line[1] === molWrite ? 'write head' : (line[1] === mol ? 'molecule head' : '')}>{line[1]}</div>
                    </div>)
                }
                </div>
                <ControlledEditor
                    width="700px"
                    height="662px"
                    language="line"
                    theme="lineTheme"
                    value={value}
                    options={Monaco.getOptions()}
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

    /**
     * This method only updates metadata: Organism.offs|funcs|stack.
     * @param {Number} index1 Start index in a code, where change was occure
     * @param {Number} index2 End index in a code where changed were occure
     * @param {Number} dir Direction. 1 - inserted code, -1 - removed code
     * @param {Number} fCount Previous amount of functions in a code
     * @override
     */
    _onUpdateMetadata(index1 = 0, index2 = 0, dir = 1, fCount = -1) {
        // TODO: we should update sCode in  Monaco editor
    }

    _updateLine() {
        const rootEl  = ReactDOM.findDOMNode(this);
        const lineEl  = rootEl.querySelector(`.${CLS_LINE}`);
        const rowsEl  = lineEl.parentNode;
        const pos     = lineEl.offsetTop - rowsEl.scrollTop;
        if ((pos >= (rowsEl.clientHeight - 20) || pos <= 0) && this._editor) {
            this._editor.setScrollPosition({scrollTop: lineEl.parentNode.scrollTop += (pos - 30)});
        }
        this._line    = this.state.line;
    }

    _updateValidation(code = this.state.code) {
        const rootEl     = ReactDOM.findDOMNode(this);
        const codeEl     = rootEl.querySelector('section');
        const valid      = this._isValid(code);
        const validCls   = valid ? '' : CLS_ERROR;
        codeEl.className = validCls;
        codeEl.title     = validCls ? 'Invalid code' : '';

        return valid;
    }

    _onRunUpdate() {
        if (Store.getState().run && !this._run) {
            this._run = true;
            this._onRun();
        }
    }

    _onCompileUpdate() {
        const org   = BioVM.getVM().orgs.get(0);
        const sCode = this._editor.getValue();
        const bCode = Bytes2Code.toByteCode(sCode);

        [this._lines, this._linesMap] = this._getLines(sCode);
        this._updateOrgCode(bCode);
        Store.dispatch(Actions.code(sCode, bCode));
        Store.dispatch(Actions.line(org.line));
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
     * @param {String} code Code to validate
     * @return {Boolean} Validation status
     */
    _isValid(sCode) {
        if (sCode === '') {return true}
        const code = sCode.split('\n');

        for (let i = 0, len = code.length; i < len; i++) {
            if (!Bytes2Code.valid(code[i])) {
                Store.dispatch(Actions.error(`Error in code: '${code[i]}', line: ${this._lines[i][0]}`));
                return false;
            }
        }

        Store.dispatch(Actions.error(''));
        return true;
    }

    _isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    _onChange(e, newCode) {
        Store.dispatch(Actions.changed(true));
        if (!this._updateValidation(newCode)) {return}

        const org     = BioVM.getVM().orgs.get(0);
        const oldCode = org.code.slice();
        const bCode   = Bytes2Code.toByteCode(newCode);
        if (Helpers.compare(oldCode, bCode)) {return}
    }

    _getLines(code) {
        const splitted = code.split('\n');
        const len      = splitted.length;
        const lines    = new Array(len + 1);
        const linesMap = {};
        let   line     = -1;
        let   mol      = 0;

        for (let i = 0; i < len; i++) {
            const ln = lines[i] = new Array(2);
            if (Bytes2Code.byte(splitted[i]) === null) {
                ln[0] = '\u0000';
                ln[1] = '\u0000';
            } else {
                linesMap[++line] = i;
                ln[0] = line;
                ln[1] = Bytes2Code.isMol(splitted[i]) ? mol++ : mol;
            }
        }
        lines[len] = [++line];
        linesMap[line] = len;

        return [lines, linesMap];
    }

    /**
     * Updates code of organism, which was changed by user or externally in an editor
     */
    _updateOrgCode(bCode = this.state.bCode) {
        const org = BioVM.getVM().orgs.get(0);
        org.code  = bCode.slice();
        org.compile();
        org.mol = 0;
    }
}

export default Code;