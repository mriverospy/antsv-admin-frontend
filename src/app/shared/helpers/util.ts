export const headers = { "Content-Type": "application/json;charset=utf-8" };

export function formatDate(data: string) {
    if(data == null) return '';
    let dft = data.split('T');
    let df = dft[0].split('-');
    return toDate(df);
}

export function toDate(df: string[]) {
    return new Date(
        Number(df[0]),
        Number(df[1]),
        Number(df[2])
    );
}

