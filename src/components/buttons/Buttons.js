import React from 'react';
import './Buttons.scss';
import {Actions} from './../../Actions';
import BioVM from './../../BioVM';
import Store from './../../Store';
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
                <button title="Stop - F9" onClick={this._onStop.bind(this)}>Stop</button>
                <button disabled title="Converts byte code to string code">2 Code</button>
                <span>{this.state.iter}</span>
            </div>
        );
    }

    _onStep() {
        const vm   = BioVM.getVM();
        vm.run();
        vm.world.canvas.update();
        const org  = vm.orgs.get(0);
        const code = Bytes2Code.toCode(org.code, false, false, false, false);
        Store.dispatch(Actions.iter(vm.iteration));
        Store.dispatch(Actions.line(org.line));
        Store.dispatch(Actions.code(code, org.code));
        Store.dispatch(Actions.run(false));
    }

    _onRun() {
        Store.dispatch(Actions.run(true));
    }

    _onStop() {
        BioVM.reset();
    }
}


export default Buttons;