require('dotenv').config();
const cors = require('cors');
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const WSServer = require('express-ws')(app);
const aWss = WSServer.getWss();
const api = require('./api');

app.use(cors());
app.use(express.json());
app.get('/', api.getStartPage)
app.post('/users', api.addUser);
app.delete('/users/:id', api.deleteUser);

app.ws('/game', (ws, req) => {
    ws.on('message', (msg) => {
        const method = JSON.parse(msg).method;
        switch (method) {
            case 'connect':
                api.connect(msg, ws, aWss);
                break;
            case 'start':
                api.start(msg, ws, aWss);
                break;
            case 'change':
                api.changeValue(msg, ws, aWss);
                break;
            case 'stop':
                api.stop(msg, ws, aWss);
                break;
        }
    });
})
// app.ws('/users/:id', (ws, req) => {
//     ws.on('message', (msg) => {
//         const method = JSON.parse(msg).method;
//         switch (method) {
//             case 'connect':
//                 api.connect(msg, ws, aWss);
//                 break
//             case 'disconnect':
//                 api.connect(msg, ws, aWss);
//                 break
//             case 'message':
//                 api.sendMessage(msg, ws, aWss);
//                 break
//             case 'get-messages':
//                 msg = JSON.parse(msg)
//                 api.getMessages(msg.id, ws)
//         }
//     });
// });

app.listen(port, () => {
    console.log(`Server started on port ${port}`)
});
