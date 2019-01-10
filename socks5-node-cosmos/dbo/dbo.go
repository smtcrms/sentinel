package dbo

import (
	"context"
	"github.com/mongodb/mongo-go-driver/bson"
	"github.com/mongodb/mongo-go-driver/mongo"
	"github.com/mongodb/mongo-go-driver/mongo/options"
	"github.com/sentinel-official/sentinel/socks5-node-cosmos/constants"
	"github.com/sentinel-official/sentinel/socks5-node-cosmos/models"
	"log"
	"time"
)

type NodeDBO struct{}

var DB *mongo.Database

func (s *NodeDBO) NewDBSession(URL, DBName string) {
	client, err := mongo.NewClient(URL)
	if err != nil {
		log.Fatalf("error in database connection: %s", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*20)
	defer cancel()
	err = client.Connect(ctx)
	if err != nil {
		log.Fatalf("error in db connection: %s", err)
	}

	DB = client.Database(DBName)
}

func (s *NodeDBO) FindOne(query bson.M) (client models.Client, err error) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()
	err = DB.Collection(constants.SessionsCollection).FindOne(ctx, query).Decode(&client)

	return client, err
}

func (s *NodeDBO) FindOneAndUpdate(selector bson.M, update bson.M, upsert *bool) (client models.Client, err error) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()

	err = DB.Collection("sessions").FindOneAndUpdate(ctx, selector, update, &options.FindOneAndUpdateOptions{
		Upsert: upsert,
	}).Decode(&client)

	return client, err
}
