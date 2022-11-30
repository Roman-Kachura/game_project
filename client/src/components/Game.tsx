import React, {useEffect, useState} from 'react';
import {Navigate, useLocation} from 'react-router-dom';
import {useSelector} from 'react-redux';
import {RootState, useAppDispatch} from '../store/store';
import {ProfileInitialStateType} from '../store/reducers/profileReducer';
import s from './style.module.css';
import {Button, Grid} from '@material-ui/core';
import {Close, TripOrigin} from '@material-ui/icons';
import {ColumnType, wsApi} from '../api/wsApi';
import {connectThunk, GameInitialStateType, onMessage, stopThunk} from '../store/reducers/gameReducer';
import {UserType} from '../api/api';

export const Game: React.FC = () => {
    const location = useLocation();
    const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
    const {isAuth, user} = useSelector<RootState, ProfileInitialStateType>(state => state.profile);
    const gameid = useSelector<RootState, string>(state => state.game.game.id);
    const current = useSelector<RootState, number>(state => state.game.game.current);
    const disabledButton = current !== user.sign;
    const game = useSelector<RootState, GameInitialStateType>(state => state.game);
    const {player_1, player_2} = game;
    const dispatch = useAppDispatch()
    const createWebSocket = () => {
        setWebSocket(wsApi.createSocket());
    }

    const closeHandler = () => {
        setTimeout(() => createWebSocket(), 3000);
    }
    const startGame = () => {
        webSocket && wsApi.start(webSocket, user.id);
    }
    const changeValue = (name: string) => {
        if (webSocket) {
            if (player_1 && player_2) {
                wsApi.changeValue(webSocket, {
                    gameid,
                    name,
                    sign: user.sign,
                    p1: player_1.id,
                    p2: player_2.id
                })
            }
        }
    }
    const stopGame = (win: number | null) => {
        if (webSocket) {
            if (player_1 && player_2) {
                dispatch(stopThunk({
                    ws: webSocket,
                    v: {
                        p1: player_1,
                        p2: player_2,
                        gameid,
                        win
                    }
                }));
            }
        }
    }
    useEffect(() => {
        webSocket?.removeEventListener('close', closeHandler);
        const ws = wsApi.createSocket();
        setWebSocket(ws);
        ws.addEventListener('close', closeHandler);
        return ws.removeEventListener('close', closeHandler);
    }, []);
    useEffect(() => {
        if (webSocket) {
            webSocket.addEventListener('open', () => {
                dispatch(connectThunk({ws: webSocket, name: user.name, id: user.id}))
            });
            webSocket.addEventListener('message', (msg) => {
                dispatch(onMessage({d: msg.data, id: user.id}))
            });
        }

    }, [webSocket])
    if (!isAuth) return <Navigate to="/login"/>;
    if (!location.pathname.replace('/game', '') && user.gameid) {
        return <Navigate to={`/game/${user.gameid}`}/>
    }
    if (!user.gameid) return <Lobby startCallBack={startGame}/>

    return <Board changeValueCallBack={changeValue} disabledButton={disabledButton} game={game} user={user}
                  stopGame={stopGame}/>
}

const Lobby: React.FC<{ startCallBack: () => void }> = ({startCallBack}) => {
    return (
        <Grid container className={s.game} alignItems="center" justifyContent="center">
            <Button
                onClick={startCallBack}
                className={s.startButton}
                color="primary"
                variant="contained"
            >start</Button>
        </Grid>
    )
}

const Board: React.FC<{
    changeValueCallBack: (name: string) => void,
    disabledButton: boolean,
    game: GameInitialStateType,
    user: UserType,
    stopGame: (win: number | null) => void
}> = (
    {changeValueCallBack, disabledButton, game, user, stopGame}
) => {
    const {cols} = game.game;
    const changeValue = (name: string) => changeValueCallBack(name);
    const stop = useSelector<RootState,boolean>(state => state.game.stop);
    useEffect(() => {
        const c = checkWin(cols);
        if(c === null || c === 0 || c === 1){
            stopGame(c);
        }
    }, [cols]);
    return (
        <Grid container className={s.game} alignItems="center" justifyContent="center">
            <div className={s.player1}>
                <h3>{game.player_1?.name === user.name ? 'You' : game.player_1?.name}</h3>
                <div>Won: {game.game.win1}</div>
            </div>
            <div className={s.player2}>
                <h3>{game.player_2?.name === user.name ? 'You' : game.player_2?.name}</h3>
                <div>Won: {game.game.win2}</div>
            </div>
            <div className={s.draw}>
                <div>Draw: {game.game.draw}</div>
            </div>
            {stop && <Button className={s.resetButton} onClick={() => {
            }} variant="contained" color="secondary">Reset</Button>}
            <div className={s.table}>
                {
                    cols.map(c => <BoardItem key={c.id} c={c} changeValue={changeValue}
                                             disabledButton={disabledButton}/>)
                }
            </div>
        </Grid>
    )
}

const BoardItem: React.FC<BoardItemPropsType> = (
    {c, changeValue, disabledButton}
) => {
    const onClickHandler = () => changeValue(c.name);
    const stop = useSelector<RootState,boolean>(state => state.game.stop);
    return <button
        id={`${c.id}`}
        onClick={onClickHandler}
        disabled={c.value !== null || disabledButton || stop}
        className={`${s.tableItem}`}>
        {c.value === 0 && <TripOrigin style={{height: '80%', width: '80%', color: 'red'}}/>}
        {c.value === 1 && <Close style={{height: '80%', width: '80%', color: 'green'}}/>}
    </button>
}

const checkWin = (cols: ColumnType[]) => {
    const c = cols.map(c => c.value === 0 ? {...c, value: 'o'} : {...c, value: 'x'});
    const win = [
        c[0].value + c[1].value + c[2].value,
        c[3].value + c[4].value + c[5].value,
        c[6].value + c[7].value + c[8].value,
        c[0].value + c[3].value + c[6].value,
        c[1].value + c[5].value + c[7].value,
        c[2].value + c[5].value + c[8].value,
        c[0].value + c[4].value + c[8].value,
        c[2].value + c[4].value + c[6].value
    ].find(s => {
        if (s === 'ooo') return s;
        if (s === 'xxx') return s;
    });

    if (win === 'xxx') return 1;
    if (win === 'ooo') return 0;
    if(!cols.find(c => c.value === null)) return null;
};

type BoardItemPropsType = { c: ColumnType, changeValue: (name: string) => void, disabledButton: boolean }