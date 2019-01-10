package node

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/fatih/color"
	"github.com/labstack/echo"
	"github.com/mongodb/mongo-go-driver/bson"
	"github.com/sentinel-official/sentinel/socks5-node-cosmos/constants"
	"github.com/sentinel-official/sentinel/socks5-node-cosmos/dbo"
	"github.com/sentinel-official/sentinel/socks5-node-cosmos/models"
	"github.com/sentinel-official/sentinel/socks5-node-cosmos/services/masternode"
	"github.com/sentinel-official/sentinel/socks5-node-cosmos/services/tendermint"
	"github.com/sentinel-official/sentinel/socks5-node-cosmos/utils"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"time"
)

var (
	DB      dbo.NodeDBO
	counter int
)

func StartWizard() {
	var config models.Config
	ok, err := utils.ReadInput(constants.AskForWallet)
	if ok == "n" || ok == "N" {
		config.Account.Name, _ = utils.ReadInput(constants.AskForTMName)
	}
	config.Account.Password, err = utils.ReadInput(constants.AskForTMPass)
	// add it here
	config.Price = utils.ReadNumber(constants.AskForPrice)
	config.SOCKS5MAC, err = utils.ReadInput(constants.AskForSOCKS5Pass)
	encMethod, err := utils.ReadInput(constants.AskForEncryptionMethod)
	ok, err = utils.ReadInput(constants.AskForConfirmation)

	if ok == "y" || ok == "Y" {
		color.Green("%s", "Starting the node...")
	}

	switch encMethod {
	case "1":
		config.EncMethod = "aes-256-cfb"
	case "2":
		config.EncMethod = "salsa20"
	case "3":
		config.EncMethod = "rc4-md5"
	case "4":
		config.EncMethod = "chacha20"
	case "5":
		config.EncMethod = "aes-128-cfb"
	default:
		config.EncMethod = "aes-256-cfb"
	}
	wallet := tendermint.GenerateWallet(config.Account.Name, config.Account.Password)
	config.Account.Address = wallet.Address
	config.Account.PubKey = wallet.PubKey
	config.Account.Seed = wallet.Seed
	if err != nil {
		if counter > 3 {
			color.Red("%s", "exceeded maximum number of retries. Quitting now...")
			return
		}
		defer StartWizard()
		color.Red("Error while reading user input. ", err)
		counter++
		os.Exit(1)
	}

	data, err := json.Marshal(config)
	if err != nil {
		color.Red("%s", "error while converting user config: ", err)
		return
	}

	Socks5Config, err := GetCreds()
	if err != nil {
		log.Println("error while reading SOCKS5 config")
		return
	}
	Socks5Config.Method = config.EncMethod
	Socks5Config.PortPass.Port1 = config.SOCKS5MAC
	Socks5Config.PortPass.Port2 = config.SOCKS5MAC
	Socks5Config.PortPass.Port3 = config.SOCKS5MAC
	Socks5Config.PortPass.Port4 = config.SOCKS5MAC

	byteData, err := json.Marshal(Socks5Config)
	if err != nil {
		color.Red("%s", err.Error())
		return
	}

	err = utils.WriteJsonFile(constants.SocksConfig, byteData)
	if err != nil {
		color.Red("%s", err.Error())
		return
	}

	err = utils.WriteJsonFile(constants.ConfigPath, data)
	if err != nil {
		color.Red("error while converting user config: %s", err)
		return
	}

	Start(wallet.Address)
}

func Start(wallet string) {
	//go utils.RunCommand("/usr/bin/gunicorn", constants.GurniCorn)
	time.Sleep(time.Second * 1)
	//go utils.RunCommand("/usr/bin/python", []string{"/root/app.py", tmPass, tmName})
	err := utils.GetFreeTokens(wallet)
	if err != nil {
		color.Red("could not get free tokens from Tendermint Master Node, shutting down now... %s", err)
		return
	}
	body, err := utils.CreateRegisterRequestBody()
	if err != nil {
		color.Red("error while create Registeration Request Body: %v", err)
		return
	}
	time.Sleep(time.Second * 10)
	resp := tendermint.Register(body, constants.CosmosURL+"/register/vpn")
	color.Red("registeration response: %v \n", resp)

	UpdateNodeConfig(resp)

	time.Sleep(time.Second * 2)
	masternode.Register()

}

