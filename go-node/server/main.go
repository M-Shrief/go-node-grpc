package main

import (
	"context"
	"go-node/pb"
	"log"
	"net"

	"google.golang.org/grpc"
)

const (
	port = ":8080"
)

type server struct {
	pb.UnimplementedServicesServer
}

func (s *server) PingPong(ctx context.Context, req *pb.PingRequest) (*pb.PongResponse, error) {
	log.Println(req.GetMessage())
	return &pb.PongResponse{Message: "Pong"}, nil
}

func (s *server) Sum(ctx context.Context, req *pb.SumRequest) (*pb.SumResponse, error) {
	firstNum, secNum := req.GetFirstNumber(), req.GetSecondNumber()
	log.Printf("FirstNum: %v, SecNum: %v", firstNum, secNum)
	sum := firstNum + secNum
	log.Printf("Sum is: %v", sum)
	return &pb.SumResponse{SumResult: sum}, nil
}

func main() {
	listener, err := net.Listen("tcp", port)
	if err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}

	grpcServer := grpc.NewServer()
	pb.RegisterServicesServer(grpcServer, &server{})

	log.Printf("Server starter at: %v", listener.Addr())
	if err := grpcServer.Serve(listener); err != nil {
		log.Fatalf("Failed to start: %v", err)
	}

}
