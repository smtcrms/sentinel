import { SENT_TEST_HISTORY, ETH_TEST_HISTORY } from '../Constants/action.names';
import config from '../Constants/config'
import axios from 'axios';


export function testSENTTxns(data) {

    console.log('inside action: ', data);
    let uri = `${config.test.sentTransUrl1}${data.account_addr}&topic1_2_opr=or&topic2=${data.account_addr}`;
    const request = axios.get(uri);

    return {
        payload: request,
        type: SENT_TEST_HISTORY
    }
}

export function testETHTxns(data) {

    const request = axios.get(`${config.test.ethTransUrl}${data.account_addr}&page=${data.page}&offset=10&sort=desc`);

    return {
        payload: request,
        type: ETH_TEST_HISTORY
    }
}