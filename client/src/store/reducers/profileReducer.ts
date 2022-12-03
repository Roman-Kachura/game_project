import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {api, UserType} from '../../api/api';
import {clearGame, setStop} from './gameReducer';

const initialState: ProfileInitialStateType = {
    isAuth: false,
    user: {} as UserType
}

export const enterToGameThunk = createAsyncThunk('enter-to-game', async (arg: { name: string }, thunkAPI) => {
    const user = await api.enterToGame(arg.name);
    thunkAPI.dispatch(setProfile(user.data));
});

export const leaveGameThunk = createAsyncThunk('leave-game', async (arg: { id: number }, thunkAPI) => {
    const res = await api.leaveGame(arg.id);
    thunkAPI.dispatch(clearProfile());
    thunkAPI.dispatch(setStop(false));
    thunkAPI.dispatch(clearGame());
});

const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        setProfile(state, action) {
            state.isAuth = true;
            state.user = action.payload;
        },
        clearProfile(state) {
            state.isAuth = false;
            state.user = {} as UserType;
        }
    }
});

export const {setProfile, clearProfile} = profileSlice.actions;
export default profileSlice.reducer;

export type ProfileInitialStateType = {
    isAuth: boolean
    user: UserType
}