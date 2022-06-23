require('dotenv').config()
const sqlite3 = require('sqlite3')
const db = new sqlite3.Database((process.env.DB_LOCATION ?? "/config/") + "stats.db")
const DAYS_HISTORY = process.env.DAYS_HISTORY ?? 7
const http = require('http')
const { resolveSoa } = require('dns')
const { resolve } = require('path')
const server = http.createServer()
server.listen(8080)

// :: Set all methods!

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

const deleteVMLatest = (vmid) => {
    return new Promise((res, rej) => {
        db.run('DELETE FROM latest WHERE vmid=?', [vmid], (error, result) => {
            if (error) {
                rej(error)
            } else {
                res(result)
            }
        })
    })
}

const deleteVMStorage = (vmid) => {
    return new Promise((res, rej) => {
        db.run('DELETE FROM storage WHERE vmid=?', [vmid], (error, result) => {
            if (error) {
                rej(error)
            } else {
                res(result)
            }
        })
    })
}

const deleteVMInfo = (vmid) => {
    return new Promise((res, rej) => {
        db.run('DELETE FROM info WHERE id=?', [vmid], (error, result) => {
            if (error) {
                rej(error)
            } else {
                res(result)
            }
        })
    })
}

const is_in_latest = (id) => {
    return new Promise((res, rej) => {
        db.all('SELECT * FROM latest WHERE vmid=?', id, (error, result) => {
            if (error) {
                rej(error)
            } else {
                res(!!result[0])
            }
        })
    })
}

const purge_oldest = () => {
    return new Promise((res, rej) => {
        let weekAgo = new Date()
        weekAgo = Math.floor(weekAgo.getTime() / 1000)
        weekAgo -= 60 * 60 * 24 * DAYS_HISTORY
        db.run('DELETE FROM storage WHERE date < ?', weekAgo, (error, result) => {
            if (error) {
                rej(error)
            } else {
                res(result)
            }
        })
    })
}

