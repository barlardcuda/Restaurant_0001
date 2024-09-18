interface myRes {
    status: number;
    desc: string;
}

export function myRes(statusIn: number, descIn: string): myRes {
    const result: myRes = {
        status: statusIn,
        desc: descIn
    };
    return result
}