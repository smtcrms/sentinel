import * as types from "./../Constants/action.names";
import axios from "axios";
const { execSync } = window.require("child_process");

export async function getKeysList(gaiaPath) {
    try {
        let output = execSync(`${gaiaPath} keys list --output json`);
        return {
            type: types.GET_KEYS_LIST,
            payload: output.toString()
        };
    } catch (err) {
        return {
            type: types.GET_KEYS_LIST,
            payload: ""
        };
    }
}

export async function getValidatorsList() {
    try {
        let url = `https://lcd.cosmostation.io/staking/validators`;
        let response = await axios.get(url, {
            headers: {
                Accept: "application/json",
                "Content-type": "application/json"
            }
        });
        return {
            type: types.GET_VAL_LIST,
            payload: response.data
        };
    } catch (err) {
        return {
            type: types.GET_VAL_LIST,
            payload: []
        };
    }
}
