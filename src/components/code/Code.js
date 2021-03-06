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
import Store from './../../Store';
import {Actions} from './../../Actions';
import Compiler from 'irma/src/irma/Compiler';
import IrmaConfig from 'irma/src/Config';
import Helper from 'irma/src/common/Helper';
import BioVM from './../../BioVM';

const CLS_BP    = 'bp';
const CLS_ROW   = 'ln';
const CLS_LINE  = 'line';
const CLS_ERROR = 'error';

class Code extends React.Component {
    constructor() {
        super();
        const code        = !Store.getState().code ? IrmaConfig.LUCAS[0].code : Store.getState().code;
        const bCode       = Compiler.toByteCode(code);
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

        const vm                       = BioVM.getVM();
        this._onUpdateMetadataCb       = this._onUpdateMetadata.bind(this);
        this._onUpdateMetadataOnMoveCb = this._onUpdateMetadataOnMove.bind(this);
        this._onUpdateAtomCb           = this._onUpdateAtom.bind(this);
        Helper.override(Compiler, 'updateMetadata', this._onUpdateMetadataCb);
        Helper.override(Compiler, 'updateMetadataOnMove', this._onUpdateMetadataOnMoveCb);
        Helper.override(vm, 'updateAtom', this._onUpdateAtomCb);

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

        const vm  = BioVM.getVM();
        const org = vm.orgs.get(0);
        Helper.unOverride(vm, 'updateAtom', this._onUpdateAtomCb);
        Helper.unOverride(org, 'updateMetadata', this._onUpdateMetadataCb);
        Helper.unOverride(org, 'updateMetadataOnMove', this._onUpdateMetadataOnMoveCb);
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
        const org      = this._rendered ? BioVM.getVM().orgs.get(0) : {heads: []};
        const heads    = [(lines[map[org.heads[0] || 0]] || [0,0])[1], (lines[map[org.heads[1] || 0]] || [0,0])[1], (lines[map[org.heads[2] || 0]] || [0,0])[1], (lines[map[org.heads[3] || 0]] || [0,0])[1]]
        this._rendered = true;

        return (
            <div className="code">
                <div className="rows"> {
                    lines.map((line,i) => <div key={i} className="row" onClick={this._onBreakpoint.bind(this)}>
                        <div className={this._onLine(i, line, curLine)}>{line[0]}</div>
                        <div
                            className={this._getHeadClass(line[1], heads)}
                            title={this._getHeadClass(line[1], heads)}>{line[1]}
                        </div>
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

    _getHeadClass(line, heads) {
        for (let i = 0, l = heads.length; i < l; i++) {
            if (line === heads[i]) {return 'head' + i}
        }
        return '';
    }

    /**
     * Is called if code need to be recompilated
     * @param {Organism} org Current organism
     * @param {Number} index1 Start index in a code, where change was occure
     * @param {Number} index2 End index in a code where changed were occure
     * @param {Number} dir Direction. 1 - inserted code, -1 - removed code
     * @override
     */
    _onUpdateMetadata(org, index1, index2, dir) {
        if (org !== BioVM.getVM().orgs.get(0)) {return}
        const lines = this._updateStrCode(index1, index2, dir, Store.getState().code.split('\n'));
        const sCode = lines.join('\n');
        [this._lines, this._linesMap] = this._getLines(sCode);
        Store.dispatch(Actions.code(sCode, BioVM.getVM().orgs.get(0).code));
    }

    /**
     * This method only updates metadata: Organism.offs|funcs|stack and should
     * be called after Uint8Array.move() function calls.
     * @param {Organism} org Organism we need to compile
     * @param {Number} start Start index in a code, where change was occure
     * @param {Number} end End index in a code where changed were occure
     * @param {Number} target Destination index of insertion
     */
    _onUpdateMetadataOnMove(org, start, end, target) {
        if (org !== BioVM.getVM().orgs.get(0)) {return}
        let sCode;
        if (target > end) {
            const len = end - start;
            let lines = this._updateStrCode(start, end, -1, Store.getState().code.split('\n'));
            sCode = this._updateStrCode(target - len, end - len, 1, lines).join('\n');
        } else {
            let lines = this._updateStrCode(start, end, -1, Store.getState().code.split('\n'));
            sCode = this._updateStrCode(target, target + end - start, 1, lines).join('\n');
        }

        [this._lines, this._linesMap] = this._getLines(sCode);
        Store.dispatch(Actions.code(sCode, BioVM.getVM().orgs.get(0).code));        
    }

    /**
     * Is called if atom separator was changed. Atom separator is a last atom
     * in a molecule
     * @param {Number} index Index of atom, which was changed
     * @param {Boolean} isLast true if current atom is the last atom in molecule
     * @override
     */
    _onUpdateAtom(index, isLast) {
        const lines   = Store.getState().code.split('\n');
        const line    = this._linesMap[index];
        const comment = IrmaConfig.CODE_COMMENT_STR;
        const mol     = IrmaConfig.CODE_MOL_STR;

        if (isLast) {
            if (lines[line].indexOf(mol) !== -1) {return}
            const parts    = lines[line].split(comment);
            parts.splice(1, 0, mol);
            if (parts.length > 2) {parts[2] = `${comment} ${parts[2]}`}
            lines[line]    = parts.join(' ');
        } else {
            lines[line]    = lines[line].split(mol).join(' ');
        }
        Store.dispatch(Actions.code(lines.join('\n'), BioVM.getVM().orgs.get(0).code));
        [this._lines, this._linesMap] = this._getLines(this._editor.getValue());
    }

    /**
     * Updates string version of code according to changes (insertion or remove)
     * @param {Number} index1 Start index in a code, where change was occure
     * @param {Number} index2 End index in a code where changed were occure
     * @param {Number} dir Direction. 1 - inserted code, -1 - removed code
     * @param {Array} lines Array of string of code lines
     * @return {Array} lines updated array of strings
     */
    _updateStrCode(index1, index2, dir, lines) {
        if (index2 === 0) {return}
        const bCode = BioVM.getVM().orgs.get(0).code;
        const map   = this._linesMap;
        //
        // Lines were inserted or removed
        //
        if (dir > 0) {
            lines.splice(map[index1] || lines.length, 0, ...Compiler.toCode(bCode.subarray(index1, index2), false, false, false, false).split('\n'));
        } else {
            // we must go backwards to do correct lines remove
            for (let i = index2 - index1 - 1; i >= 0; i--) {lines.splice(map[index1 + i], 1)}
        }

        return lines;
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
        const valid      = this._checkValid(code);
        codeEl.className = valid ? '' : CLS_ERROR;

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
        const bCode = Compiler.toByteCode(sCode);

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
            Store.dispatch(Actions.line(org.line));
        }
        if (this._breakpoints[org.line] || !Store.getState().run) {
            vm.world.canvas.update();
            Store.dispatch(Actions.iter(vm.iteration));
            Store.dispatch(Actions.line(org.line));
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
    _checkValid(sCode) {
        if (sCode === '') {return true}
        const code = sCode.split('\n');

        for (let i = 0, len = code.length; i < len; i++) {
            if (!Compiler.valid(code[i])) {
                Store.dispatch(Actions.error(`Error in code: '${code[i]}', line: ${this._lines[i][0]}`));
                return false;
            }
        }

        Store.dispatch(Actions.error(''));
        return true;
    }

    _onChange(e, newCode) {
        if (Store.getState().code === newCode) {return}
        Store.dispatch(Actions.changed(true));
        this._updateValidation(newCode);
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
            if (Compiler.byte(splitted[i]) === null) {
                ln[0] = '\u0000';
                ln[1] = '\u0000';
            } else {
                linesMap[++line] = i;
                ln[0] = line;
                ln[1] = Compiler.isMol(splitted[i]) ? mol++ : mol;
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
        const org    = BioVM.getVM().orgs.get(0);
        org.code     = bCode.slice();
        Compiler.compile(org);
        org.mol      = 0;
        org.molWrite = 0;
    }
}

export default Code;