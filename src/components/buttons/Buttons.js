import React from 'react';
import './Buttons.scss';
import {Actions} from './../../Actions';
import BioVM from './../../BioVM';
import Store from './../../Store';

class Buttons extends React.Component {
    render () {
        return (
            <div className="buttons">
                <button title="Step - F10" onClick={this._onStep.bind(this)}>Step</button>
                <button title="Stop - F9">Stop</button>
                <button title="Converts byte code to string code">2 Code</button>
            </div>
        );
    }

    _onStep() {
        const vm = BioVM.getVM();
        vm.run();
        Store.dispatch(Actions.line(vm.orgs.get(0).line));
    }
}

export default Buttons;