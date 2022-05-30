require('dotenv').config()
const sqlite3 = require('sqlite3')
const db = new sqlite3.Database((process.env.DB_LOCATION || "/config/") + "stats.db")
const http = require('http')
const server = http.createServer()
server.listen(8080)

const query = (command, method = 'all') => {
    return new Promise((resolve, reject) => {
        db[method](command, (error, result) => {
        if (error) {
            reject(error)
        } else {
            resolve(result)
        }
        })
    })
}

db.serialize(async () => {
    await query("CREATE TABLE IF NOT EXISTS storage (date text, vm text, storagebytes integer)", 'run');
})

server.on('request', (req, res) => {
    switch(req.url) {
        case '/ping':
            if(req.method != 'GET') {
                res.writeHead(405)
                return res.end('405 Method Not Allowed')
            }
            res.writeHead(200)
            res.end('Pong')
            break
        default:
            res.writeHead(404)
            res.end('404 Not Found')
            break
    }
})