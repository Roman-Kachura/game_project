import React from 'react';
import {RootState, useAppDispatch} from '../store/store';
import {AppBar, Button, Grid, Toolbar} from '@material-ui/core';
import {useSelector} from 'react-redux';
import {leaveGameThunk, ProfileInitialStateType} from '../store/reducers/profileReducer';

export const Header: React.FC = () => {
    const {isAuth, user} = useSelector<RootState, ProfileInitialStateType>(state => state.profile);
    const dispatch = useAppDispatch();
    const onClickHandler = () => {
        dispatch(leaveGameThunk({id: user.id}));
    }
    return (
        <AppBar position="fixed" color="primary" style={{height: '10vh', width: '100%'}}>
            <Toolbar>
                <Grid container alignItems="center" justifyContent="flex-start">
                    <div style={{display: 'flex', justifyContent: 'center', marginRight: '20px'}}>
                        {isAuth && <Button color='inherit' onClick={onClickHandler}>Leave</Button>}
                    </div>
                </Grid>
            </Toolbar>
        </AppBar>
    )
}
