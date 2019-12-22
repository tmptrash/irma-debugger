/**
 * Creates and shares application wide store.
 * 
 * @singleton
 * @author flatline
 */
import { createStore } from 'redux';
import Reducer from './Reducer';
import Constants from './Constants';
import JSON5 from 'json5';
//
// This code implements time traveling technique. It stores all state in localStorage
//
const value = localStorage[Constants.LS_KEY];
let   state;
try {state  = JSON5.parse(value)} catch (e) {state = {config: '{}', code: ''}}
const store = createStore(Reducer, state);
store.subscribe(() => localStorage[Constants.LS_KEY] = JSON5.stringify(store.getState()));

export default store;