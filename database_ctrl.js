import { JSONFilePreset } from 'lowdb/node';
const ramadanStorage = {
    user : [],
    tarawih : [],
};

const db = await JSONFilePreset('db.json', ramadanStorage);


export default db;