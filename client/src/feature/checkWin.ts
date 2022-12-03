import {ColumnType} from '../api/wsApi';

export const checkWin = (cols: ColumnType[]) => {
    const c = cols.map(c => {
        if (c.value === 0) return {...c, value: 'o'};
        if (c.value === 1) return {...c, value: 'x'};
        return {...c, value: 'n'};
    });

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
    if (!cols.find(c => c.value === null)) return null;
};