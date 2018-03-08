let numUsers = 0
const allUsers = {}
const SocketioData = {
    numUsers,
    allUsers
}

function CreateSocketio(server) {
    const io = require('socket.io')(server)
    io.on('connection', (socket) => {
        // when the client emits 'new message', this listens and executes
        let addedUser = false
        socket.on('new message', (data) => {
            // we tell the client to execute 'new message'
            socket.broadcast.emit('new message', {
                username: socket.username,
                message: data
            })
        })

        socket.on('add user', (username) => {
            if (addedUser) return

            // we store the username in the socket session for this client
            socket.username = username
            SocketioData.numUsers++
                SocketioData.allUsers[username] = username
            addedUser = true
            console.log('server all ', allUsers)
            socket.emit('login', {
                numUsers: numUsers
            })

            // echo globally (all clients) that a person has connected
            socket.broadcast.emit('user joined', {
                username: socket.username,
                numUsers: numUsers,
                allUsers: allUsers
            })
        })

        // when the client emits 'typing', we broadcast it to others
        socket.on('typing', () => {
            socket.broadcast.emit('stop typing', {
                username: socket.username
            })
        })

        // when the user disconnects.. perform this
        socket.on('disconnect', () => {
            if (addedUser) {
                --SocketioData.numUsers
                delete SocketioData.allUsers[socket.username]
                console.log(allUsers)
                    //echo globally that this client has left
                socket.broadcast.emit('user left', {
                    username: socket.username,
                    numUsers: numUsers,
                    allUsers: allUsers
                })
            }
        })
    })
}

module.exports = {
    CreateSocketio,
    SocketioData
}