import Constants from './Constants.js';

export default function Reducer(state, action) {
    //
    // We store action type to have a posiibliity to subscribe on special action
    //
    const newState = {type: action.type};
    switch (action.type) {
        //
        // Configuration has changed
        //
        case Constants.CONFIG:
            return Object.assign(newState, state, {config: action.value});
        case Constants.CODE:
            return Object.assign(newState, state, {code: action.value, bCode: action.value1.slice()});
        case Constants.LINE:
            return Object.assign(newState, state, {line: action.value});
        case Constants.RUN:
            return Object.assign(newState, state, {run: action.value});
        case Constants.ITER:
            return Object.assign(newState, state, {iter: action.value});
        case Constants.VIS:
            return Object.assign(newState, state, {visualize: action.value});

        default:
            return state;
    }
}