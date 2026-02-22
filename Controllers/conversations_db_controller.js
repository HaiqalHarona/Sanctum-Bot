import { JSONFilePreset } from 'lowdb/node';

// Structure of serverConversations
// [
//     "serverConversations" = [{
//         server_id : '',
//         channel_id : '',
//         author_id : '',
//         message_content : '',
//         timestamp : ''
//     }]
// ]

const conversationStorage = {
    serverConversations : [],
};

const conversation_db = await JSONFilePreset('conversation_db.json', conversationStorage);

export default conversation_db;
