# coding=utf-8
import json

import falcon
import requests

from ..db import db
from ..helpers import tokens


def get_swixer_nodes_list():
    _list = db.swixer_nodes.find({
        'swixer.status': 'up'
    }, {
        '_id': 0,
        'account_addr': 1,
        'ip': 1,
        'service_charge': 1
    })

    return list(_list)


def get_account(ip, from_symbol, to_symbol, client_address, destination_address, delay_in_seconds,rate,refund_address, amount):
    try:
        url = 'http://{}:3000/account'.format(ip)
        res = requests.post(url, json={
            'fromSymbol': from_symbol,
            'toSymbol': to_symbol,
            'clientAddress': client_address,
            'destinationAddress': destination_address,
            'delayInSeconds': delay_in_seconds,
            'rate':rate,
            'refundAddress':refund_address,
            'value': amount
        })
        res = res.json()
        if res['success']:
            return None, {
                'swix_hash': res['swixHash'],
                'address': res['address']
            }
        else:
            return {
                'message': res['message']
            }, None
    except Exception as error:
        print(error)
        return None


def get_swix_status(ip, swix_hash):
    try:
        url = 'http://{}:3000/status?swixHash={}'.format(ip, swix_hash)
        res = requests.get(url)
        res = res.json()
        if res['success']:
            return {
                'status': res['swixStatus'],
                'from_token': res['fromToken'],
                'to_token': res['toToken'],
                'destination_address': res['destAddr'],
                'tx_infos': res['txInfos'],
                'remaining_amount': res['remainingAmount'] if 'remainingAmount' in res else None
            }
        else:
            return None
    except Exception as error:
        print(error)
        return None


def get_pending_swix(ip):
   try:
        url = 'http://{}:3000/pending'.format(ip)
        res = requests.get(url)
        res = res.json()
        if res['success']:
            return res['result']
        else:
            return None
   except Exception as error:
        print(error)
        return None

class GetSwixStatus(object):
    def on_get(self, req, resp):
        swix_hash = str(req.get_param('hash'))
        swix = db.swixes.find_one({
            'swix_hash': swix_hash
        })
        if swix is None:
            message = {
                'success': False,
                'message': 'No swix found.'
            }
        else:
            node = db.swixer_nodes.find_one({
                'account_addr': swix['node_address'],
                'swixer.status': 'up'
            })
            if node is None:
                message = {
                    'success': False,
                    'message': 'No swixer node found.'
                }
            else:
                details = get_swix_status(node['ip'], swix_hash)
                if details is None:
                    message = {
                        'success': False,
                        'message': 'Error occured while getting swix status.'
                    }
                else:
                    message = {
                        'success': True,
                        'status': details['status'],
                        'from_symbol': details['from_token'],
                        'to_symbol': details['to_token'],
                        'dest_addr': details['destination_address'],
                        'tx_infos': details['tx_infos'],
                        'remaining_amount': details['remaining_amount']
                    }

        resp.status = falcon.HTTP_200
        resp.body = json.dumps(message)


class GetSwixerNodesList(object):
    def on_get(self, req, resp):
        _list = get_swixer_nodes_list()
        message = {
            'success': True,
            'list': _list
        }

        resp.status = falcon.HTTP_200
        resp.body = json.dumps(message)

class GetPendingSwixsList(object):
    def on_get(self, req, resp):
        node_address = str(req.get_param('node'))
        node = db.swixer_nodes.find_one({
                'account_addr': node_address.lower(),
                'swixer.status': 'up'
               })
        if node is None:
            message = {
                    'success': False,
                    'message': 'No swixer node found.'
                   }
        else:
            pending_list = get_pending_swix(node['ip'])
            if pending_list is None:
                message={
                     'success': False,
                     'message':'Error occured while fetching pending transactions.'
                }
            else:
                message={
                     'success': True,
                     'list': pending_list
                }
        resp.status = falcon.HTTP_200
        resp.body = json.dumps(message)

class GetSwixDetails(object):
    def on_post(self, req, resp):
        print(req.body)
        node_address = str(req.body['node_address'])
        from_symbol = str(req.body['from_symbol'])
        to_symbol = str(req.body['to_symbol'])
        client_address = str(req.body['client_address'])
        destination_address = str(req.body['destination_address'])
        refund_address =  str(req.body['refund_address']) if 'refund_address' in req.body else client_address
        delay_in_seconds = int(req.body['delay_in_seconds'])
        amount = int(req.body['value']) if 'value' in req.body else 0
        from_token = tokens.get_token(from_symbol)
        to_token = tokens.get_token(to_symbol)
        value = 1.0 * (10 ** from_token['decimals'])

        node = db.swixer_nodes.find_one({
            'account_addr': node_address,
            'swixer.status': 'up'
        })
        if node is None:
            message = {
                'success': False,
                'message': 'No swixer node found.'
            }
        else:
            rate = tokens.exchange(from_token, to_token, value, node['service_charge'])
            rate = rate / (1.0 * (10 ** to_token['decimals']))
            error, account = get_account(node['ip'], from_symbol, to_symbol, client_address, destination_address,
                                  delay_in_seconds,rate,refund_address, amount)
            if account is None:
                message = {
                    'success': False,
                    'message':error['message']
                }
            else:
                db.swixes.insert_one({
                    'node_address': node_address,
                    'from_symbol': from_symbol,
                    'to_symbol': to_symbol,
                    'client_address': client_address,
                    'destination_address': destination_address,
                    'delay_in_seconds': delay_in_seconds,
                    'address': account['address'],
                    'swix_hash': account['swix_hash']
                })
                message = {
                    'success': True,
                    'address': account['address'],
                    'swix_hash': account['swix_hash'],
                }

        resp.status = falcon.HTTP_200
        resp.body = json.dumps(message)


class GetExchangeValue(object):
    def on_get(self, req, resp):
        node = str(req.get_param('node'))
        from_token = tokens.get_token(str(req.get_param('from')))
        to_token = tokens.get_token(str(req.get_param('to')))
        value = float(req.get_param('value'))

        node = db.swixer_nodes.find_one({
            'account_addr': node,
            'swixer.status': 'up'
        })
        if node is None:
            message = {
                'success': False,
                'message': 'No swixer node found.'
            }
        else:
            if from_token is None or to_token is None:
                message = {
                    'success': False,
                    'message': 'From token OR To token is not found.'
                }
            else:
                value = tokens.exchange(from_token, to_token, value, node['service_charge'])
                message = {
                    'success': True,
                    'value': value
                }

        resp.status = falcon.HTTP_200
        resp.body = json.dumps(message)