db.serialize(async () => {
    await query("CREATE TABLE IF NOT EXISTS storage (date integer, vmid text, storagebytes integer, totalbytes integer)", 'run')
    await query("CREATE TABLE IF NOT EXISTS latest (date integer, vmid text, storagebytes integer, totalbytes integer)", 'run')
    await query("CREATE TABLE IF NOT EXISTS info (id integer primary key, name text, description text)", 'run')
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
        case '/api/vms/create-vm':
            (() => {
                let vmname = url.searchParams.get('name')
                let description = url.searchParams.get('description')
                if(!vmname || !description) {
                    res.writeHead(400)
                    return res.end('400 Bad Request')
                }


                db.serialize(async () => {
                    let insert = db.prepare("INSERT INTO info(name, description) VALUES(?, ?)")
                    insert.run(vmname, description)
                    insert.finalize()
                    res.writeHead(200)
                    res.end()
                })
            })()
            break
        case '/api/vms/get-info':
            (() => {
                db.serialize(async () => {
                    db.all('SELECT * FROM info', (error, result) => {
                        if (error) {
                            res.writeHead(500)
                            res.end('500 Internal Server Error')
                        } else {
                            res.writeHead(200, {'Content-Type': 'application/json'})
                            result = {vms: result}
                            res.end(JSON.stringify(result))
                        }
                    })
                })
            })()
            break
        case '/api/vms/edit-vm':
            (() => {
                db.serialize(() => {
                    let id = url.searchParams.get('id')
                    if(!id) {
                        res.writeHead(400)
                        return res.end('400 Bad Request')
                    }
    
                    let vmname = url.searchParams.get('name')
                    let description = url.searchParams.get('description')

                    db.all('SELECT * FROM info WHERE id=?', id, (error, result) => {
                        if (error) {
                            res.writeHead(500)
                            res.end('500 Internal Server Error')
                        } else {
                            let insert = db.prepare("UPDATE info SET name=?, description=? WHERE id=?")
                            insert.run(vmname ?? result[0]?.name, description ?? result[0]?.description, id)
                            insert.finalize()
                            res.writeHead(200)
                            res.end()
                        }
                    })
                })
            })()
            break
        case '/api/vms/delete-vm':
            (() => {
                let id = url.searchParams.get('id')
                if(!id) {
                    res.writeHead(400)
                    return res.end('400 Bad Request')
                }

                db.serialize(async () => {
                    await deleteVMInfo(id).catch(err => {
                        res.writeHead(500)
                        res.end()
                        return
                    })
                    await deleteVMStorage(id).catch(err => {
                        res.writeHead(500)
                        res.end()
                        return
                    })
                    await deleteVMLatest(id).catch(err => {
                        res.writeHead(500)
                        return res.end()
                    })
                    res.writeHead(200)
                    res.end()
                })
            })()
            break;
        case '/api/storage/insert':
            (() => {
                if(req.method != 'GET') {
                    res.writeHead(405)
                    return res.end('405 Method Not Allowed')
                }

                let id = url.searchParams.get('id')
                let sb = url.searchParams.get('sb')
                let tb = url.searchParams.get('tb')

                if(!id || !sb || !tb) {
                    res.writeHead(400)
                    return res.end('400 Bad Request')
                }

                let date = new Date()
                date = Math.floor(date.getTime() / 1000)
                
                db.serialize(async () => {
                    await purge_oldest().catch(err => {
                        res.writeHead(500)
                        return res.end('500 Internal Server Error')
                    })
                    let insert = db.prepare('INSERT INTO storage VALUES(?, ?, ?, ?)')
                    insert.run(date, id, sb, tb)
                    insert.finalize()
                    if (await is_in_latest(id)) {
                        db.run('UPDATE latest SET storagebytes=?, totalbytes=? WHERE vmid=?', [sb, tb, id], (error, result) => {
                            res.writeHead(200)
                            res.end()
                        })
                    } else {
                        db.run('INSERT INTO latest(date, vmid, storagebytes, totalbytes) VALUES(?, ?, ?, ?)', [date, id, sb, tb], (error, result) => {
                            res.writeHead(200)
                            res.end()
                        })
                    }
                })
            })()
            break
        case '/api/get-latest':
            (() => {
                if(req.method != 'GET') {
                    res.writeHead(405)
                    return res.end('405 Method Not Allowed')
                }

                db.serialize(async () => {
                    db.all('SELECT * FROM latest', (error, result) => {
                        if (error) {
                            res.writeHead(500)
                            res.end('500 Internal Server Error')
                        } else {
                            result.map((itm) => {
                                let date = new Date(itm.date * 1000)
                                date = date.toISOString()

                                return {
                                    date,
                                    vmid: itm.vmid,
                                    storagebytes: itm.sb,
                                    totalbytes: itm.tb
                                }
                            })
                            result = {values: result}

                            res.writeHead(200, {'Content-Type': 'application/json'})
                            res.end(JSON.stringify(result))
                        }
                    })
                })
            })()
            break
        case '/api/storage/get-vm':
            (() => {
                if(req.method != 'GET') {
                    res.writeHead(405)
                    return res.end('405 Method Not Allowed')
                }

                let id = url.searchParams.get('id')
                let time = url.searchParams.get('time')

                if(!id || !time) {
                    res.writeHead(400)
                    return res.end('400 Bad Request')
                }

                time = Math.floor(new Date().getTime() / 1000) - Math.floor(time * 60 * 60)

                db.serialize(async () => {
                    db.all('SELECT * FROM storage WHERE vmid=? AND date > ?', [id, time], (error, result) => {
                        if (error) {
                            res.writeHead(500)
                            res.end('500 Internal Server Error')
                        } else {
                            result.map((itm) => {
                                let date = new Date(itm.date * 1000)
                                date = date.toISOString()

                                return {
                                    date,
                                    storagebytes: itm.storagebytes,
                                    totalbytes: itm.totalbytes
                                }
                            })
                            result = {points: result}

                            res.writeHead(200, {'Content-Type': 'application/json'})
                            res.end(JSON.stringify(result))
                        }
                    })
                })
            })()
            break
        default:
            res.writeHead(404)
            res.end('404 Not Found')
            break
    }
})