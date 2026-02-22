import { JSONFilePreset } from 'lowdb/node';
const ramadanStorage = {
    user : [],
    tarawih : [],
};

const tarawih_db = await JSONFilePreset('tarawih_db.json', ramadanStorage);

export default tarawih_db;
