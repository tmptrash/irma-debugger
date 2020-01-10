import React from 'react';
import './Buttons.scss';
import { Actions } from './../../Actions';
import BioVM from './../../BioVM';
import Store from './../../Store';
import Hotkey from './../hotkeys/Hotkeys';

class Buttons extends React.Component {
    render() {
        return (
            <div className="buttons">
                <Hotkey hotkey="F10" action={this._onStep.bind(this)}>
                    <button title="Step - F10" onClick={this._onStep.bind(this)}>Step</button>
                </Hotkey>
                <Hotkey hotkey="F9" action={this._onStop.bind(this)}>
                    <button title="Stop - F9" onClick={this._onStop.bind(this)}>Stop</button>
                </Hotkey>
                <button disabled title="Converts byte code to string code">2 Code</button>
            </div>
        );
    }

    _onStep() {
        const vm = BioVM.getVM();
        vm.run();
        vm.world.canvas.update();
        Store.dispatch(Actions.line(vm.orgs.get(0).line));
    }

    _onStop() {
        BioVM.reset();
    }
}

export default Buttons;