/**
 * Configuration component. Contains configuration, which is applied to debugger and VM.
 * This is the same as irma's Config.js file.
 * 
 * @author flatline
 */
import React from 'react';
import './Config.scss';
import Store from './../../Store';
import {Actions} from './../../Actions';
import JSON5 from 'json5';

class Config extends React.Component {
  constructor () {
    super();
    this.state = {config: Store.getState().config};
  }

  componentDidMount() {
    this.unsubscribe = Store.subscribe(() => {
      this.setState({config: Store.getState().config});
    });
  }

  componentWillUnmount() {this.unsubscrube()}

  render() {
    const validCls = this._isValid(this.state.config) ? '' : 'error';
    const onChange = this._onChange.bind(this);
    const errMsg   = validCls ? 'Invalid configuration' : '';
    const value    = this.state.config;
 
    return (
      <div className="config">
        <textarea title={errMsg} className={validCls} value={value} onChange={onChange}></textarea>
      </div>
    );
  }

  _isValid(v) {
    try {
      JSON5.parse(this.state.config);
      return true;
    } catch (e) {
      return false;
    }
  }

  _onChange(e) {
    Store.dispatch(Actions.config(e.target.value));
  }
}

export default Config;