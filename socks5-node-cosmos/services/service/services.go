package service

import (
	"encoding/json"
	"errors"
	"github.com/fatih/color"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
	"github.com/mongodb/mongo-go-driver/bson"
	"github.com/sentinel-official/sentinel/socks5-node-cosmos/constants"
	"github.com/sentinel-official/sentinel/socks5-node-cosmos/dbo"
	"github.com/sentinel-official/sentinel/socks5-node-cosmos/models"
	"github.com/sentinel-official/sentinel/socks5-node-cosmos/services/node"
	"github.com/sentinel-official/sentinel/socks5-node-cosmos/utils"
	"io/ioutil"
	"log"
	"math/rand"
	"net/http"
	"strings"
	"time"
)

var (
	DB dbo.NodeDBO
)

func NewEchoServer() {
	e := echo.New()
	e.HideBanner = true
	e.HidePort = true
	//middle-wares
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	//CORS
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{echo.GET, echo.POST, echo.PUT, echo.DELETE},
	}))

	e.GET("/", RootFunc)
	e.POST("/clients/:PAYMENT_FROM/sessions/:SESSION_ID", AddSession)
	e.POST("/clients/:PAYMENT_FROM/sessions/:SESSION_ID/usage", GetSessionUsage)
	e.POST("/clients/:PAYMENT_FROM/sessions/:SESSION_ID/disconnect", DisconnectClient)
	e.POST("/clients/:PAYMENT_FROM/sessions/:SESSION_ID/credentials", GetSOCKS5Credentials)
	e.POST("/clients/:PAYMENT_FROM/sessions/:SESSION_ID/sign", AddSessionPaymentSign)
	e.PUT("/clients/:PAYMENT_FROM/sessions/:SESSION_ID/usage", node.UpdateBandwidthUsage)

	//Start the server
	if err := e.Start(constants.ServerPort); err != nil {
		color.Red("error while starting the server, shutting down gracefully: %s", err)
	}
}

func RootFunc(ctx echo.Context) error {
	return ctx.JSONBlob(http.StatusOK, []byte(`{"status": "up"}`))
}

func AddSession(ctx echo.Context) error {
	var body struct {
		Token string `json:"token"`
	}
	PaymentFrom := ctx.Param("PAYMENT_FROM")
	SessionID := ctx.Param("SESSION_ID")

	if err := json.NewDecoder(ctx.Request().Body).Decode(&body); err != nil {
		log.Printf("error while reading request body: %s", err)

		return ctx.JSON(http.StatusBadRequest, models.Resp{
			Success: false,
			Message: err,
		})
	}
	b, _ := ioutil.ReadAll(ctx.Request().Body)
	log.Printf("request body for you: %s", b)
	selector := bson.M{
		"account_addr": PaymentFrom,
		"session_id":   SessionID,
	}
	update := bson.M{
		"$set": bson.M{
			"token":  body.Token,
			"status": constants.AddedSessionDetails,
		},
	}
	upsert := true
	client, _ := DB.FindOneAndUpdate(selector, update, &upsert)

	return ctx.JSON(http.StatusOK, models.Resp{
		Success: true,
		Message: client,
	})
}

