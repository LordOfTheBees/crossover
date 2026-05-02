// https://playwright.dev/docs/api/
// https://jestjs.io/docs/expect

/*
	TO TEST:
	- github files
	- default asset paths
	- dialog/menu are receiving icon assets
*/

const { expect, test } = require( '@playwright/test' )
const { productName } = require( '../package.json' )
const { closeApp, startApp, wait, delays, focusedMinimizedVisible } = require( './helpers.js' )
// Breakpoint: await mainPage.pause()

let electronApp
let mainPage

test.beforeAll( async () => {

	const app = await startApp()
	electronApp = app.electronApp
	mainPage = app.mainPage

} )

test.afterEach( async () => wait( delays.short ) )

test.afterAll( closeApp )

test( 'Validate app launches: launch.png', async () => {

	// Capture a screenshot.
	await mainPage.screenshot()

	// TODO: wait for app load
	await wait( delays.medium )

	// Print the title.
	const title = await mainPage.title()
	expect( title ).toBe( productName )

	// App properties - focused, minimized, visible
	const { focused, minimized, visible } = await focusedMinimizedVisible( { electronApp, windowName: productName } )

	expect( focused ).toBe( true )
	expect( minimized ).toBe( false )
	expect( visible ).toBe( true )

} )

test( 'Validate feather icons loaded', async () => {

	// Await wait(delays.short)

	// Number of buttons
	let button = mainPage.locator( '#main .button' )
	expect( await button.count() ).toBe( 4 )

	// Feather converts <i/> --> <svg/>
	button = mainPage.locator( '.close-button svg' )
	expect( await button.count() ).toBe( 1 )

	button = mainPage.locator( '.center-button svg' )
	expect( await button.count() ).toBe( 1 )

	button = mainPage.locator( '.settings-button svg' )
	expect( await button.count() ).toBe( 1 )

	// Info button has more icons: move, resize, info
	button = mainPage.locator( '.info-button svg' )
	expect( await button.count() ).toBe( 3 )

} )


test( 'Validate centered bounds accounts for display y offset', async () => {

	const centeredBounds = await electronApp.evaluate( async () => {
		const { getWindowBoundsCentered } = require( './src/main/util' )
		return getWindowBoundsCentered( {
			window: { getSize: () => [ 400, 200 ] },
			display: { bounds: { x: 0, y: 1200, width: 1920, height: 1080 }, workArea: { x: 0, y: 1200, width: 1920, height: 1040 } },
			useFullBounds: true,
		} )
	} )

	expect( centeredBounds.x ).toBe( 760 )
	expect( centeredBounds.y ).toBe( 1640 )

} )

test( 'Validate custom image', async () => {} )
