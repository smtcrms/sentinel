const electron = window.require("electron");
const remote = electron.remote;
const { execSync } = window.require("child_process");
const path = window.require("path");

export function getGaiaclipath() {
    if (remote.process.platform === "linux") {
        let path = "public/gaiacli";
        execSync(`chmod +x ${path}`);
        return path;
    } else if (remote.process.platform === "darwin") {
        let gaiacliPath = path.join(remote.process.resourcesPath, "gaiacli");
        execSync(`chmod +x ${gaiacliPath}`);
        return gaiacliPath;
    } else {
        return "resources\\extras\\gaiacli.exe";
    }
}
