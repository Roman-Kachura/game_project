import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {GameValueType, stopValuesType, wsApi} from '../../api/wsApi';
import {UserType} from '../../api/api';
import {setProfile} from './profileReducer';

const initialState: GameInitialStateType = {
    game: {} as GameValueType,
    player_1: null,
    player_2: null,
    stop: false
}

export const connectThunk = createAsyncThunk('connect-game', async (arg: { ws: WebSocket, name: string, id: number }, thunkAPI) => {
    wsApi.connect(arg.ws, arg.name, arg.id);
});

export const startThunk = createAsyncThunk('start-game', async (arg: { ws: WebSocket, id: number }, thunkAPI) => {
    wsApi.start(arg.ws, arg.id);
});

export const stopThunk = createAsyncThunk('stop-game', async (arg: { ws: WebSocket, v: stopValuesType }, thunkAPI) => {
    thunkAPI.dispatch(setStop(true));
    wsApi.stop(arg.ws, arg.v);
});

export const onMessage = createAsyncThunk('start-game', async (arg: { d: string, id: number }, thunkAPI) => {
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
            thunkAPI.dispatch(setGame(data));
            break;
        case 'stop':
            thunkAPI.dispatch(setGame(data));
            setStop(true);
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
        setStop(state, action) {
            state.stop = action.payload;
        }
    }
});

export const {setGame, setPlayers, setStop} = gameSlice.actions;
export default gameSlice.reducer;

export type GameInitialStateType = {
    game: GameValueType
    player_1: UserType | null
    player_2: UserType | null
    stop: boolean
}