import React from 'react';
import './Info.scss';
import BioVM from './../../BioVM'; 
import Store from './../../Store';
import Mutations from 'irma/src/irma/Mutations';
import Constants from './../../Constants';

const MEM_NUM_WIDTH  = 4;
const MEM_NUM_WIDTH2 = 7;

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
                        <div className="header">Registers:</div>
                        <div>ax : {org.ax}</div>
                        <div>bx : {org.bx}</div>
                        <div>re : {org.re}</div>
                    </div>
                    <div className="org">
                        <div className="header">Organism:</div>
                        <div>idx : {org.index}</div>
                        <div>mIdx: {org.molIndex}</div>
                        <div>offs: {org.offset}</div>
                        <div>col : {org.color.toString(16)}</div>
                        <div>nrg : {org.energy}</div>
                        <div>mol : {org.mol}</div>
                    </div>
                    <div className="probs">
                        <div className="header">Probabilities:</div>
                        {Array.from(org.probs).map((p, i) => <span key={i}>{Mutations.NAMES[i].padEnd(MEM_NUM_WIDTH)}: {p} </span>)}
                    </div>
                    <div className="mut">
                        <div className="header">Mutation:</div>
                        <div className="period">every: {org.period}</div>
                        <div className="percent">{'%'.padEnd(MEM_NUM_WIDTH, Constants.NUM_PAD)} : {org.percent}</div>
                        <div>{'age'.padEnd(MEM_NUM_WIDTH, Constants.NUM_PAD)} : {org.age}</div>
                    </div>
                </div>
            </div>
        );
    }

    _renderMem(o) {
        const mem  = Array.from(o.mem);
        const w    = MEM_NUM_WIDTH;
        const p    = Constants.NUM_PAD;
        return (
            <div className="mem">
                {
                    mem.map((m, i) => {
                        return <div key={i} className="cell">
                            <div className="header">{i.toString().padEnd(w, p)}</div>
                            <div className={o.memPos === i ? 'val active' : 'val'}>{m.toString().padEnd(MEM_NUM_WIDTH, Constants.NUM_PAD)} </div>
                        </div>
                    })
                }
            </div>
        );
    }
}

export default Info;