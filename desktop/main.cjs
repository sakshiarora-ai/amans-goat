const { app, BrowserWindow, ipcMain, nativeImage, screen, shell } = require('electron');
const path = require('path');

const SITE_URL = process.env.AMANS_GOAT_URL || 'https://sakshiarora-ai.github.io/amans-goat/';
const COMPACT = { width: 92, height: 92 };
const EXPANDED = { width: 380, height: 484 };

let launcherWindow;
let mainWindow;
let launcherExpanded = false;

function positionAtBottomRight(window, size) {
  const cursor = screen.getCursorScreenPoint();
  const display = screen.getDisplayNearestPoint(cursor);
  const { x, y, width, height } = display.workArea;
  window.setBounds({
    x: Math.round(x + width - size.width - 22),
    y: Math.round(y + height - size.height - 22),
    width: size.width,
    height: size.height,
  }, true);
}

function setLauncherExpanded(expanded) {
  launcherExpanded = Boolean(expanded);
  if (!launcherWindow || launcherWindow.isDestroyed()) return;
  positionAtBottomRight(launcherWindow, launcherExpanded ? EXPANDED : COMPACT);
  launcherWindow.webContents.send('launcher-state', launcherExpanded);
}

function routeUrl(route = 'today') {
  const url = new URL(SITE_URL);
  url.searchParams.set('view', route);
  url.searchParams.set('desktop', '1');
  return url.toString();
}

function configureExternalLinks(window) {
  window.webContents.setWindowOpenHandler(({ url }) => {
    try {
      const host = new URL(url).hostname;
      if (host === 'sakshiarora-ai.github.io') return { action: 'allow' };
    } catch {}
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

function openMainWindow(route = 'today') {
  if (!mainWindow || mainWindow.isDestroyed()) {
    mainWindow = new BrowserWindow({
      width: 1320,
      height: 860,
      minWidth: 960,
      minHeight: 650,
      title: "Aman's GOAT",
      backgroundColor: '#0e1420',
      show: false,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        partition: 'persist:amans-goat',
      },
    });
    configureExternalLinks(mainWindow);
    mainWindow.once('ready-to-show', () => mainWindow.show());
    mainWindow.on('closed', () => { mainWindow = null; });
  }
  mainWindow.loadURL(routeUrl(route));
  mainWindow.show();
  mainWindow.focus();
  setLauncherExpanded(false);
}

function createLauncher() {
  launcherWindow = new BrowserWindow({
    ...COMPACT,
    frame: false,
    transparent: true,
    resizable: false,
    movable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  launcherWindow.setAlwaysOnTop(true, 'floating');
  launcherWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  launcherWindow.loadFile(path.join(__dirname, 'launcher.html'));
  launcherWindow.once('ready-to-show', () => {
    positionAtBottomRight(launcherWindow, COMPACT);
    launcherWindow.showInactive();
  });
  launcherWindow.on('closed', () => { launcherWindow = null; });
}

app.whenReady().then(() => {
  const iconPath = path.join(__dirname, 'assets', 'icon.png');
  const icon = nativeImage.createFromPath(iconPath);
  if (process.platform === 'darwin' && !icon.isEmpty()) app.dock.setIcon(icon);
  createLauncher();
  app.on('activate', () => {
    if (!launcherWindow) createLauncher();
    else openMainWindow('today');
  });
});

ipcMain.on('launcher:toggle', (_event, expanded) => setLauncherExpanded(expanded));
ipcMain.on('launcher:open-route', (_event, route) => openMainWindow(route));
ipcMain.on('launcher:open-home', () => openMainWindow('today'));
ipcMain.on('launcher:quit', () => app.quit());

app.on('window-all-closed', (event) => {
  event.preventDefault();
});
