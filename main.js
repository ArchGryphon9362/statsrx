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
    await query("CREATE TABLE IF NOT EXISTS storage (date text, vm text, storagebytes integer)", 'run')
})

server.on('request', (req, res) => {
    let url = new URL(req.url, `http://${req.headers.host}`)

    switch(url.pathname) {
        case '/':
            res.writeHead(200)
            res.end("Welcome to the incomplete main page!")
            break
        case '/ping':
            if(req.method != 'GET') {
                res.writeHead(405)
                return res.end('405 Method Not Allowed')
            }
            res.writeHead(200)
            res.end('Pong')
            break
        case '/insert':
            if(req.method != 'GET') {
                res.writeHead(405)
                return res.end('405 Method Not Allowed')
            }

            let date = url.searchParams.get('date')
            let vm = url.searchParams.get('vm')
            let sb = url.searchParams.get('sb')
            
            db.serialize(async () => {
                let insert = db.prepare('INSERT INTO storage VALUES(?, ?, ?)')
                insert.run(date, vm, sb)
                insert.finalize()
                let result = await query(`SELECT * FROM storage`)
                console.log(result)
                res.writeHead(200)
                res.end(JSON.stringify(result))
            })

            break
        default:
            res.writeHead(404)
            res.end('404 Not Found')
            break
    }
    console.log(url.pathname)
    console.log(url.searchParams.get('abc'))
})