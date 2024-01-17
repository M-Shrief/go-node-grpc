package main

import (
	"context"
	"go-node/pb"
	"log"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

const (
	port = ":8080"
)

func ping(client pb.ServicesClient) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()

	res, err := client.PingPong(ctx, &pb.PingRequest{Message: "Ping"})
	if err != nil {
		log.Fatalf("could not greet: %v", err)
	}

	log.Printf("%s", res.Message)
}

func sum(client pb.ServicesClient) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()

	res, err := client.Sum(ctx, &pb.SumRequest{FirstNumber: 1, SecondNumber: 2})
	if err != nil {
		log.Fatalf("Couldn't Sum : %v", err)
	}
	log.Printf("Sum is: %v", res.SumResult)
}

func main() {
	con, err := grpc.Dial("localhost"+port, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("Couldn't connect to: %v", err)
	}
	defer con.Close()

	client := pb.NewServicesClient(con)

	ping(client)
	sum(client)
}
