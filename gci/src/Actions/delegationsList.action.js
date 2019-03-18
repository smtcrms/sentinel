import * as types from "./../Constants/action.names";
import { GAIA_NODE, CHAIN_ID } from "./../Constants/config";
const { execSync } = window.require("child_process");

export async function getDelegationsList(gaiaPath, address) {
    try {
        let output = execSync(
            `${gaiaPath} query staking delegations ${address} --node ${GAIA_NODE} --chain-id ${CHAIN_ID} --output json`
        );
        return {
            type: types.GET_DEL_LIST,
            payload: output.toString()
        };
    } catch (err) {
        return {
            type: types.GET_DEL_LIST,
            payload: ""
        };
    }
}
