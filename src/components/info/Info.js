import React from 'react';
import './Info.scss';
import IrmaConfig from 'irma/src/Config'; 
import BioVM from './../../BioVM'; 
import Store from './../../Store';
import Mutations from 'irma/src/irma/Mutations';
import Constants from './../../Constants';

const PAD_WIDTH = 4;
const PAD_SYM   = '\u0000';

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
                <div className="header">Memory:</div>
                {this._renderMem(org)}
                <div className="cols">
                    <div className="regs">
                        <div className="header">Code:</div>
                        <div>{'ax'.padEnd(PAD_WIDTH, PAD_SYM)} : {org.ax}</div>
                        <div>{'bx'.padEnd(PAD_WIDTH, PAD_SYM)} : {org.bx}</div>
                        <div>{'re'.padEnd(PAD_WIDTH, PAD_SYM)} : {org.re}</div>
                        <div>{'mol'.padEnd(PAD_WIDTH, PAD_SYM)} : {org.mol}</div>
                        <div>{'read'.padEnd(PAD_WIDTH, PAD_SYM)} : {org.molRead}</div>
                        <div>{'write'.padEnd(PAD_WIDTH, PAD_SYM)}: {org.molWrite}</div>
                        {org.code[org.line] === IrmaConfig.CODE_CMDS.LOOP ? (<div>lp : {org.loops[org.line] || org.ax}</div>) : ''}
                    </div>
                    <div className="org">
                        <div className="header">Organism:</div>
                        <div>idx : {org.index}</div>
                        <div>mIdx: {org.molIndex}</div>
                        <div>offs: {org.offset}</div>
                        <div>rgb : {org.color.toString(16)}</div>
                        <div>nrg : {org.energy}</div>
                        <div>mol : {org.mol}</div>
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
                            <div className={o.memPos === i ? 'val active' : 'val'}>{m.toString().padEnd(PAD_WIDTH, Constants.NUM_PAD)} </div>
                        </div>
                    })
                }
            </div>
        );
    }
}

export default Info;