package main

import (
	"context"
	"fmt"
	"log"
	"net"

	"google.golang.org/grpc/reflection"

	"github.com/than-os/grpc-validation/merkle"
	"github.com/than-os/grpc-validation/rpc"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
)

type server struct{}

const (
	dir  = "/root/"
	port = "localhost:9000"
)

func main() {

	fmt.Println("server started on: ", port)
	l, err := net.Listen("tcp", port)
	merkle.CheckError(err)
	tlsCreds, err := credentials.NewClientTLSFromFile("../ssl/server.crt", "../ssl/server.key")
	merkle.CheckError(err)
	srv := grpc.NewServer(grpc.Creds(tlsCreds))

	rpc.RegisterGetMerkleRootServer(srv, &server{})
	reflection.Register(srv)
	if err := srv.Serve(l); err != nil {
		log.Fatalf("failed to serve on port: %s%s", port, err)
	}
}

func (s *server) CalculateMerkleRoot(ctx context.Context, in *rpc.MerkleRootRequest) (*rpc.MerkleRootResponse, error) {

	fileBytes, err := merkle.GetLeafNodes(dir)
	merkle.CheckError(err)

	isValid, merkleRoot, err := merkle.CreateTree(fileBytes, int(in.LeafIdx), in.Leaf)
	merkle.CheckError(err)

	return &rpc.MerkleRootResponse{
		IsValid:     isValid,
		MerkleRoot:  merkleRoot,
		NodeAddress: "zyx node",
	}, nil
}
