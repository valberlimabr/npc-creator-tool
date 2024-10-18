const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Dynamic import do 'electron-store' com tratamento completo de erros
let store;

(async () => {
  try {
    const module = await import('electron-store');
    const Store = module.default;
    store = new Store();
    console.log('Instância do electron-store criada com sucesso.');
  } catch (error) {
    console.error('Erro ao carregar electron-store:', error);
  }
})();

const { connectToDB, checkEntry, createNPC } = require('./db');
let mainWindow;

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden', // Remove a barra de título
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Adicione isso
      enableRemoteModule: false,
      nodeIntegration: true,
      contextIsolation: true
    },
  });

  mainWindow.loadFile('index.html');
    ipcMain.on('maximize-window', () => {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    });
    ipcMain.on('cl-window', () => {
      mainWindow.close();
    });
    ipcMain.on('minimize-window', () => {
      mainWindow.minimize();
    });
    // Impede redimensionamento manual mantendo o tamanho fixo
    mainWindow.on('resize', () => {
      const { x, y } = mainWindow.getBounds();
      mainWindow.setBounds({ x, y, width: 1280, height: 720 });
    });
  console.log('Janela carregada com sucesso!');
});

ipcMain.on('connect-db', async (event, config) => {
  console.log('Evento "connect-db" recebido com as credenciais:', config);

  try {
    const connected = await connectToDB(config);
    if (connected) {
      console.log('Conectado ao banco de dados com sucesso.');
      store.set('credentials', config);  // Armazena credenciais no cache
      event.reply('db-connected');
    } else {
      console.error('Erro ao conectar ao banco de dados.');
    }
  } catch (error) {
    console.error('Erro durante a conexão:', error);
  }
});

ipcMain.handle('get-cached-credentials', () => {
  try {
    const credentials = store.get('credentials');
    console.log('Credenciais obtidas do cache:', credentials);
    return credentials;
  } catch (error) {
    console.error('Erro ao obter credenciais cacheadas:', error);
    return null;
  }
});

ipcMain.handle('check-entry', async (event, entry) => {
  try {
    console.log('Verificando entry:', entry);
    return await checkEntry(entry);
  } catch (error) {
    console.error('Erro ao verificar entry:', error);
    return false;
  }
});

ipcMain.on('create-npc', async (event, npcData) => {
  try {
    await createNPC(npcData);
    console.log('NPC e modelo criados com sucesso!');
  } catch (error) {
    console.error('Erro ao criar NPC ou modelo:', error.message);
  }
});