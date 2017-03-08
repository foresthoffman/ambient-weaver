const electron = require( 'electron' );
const { app, BrowserWindow } = electron;
const path = require( 'path' );
const url = require( 'url' );

// keeps a global reference of the window object, so that it won't be collected
// by the garbage collector.
let win;

function createWindow() {

	// get display dimensions
	const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize;

	// create browser window
	win = new BrowserWindow({
		width: width, height: height, backgroundColor: '#333333', show: false
	});

	// load the index.html of the app
	win.loadURL( url.format({
		pathname: path.join( __dirname, 'index.html' ),
		protocol: 'file:',
		slashes: true
	}));

	// open the dev tools for debugging
	win.webContents.openDevTools();

	// "emitted" when the window is closed
	win.on( 'closed', () => {

		// dereferences the global reference to the window object
		win = null;
	});

	// hide the window until it is fully loaded
	win.once( 'ready-to-show', () => {
		win.show();
	});
}

// this method is called when Electron has initialized and is ready to create browser windows.
// Some APIs can only be used after this method.
app.on( 'ready', createWindow );

// quit when ALL the windows are closed
app.on( 'window-all-closed', () => {

	// if the platform is MacOS, the menu bar will stay active until CMD+Q is pressed
	if ( 'darwin' !== process.platform ) {
		app.quit();
	}
});

app.on( 'activate', () => {

	// re-create a window when the app is clicked in the dock and no other window are open
	if ( null === win ) {
		createWindow();
	}
});
