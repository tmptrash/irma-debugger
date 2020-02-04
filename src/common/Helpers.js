/**
 * Global application helpers
 * 
 * @author flatline
 */
class Helpers {
    /**
     * Compares two typed arrays
     * @param {TypedArray} arr1 
     * @param {TypedArray} arr2 
     * @return {boolean} compare status
     */
    static compare(arr1, arr2) {
        if (arr1.length !== arr2.length) {return false}
        for (let i = 0, len = arr1.length; i < len; i++) {
            if (arr1[i] !== arr2[i]) {return false}
        }
        return true;
    }

    static deepCompare(x, y) {
        if ( x === y ) return true;
        // if both x and y are null or undefined and exactly the same
      
        if ( ! ( x instanceof Object ) || ! ( y instanceof Object ) ) return false;
        // if they are not strictly equal, they both need to be Objects
      
        if ( x.constructor !== y.constructor ) return false;
        // they must have the exact same prototype chain, the closest we can do is
        // test there constructor.
      
        for ( var p in x ) {
            if ( ! x.hasOwnProperty( p ) ) continue;
            // other properties were tested using x.constructor === y.constructor
      
            if ( ! y.hasOwnProperty( p ) ) return false;
            // allows to compare x[ p ] and y[ p ] when set to undefined
      
            if ( x[ p ] === y[ p ] ) continue;
            // if they have the same strict value or identity then they are equal
      
            if ( typeof( x[ p ] ) !== "object" ) return false;
            // Numbers, Strings, Functions, Booleans must be strictly equal
      
            if ( ! Object.equals( x[ p ],  y[ p ] ) ) return false;
            // Objects and Arrays must be tested recursively
        }
      
        for ( p in y ) {
            if ( y.hasOwnProperty( p ) && ! x.hasOwnProperty( p ) ) return false;
            // allows x[ p ] to be set to undefined
        }
        
        return true;
    }

    static isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
}

module.exports = Helpers;