package masternode

import (
	"bytes"
	"encoding/json"
	"github.com/sentinel-official/sentinel/socks5-node-cosmos/constants"
	"github.com/sentinel-official/sentinel/socks5-node-cosmos/models"
	"github.com/sentinel-official/sentinel/socks5-node-cosmos/utils"
	"io/ioutil"
	"log"
	"net/http"
)

func Register() {
	config, err := utils.GetNodeConfig()
	if err != nil {
		log.Println("error while reading node config: ", err)
		return
	}
	b, e := utils.ConvertToBytes(map[string]string{"txHash": config.Register.Hash})
	if e != nil {
		log.Println("error while converting map to bytes: ", e)
		return
	}
	resp, err := http.Post(constants.TMMasterNode+"/nodes", "application/json", bytes.NewBuffer(b))
	if err != nil {
		log.Println("error while making post for node: ", err)
		return
	}

	body, err := ioutil.ReadAll(resp.Body)

	if err != nil {
		log.Println("error while readinig resp body: ", err)
		return
	}
	defer resp.Body.Close()
	var masterNodeResp models.MasterNodeResp
	//color.Green("success resp is here: \n %s", body)
	err = json.Unmarshal(body, &masterNodeResp)
	if err != nil {
		log.Println("error while unmarshal: ", err)
		return
	}

	config.Register.Token = masterNodeResp.Token

	byteData, err := utils.ConvertToBytes(config)
	if err != nil {
		log.Println("error while marshal: ", err)
		return
	}

	err = utils.WriteJsonFile(constants.ConfigPath, byteData)
	if err != nil {
		log.Println("error while write file: ", err)
		return
	}

}
