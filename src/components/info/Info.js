import React from 'react';
import './Info.scss';
import IrmaConfig from 'irma/src/Config'; 
import BioVM from './../../BioVM'; 
import Store from './../../Store';
import Mutations from 'irma/src/irma/Mutations';
import Constants from './../../Constants';

const PAD_WIDTH = 4;
const PAD_SYM   = '\u0000';
const UNDIRS    = IrmaConfig.UNDIRS;

class Info extends React.Component {
    constructor() {
        super();
        // TODO: refactor this to use separate reducers
        this._line     = 0;
        this._debug    = false;
        this._prevVals = {};
        this.state     = {line: 0};
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

    componentDidUpdate() {
        if (!this._debug) {return}
        const org = BioVM.getVM().orgs.get(0);
        this._prevVals = Object.assign({}, {
            ax  : org.ax,
            bx  : org.bx,
            re  : org.re,
            head: org.head,
            h0  : org.heads[0],
            h1  : org.heads[1],
            h2  : org.heads[2],
            h3  : org.heads[3]
        });
    }

    render () {
        if (!this._debug) {return (<div className="info">Press "Step" to start debug</div>)}

        const org = BioVM.getVM().orgs.get(0);
        return (
            <div className="info">
                <div className="header">Memory:</div>
                {this._renderMem(org)}
                <div className="cols">
                    <div className="code">
                        <div className="header">Code:</div>
                        <div className={this._mark('ax', org)}>{'ax'.padEnd(PAD_WIDTH, PAD_SYM)} : {org.ax}</div>
                        <div className={this._mark('bx', org)}>{'bx'.padEnd(PAD_WIDTH, PAD_SYM)} : {org.bx}</div>
                        <div className={this._mark('re', org)}>{'re'.padEnd(PAD_WIDTH, PAD_SYM)} : {org.re}</div>
                        <div className={this._mark('head', org)}>{'head'.padEnd(PAD_WIDTH, PAD_SYM)} : {org.head}</div>
                        <div className={this._mark('h0', org)}>{'h0'.padEnd(PAD_WIDTH, PAD_SYM)} : {org.heads[0]}</div>
                        <div className={this._mark('h1', org)}>{'h1'.padEnd(PAD_WIDTH, PAD_SYM)} : {org.heads[1]}</div>
                        <div className={this._mark('h2', org)}>{'h2'.padEnd(PAD_WIDTH, PAD_SYM)} : {org.heads[2]}</div>
                        <div className={this._mark('h3', org)}>{'h3'.padEnd(PAD_WIDTH, PAD_SYM)} : {org.heads[3]}</div>
                        {org.code[org.line] === IrmaConfig.CODE_CMDS.LOOP ? (<div className="loop">loop : {org.loops[org.line] || org.ax}</div>) : ''}
                    </div>
                    <div className="org">
                        <div className="header">Organism:</div>
                        <div>dir : {UNDIRS[org.dir]}</div>
                        <div>idx : {org.index}</div>
                        <div>mIdx: {org.molIndex}</div>
                        <div>offs: {org.offset}</div>
                        <div>rgb : {org.color.toString(16)}</div>
                        <div>nrg : {org.energy.toFixed(2)}</div>
                    </div>
                    <div className="probs">
                        <div className="header">Probabilities:</div>
                        {Array.from(org.probs).map((p, i) => <span key={i}>{Mutations.NAMES[i].padEnd(PAD_WIDTH)}: {p} </span>)}
                    </div>
                    <div className="mut">
                        <div className="header">Mutation:</div>
                        <div className="period">every: {org.period}</div>
                        <div className="percent">{'%'.padEnd(PAD_WIDTH, Constants.NUM_PAD)} : {org.percent}</div>
                        <div>{'age'.padEnd(PAD_WIDTH, Constants.NUM_PAD)} : {org.age}</div>
                    </div>
                </div>
            </div>
        );
    }

    _mark(name, org) {
        return this._prevVals[name] !== org[name] ? 'marked' : '';
    }

    _renderMem(o) {
        const mem  = Array.from(o.mem);
        const w    = PAD_WIDTH;
        const p    = Constants.NUM_PAD;
        return (
            <div className="mem">
                {
                    mem.map((m, i) => {
                        return <div key={i} className="cell">
                            <div className="header">{i.toString().padEnd(w, p)}</div>
                            <div className={o.mPos === i ? 'val active' : 'val'}>{m.toString().padEnd(PAD_WIDTH, Constants.NUM_PAD)} </div>
                        </div>
                    })
                }
            </div>
        );
    }
}

export default Info;