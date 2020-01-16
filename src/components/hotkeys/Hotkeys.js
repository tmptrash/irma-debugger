import React from 'react';
import PropTypes from 'prop-types';

const keymap = {}

class Hotkeys extends React.Component {
    _handlerBinded = false

    componentDidMount() {
        if (!this._handlerBinded) {
            document.addEventListener('keydown', this._handleKeydown);
            this._handlerBinded = true;
        }

        if (typeof this.props.hotkey === "string" && typeof this.props.action === "function") {
            if (!(keymap[this.props.hotkey] instanceof Array)) {
                keymap[this.props.hotkey] = [];
            }
            keymap[this.props.hotkey].push(this.props.action);
        }
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this._handleKeydown);
    }

    _handleKeydown(e) {
        if (keymap[e.key] instanceof Array) {
            e.preventDefault();
            keymap[e.key].forEach(function (action) {
                action();
            });
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

Hotkeys.propTypes = {
    hotkey: PropTypes.string.isRequired,
    action: PropTypes.func.isRequired
}

export default Hotkeys;