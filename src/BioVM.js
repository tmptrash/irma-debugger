/**
 * This is an implementation of BioVM (Biologocal Virtual Machine). It
 * is used for debugging "line" scripts.
 * 
 * @singleton
 * @author flatline
 */
import Store from './Store';
import IrmaConfig from 'irma/src/Config';
//
// This is small hack. We have to apply default config before it will be
// used inside BioVM module. It's because it stores config values in constants
// and after apply of our values constants stay the same. We also should use
// require() instead import to import BioVM after applyCfg() call.
//
applyCfg();
const BioVM = require('irma/src/irma/BioVM');

/**
 * Instance of BioVM
 * @singleton
 */
let bioVM = null;
/**
 * Applies default configuration instead typed in Config component.
 * These parameters must overwrite typed by user
 */
function applyCfg() {
    Object.assign(IrmaConfig, Store.getState().config, {
        codeLinesPerIteration: 1,
        codeRepeatsPerRun    : 1,
        codeMutateEveryClone : 0,
        codeMutateMutations  : false,
        WORLD_USE_ZOOM       : false,
        WORLD_WIDTH          : 10,
        WORLD_HEIGHT         : 10,
        WORLD_CANVAS_WIDTH   : 10,
        WORLD_CANVAS_HEIGHT  : 10,
        WORLD_CANVAS_QUERY   : '#world',
        worldCanvasButtons   : false,
        DB_ON                : false,
        orgMutationPeriod    : 10000000,
        molAmount            : 50,
        molRandomAtomPercent : 0,
        PLUGINS              : []
    });
    IrmaConfig.DIR[0] = -IrmaConfig.WORLD_WIDTH;
    IrmaConfig.DIR[1] = -IrmaConfig.WORLD_WIDTH + 1;
    IrmaConfig.DIR[2] = 1;
    IrmaConfig.DIR[3] = IrmaConfig.WORLD_WIDTH + 1;
    IrmaConfig.DIR[4] = IrmaConfig.WORLD_WIDTH;
    IrmaConfig.DIR[5] = IrmaConfig.WORLD_WIDTH - 1;
    IrmaConfig.DIR[6] = -1;
    IrmaConfig.DIR[7] = -IrmaConfig.WORLD_WIDTH - 1;
}
/**
 * Returns VM instance singleton
 */
function getVM () {
    return bioVM || (bioVM = new BioVM());
}

Store.subscribe(applyCfg);
/**
 * Creates BioVM instance as a singleton
 */
export default {
    getVM
}