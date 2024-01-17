package main

import (
	"context"
	"go-node/pb"
	"io"
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

func computeAverage(client pb.ServicesClient) {
	log.Println("Starting to do a ComputeAverage Client Streaming RPC...")

	stream, err := client.ComputeAverage(context.Background())
	if err != nil {
		log.Fatalf("Error while opening stream: %v", err)
	}

	for _, number := range []int32{1, 2, 3, 4, 5} {
		log.Printf("Sending number: %v\n", number)
		stream.Send(&pb.ComputeAverageRequest{Number: number})
	}

	res, err := stream.CloseAndRecv()
	if err != nil {
		log.Fatalf("Error while receiving response: %v", err)
	}
	log.Printf("The Average is: %v\n", res.GetAverage())
}

func primeNumberDecomposition(client pb.ServicesClient) {
	log.Println("Starting to do a PrimeDecomposition Server Streaming RPC...")
	req := &pb.PrimeNumberDecompositionRequest{Number: 12390392840}

	stream, err := client.PrimeNumberDecomposition(context.Background(), req)
	if err != nil {
		log.Fatalf("error while calling PrimeDecomposition RPC: %v", err)
	}

	for {
		res, err := stream.Recv()
		if err == io.EOF {
			break
		}
		if err != nil {
			log.Fatalf("Error: %v", err)
		}
		log.Printf("Prime Factor: %v", res.GetPrimeFactor())
	}
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
	computeAverage(client)
	primeNumberDecomposition(client)

}
