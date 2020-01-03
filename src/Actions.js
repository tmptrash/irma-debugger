/**
 * Actions for Redux
 * 
 * @author flatline
 */
import Constants from './Constants';

export const Actions = {
  config : value    => ({type: Constants.CONFIG, value}),
  code   : (v0, v1) => ({type: Constants.CODE,   value: v0, value1: v1}),
  line   : value    => ({type: Constants.LINE,   value}),
  run    : value    => ({type: Constants.RUN,    value}),
  iter   : value    => ({type: Constants.ITER,   value})
};