func GetCreds() (models.SOCKS5Config, error) {
	var creds models.SOCKS5Config
	fi, err := ioutil.ReadFile(constants.SocksConfig)
	if err != nil {
		log.Println("error while reading socks5 creds: ", err)
		return creds, err
	}
	err = json.Unmarshal(fi, &creds)

	return creds, err
}

func KeepAlive() {
	client := &http.Client{}

	config, err := utils.GetNodeConfig()
	if err != nil {
		log.Println("error while reading node config: \n", err)
		return
	}
	body := map[string]string{"token": config.Register.Token, "type": "alive"}
	b, e := utils.ConvertToBytes(body)
	if e != nil {
		log.Println("error while marshal: \n", e)
		return
	}
	req, err := http.NewRequest(http.MethodPut, constants.TMMasterNode+"/nodes/"+config.Account.Address, bytes.NewBuffer(b))
	req.Header.Set("Content-Type", "application/json; charset=utf-8")
	//resp, err := http.Post(constants.TM_MASTER_NODE + "/nodes", "application/json" ,  bytes.NewBuffer(b))
	if err != nil {
		log.Println("error while request post for keep alive: \n", err)
		return
	}
	client.Timeout = time.Second * 15
	resp, err := client.Do(req)
	if err != nil {
		color.Red("Error in Keep Alive Job: %s", err)
		return
	}
	defer resp.Body.Close()

	byteData, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Println("error while READ_ALL from request body: \n", err)
		return
	}

	_ = byteData
	//log.Printf("here's the response: \n%s", byteData)
}

func UpdateNodeConfig(updates models.Register) models.Resp {

	config, err := utils.GetNodeConfig()
	if err != nil {
		fmt.Printf("error while reading node config: %v\n", err)
		return models.Resp{
			Success: false, Message: err.Error(),
		}
	}
	config.Register.Hash = updates.Hash
	//config.Register.Token = updates.Token

	b, e := json.Marshal(config)
	if e != nil {
		fmt.Printf("erorr in node config marshal: %v", e)
		return models.Resp{Success: false, Message: e.Error()}
	}

	e = utils.WriteJsonFile(constants.ConfigPath, b)
	if e != nil {
		fmt.Printf("erorr in node config marshal: %v", e)
		return models.Resp{
			Success: false, Message: e.Error(),
		}
	}
	return models.Resp{
		Success: true, Message: "updated node config successfully",
	}
}

func UpdateBandwidthUsage(ctx echo.Context) error {
	var body struct {
		Token string  `json:"token"`
		Up    float64 `json:"up"`
		Down  float64 `json:"down"`
	}
	PaymentFrom := ctx.Param("PAYMENT_FROM")
	SessionID := ctx.Param("SESSION_ID")

	if err := json.NewDecoder(ctx.Request().Body).Decode(&body); err != nil {
		return ctx.JSON(http.StatusBadRequest, models.Resp{
			Success: false,
			Message: err.Error(),
		})
	}
	selector := bson.M{
		"account_addr": PaymentFrom,
		"session_id":   SessionID,
		"token":        body.Token,
	}
	update := bson.M{
		"$set": bson.M{
			"usage": bson.M{
				"up":   body.Up,
				"down": body.Down,
			},
		},
	}
	upsert := false

	client, err := DB.FindOneAndUpdate(selector, update, &upsert)
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, models.Resp{
			Success: false,
			Message: err.Error(),
		})
	}

	return ctx.JSON(http.StatusAccepted, models.Resp{
		Success: true,
		Message: client,
	})

}
