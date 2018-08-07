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


// SENT_TRANSC_URL1 + account_addr + SENT_TRANSC_URL2 + account_addr
//     try {
//         if (localStorage.getItem('config') === 'TEST')
//             ETH_TRANSC_URL = config.test.ethTransUrl
//         else
//             ETH_TRANSC_URL = config.main.ethTransUrl
//         fetch(ETH_TRANSC_URL + account_addr + '&page=' + page + "&offset=10&sort=desc", {
//             method: 'GET',
//             headers: {
//                 'Accept': 'application/json',
//                 'Content-type': 'application/json',
//             }
//         }).then(function (response) {
//             response.json().then(function (response) {
//                 if (response.status === '1') {
//                     var history = response['result'];
//                     cb(null, history);
//                 } else cb({ message: 'Error occurred while getting transaction history.' }, null);
//             });
//         });
// }