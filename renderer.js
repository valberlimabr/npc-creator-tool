const connectBtn = document.getElementById('connect-btn');
const connectionForm = document.getElementById('connection-form');
const npcForm = document.getElementById('npc-form');
const entryInput = document.getElementById('entry');
const entryStatus = document.getElementById('entry-status');
const createNpcBtn = document.getElementById('create-npc-btn');
const successMessage = document.getElementById('success-message');

// Carregar credenciais do cache ao iniciar
window.onload = async () => {
  console.log('Carregando credenciais do cache...');
  const cachedCredentials = await window.electron.invoke('get-cached-credentials');
  if (cachedCredentials) {
    console.log('Credenciais encontradas:', cachedCredentials);
    document.getElementById('host').value = cachedCredentials.host;
    document.getElementById('username').value = cachedCredentials.username;
    document.getElementById('password').value = cachedCredentials.password;
    document.getElementById('database').value = cachedCredentials.database;
  } else {
    console.log('Nenhuma credencial encontrada no cache.');
  }
};

// Conectar ao banco de dados
connectBtn.addEventListener('click', () => {
  const host = document.getElementById('host').value;
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const database = document.getElementById('database').value;

  console.log('Enviando credenciais para conexão...', { host, username, password, database });
  window.electron.send('connect-db', { host, username, password, database });
});

// Exibir o formulário de NPC após conexão bem-sucedida e ocultar o formulário de conexão
window.electron.on('db-connected', () => {
  console.log('Conexão ao banco de dados bem-sucedida!');
  connectionForm.classList.add('hidden');  // Oculta os inputs de conexão
  npcForm.classList.remove('hidden');  // Exibe os inputs de NPC
});

// Verificar se o "entry" já está em uso
entryInput.addEventListener('input', async (e) => {
  const entry = e.target.value;
  console.log('Verificando se o entry já está em uso:', entry);

  const exists = await window.electron.invoke('check-entry', entry);
  if (exists) {
    entryStatus.textContent = 'Entry já em uso!';
    entryStatus.style.color = 'red';
    createNpcBtn.disabled = true;
  } else {
    entryStatus.textContent = 'Entry disponível!';
    entryStatus.style.color = 'LawnGreen';
    createNpcBtn.disabled = false;
  }
});

// Enviar dados do NPC para criação
createNpcBtn.addEventListener('click', () => {
  const npcData = {
    entry: entryInput.value,
    name: document.getElementById('name').value,
    subname: document.getElementById('subname').value,
    faction: document.getElementById('faction').value,
    minlevel: document.getElementById('minlevel').value,
    maxlevel: document.getElementById('maxlevel').value,
    npcflag: document.getElementById('npcflag').value,
    VerifiedBuild: 12340,
    modelData: {
      CreatureID: entryInput.value,
      Idx: 0,
      CreatureDisplayID: document.getElementById('creature-display-id').value,
      DisplayScale: document.getElementById('display-scale').value || 1,
      Probability: document.getElementById('probability').value || 1,
      VerifiedBuild: 12340
    }
  };

  console.log('Enviando dados do NPC para criação:', npcData);
  window.electron.send('create-npc', npcData);
  showSuccessMessage();
});

// Exibir uma mensagem de sucesso por 3 segundos
function showSuccessMessage() {
  successMessage.style.display = 'block';
  successMessage.style.opacity = '1';

  setTimeout(() => {
    successMessage.style.opacity = '0';
    setTimeout(() => (successMessage.style.display = 'none'), 500);
  }, 3000);
}