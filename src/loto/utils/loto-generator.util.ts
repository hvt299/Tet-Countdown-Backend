export function generateLotoTicket(): number[][] {
    const ticket = Array.from({ length: 3 }, () => Array(9).fill(0));
    const colsCount = Array(9).fill(0);

    for (let r = 0; r < 3; r++) {
        let placed = 0;
        while (placed < 5) {
            const c = Math.floor(Math.random() * 9);
            if (ticket[r][c] === 0) {
                ticket[r][c] = 1;
                colsCount[c]++;
                placed++;
            }
        }
    }

    const ranges = [
        { min: 1, max: 9 },
        { min: 10, max: 19 },
        { min: 20, max: 29 },
        { min: 30, max: 39 },
        { min: 40, max: 49 },
        { min: 50, max: 59 },
        { min: 60, max: 69 },
        { min: 70, max: 79 },
        { min: 80, max: 90 }
    ];

    for (let c = 0; c < 9; c++) {
        if (colsCount[c] > 0) {
            const range = ranges[c];
            const pool: number[] = [];
            for (let i = range.min; i <= range.max; i++) pool.push(i);

            const picked: number[] = [];
            for (let i = 0; i < colsCount[c]; i++) {
                const idx = Math.floor(Math.random() * pool.length);
                picked.push(pool.splice(idx, 1)[0]);
            }

            picked.sort((a, b) => a - b);

            let pIdx = 0;
            for (let r = 0; r < 3; r++) {
                if (ticket[r][c] === 1) {
                    ticket[r][c] = picked[pIdx++];
                }
            }
        }
    }

    return ticket;
}