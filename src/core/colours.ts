
export function randomColour() {
    let samples = "A1B2C3D4E5F6A7B8D9E0F1";
    let gen = '#';
    for(let i = 0; i<6;i++) {
        gen += samples[Math.floor(Math.random() * (samples.length - 1))];
    }
    return gen;
}

let os_colours_map = {
    windows: "#2272B6",
    linux: "#F1BB13",
    ubuntu: "#DD4814",
    mac: "#030104"
};

let browser_colours_map = {

};