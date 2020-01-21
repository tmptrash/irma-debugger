/**
 * Creates and shares application wide store.
 * 
 * @singleton
 * @author flatline
 */
import { createStore } from 'redux';
import Reducer from './Reducer';
import Constants from './Constants';
import Helpers from './common/Helpers';
import JSON5 from 'json5';
//
// This code implements time traveling technique. It stores all state in localStorage
//
const value = localStorage[Constants.LS_KEY];
let   state;
try {state  = JSON5.parse(value)} catch (e) {state = {config: '{}', code: '', bCode: new Uint8Array(), line: 0, run: false, visualize: false}}
const store = createStore(Reducer, state);
store.subscribe(() => localStorage[Constants.LS_KEY] = JSON5.stringify(store.getState()));
/**
 * Dispatches an action only if data was changed
 */
store.dispatch2 = (action) => {
    const state = store.getState();
    if (!Helpers.deepCompare(state, action)) {
        store.dispatch(action);
    }
}

export default store;