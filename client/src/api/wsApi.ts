//wss://localhost:5000/
import {UserType} from './api';

const url = 'ws://localhost:5000/';

export const wsApi = {
    createSocket() {
        return new WebSocket(`${url}game`);
    },
    connect(ws: WebSocket, name: string, id: number) {
        ws.send(JSON.stringify({name, id, method: 'connect'}));
    },
    start(ws: WebSocket, id: number) {
        ws.send(JSON.stringify({id, method: 'start'}));
    },
    changeValue(ws: WebSocket,v:ChangeValueObjectType){
        ws.send(JSON.stringify({...v,method:'change'}));
    },
    stop(ws: WebSocket,v:stopValuesType){
        ws.send(JSON.stringify({...v,method:'stop'}));
    }
}

export type GameValueType = {
    id: string
    current:number
    win1: number
    win2: number
    draw: number
    cols: ColumnType[]
}

export type ColumnType = { id: number, name: string, value: number | null };
export type ChangeValueObjectType = {
    gameid:string
    name:string
    sign:number
    p1:number
    p2:number
};
export type stopValuesType = {
    gameid:string
    win: number | null
    p1:UserType
    p2:UserType
}

export type GamePlayerType = UserType & {
    sign: number
}