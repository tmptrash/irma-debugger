import Constants from './Constants.js';

export default function Reducer(state, action) {
    switch (action.type) {
        //
        // Configuration has changed
        //
        case Constants.CONFIG:
            return Object.assign({}, state, {type: action.type, config: action.value});
        case Constants.CODE:
            return Object.assign({}, state, {type: action.type, code: action.value, bCode: action.value1.slice()});
        case Constants.LINE:
            return Object.assign({}, state, {type: action.type, line: action.value});
        case Constants.RUN:
            return Object.assign({}, state, {type: action.type, run: action.value});
        case Constants.ITER:
            return Object.assign({}, state, {type: action.type, iter: action.value});
        case Constants.VIS:
            return Object.assign({}, state, {type: action.type, visualize: action.value});
            
        default:
            return state;
    }
}