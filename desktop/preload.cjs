const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('goatDesktop', {
  toggle: (expanded) => ipcRenderer.send('launcher:toggle', Boolean(expanded)),
  openRoute: (route) => ipcRenderer.send('launcher:open-route', route),
  openHome: () => ipcRenderer.send('launcher:open-home'),
  quit: () => ipcRenderer.send('launcher:quit'),
  onState: (callback) => ipcRenderer.on('launcher-state', (_event, expanded) => callback(Boolean(expanded))),
});

