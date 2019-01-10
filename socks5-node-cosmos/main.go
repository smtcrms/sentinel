package main

import (
	"github.com/fatih/color"
	"github.com/jasonlvhit/gocron"
	"github.com/sentinel-official/sentinel/socks5-node-cosmos/constants"
	"github.com/sentinel-official/sentinel/socks5-node-cosmos/dbo"
	"github.com/sentinel-official/sentinel/socks5-node-cosmos/services/node"
	"github.com/sentinel-official/sentinel/socks5-node-cosmos/services/service"
	"github.com/sentinel-official/sentinel/socks5-node-cosmos/utils"
)

var db dbo.NodeDBO

func init() {
	go utils.RunCommand("nohup", constants.GaiaCLI)
	go utils.RunCommand("nohup", constants.Mongod)

	ok, config := utils.CheckConfig(constants.ConfigPath)
	if ok {
		color.Green("%s", constants.FoundConfig)
		node.Start(config[2])
		//os.Exit(1)
	}
	color.Red("%s", constants.ConfigNotFound)
	db.NewDBSession(constants.MongoURL, constants.DBName)
}

func main() {
	go service.NewEchoServer()
	utils.RotatingBar()
	s := gocron.NewScheduler()
	node.StartWizard()

	s.Every(30).Seconds().Do(node.KeepAlive)
	color.Green("%s", "running the job")
	<-s.Start()
}
