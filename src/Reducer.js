import Constants from './Constants.js';

export default function Reducer(state, action) {
    switch (action.type) {
        //
        // Configuration has changed
        //
        case Constants.CONFIG:
            return Object.assign({}, state, {config: action.value});
        case Constants.CODE:
            return Object.assign({}, state, {code: action.value});
            case Constants.LINE:
                return Object.assign({}, state, {line: action.value});
        default:
            return state;
    }
}