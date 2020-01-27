import React from 'react';
import './Buttons.scss';
import Constants from './../../Constants';
import {Actions} from './../../Actions';
import BioVM from './../../BioVM';
import Store from './../../Store';
import Helpers from './../../common/Helpers';
import Bytes2Code from 'irma/src/irma/Bytes2Code';

class Buttons extends React.Component {
    constructor () {
        super();
        this.state = {iter: 0, compiled: true};
        this._iter = 0;
    }

    componentDidMount() {
        this._unsubscribeChanged = Store.subscribeTo(Constants.CHANGED, () => this.setState({compiled: false}));
        this._unsubscribeIter    = Store.subscribeTo(Constants.ITER,    this._onIterUpdate.bind(this));
        this._unsubscribeErr     = Store.subscribeTo(Constants.ERROR,   () => this.setState({error: Store.getState().error}));
    }

    componentDidUpdate() {}

    componentWillUnmount() {
        this._unsubscribeErr();
        this._unsubscribeChanged();
        this._unsubscribeIter();
    }

    render () {
        const err = this.state.error;

        return (
            <div className="buttons">
                <button title="Step - F10" onClick={this._onStep.bind(this)} disabled={!this.state.compiled}>Step</button>
                <button title="Run - F8" onClick={this._onRun.bind(this)} disabled={!this.state.compiled}>Run</button>
                <button title="Compile - F9" onClick={this._onCompile.bind(this)} disabled={this.state.compiled}>Compile</button>
                <label>Visualize:<input type="checkbox" value="Visualize" onChange={this._onVisualize.bind(this)} checked={Store.getState().visualize}></input></label>
                <span> Iteration: {this.state.iter}</span>
                <span className={err ? 'error' : ''}>{err}</span>
            </div>
        );
    }

    _onVisualize(event) {
        Store.dispatch(Actions.visualize(event.target.checked));
    }

    _onIterUpdate() {
        const iter = Store.getState().iter;
        if (this._iter !== iter) {
            this.setState({iter: iter});
            this._iter = iter;
        }
    }

    _onStep() {
        const vm  = BioVM.getVM();
        const org = vm.orgs.get(0);
        vm.run();
        vm.world.canvas.update();
        Store.dispatch(Actions.iter(vm.iteration));
        Store.dispatch(Actions.line(org.line));
        Store.dispatch(Actions.run(false));
    }

    _onRun() {
        Store.dispatch(Actions.run(true));
    }

    _onCompile() {
        Store.dispatch(Actions.compile());
        this.setState({compiled: true});
    }
}


export default Buttons;