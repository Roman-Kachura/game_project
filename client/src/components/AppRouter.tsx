import React from 'react';
import {Navigate, Route, Routes, useLocation, useParams} from 'react-router-dom';
import {Login} from './Login';
import {Game} from './Game';

export const AppRouter: React.FC = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login/>}/>
            <Route path={'/game/:id'} element={<Game/>}/>
            <Route path={'*'} element={<Game/>}/>
        </Routes>
    )
}