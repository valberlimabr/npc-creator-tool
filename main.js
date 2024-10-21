const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Dynamic import do 'electron-store'
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

const { connectToDB, checkEntry, createNPC, searchNPCs, updateNPC } = require('./db');
let mainWindow;

//Renderiza a Janela
app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden', // 
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // 
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
    // Impede redimensionamento manual
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
      store.set('credentials', config);
      event.reply('db-connected');
    } else {
      console.error('123Erro ao conectar ao banco de dados.');
      event.reply('db-connected-false');
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

ipcMain.handle('buscar-npcs', async (event, filtros) => {
  try {
    const result = await searchNPCs(filtros);
    console.log('NPCs encontrados:', result); // Para confirmar se a consulta está sendo feita
    return result;
  } catch (error) {
    console.error('Erro ao buscar NPCs:', error);
    return [];
  }
});

ipcMain.handle('editar-npc', async (event, npc) => {
  try {
    await updateNPC(npc);
    console.log('NPC atualizado:', npc);
    return true;
  } catch (error) {
    console.error('Erro ao atualizar NPC:', error);
    return false;
  }
});