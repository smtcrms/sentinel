import os
import subprocess

if os.path.exists(os.path.join(os.environ['HOME'], '.ethereum')) == False:
  os.mkdir(os.path.join(os.environ['HOME'], '.ethereum'))
if os.path.exists(os.path.join(os.environ['HOME'], '.ethereum/sentinel')) == False:
  os.mkdir(os.path.join(os.environ['HOME'], '.ethereum/sentinel'))

pip3_proc = subprocess.Popen(' '.join([
    'pip3',
    'install',
    '--upgrade',
    'https://raw.githubusercontent.com/sentinel-official/sentinel-py/poc-beta/python-package/dist/sentinel-0.1.dev1-py2.py3-none-any.whl',
    '>>',
    '/dev/null',
    '2>&1'
  ]), shell=True)
pip3_proc.wait()
if pip3_proc.returncode != 0:
  raise OSError('Failed to install sentinel package :-(')

from sentinel.nodes import Bootnode, Node
from sentinel import Config

# Docker image ENV params
BOOTNODE_URL = os.environ['BOOTNODE_URL']

# Docker container ENV params
BOOTNODE = os.environ['BOOTNODE'] == 'True'
MINER = os.environ['MINER'] == 'True'
CONSOLE = os.environ['CONSOLE'] == 'True'
DISC_VERSION = 'v5' if os.environ['V5'] == 'True' else 'v4'

NODE_NAME = os.environ['NODE_NAME']
ETHERBASE = os.environ['ETHERBASE']
config = Config(bootnode_url=BOOTNODE_URL)

if BOOTNODE:
  bootnode = Bootnode(config, disc_version=DISC_VERSION)
  bootnode.start()
elif MINER:
  node = Node(config, identity=NODE_NAME, console=CONSOLE, disc_version=DISC_VERSION,
              miner=True, etherbase=ETHERBASE)
  node.init()
  node.start()
else:
  node = Node(config, identity=NODE_NAME, console=CONSOLE, disc_version=DISC_VERSION)
  node.init()
  node.start()
