import chai from "chai";
import chaiHttp from "chai-http";

import server from "../../../src";
import {
  SwixerNodes,
  Swixes
} from "../../../src/models";

const expect = chai.expect;
const should = chai.should();

chai.use(chaiHttp);

const getSwixDetailsRoute = '/api/swix'
const getExchangeValueRoute = '/api/swix/rate'
const getSwixerNodesListRoute = '/api/swix/list'
const getSwixStatusRoute = '/api/swix/status'
const registerSwixerNodeRoute = '/api/swix/register'
const deRegisterSwixerNodeRoute = '/api/swix/deregister'
const updateSwixerNodeInfoRoute = '/api/swix/update-nodeinfo'

const registerDetails = {
  "account_addr": "0x47bd80a152d0d77664d65de5789df575c9caaaaa",
  "ip": "185.181.8.90",
  "service_charge": 5,
  "joined_on": 1530809657,
  "swixer": {
    "status": "up",
    "init_on": 1530809683,
    "ping_on": 1530809683
  }
}

const getSwixDetails = {
  "node_address": "0x47bd80a152d0d77664d65de5789df575c9caaaaa",
  "from_symbol": "SENT",
  "to_symbol": "SENT",
  "client_address": "0x47bd80a152d0d77664d65de5789df575c9cabbbb",
  "destination_address": "0x47bd80a152d0d77664d65de5789df575c9cabbbb",
  "delay_in_seconds": 60,
  "address": "0xe614ddf71de5890c16b5b48c2549cbc588771db8",
}

const exchangeData = {
  'node': '0x47bd80a152d0d77664d65de5789df575c9caaaaa',
  'from': 'SENT',
  'to': 'PIVX',
  'value': '10000000000'
}

const swixStatusData = {
  'hash': '13f38e66e9b7cee205c9b46cea39154d'
}

const updateSwixerNodeDetails = {
  account_addr: '0x47bd80a152d0d77664d65de5789df575c9caaaaa',
  info: {
    type: 'swixer'
  }
}

const updateAliveNodeDetails = {
  account_addr: '0x47bd80a152d0d77664d65de5789df575c9caaaaa',
  info: {
    type: 'alive'
  }
}

let token = null

describe('Route for register swixer node', () => {
  describe('/POST ' + registerSwixerNodeRoute, () => {

    it('should create the swixer node', (done) => {
      chai.request(server)
        .post(registerSwixerNodeRoute)
        .send(registerDetails)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          done();
        });
    }).timeout(10000)
  });
});

describe('Route for update swixer node ', () => {
  describe('/POST ' + updateSwixerNodeInfoRoute, () => {

    before((done) => {
      SwixerNodes.findOne({
        account_addr: registerDetails['account_addr']
      }, (err, resp) => {
        updateSwixerNodeDetails.token = resp.token
        updateAliveNodeDetails.token = resp.token
        done();
      })
    });

    it('should update the swixer node with details', (done) => {
      chai.request(server)
        .post(updateSwixerNodeInfoRoute)
        .send(updateSwixerNodeDetails)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          done();
        });
    }).timeout(10000)

    it('should update the swixer node with alive', (done) => {
      chai.request(server)
        .post(updateSwixerNodeInfoRoute)
        .send(updateAliveNodeDetails)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          done();
        });
    }).timeout(10000)
  });
});

describe('Route for get swixer nodes list', () => {
  describe('/GET ' + getSwixerNodesListRoute, () => {

    it('should return list of swixer nodes', (done) => {
      chai.request(server)
        .get(getSwixerNodesListRoute)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          done();
        });
    }).timeout(10000)
  });
});

describe('Route for get swix rate', () => {
  describe('/GET ' + getExchangeValueRoute, () => {

    it('should return exchange price', (done) => {
      chai.request(server)
        .get(getExchangeValueRoute)
        .query(exchangeData)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          done();
        });
    }).timeout(10000)
  });
});

describe('Route for get swix details', () => {
  describe('/POST ' + getSwixDetailsRoute, () => {

    it('it should return swix details on success ', (done) => {
      chai.request(server)
        .post(getSwixDetailsRoute)
        .send(getSwixDetails)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          done();
        });
    }).timeout(10000)
  });
});

describe('Route for get swix status', () => {
  describe('/GET ' + getSwixStatusRoute, () => {
    before((done) => {
      Swixes.findOne({
        node_address: getSwixDetails.node_address,
        client_address: getSwixDetails.client_address,
        destination_address: getSwixDetails.destination_address
      }, (error, resp) => {
        swixStatusData.hash = resp.swix_hash;
        done()
      })
    })

    after((done) => {
      Swixes.findOneAndRemove({
        node_address: getSwixDetails.node_address,
        client_address: getSwixDetails.client_address,
        destination_address: getSwixDetails.destination_address
      }, (err, resp) => {
        done();
      })
    })

    it('should return status of the swix', (done) => {
      chai.request(server)
        .get(getSwixStatusRoute)
        .query(swixStatusData)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          done();
        });
    }).timeout(20000)
  });
});

describe('Route for deregister swixer node', () => {
  describe('/POST ' + deRegisterSwixerNodeRoute, () => {

    before((done) => {
      SwixerNodes.findOne({
        account_addr: registerDetails['account_addr']
      }, (err, resp) => {
        registerDetails.token = resp.token;
        done();
      })
    });

    it('should remove the swix node', (done) => {
      chai.request(server)
        .post(deRegisterSwixerNodeRoute)
        .send(registerDetails)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          done();
        });
    }).timeout(10000);
  });
});
