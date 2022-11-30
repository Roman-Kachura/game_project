import axios, {AxiosResponse} from 'axios';

//'https://itransition-chat-server.herokuapp.com/'
const $api = axios.create({
    baseURL: 'http://localhost:5000/'
});

export const api = {
    enterToGame(name: string) {
        return $api.post<AxiosResponse, AxiosResponse<UserType>>('users', {name});
    },
    leaveGame(id: number) {
        return $api.delete<AxiosResponse>(`users/${id}`);
    }
}

export type UserType = {
    gameid: string | null
    id: number
    name: string
    sign:number
}