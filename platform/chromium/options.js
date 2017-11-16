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
     * Get the list of enabled providers
     */
    function getCheckboxValues( elem ) {
        var provs = [],
            targ = document.querySelector( "#providers" ),
            cbs = targ.querySelectorAll( "input[type='checkbox']" );

        for( var cbIdx in cbs ) {
            if( cbs.hasOwnProperty( cbIdx ) && cbs[cbIdx] instanceof HTMLInputElement ) {
                var cb = cbs[cbIdx];
                if( cb.checked ) {
                    provs.push( cb.value );
                }
            }
        }
        return provs;
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
                        var dataUse = elem.getAttribute( "data-use" );
                        if( dataUse === "list" ) {
                            var values = getVisualListValues( elem );
                            prefs[key] = values;
                        } else if( dataUse === "checkbox" ) {
                            var values = getCheckboxValues( elem );
                            prefs[key] = values;
                        }

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
                }
            } );
        } catch( ex ) {
            console.error( "Error saving prefs: ", ex.message );
        }
    }

    /**
     * Selects the proper radio button
     */
    function setRadioButton( key, value ) {
        var elem = document.querySelector( "input[type='radio'][name='" + key + "'][value='" + value + "']" );
        if( !! elem ) {
            elem.checked = true;

            while( elem.type !== "fieldset" ) {
                elem = elem.parentNode;
            }

            var buttons = elem.querySelectorAll( "input[type='radio']" );
            for( var btn in buttons ) {
                if( buttons.hasOwnProperty( btn ) && buttons[btn] instanceof HTMLInputElement ) {
                    buttons[btn].addEventListener( "input", saveOptions );
                    buttons[btn].addEventListener( "change", saveOptions );
                }
            }
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
        if( !! add ) {
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
    }

    /**
     * Create a set of checkboxes
     * Adds behavior to clicks on the checkboxes
     */
    function makeCheckboxList( key, value, elem ) {
        if( key === "enabledProviders" ) {
            var i = 0,
                cont = elem.parentNode,
                leftCol  = document.createElement( "p" ),
                rightCol = document.createElement( "p" ),
                providers = OmnibugProvider.getProviders(),
                halfway = Math.round( Object.keys( providers ).length / 2 );

            Object.keys( providers ).sort().forEach( function( prov ) {
                var cb = document.createElement( "input" );
                cb.type = "checkbox";
                cb.name = "enabledProvList";

                if( value.indexOf( prov ) > -1 ) {
                    cb.checked = true;
                }

                cb.value = prov;
                cb.addEventListener( "change", saveOptions );

                var lbl = document.createElement( "label" );
                lbl.appendChild( cb );
                lbl.appendChild( document.createTextNode( OmnibugProvider[prov].name ) );

                if( ++i <= halfway ) {
                    leftCol.appendChild( lbl );
                } else {
                    rightCol.appendChild( lbl );
                }

                cont.appendChild( leftCol );
                cont.appendChild( rightCol );
            } );
        }
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
                            elem.addEventListener( "input", function( e ) {
                                updateExampleColor( e.target, e.target.value );
                                saveOptions();
                            } );
                        }

                    } else if( elem.type === "radio" ) {
                        setRadioButton( key, prefs[key] );
                    } else if( elem.type === "hidden" ) {
                        var dataUse = elem.getAttribute( "data-use" );
                        if( dataUse === "list" ) {
                            makeHiddenList( key, prefs[key], elem );
                        } else if( dataUse === "checkbox" ) {
                            makeCheckboxList( key, prefs[key], elem );
                        }
                    } else {
                        console.error( "Unknown options element type ", elem.type, " for option ", key );
                    }
                }
            }
        }
    }

    // load prefs and update the HTML
    document.addEventListener( 'DOMContentLoaded', function() {
        chrome.storage.local.get( "omnibug", restoreOptions );
    } );

}() );