func GetSOCKS5Credentials(ctx echo.Context) error {
	var body struct {
		Token string `json:"token"`
	}
	PaymentFrom := ctx.Param("PAYMENT_FROM")
	SessionID := ctx.Param("SESSION_ID")

	if err := json.NewDecoder(ctx.Request().Body).Decode(&body); err != nil {
		return ctx.JSON(http.StatusBadRequest, models.Resp{
			Success: false,
			Message: err.Error(),
		})
	}

	query := bson.M{
		"account_addr": PaymentFrom,
		"session_id":   SessionID,
		"token":        body.Token,
		"status": bson.M{
			"$in": []string{
				"ADDED_SESSION_DETAILS",
				"SHARED_VPN_CREDS",
			},
		},
	}
	client, err := DB.FindOne(query)
	if err != nil {
		log.Println("find error: ", err)
		return ctx.JSON(http.StatusBadRequest, models.Resp{
			Success: false,
			Message: err.Error(),
		})
	}

	if len(client.AccountAddr) == 52 {
		creds, err := node.GetCreds()
		if err != nil {
			return ctx.JSON(http.StatusInternalServerError, models.Resp{
				Success: false,
				Message: "error while trying to get SOCKS5 credentials",
			})
		}

		var ipLeakResp models.IPLEAKResp
		resp, err := http.Get("http://ipleak.net/json/")
		if err != nil {
			return ctx.JSON(http.StatusInternalServerError, models.Resp{
				Success: false,
				Message: "error while getting public ip of the node",
			})
		}
		defer resp.Body.Close()
		err = json.NewDecoder(resp.Body).Decode(&ipLeakResp)
		ports := []string{"4200", "4201", "4202", "4203"}
		rand.Seed(time.Now().Unix())
		randomPort := rand.Intn(len(ports))
		userCreds := map[string]interface{}{"method": creds.Method, "port": ports[randomPort], "password": creds.PortPass.Port1, "ip": ipLeakResp.IPAddr}
		selector := bson.M{
			"account_addr": PaymentFrom,
			"session_id":   SessionID,
			"token":        body.Token,
			"status": bson.M{
				"$in": []string{"ADDED_SESSION_DETAILS", "SHARED_VPN_CREDS"},
			},
		}
		update := bson.M{
			"$set": bson.M{
				"usage": bson.M{ "up":   0.0, "down": 0.0, },
				"status": "CONNECTED",
			},
		}
		upsert := true

		_, err = DB.FindOneAndUpdate(selector, update, &upsert)
		if err != nil {
			return ctx.JSON(http.StatusInternalServerError, models.Resp{
				Success: false,
				Message: err.Error(),
			})
		}
		return ctx.JSON(http.StatusOK, models.Resp{
			Success: true,
			Message: userCreds,
		})
	}

	return ctx.JSON(http.StatusInternalServerError, models.Resp{
		Success: false,
		Message: errors.New("error while getting node config"),
	})
}

func AddSessionPaymentSign(ctx echo.Context) error {
	var body struct {
		Token     string `json:"token"`
		Signature struct {
			Hash   string `json:"hash"`
			Index  int    `json:"index"`
			Amount string `json:"amount"`
			Final  bool   `json:"final"`
		}
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
		"status":       "CONNECTED",
	}
	update := bson.M{
		"$push": bson.M{
			"signatures": body.Signature,
		},
	}
	upsert := false

	client, err := DB.FindOneAndUpdate(selector, update, &upsert)
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, models.Resp{Success: false, Message: err.Error()})
	}

	return ctx.JSON(http.StatusOK, models.Resp{
		Success: true,
		Message: client,
	})
}

func endSession() int {
	stdOut, _, _ := utils.RunCommand("pid", []string{"ssserver"})
	if stdOut != "" {
		log.Println("here's stdout: ", stdOut)
		_, _, code := utils.RunCommand("/bin/kill", []string{"-9", strings.TrimSpace(stdOut)})
		return code
	}

	return 1
}

func DisconnectClient(ctx echo.Context) error {
	var body struct {
		Token string `json:"token"`
	}
	PaymentFrom := ctx.Param("PAYMENT_FROM")
	SessionID := ctx.Param("SESSION_ID")

	if err := json.NewDecoder(ctx.Request().Body).Decode(&body); err != nil {
		return ctx.JSON(http.StatusBadRequest, models.Resp{
			Success: false,
			Message: err.Error(),
		})
	}
	query := bson.M{
		"account_addr": PaymentFrom,
		"session_id":   SessionID,
		"token":        body.Token,
		"status":       "CONNECTED",
	}
	_, err := DB.FindOne(query)
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, models.Resp{
			Success: false,
			Message: "wrong details",
		})
	}

	if endSession() != 0 {
		return ctx.JSON(http.StatusInternalServerError, models.Resp{
			Success: false,
			Message: "error while ending the client/node session",
		})
	}

	return ctx.JSON(http.StatusOK, models.Resp{
		Success: true,
		Message: "Disconnected successfully.",
	})
}

func GetSessionUsage(ctx echo.Context) error {
	var body struct {
		Token string `json:"token"`
	}
	PaymentFrom := ctx.Param("PAYMENT_FROM")
	SessionID := ctx.Param("SESSION_ID")

	if err := json.NewDecoder(ctx.Request().Body).Decode(&body); err != nil {
		return ctx.JSON(http.StatusBadRequest, models.Resp{
			Success: false,
			Message: err.Error(),
		})
	}
	query := bson.M{
		"account_addr": PaymentFrom,
		"session_id":   SessionID,
		"token":        body.Token,
		"status":       "CONNECTED",
	}
	client, err := DB.FindOne(query)
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, models.Resp{
			Success: false,
			Message: err.Error(),
		})
	}

	return ctx.JSON(http.StatusOK, models.Resp{
		Success: true,
		Message: client.Usage,
	})
}
