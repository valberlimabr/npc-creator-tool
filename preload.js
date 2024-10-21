const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  buscarNPCs: (filtros) => ipcRenderer.invoke('buscar-npcs', filtros),
  editarNPC: (npc) => ipcRenderer.invoke('editar-npc', npc),
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('cl-window'),
  connectDB: (config) => ipcRenderer.send('connect-db', config),
  send: (channel, data) => ipcRenderer.send(channel, data),
  invoke: (channel, data) => ipcRenderer.invoke(channel, data),
  on: (channel, func) =>
    ipcRenderer.on(channel, (event, ...args) => func(...args))
});
