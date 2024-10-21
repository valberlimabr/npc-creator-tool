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
  
// Função de busca de NPCs com filtros
// Função de busca de NPCs com filtros
async function searchNPCs({ entry, name, subname }) {
  try {
    let query = 'SELECT entry, name, subname, minlevel, maxlevel FROM creature_template WHERE 1=1';
    const params = [];

    if (entry) {
      query += ' AND entry = ?';
      params.push(entry);
    }
    if (name) {
      query += ' AND name LIKE ?';
      params.push(`%${name}%`);
    }
    if (subname) {
      query += ' AND subname LIKE ?';
      params.push(`%${subname}%`);
    }

    console.log('Consulta SQL gerada:', query);
    console.log('Parâmetros:', params);

    const [rows] = await connection.execute(query, params);
    return rows;
  } catch (error) {
    console.error('Erro ao buscar NPCs:', error.message);
    throw error;
  }
}

async function updateNPC({ entry, name, subname }) {
  try {
    const query = `
      UPDATE creature_template
      SET name = ?, subname = ?
      WHERE entry = ?
    `;
    await connection.execute(query, [name, subname, entry]);
    console.log(`NPC ${entry} atualizado com sucesso!`);
  } catch (error) {
    console.error('Erro ao atualizar NPC:', error.message);
    throw error;
  }
}

  module.exports = { connectToDB, checkEntry, createNPC, searchNPCs, updateNPC };
  
