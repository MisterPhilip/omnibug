/*
 * Omnibug
 * Prefs logic
 *
 * This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send
 * a letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041,
 * USA.
 *
 */
(function() {
    var prefs,
        that = this;

    /**
     * Cast values from the form to their correct type
     */
    function processFormValue( key, value ) {
        if( value === "true" ) {
            return true;
        } else if( value === "false" ) {
            return false;
        } else {
            return value;
        }
    }

    /**
     * Create an array from a list of li values
     */
    function getVisualListValues( elem ) {
        var vals = [],
            list = elem.parentNode.querySelectorAll( "li" );

        for( var key in list ) {
            if( list.hasOwnProperty( key ) && list[key] instanceof HTMLLIElement ) {
                vals.push( list[key].firstChild.nodeValue );
            }
        }
        return vals;
    }

    /**
     * Save new prefs back to local storage
     */
    function saveOptions( evt ) {
        if( !! evt ) {
            evt.preventDefault();
        }

        // update our prefs object with new values
        var prefs = that.prefs;
        for( var key in prefs ) {
            if( prefs.hasOwnProperty( key ) ) {
                var elem = document.querySelector( "#" + key );
                if( !! elem ) {
                    if( elem.type === "text" ) {
                        prefs[key] = elem.value;
                    } else if( elem.type === "radio" ) {
                        var active = document.querySelector( "input[type='radio'][name='" + key + "']:checked" );
                        prefs[key] = processFormValue( key, active.value );
                    } else if( elem.type === "hidden" ) {
                        var values = getVisualListValues( elem );
                        prefs[key] = values;
                    } else {
                        console.error( "Unknown options element type ", elem.type, " for option ", key );
                    }
                }
            }
        }

        // save the new values into local storage
        try {
            chrome.storage.local.set( { "omnibug" : prefs }, function() {
                    if( !! chrome.runtime.lastError ) {
                        console.error( "Error setting prefs: ", chrome.runtime.lastError );
                        flashMessage( "Error saving options", true );
                    } else {
                        flashMessage( "Options saved successfully", false );
                    }

            } );
        } catch( ex ) {
            console.error( "Error saving prefs: ", ex.message );
            flashMessage( "Error saving options", true );
        }
    }

    /**
     * Display an alert message next to the save button
     */
    function flashMessage( msg, error ) {
        var statusArea = document.querySelector( "#status" );
        if( !! statusArea ) {
            statusArea.innerHTML = msg;
            statusArea.style.backgroundColor = ( error ? "#faa" : "#afa" );
            statusArea.style.visibility = "visible";
            statusArea.style.opacity = 0;
            setTimeout( function() {
                statusArea.style.visibility = "hidden";
                statusArea.style.opacity = 1;
                statusArea.innerHTML = "";
            }, 2100 );
        }
    }

    /**
     * Selects the proper radio button
     */
    function setRadioButton( key, value ) {
        var elem = document.querySelector( "input[type='radio'][name='" + key + "'][value='" + value + "']" );
        if( !! elem ) {
            elem.checked = true;
        }
    }

    /**
     * Creates a list item for the visual list, with a remove button
     */
    function createListItem( value ) {
        var li = document.createElement( "li" );
        li.textContent = value;
        var rem = document.createElement( "a" );
        rem.className = "rem";
        rem.href="#";
        rem.innerHTML = "x";
        rem.title = "Remove item";
        rem.addEventListener( "click", function( e ) {
            e.preventDefault();
            var elem = e.target.parentNode;
            elem.parentNode.removeChild( elem );
            saveOptions();
        } );
        li.appendChild( rem );
        return li;
    }

    /**
     * Creates a visual list from an array
     * Also adds behavior to add new entries
     */
    function makeHiddenList( key, value, elem ) {
        var p = elem.parentNode;
        var list = p.querySelector( "ul" );
        value.forEach( function( v ) {
            list.appendChild( createListItem( v ) );
        } );

        var add = p.querySelector( "input[type='button']" );
        add.addEventListener( "click", function( e ) {
            var p   = e.target.parentNode,
                inp = p.querySelector( "input[type='text']" );

            if( !! inp.value ) {
                p.querySelector( "ul" ).appendChild( createListItem( inp.value ) );
                inp.value = "";
            }
            saveOptions();
        } );
    }

    /**
     * Update a color's "example" text with new color
     */
    function updateExampleColor( elem, value ) {
        var parentNode = elem.parentNode,
            example = parentNode.querySelector( "span" );
        if( !! example ) {
            example.style.backgroundColor = value;
        }
    }

    /**
     * Restore state of options elements from prefs
     */
    function restoreOptions( prefData ) {
        var prefs = that.prefs = prefData.omnibug;

        for( var key in prefs ) {
            if( prefs.hasOwnProperty( key ) ) {
                var elem = document.querySelector( "#" + key );
                if( !! elem ) {
                    if( elem.type === "text" ) {
                        elem.value = prefs[key];

                        if( key.substring( 0, 6 ) === "color_" ) {
                            updateExampleColor( elem, prefs[key] );
                            elem.addEventListener( 'input', function( e ) {
                                updateExampleColor( e.target, e.target.value );
                            } );
                        }

                    } else if( elem.type === "radio" ) {
                        setRadioButton( key, prefs[key] );
                    } else if( elem.type === "hidden" ) {
                        makeHiddenList( key, prefs[key], elem );
                    } else {
                        console.error( "Unknown options element type ", elem.type, " for option ", key );
                    }
                }
            }
        }

        // attach save button handler
        document.querySelector( '#save' ).addEventListener( 'click', saveOptions );
    }

    // load prefs and update the HTML
    document.addEventListener( 'DOMContentLoaded', function() {
        chrome.storage.local.get( "omnibug", restoreOptions );
    } );

}() );

