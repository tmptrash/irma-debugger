/**
 * Hotkeys support.
 * Hotkeys listed in keymap property as a key => value storage,
 * where storage is an array of functions.
 * @author zostum
 */

import React from 'react';
import PropTypes from 'prop-types';

class Hotkeys extends React.Component {

    hotkey = '';
    actions = [];

    constructor() {
        super();
        document.addEventListener('keydown', this._handleKeydown.bind(this));
    }

    componentDidMount() {
        const hotkey = this.props.hotkey;
        const action = this.props.action;
        if (typeof hotkey !== 'string' || typeof action !== 'function') { return }
        this.hotkey = hotkey
        this.actions.push(action);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this._handleKeydown);
    }

    render() {
        return (
            <React.Fragment>
                {this.props.children}
            </React.Fragment>
        )
    }

    _handleKeydown(e) {
        e.preventDefault();
        if (e.key !== this.hotkey) { return }
        this.actions.forEach((action) => action());
    }
}

Hotkeys.propTypes = {
    hotkey: PropTypes.string.isRequired,
    action: PropTypes.func.isRequired
}

export default Hotkeys;