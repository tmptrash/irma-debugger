/**
 * This is an implementation of BioVM (Biologocal Virtual Machine). It
 * is used for debugging "line" scripts.
 * 
 * @singleton
 * @author flatline
 */
import Store from './Store';
import BioVM from 'irma/src/irma/BioVM';
import IrmaConfig from 'irma/src/Config';

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
        WORLD_WIDTH          : 10,
        WORLD_HEIGHT         : 10,
        WORLD_CANVAS_WIDTH   : 10,
        WORLD_CANVAS_HEIGHT  : 10,
        DB_ON                : false,
        orgAmount            : 1
    });
}
Store.subscribe(applyCfg);
applyCfg();
// TODO: Canvas destination id should be set here somehow
export default new BioVM();