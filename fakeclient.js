const socket = require('socket.io-client')
const connection = socket('http://localhost:3000')

// connection.on('message', (data) => {
//     console.log(data);
// });

connection.on('whoyouare', () => {
    console.log('identity required')
    connection.emit('whoiam', { name: 'TestUser', role: 2 })
    // connection.on('welcome-user', (data) => {
    //     console.log('Client.welcome-user', data)
    // })
    // connection.on('roomColelctor.refresh-roomlist', data => {
    //     console.log(data)
    // })
    connection.on('socket-event', data => {
        console.log(data)
    })
});
connection.on('user-error', (error) => {
    console.error(error);
})
