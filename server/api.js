const mysql = require("mysql");
const conn = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT
});

class Api {
    users = []

    addUsersToLobby(id) {
        const u = this.users.find(v => v === id);
        if (!u) {
            this.users.push(id);
        }
    }

    deleteUsersFromLobby(id) {
        this.users = this.users.filter(i => i !== id);
    }

    getStartPage(req, res) {
        res.json({message: 'Server works!'})
    }

    addUser(req, res) {
        const query = `insert into game_users(name) values ('${req.body.name}');`;
        conn.query(query, (e, r) => {
            return e ? res.status(501).json(e) : res.json({id: r.insertId, name: req.body.name});
        })

    }

    deleteUser(req, res) {
        let id = req.params.id;
        const query = `delete from game_users where id = ${id}`;
        conn.query(query, (e, r) =>
            e ? res.status(501).json(e) : res.json({}));
    }

    sendError(status, message, ws) {
        ws.send(JSON.stringify({status, message}));
    }

    getGameValues(v) {
        const cols = [];
        for (let i = 1; i < 10; i++) {
            cols.push(
                {id: i, value: v[`c${i}`], name: `c${i}`}
            )
        }
        return {
            id: v.id,
            current: v.current,
            win1: v.win1,
            win2: v.win2,
            draw: v.draw,
            cols
        }
    }


    connect(msg, ws, aWss) {
        const {name, id} = JSON.parse(msg);
        ws.id = id;
        aWss.clients.forEach(c => {
            c.send(`User ${name} connected!`);
        })
    }

    start(msg, ws, aWss) {
        const id = JSON.parse(msg).id;
        this.addUsersToLobby(id);

        if (this.users.length > 1) {
            const p2 = this.users.find(u => u !== id);
            this.deleteUsersFromLobby(id);
            this.deleteUsersFromLobby(p2);
            const gameID = `rk${(+new Date).toString(20)}`;
            const query1 = `update game_users set gameid='${gameID}' where id in (${id},${p2});`;
            conn.query(query1, (e, r) => {
                if (e) return this.sendError(501, e, ws);
                const query2 = `select * from game_users where id in (${id},${p2});`;
                conn.query(query2, (e, r) => {
                    if (e) return this.sendError(501, e, ws);
                    const player_1 = {...r[0], sign: 0};
                    const player_2 = {...r[1], sign: 1};
                    const query3 = `insert into game_col(id) values('${gameID}');`;
                    conn.query(query3, (e, r) => {
                        if (e) return this.sendError(501, e, ws);
                        const query4 = `select * from game_col where id='${gameID}';`
                        conn.query(query4, (e, r) => {
                            if (e) return this.sendError(501, e, ws);

                            const result = {
                                player_1,
                                player_2,
                                game: this.getGameValues(r[0]),
                                method: 'start'
                            }

                            aWss.clients.forEach(c => {
                                if (c.id === player_1.id || c.id === player_2.id) {
                                    c.send(JSON.stringify(result));
                                }
                            });
                        });
                    });
                });
            })
        }
    };

    changeValue(msg, ws, aWss) {
        const {gameid, name, sign, p1, p2} = JSON.parse(msg);
        conn.query(`select * from game_col where id='${gameid}';`, (e, r) => {
            if (e) return this.sendError(501, e, ws);
            if (r[0].current !== sign) {
                return this.sendError(402, 'Please, wait for your step!', ws);
            } else {
                const query = `update game_col set ${name} = ${sign},current=${sign === 0 ? 1 : 0} where id='${gameid}';`;
                conn.query(query, (e, r) => {
                    if (e) return this.sendError(501, e, ws);
                    const query1 = `select * from game_col where id='${gameid}';`;
                    conn.query(query1, (e, r) => {
                        if (e) return this.sendError(501, e, ws);
                        const game = this.getGameValues(r[0]);
                        aWss.clients.forEach(c => {
                            if (c.id === p1 || c.id === p2) {
                                c.send(JSON.stringify({
                                    method: 'change',
                                    game
                                }))
                            }
                        })
                    });
                });
            }
        })
    };

    stop(msg, ws, aWss) {
        const {gameid, win, p1, p2} = JSON.parse(msg);
        const query = `select * from game_col where id='${gameid}';`;
        conn.query(query, (e, r) => {
            if (e) return this.sendError(501, e, ws);
            const draw = win === null ? r[0].draw + 1 : r[0].draw;
            const win1 = win === p1.sign ? r[0].win1 + 1 : r[0].win1;
            const win2 = win === p2.sign ? r[0].win2 + 1 : r[0].win2;
            let query1 = `update game_col set draw=${draw}, win1=${win1}, win2=${win2} where id='${gameid}';`;
            conn.query(query1, (e, r) => {
                if (e) return this.sendError(501, e, ws);
                conn.query(query, (e, r) => {
                    if (e) return this.sendError(501, e, ws);
                    const result = {
                        game: this.getGameValues(r[0]),
                        method: 'stop'
                    }
                    aWss.clients.forEach(c => {
                        if (c.id === p1.id || c.id === p2.id) {
                            c.send(JSON.stringify(result));
                        }
                    });
                });
            });
        })
    }

    reset(msg, ws, aWss) {
        const {gameid, p1, p2} = JSON.parse(msg);
        const query = `update game_col set c1=null, c2=null, c3=null, c4=null, c5=null, c6=null, c7=null, c8=null, c9=null where id='${gameid}';`;
        conn.query(query, (e, r) => {
            if (e) return this.sendError(501, e, ws);
            const query1 = `select * from game_col where id='${gameid}';`;
            conn.query(query1, (e, r) => {
                if (e) return this.sendError(501, e, ws);
                const result = {
                    game: this.getGameValues(r[0]),
                    method: 'reset'
                }

                aWss.clients.forEach(c => {
                    if (c.id === p1 || c.id === p2) {
                        c.send(JSON.stringify(result));
                    }
                });
            });
        });
    }
}

module.exports = new Api();