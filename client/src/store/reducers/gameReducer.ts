import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {GameValueType, wsApi} from '../../api/wsApi';
import {UserType} from '../../api/api';
import {setProfile} from './profileReducer';
import {checkWin} from '../../feature/checkWin';

const initialState: GameInitialStateType = {
    game: {} as GameValueType,
    player_1: null,
    player_2: null,
    stop: false
}

export const onMessage = createAsyncThunk('start-game', async (arg: { ws: WebSocket, d: string, id: number }, thunkAPI) => {
    const data = JSON.parse(arg.d);
    const {method} = data;
    switch (method) {
        case 'start':
            thunkAPI.dispatch(setGame(data));
            thunkAPI.dispatch(setPlayers(data));
            if (arg.id === data.player_1.id) thunkAPI.dispatch(setProfile(data.player_1));
            if (arg.id === data.player_2.id) thunkAPI.dispatch(setProfile(data.player_2));
            break;
        case 'change':
            const check = checkWin(data.game.cols);
            thunkAPI.dispatch(setGame(data));
            if (check === 0 || check === 1 || check === null) {
                thunkAPI.dispatch(setStop(true));
                const state: any = thunkAPI.getState();
                if (state.game.game.current === state.profile.user.sign) {
                    wsApi.stop(arg.ws, {
                        gameid: state.game.game.id,
                        win: check,
                        p1: state.game.player_1,
                        p2: state.game.player_2,
                    });
                }
            }
            break;
        case 'stop':
            thunkAPI.dispatch(setGame(data));
            thunkAPI.dispatch(setStop(true));
            break;
        case 'reset':
            thunkAPI.dispatch(setGame(data));
            thunkAPI.dispatch(setStop(false));
            break;
    }
});


const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        setGame(state, action) {
            state.game = action.payload.game
        },
        setPlayers(state, action) {
            state.player_1 = action.payload.player_1
            state.player_2 = action.payload.player_2
        },
        clearGame(state) {
            state = initialState;
        },
        setStop(state, action) {
            state.stop = action.payload;
        }
    }
});

export const {setGame, setPlayers, setStop, clearGame} = gameSlice.actions;
export default gameSlice.reducer;

export type GameInitialStateType = {
    game: GameValueType
    player_1: UserType | null
    player_2: UserType | null
    stop: boolean
}