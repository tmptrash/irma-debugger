import React from 'react';
import './Buttons.scss';
import {Actions} from './../../Actions';
import BioVM from './../../BioVM';
import Store from './../../Store';
import IrmaConfig from 'irma/src/Config';

class Buttons extends React.Component {
    render () {
        return (
            <div className="buttons">
                <button title="Step - F10" onClick={this._onStep.bind(this)}>Step</button>
                <button title="Stop - F9" onClick={this._onStop.bind(this)}>Stop</button>
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
        const vm  = BioVM.getVM();
        let   org = vm.orgs.get(0);
        vm.delOrg(org);
        org = vm.addOrg(0, IrmaConfig.LUCAS[0].code.slice(), 10000);
        vm.world.canvas.update();
        Store.dispatch(Actions.line(org.line));
    }
}

export default Buttons;