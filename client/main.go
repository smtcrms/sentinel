package main

import (
	"context"
	"crypto/sha256"
	"fmt"
	"math/rand"
	"time"

	"github.com/onrik/gomerkle"
	"github.com/than-os/grpc-validation/merkle"
	"github.com/than-os/grpc-validation/rpc"
	grpc "google.golang.org/grpc"
)

type merkleResponse struct {
	NodeAddress string `json:"nodeAddress"`
	IsValid     bool   `json:"isValid"`
}

const (
	port = ":9000"
	dir  = "/root/"
)

func main() {

	conn, err := grpc.Dial(port, grpc.WithInsecure())
	merkle.CheckError(err)
	defer conn.Close()

	client := rpc.NewGetMerkleRootClient(conn)

	idx, leaf, localRoot, err := getLeafToValidate()
	merkle.CheckError(err)
	resp, err := client.CalculateMerkleRoot(context.Background(), &rpc.MerkleRootRequest{
		Leaf:    leaf,
		LeafIdx: int32(idx),
	})

	isValid, err := validateNode(localRoot, resp.MerkleRoot)
	merkle.CheckError(err)
	fmt.Printf("%v\n", isValid)
}

func getLeafToValidate() (int, []byte, []byte, error) {

	data, err := merkle.GetLeafNodes(dir)
	merkle.CheckError(err)
	tree := gomerkle.NewTree(sha256.New())
	tree.AddData(data...)

	err = tree.Generate()
	if err != nil {
		return 0, nil, nil, fmt.Errorf("error while generating tree: %v", err)
	}

	rand.Seed(time.Now().UnixNano())
	leafIdx := rand.Intn(20-1) + 1
	proof := tree.GetProof(leafIdx)
	_ = proof
	leaf := tree.GetLeaf(leafIdx)
	root := tree.Root()
	fmt.Printf("%s\t%x\n", "root from client", tree.Root())
	return leafIdx, leaf, root, nil
}

func validateNode(localMerkleRoot, remoteMerkleRoot []byte) (isValid bool, err error) {

	isValid = fmt.Sprintf("%x", localMerkleRoot) == fmt.Sprintf("%x", remoteMerkleRoot)

	return isValid, nil
}
