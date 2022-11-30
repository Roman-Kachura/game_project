import React, {ChangeEvent, useState} from 'react';
import {Box, Button, Grid, Paper, TextField} from '@material-ui/core';
import s from './style.module.css';
import {useSelector} from 'react-redux';
import {RootState, useAppDispatch} from '../store/store';
import {enterToGameThunk, ProfileInitialStateType} from '../store/reducers/profileReducer';
import {Navigate} from 'react-router-dom';

export const Login: React.FC = () => {
    const [name, setName] = useState('');
    const {isAuth} = useSelector<RootState, ProfileInitialStateType>(state => state.profile);
    const dispatch = useAppDispatch();
    const onClickHandler = () => {
        !!name && dispatch(enterToGameThunk({name}));
    }
    const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
        setName(e.currentTarget.value);
    }
    if (isAuth) return <Navigate to='/game'/>;
    return (
        <>
            <Grid
                container
                alignItems="center"
                justifyContent="center"
                direction="column"
                className={s.login}
            >
                <Paper>
                    <Box className={s.loginBox}>
                        <TextField
                            color="primary"
                            style={{width: '100%'}}
                            variant="outlined"
                            label="Your name"
                            value={name}
                            onChange={onChangeHandler}
                        />
                        <Button
                            color="secondary"
                            style={{width: '100%', height: '40px', marginTop: '20px'}}
                            variant="contained"
                            onClick={onClickHandler}
                        >
                            Enter
                        </Button>
                    </Box>
                </Paper>
            </Grid>
        </>
    )
}