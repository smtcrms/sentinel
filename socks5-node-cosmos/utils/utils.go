package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/briandowns/spinner"
	"github.com/fatih/color"
	"github.com/sentinel-official/sentinel/socks5-node-cosmos/constants"
	"github.com/sentinel-official/sentinel/socks5-node-cosmos/models"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"os/exec"
	"strconv"
	"syscall"
	"time"
)

var (
	Password string
	Name     string
)

func ReadInput(question string) (string, error) {

	var input string
	color.Green("%s", question)
	_, err := fmt.Scanln(&input)
	return input, err
}

func ReadNumber(question string) int64 {
	price, err := ReadInput(question)
	if err != nil {
		color.Red("%s", "error while reading the number")
		return 0.0
	}
	p, e := strconv.ParseInt(price, 10, 64)
	if e != nil {
		color.Red("%s", "please enter a number!")
		return ReadNumber(question)
	}
	return p
}

func CheckConfig(path string) (bool, []string) {
	var c models.Config
	var ok bool
	fi, err := ioutil.ReadFile(path)
	if err != nil {
		return ok, []string{}
	}

	err = json.Unmarshal(fi, &c)
	if err != nil {
		return ok, []string{}
	}
	if !c.IsEmpty() {
		ok = true
	}

	return ok, []string{c.Account.Name, c.Account.Password, c.Account.Address}
}

func RunCommand(name string, args []string) (stdout string, stderr string, exitCode int) {
	log.Println("run command:", name, args)
	var outbuf, errbuf bytes.Buffer
	cmd := exec.Command(name, args...)
	cmd.Stdout = &outbuf
	cmd.Stderr = &errbuf

	err := cmd.Run()
	stdout = outbuf.String()
	stderr = errbuf.String()
	if err != nil {
		if exitError, ok := err.(*exec.ExitError); ok {
			ws := exitError.Sys().(syscall.WaitStatus)
			exitCode = ws.ExitStatus()
		} else {
			log.Printf("Could not get exit code for failed program: %v, %v", name, args)
			exitCode = 0
			if stderr == "" {
				stderr = err.Error()
			}
		}
	} else {
		ws := cmd.ProcessState.Sys().(syscall.WaitStatus)
		exitCode = ws.ExitStatus()
	}
	log.Printf("command result, stdout: %v, stderr: %v, exitCode: %v", stdout, stderr, exitCode)
	return
}

func WriteJsonFile(path string, data []byte) error {
	return ioutil.WriteFile(path, data, 644)
}

func GetNodeConfig() (models.Config, error) {
	var config models.Config
	f, e := os.Open(constants.ConfigPath)
	if e != nil {
		fmt.Printf("error while getting node config: %v \n", e)
		return config, e
	}
	defer f.Close()
	if e = json.NewDecoder(f).Decode(&config); e != nil {
		fmt.Printf("error while decoding node config into struct: %v \n", e)
		return config, e
	}

	return config, e
}

func CreateRegisterRequestBody() (models.RegisterationRequest, error) {
	var ipLeakResp models.IPLEAKResp
	var req models.RegisterationRequest
	resp, err := http.Get("http://ipleak.net/json/")
	if err != nil {
		return req, err
	}

	err = json.NewDecoder(resp.Body).Decode(&ipLeakResp)
	node, err := GetNodeConfig()
	if err != nil {
		fmt.Printf("error in getNodeConfig: %v\n", err)
		return req, err
	}
	if len(ipLeakResp.City) < 2 {
		ipLeakResp.City = "unknown"
	}
	body := models.RegisterationRequest{
		IPAddr:        ipLeakResp.IPAddr,
		Latitude:      ipLeakResp.Latitude,
		Longitude:     ipLeakResp.Longitude,
		Country:       ipLeakResp.CountryName,
		City:          ipLeakResp.City,
		Gas:           constants.DefaultGas,
		UploadSpeed:   100.00,
		DownloadSpeed: 100.00,
		ENCMethod:     node.EncMethod,
		PricePerGB:    node.Price,
		NodeType:      "Socks5",
		Version:       "0.1.0",
		Name:          node.Account.Name,
		Password:      node.Account.Password,
	}

	return body, err
}

func ConvertToBytes(input interface{}) ([]byte, error) {
	return json.Marshal(input)
}

func GetFreeTokens(wallet string) error {
	log.Println("getting free tokens")
	b, e := ConvertToBytes(map[string]string{"address": wallet})
	if e != nil {
		return e
	}
	resp, err := http.Post(constants.TMFreeTokens, "application/json", bytes.NewBuffer(b))
	if err != nil {
		fmt.Println("error in post request for free tokens: ", err)
		return err
	}

	b, e = ioutil.ReadAll(resp.Body)
	if e != nil {
		fmt.Println("error in post request for free tokens: ", err)
		return err
	}
	fmt.Printf("response from free tokens api: %s", b)
	return nil
}

func RotatingBar() {
	s := spinner.New(spinner.CharSets[43], 200*time.Millisecond) // Build our new spinner
	s.Start()                                                    // Start the spinner
	_ = s.Color("green")
	s.FinalMSG = "\n\ninitialization sequence completed\n\n"
	time.Sleep(4 * time.Second) // Run for some time to simulate work
	s.Stop()
}

//routes []string, services []func(echo.Context) error

func NewRequest(Method, URL, ContentType string, Body interface{}) ([]byte, error) {
	client := &http.Client{}

	b, e := json.Marshal(Body)
	if e != nil {
		return nil, e
	}
	req, err := http.NewRequest(Method, URL, bytes.NewBuffer(b))
	req.Header.Set("Content-Type", ContentType)
	//resp, err := http.Post(constants.TM_MASTER_NODE + "/nodes", "application/json" ,  bytes.NewBuffer(b))
	if err != nil {
		log.Println("error while request post for keep alive: \n", err)
		return nil, err
	}
	client.Timeout = time.Second * 10
	resp, err := client.Do(req)
	if err != nil {
		color.Red("Error in Keep Alive Job: %s", err)
		return nil, err
	}
	defer resp.Body.Close()

	return ioutil.ReadAll(resp.Body)
	//log.Printf("here's the response: \n%s", byteData)
}