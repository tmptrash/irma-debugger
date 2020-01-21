import React from 'react';
import './Buttons.scss';
import {Actions} from './../../Actions';
import BioVM from './../../BioVM';
import Store from './../../Store';
import Helpers from './../../common/Helpers';
import Bytes2Code from 'irma/src/irma/Bytes2Code';

class Buttons extends React.Component {
    constructor () {
        super();
        this.state = {iter: 0};
        this._iter = 0;
    }

    componentDidMount() {
        this._unsubscribe = Store.subscribe(() => {
            const iter = Store.getState().iter;
            if (this._iter !== iter) {
                this.setState({iter: iter});
                this._iter = iter;
            }
        });
    }

    componentWillUnmount() {this._unsubscribe()}

    render () {
        return (
            <div className="buttons">
                <button title="Step - F10" onClick={this._onStep.bind(this)}>Step</button>
                <button title="Run - F8" onClick={this._onRun.bind(this)}>Run</button>
                <button title="Compile - F9" onClick={this._onCompile.bind(this)}>Compile</button>
                <label>Visualize:<input type="checkbox" value="Visualize" onChange={this._onVisualize.bind(this)} checked={Store.getState().visualize}></input></label>
                <span> Iteration: {this.state.iter}</span>
            </div>
        );
    }

    _onVisualize(event) {
        Store.dispatch(Actions.visualize(event.target.checked));
    }

    _onStep() {
        const vm      = BioVM.getVM();
        const org     = vm.orgs.get(0);
        const oldCode = org.code.slice();
        vm.run();
        vm.world.canvas.update();
        Store.dispatch(Actions.iter(vm.iteration));
        Store.dispatch(Actions.line(org.line));
        !Helpers.compare(oldCode, org.code) && Store.dispatch(Actions.code(Bytes2Code.toCode(org.code, false, false, false, false), org.code));
        Store.dispatch(Actions.run(false));
    }

    _onRun() {
        Store.dispatch(Actions.run(true));
    }

    _onCompile() {
        BioVM.reset();
    }
}


export default Buttons;