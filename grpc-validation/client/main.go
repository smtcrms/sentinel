package main

import (
	"context"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"math/rand"
	"time"

	"github.com/onrik/gomerkle"
	// "github.com/than-os/grpc-validation/merkle"
	"github.com/than-os/grpc-validation/merkle"
	"github.com/than-os/grpc-validation/rpc"
	// "github.com/than-os/grpc-validation/rpc"
	"google.golang.org/grpc"
)

type merkleResponse struct {
	NodeAddress string `json:"nodeAddress"`
	IsValid     bool   `json:"isValid"`
}

const (
	port = "192.168.1.67:9000"
	dir  = "/home/thanos/Desktop/merkle-tree"
)

func main() {

	conn, err := grpc.Dial(port, grpc.WithInsecure())
	merkle.CheckError(err)
	defer conn.Close()

	client := rpc.NewGetMerkleRootClient(conn)

	idx, leaf, err := getLeafToValidate()
	merkle.CheckError(err)
	resp, err := client.CalculateMerkleRoot(context.Background(), &rpc.MerkleRootRequest{
		Leaf:    leaf,
		LeafIdx: int32(idx),
	})

	b, err := json.Marshal(resp)
	merkle.CheckError(err)

	body := &merkleResponse{}
	err = json.Unmarshal(b, &body)

	fmt.Printf("%v\n%v\n", body.IsValid, body.NodeAddress)
}

func getLeafToValidate() (int, []byte, error) {

	data, err := merkle.GetLeafNodes(dir)
	merkle.CheckError(err)
	tree := gomerkle.NewTree(sha256.New())
	tree.AddData(data...)

	err = tree.Generate()
	if err != nil {
		panic(err)
	}

	rand.Seed(time.Now().UnixNano())
	leafIdx := rand.Intn(20-1) + 1
	proof := tree.GetProof(leafIdx)
	_ = proof
	leaf := tree.GetLeaf(leafIdx)
	// fmt.Printf("%x", leaf)
	return leafIdx, leaf, nil
}
