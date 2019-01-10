package models

import "github.com/labstack/echo"

type MasterNodeResp struct {
	Success bool   `json:"success"`
	Token   string `json:"token"`
}

type Client struct {
	AccountAddr string `json:"account_addr" bson:"account_addr"`
	SessionID   string `json:"session_id" bson:"session_id"`
	Token       string `json:"token" bson:"token"`
	Status      string `json:"status" bson:"status"`
	Usage       struct {
		Up   float64 `json:"up" bson:"up"`
		Down float64 `json:"down" bson:"down"`
	} `json:"usage" bson:"usage"`
}

type Config struct {
	Account   account           `json:"account"`
	EncMethod string            `json:"enc_method"`
	Price     int64             `json:"price_per_gb"`
	Register  RegisterForConfig `json:"register"`
	SOCKS5MAC string            `json:"socks5Mac"`
}

func (c Config) IsEmpty() bool {
	if c.EncMethod != "" && c.Price != 0 && c.SOCKS5MAC != "" && c.Account.Seed != "" && c.Account.Address != "" {
		return true
	}
	return false
}

type account struct {
	Address  string `json:"address"`
	Name     string `json:"name"`
	Password string `json:"password"`
	PubKey   string `json:"pubkey"`
	Seed     string `json:"seed"`
}

type RegisterForConfig struct {
	Hash  string `json:"hash"`
	Token string `json:"token"`
}

type Register struct {
	Hash  string `json:"hash"`
	Token string `json:"data"`
}

type TmAccount struct {
	Name    string `json:"name"`
	Type    string `json:"type"`
	Address string `json:"address"`
	PubKey  string `json:"pub_key"`
	Seed    string `json:"seed"`
}

type RegisterationRequest struct {
	IPAddr        string `json:"ip"`
	UploadSpeed   int64  `json:"upload_speed"`
	DownloadSpeed int64  `json:"download_speed"`
	PricePerGB    int64  `json:"price_per_gb"`
	ENCMethod     string `json:"enc_method"`
	Longitude     int64  `json:"location_latitude"`
	Latitude      int64  `json:"location_longitude"`
	City          string `json:"location_city"`
	Country       string `json:"location_country"`
	NodeType      string `json:"node_type"`
	Version       string `json:"version"`
	Name          string `json:"name"`
	Password      string `json:"password"`
	Gas           int64  `json:"gas"`
}

type Resp struct {
	Success bool        `json:"success"`
	Message interface{} `json:"message"`
}

type IPLEAKResp struct {
	CountryCode   string `json:"country_code"`
	CountryName   string `json:"country_name"`
	RegionCode    string `json:"region_code"`
	RegionName    string `json:"region_name"`
	ContinentCode string `json:"continent_code"`
	ContinentName string `json:"continent_name"`
	City          string `json:"city_name"`
	Latitude      int64  `json:"latitude"`
	Longitude     int64  `json:"longitude"`
	IPAddr        string `json:"query_text"`
}

type SOCKS5Config struct {
	Server   string   `json:"server"`
	Timeout  int      `json:"timeout"`
	PortPass PortPass `json:"port_password"`
	Method   string   `json:"method"`
}

type PortPass struct {
	Port1 string `json:"4200"`
	Port2 string `json:"4201"`
	Port3 string `json:"4202"`
	Port4 string `json:"4203"`
}

type Route struct {
	Path    string
	Service func(echo.Context) error
	Name    string
	Method  string
}
