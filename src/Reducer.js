import Constants from './Constants.js';

export default function Reducer(state, action) {
    if (state === undefined) {return {config: '{}', code: ''}}
    switch (action.type) {
        //
        // Configuration has changed
        //
        case Constants.CONFIG:
            return Object.assign({}, state, {config: action.value});
        case Constants.CODE:
            return Object.assign({}, state, {code: action.value});
        default:
            return state;
    }
}