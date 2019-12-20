import Constants from './Constants.js';

export default function Reducer(state, action) {
    if (state === undefined) {return {
        config: {}
    }}
    switch (action.type) {
        //
        // Configuration has changed
        //
        case Constants.CONFIG:
            try {
                return JSON.parse(JSON.stringify(action.value));
            } catch (e) {
                console.error(`Possibly incorrect value of configuration.\nError: ${e}\nValue: ${action.value}`);
                return state;
            }
        default:
            return state;
    }
}