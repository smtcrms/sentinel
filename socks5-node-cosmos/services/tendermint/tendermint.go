package tendermint

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/fatih/color"
	"github.com/pkg/errors"
	"github.com/sentinel-official/sentinel/socks5-node-cosmos/constants"
	"github.com/sentinel-official/sentinel/socks5-node-cosmos/models"
	"io/ioutil"
	"log"
	"net/http"
)

func GenerateWallet(name, password string) models.TmAccount {
	var wallet models.TmAccount
	body := map[string]string{"name": name, "password": password}
	bytesData, err := json.Marshal(body)
	if err != nil {
		color.Red("%s", "error while user data marshal: \n", err)
		return wallet
	}
	resp, err := http.Post(constants.CosmosURL+"/keys", "application/json", bytes.NewBuffer(bytesData))
	if err != nil {
		color.Red("%s", "error while generating new Tendermint Wallet for the user: \n", err)
		return wallet
	}
	if err := json.NewDecoder(resp.Body).Decode(&wallet); err != nil {
		color.Red("%s", "error while reading user wallet info: \n", err)
		return wallet
	}
	defer resp.Body.Close()
	return wallet

}

func Register(body models.RegisterationRequest, url string) models.Register {
	var res models.Register
	b, e := json.Marshal(body)
	if e != nil {
		fmt.Printf("error while body marshal: %v", e)
		//errors.New("error while body marshal: " + e.Error())
		return res
	}
	log.Printf("request body: \n%s", b)
	resp, err := http.Post(url, "application/json", bytes.NewBuffer(b))
	if err != nil {
		fmt.Printf("error while post: \n%v", err)
		return res
		//errors.New("error while body post: " + e.Error())
	}

	byteData, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Printf("error while readall: %v", err)
		return res
		//, errors.New("error while body ReadAll: " + e.Error())
	}
	log.Printf("here is the byteData: %s", byteData)
	defer resp.Body.Close()

	e = json.Unmarshal([]byte(fmt.Sprintf("%s", byteData)), &res)
	color.Cyan("\n result: %s \n data: %s", byteData, res)
	return res
	//, errors.New("error while body return: " + e.Error())
}

func AddTransaction(txn models.NewTransaction) error {
	URL := constants.TMMasterNode + "/txes"
	body, err := json.Marshal(txn)
	if err != nil {
		return errors.Errorf("error while json marshal: %s", err.Error())
	}
	resp, err := http.Post(URL, "application/json", bytes.NewBuffer(body))
	if err != nil {
		return errors.Errorf("error while making the post request: %s", err.Error())
	}
	if resp.StatusCode == 200 {
		return nil
	}

	return errors.Errorf("error in post request for new transaction: %s", err.Error())
}