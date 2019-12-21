import Constants from './Constants.js';

export default function Reducer(state, action) {
    if (state === undefined) {return {config: '{}'}}
    switch (action.type) {
        //
        // Configuration has changed
        //
        case Constants.CONFIG:
            return Object.assign({}, state, {config: action.value});
        default:
            return state;
    }
}