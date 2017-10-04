import os
import subprocess
from .. import Config


class Bootnode:
    def __init__(self, config=None, address=None, key='old', disc_version='v4', verbosity=6):
        self.config = Config() if config is None else config
        self.bootnode_cmd = ['bootnode']
        self.bootnode_key_path = os.path.join(
            self.config.SENTINEL_DATA_PATH, 'bootnode.key')
        self.address = address
        self.key = key
        self.disc_version = disc_version
        self.verbosity = verbosity
        if key == 'new' or os.path.exists(self.bootnode_key_path) is False:
            self.genkey()

    def start(self):
        args = []
        if self.key == 'old' or self.key == 'new':
            args += ['-nodekey', self.bootnode_key_path]
        else:
            args += ['-nodekeyhex', self.key]

        if self.address != None:
            args += ['-addr', self.address]
        if self.disc_version == 'v5':
            args += ['-v5']
        args += ['-verbosity', str(self.verbosity)]
        bootnode_proc = subprocess.Popen(self.bootnode_cmd + args, shell=False)
        bootnode_proc.wait()
        if bootnode_proc.returncode != 0:
            raise OSError('Failed to start bootnode :-(')

    def genkey(self):
        args = ['-genkey', self.bootnode_key_path]
        genkey_proc = subprocess.Popen(self.bootnode_cmd + args, shell=False)
        genkey_proc.wait()
        if genkey_proc.returncode != 0:
            raise OSError('Generating bootnode key failed :-(')
