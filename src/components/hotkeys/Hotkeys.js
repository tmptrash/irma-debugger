/**
 * Hotkeys support.
 * Hotkeys listed in keymap property as a key => value storage,
 * where storage is an array of functions.
 * @author zostum
 */

import React from 'react';
import PropTypes from 'prop-types';

const keymap = {}

class Hotkeys extends React.Component {

    constructor() {
        super();
        document.addEventListener('keydown', this._handleKeydown);
    }

    componentDidMount() {
        const hotkey = this.props.hotkey;
        const action = this.props.action;
        if (typeof hotkey !== 'string' || typeof action !== 'function') { return }
        if (!Array.isArray(keymap[hotkey])) { keymap[hotkey] = [] }
        keymap[hotkey].push(action);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this._handleKeydown);
    }

    _handleKeydown(e) {
        if (!Array.isArray(keymap[e.key])) { return }
        e.preventDefault();
        keymap[e.key].forEach((action) => action());
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