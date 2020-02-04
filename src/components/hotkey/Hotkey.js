/**
 * Hotkeys support. Hotkeys listed in keymap property as a key => value storage, where 
 * storage is an array of functions.
 * 
 * @author zostum
 */
import React from 'react';
import PropTypes from 'prop-types';

class Hotkey extends React.Component {

    _hotkey  = '';
    _actions = [];

    constructor() {
        super();
        document.addEventListener('keydown', this._handleKeydown.bind(this));
    }

    componentDidMount() {
        const hotkey = this.props.hotkey;
        const action = this.props.action;
        if (typeof hotkey !== 'string' || typeof action !== 'function') { return }
        this._hotkey = hotkey
        this._actions.push(action);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this._handleKeydown);
    }

    render() {
        return (
            <>
                {this.props.children}
            </>
        )
    }

    _handleKeydown(e) {
        if (e.key !== this._hotkey) { return }
        e.preventDefault();
        this._actions.forEach((action) => action());
    }
}

Hotkey.propTypes = {
    hotkey: PropTypes.string.isRequired,
    action: PropTypes.func.isRequired
}

export default Hotkey;