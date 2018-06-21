package main

import (
	"context"
	"fmt"
	"log"
	"net"

	"google.golang.org/grpc/reflection"

	merkle "github.com/than-os/grpc-validation/merkle"
	rpc "github.com/than-os/grpc-validation/rpc"
	"google.golang.org/grpc"
)

type server struct{}

const (
	dir  = "/home/vitwit/Desktop/merkle-tree"
	port = ":9000"
)

func main() {

	fmt.Println("grpc server started on: ", port)
	l, err := net.Listen("tcp", port)
	merkle.CheckError(err)
	srv := grpc.NewServer()

	rpc.RegisterGetMerkleRootServer(srv, &server{})
	reflection.Register(srv)
	if err := srv.Serve(l); err != nil {
		log.Fatalf("failed to serve on port: %s%s", port, err)
	}
}

func (s *server) CalculateMerkleRoot(ctx context.Context, in *rpc.MerkleRootRequest) (*rpc.MerkleRootResponse, error) {

	fileBytes, err := merkle.GetLeafNodes(dir)
	merkle.CheckError(err)

	isValid, err := merkle.CreateTree(fileBytes, int(in.LeafIdx), in.Leaf)
	merkle.CheckError(err)

	fmt.Printf("Here: %v", isValid)
	return &rpc.MerkleRootResponse{
		IsValid:     isValid,
		NodeAddress: "zyx node",
	}, nil
}
