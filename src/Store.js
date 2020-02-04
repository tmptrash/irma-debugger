/**
 * Creates and shares application wide storage. Adds subscribeTo() method to
 * store to have an ability to listen special action
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
try {state  = JSON5.parse(value)} catch (e) {state = {config: '{}', code: '', bCode: new Uint8Array(), line: 0, run: false, visualize: false}}
const store = createStore(Reducer, state);
store.subscribe(() => localStorage[Constants.LS_KEY] = JSON5.stringify(store.getState()));
/**
 * Subscriber function to add listener for special action
 * @param {Number} id Id of the action we want to listen
 * @param {Function} cb Callback function
 * @return {Function} unsubscribe function
 */
store.subscribeTo = (id, cb) => store.subscribe(() => store.getState().type === id && cb());

export default store;