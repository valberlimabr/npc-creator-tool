const mysql = require('mysql2/promise');
let connection;

async function connectToDB({ host, username, password, database }) {
  try {
    connection = await mysql.createConnection({ host, user: username, password, database });
    console.log('Conectado ao banco de dados com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro na conexão ao banco de dados:', error.message);
    return false;
  }
}

async function checkEntry(entry) {
  try {
    const [rows] = await connection.execute('SELECT 1 FROM creature_template WHERE entry = ?', [entry]);
    return rows.length > 0;
  } catch (error) {
    console.error('Erro ao verificar entry:', error.message);
    return false;
  }
}

async function createNPC(npcData) {
    try {
      const npcQuery = `
        INSERT INTO creature_template (entry, name, subname, faction, minlevel, maxlevel, npcflag, VerifiedBuild)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const npcValues = [
        npcData.entry, npcData.name, npcData.subname, npcData.faction,
        npcData.minlevel, npcData.maxlevel, npcData.npcflag, npcData.VerifiedBuild
      ];
      await connection.execute(npcQuery, npcValues);
  
      const modelQuery = `
        INSERT INTO creature_template_model (CreatureID, Idx, CreatureDisplayID, DisplayScale, Probability, VerifiedBuild)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const modelValues = [
        npcData.modelData.CreatureID, npcData.modelData.Idx, 
        npcData.modelData.CreatureDisplayID, npcData.modelData.DisplayScale,
        npcData.modelData.Probability, npcData.modelData.VerifiedBuild
      ];
      await connection.execute(modelQuery, modelValues);
  
      console.log('NPC e modelo inseridos com sucesso!');
    } catch (error) {
      console.error('Erro ao inserir NPC ou modelo:', error.message);
      throw error;
    }
  }
  
  module.exports = { connectToDB, checkEntry, createNPC };
  
