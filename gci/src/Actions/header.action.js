import * as types from "./../Constants/action.names";
import { GAIA_NODE, CHAIN_ID } from "./../Constants/config";
const { execSync } = window.require("child_process");
const electron = window.require("electron");
const remote = electron.remote;

export function getBalance(gaiaPath, address) {
    try {
        let output = execSync(
            `${gaiaPath} query account ${address} --node ${GAIA_NODE} --chain-id ${CHAIN_ID} --output json`
        );
        return {
            type: types.GET_BALANCE,
            payload: output.toString()
        };
    } catch (err) {
        console.log("Error..", err);
        return {
            type: types.GET_BALANCE,
            payload: ""
        };
    }
}
