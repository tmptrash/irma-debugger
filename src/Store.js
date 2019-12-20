/**
 * Creates and shares application wide store
 * 
 * @author flatline
 */
import { createStore } from 'redux';
import Reducer from './Reducer';

export default createStore(Reducer);