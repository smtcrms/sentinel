import chai from "chai";
import chaiHttp from "chai-http";

import server from "../../../src";
import {
  Swap
} from "../../../src/models";

const expect = chai.expect;
const should = chai.should();

chai.use(chaiHttp);

const getAvailableTokens = '/api/swaps/available';
const getExchangeValue = '/api/swaps/exchange';
const getSwapStatus = '/api/swaps/status';
const getNewAddress = '/api/swaps/new-address';
const getPendingSwix = '/api/swaps/pending';

let exchangeData = {
  from: 'ETH',
  to: 'SENT',
  value: 1e16
}

let key = {
  key: '0xcb32c7e2c1fb4335d5450c9d172cde05e7b126bc'
}

let getNewAddressData = {
  account_addr: '0xcb32c7e2c1fb4335d5450c9d172cde05e7b126bc',
  from: 'PIVX',
  to: 'SENT',
}

describe('Route for get available tokens', () => {
  describe('/GET ' + getAvailableTokens, () => {

    it('it should return available tokens', (done) => {
      chai.request(server)
        .get(getAvailableTokens)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          done();
        });
    }).timeout(20000)
  });
});

describe('Route for get exchange value', () => {
  describe('/GET ' + getExchangeValue, () => {

    it('it should return exchange value for given amount', (done) => {
      chai.request(server)
        .get(getExchangeValue)
        .query(exchangeData)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          done();
        });
    }).timeout(20000)
  });
});

describe('Route for checking status of tx', () => {
  describe('/GET ' + getSwapStatus, () => {

    it('it should return status of the tx', (done) => {
      chai.request(server)
        .get(getSwapStatus)
        .query(key)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          done();
        });
    }).timeout(20000)
  });
});

describe('Route for getting new address', () => {
  describe('/POST ' + getNewAddress, () => {

    after((done) => {
      Swap.findOneAndRemove({
        to_address: getNewAddressData.account_addr,
        status: 0,
      }, (error, resp) => {
        done();
      })
    })
    it('it should return the new deposit address', (done) => {
      chai.request(server)
        .post(getNewAddress)
        .send(getNewAddressData)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          done();
        });
    }).timeout(20000)
  });
});

describe('Route for get pending address', () => {
  describe('/POST ' + getPendingSwix, () => {

    it('it should return list of pending swap list', (done) => {
      chai.request(server)
        .get(getPendingSwix)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          done();
        });
    }).timeout(20000)
  });
});
