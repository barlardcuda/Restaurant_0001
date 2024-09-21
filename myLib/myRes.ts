interface myRes {
    status: number
    desc: string
    cmd: string
}

export function myRes(statusIn: number, descIn: string, cmdIn: string = ""): myRes {
    const result: myRes = {
        status: statusIn,
        desc: descIn,
        cmd: cmdIn
    }
    return result
}