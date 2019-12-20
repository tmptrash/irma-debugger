import React from 'react';
import './Config.scss';
import Store from './../../Store';

function Config() {
  let config = Store.getState().config;
  Store.subscribe(() => config = Store.getState().config);

  return (
    <div className="config">
      <textarea value={config}></textarea>
    </div>
  );
}

export default Config;