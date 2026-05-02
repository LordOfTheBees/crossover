const Module = require( 'module' )
const { expect, test } = require( '@playwright/test' )

const loadWindowsWithMocks = ( { isMacos } ) => {
	const centerCalls = []
	const originalLoad = Module._load

	Module._load = function( request, parent, isMain ) {

		if ( request === 'electron' ) {

			return {
				app: {},
				BrowserWindow: function () {},
				screen: {
					getDisplayNearestPoint: () => ( { workArea: { x: 0, y: 0, width: 100, height: 100 } } ),
					getCursorScreenPoint: () => ( { x: 10, y: 10 } ),
				},
			}

		}

		if ( request === './util' && parent?.filename?.endsWith( 'src/main/windows.js' ) ) {

			return {
				activeWindow: () => ( {} ),
				centerWindow: options => centerCalls.push( options ),
				is: { macos: isMacos, windows: false, linux: !isMacos },
			}

		}

		if ( request.endsWith( '/package.json' ) && parent?.filename?.endsWith( 'src/main/windows.js' ) ) {

			return { productName: 'CrossOver' }

		}

		if ( [ './dock.js', './log.js', './helpers.js' ].includes( request ) && parent?.filename?.endsWith( 'src/main/windows.js' ) ) {

			return new Proxy( {}, { get: () => () => {} } )

		}

		if ( request === './paths.js' && parent?.filename?.endsWith( 'src/main/windows.js' ) ) {

			return { __renderer: '' }

		}

		if ( request === './preferences.js' && parent?.filename?.endsWith( 'src/main/windows.js' ) ) {

			return { init: () => ( { value: () => false } ) }

		}

		return originalLoad.apply( this, [ request, parent, isMain ] )

	}

	delete require.cache[require.resolve( '../src/main/windows.js' )]
	const windows = require( '../src/main/windows.js' )
	Module._load = originalLoad

	return { windows, centerCalls }
}

test( 'center uses workArea path on macOS (useFullBounds=false)', () => {

	const { windows, centerCalls } = loadWindowsWithMocks( { isMacos: true } )
	windows.center( { targetWindow: {} } )

	expect( centerCalls[0].useFullBounds ).toBe( false )
} )

test( 'center keeps full bounds behavior on non-macOS', () => {

	const { windows, centerCalls } = loadWindowsWithMocks( { isMacos: false } )
	windows.center( { targetWindow: {} } )

	expect( centerCalls[0].useFullBounds ).toBe( true )
} )
