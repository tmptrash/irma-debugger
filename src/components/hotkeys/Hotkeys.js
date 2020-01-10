import React from 'react';

const keymap = {}

class Hotkeys extends React.Component {
    handlerBinded = false

    componentDidMount() {
        if (!this.handlerBinded) {
            document.addEventListener('keydown', this.handleKeyDown);
            this.handlerBinded = true;
        }

        keymap[this.props.hotkey] = this.props.action
    }

    handleKeyDown(e) {
        e.preventDefault();
        if (keymap[e.key]) {
            keymap[e.key]();
        }
    }

    render() {
        return (
            <React.Fragment>
                {this.props.children}
            </React.Fragment>
        )
    }
}

export default Hotkeys;