import React from 'react';
import s from './style.module.css';
import {Header} from './Header';
import {AppRouter} from './AppRouter';

export const App: React.FC = () => {
    return (
        <div className={s.app}>
            <Header/>
            <AppRouter/>
        </div>
    )
}
