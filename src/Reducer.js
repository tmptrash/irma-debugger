import Constants from './Constants.js';

export default function Reducer(state, action) {
    switch (action.type) {
        //
        // Configuration has changed
        //
        case Constants.CONFIG:
            return Object.assign({}, state, {config: action.value});
        case Constants.CODE:
            return Object.assign({}, state, {code: action.value, bCode: action.value1.slice()});
        case Constants.LINE:
            return Object.assign({}, state, {line: action.value});
        case Constants.RUN:
            return Object.assign({}, state, {run: action.value});
        case Constants.ITER:
            return Object.assign({}, state, {iter: action.value});
        case Constants.VIS:
            return Object.assign({}, state, {visualize: action.value});
            
        default:
            return state;
    }
}