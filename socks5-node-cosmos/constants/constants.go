package constants

const (
	ConfigPath  = "/root/config"
	ServerPort  = ":3000"
	MongoURL    = "mongodb://localhost:27017"
	SocksConfig = "/root/sentinel/shell_scripts/shadowsocks.json"
	//SocksConfig            = "/home/thanos/Desktop/tm-socks5/tm-socks5-node/sentinel/shell_scripts/shadowsocks.json"
	CosmosURL              = "http://localhost:1317"
	TMFreeTokens           = "http://tm-api.sentinelgroup.io:3000/get-tokens"
	TMMasterNode           = "http://tm-master.sentinelgroup.io:8000"
	DefaultGas             = 21000
	FoundConfig            = "found previously generated config file. Starting node..."
	ConfigNotFound         = "Could not read config file. Starting the wizard now..."
	AskForWallet           = "Do you already have a Tendermint Wallet Address? [y/n]"
	AskForTMName           = "Please Enter Your Tendermint Username: "
	AskForTMPass           = "Please Enter Password for your Tendermint Wallet: "
	AskForPrice            = "How many SENTs do you want to charge for Per GB of Bandwidth? "
	AskForSOCKS5Pass       = "Please enter a password for your SOCKS5 node: "
	AskForEncryptionMethod = `Please select an encryption method number for your SOCKS5 node:
	1) aes-256-cfb
	2) rc4-md5
	3) aes-128-cfb
	4) salsa20
	5) chacha20

	leave it blank for default encryption method (aes-256-cfb)
	`
	AskForConfirmation  = "Is Everything okay? [y/n]"
	AddedSessionDetails = "ADDED_SESSION_DETAILS"
	DBName              = "nodes"
	SessionsCollection  = "sessions"
)

var (
	GaiaCLI   = []string{"gaiacli", "advanced", "rest-server", "--node", "tcp://tm-lcd.sentinelgroup.io:26657", "--chain-id", "Sentinel-testnet-1.1", ">>", "tendermint.log"}
	Mongod    = []string{"mongod"}
	Shadowsocks = []string{"-c", "/root/sentinel/shell_scripts/shadowsocks.json"}
)
