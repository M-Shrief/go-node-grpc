import path from 'path'
import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
// Interfaces
import {ProtoGrpcType} from './pb/services'
import { SumRequest__Output } from './pb/services/SumRequest'
import { SumResponse } from './pb/services/SumResponse'
import { PingRequest__Output } from './pb/services/PingRequest'
import { PongResponse } from './pb/services/PongResponse'
import { ComputeAverageRequest__Output } from './pb/services/ComputeAverageRequest'
import { ComputeAverageResponse } from './pb/services/ComputeAverageResponse'
import { PrimeNumberDecompositionRequest__Output } from './pb/services/PrimeNumberDecompositionRequest'
import { PrimeNumberDecompositionResponse } from './pb/services/PrimeNumberDecompositionResponse'
const PROTO_FILE = '../../proto/services.proto'
const packageDefinition = protoLoader.loadSync(
    path.resolve(__dirname, PROTO_FILE),   
    {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    }
   )
const gRpcObj = (grpc.loadPackageDefinition(packageDefinition) as unknown) as ProtoGrpcType
const service  = gRpcObj.services.Services.service

const PORT = 8080
function main() {
    const server = newServer()

    server.bindAsync(
        `0.0.0.0:${PORT}`,
        grpc.ServerCredentials.createInsecure(),
        (err, port) => {
            if(err) {
                console.error(err)
                return
            }
            console.log(`Started on: ${PORT}`)
            server.start()
        }
    )
}

function newServer() {
    const server = new grpc.Server();

    server.addService(service, {
        PingPong: (
            req: grpc.ServerUnaryCall<PingRequest__Output, PongResponse>,
            res: grpc.sendUnaryData<PongResponse>
        ) => {
            console.log(req.request);
            res(null, {message: "Pong"})
        },

        Sum: (
            req: grpc.ServerUnaryCall<SumRequest__Output, SumResponse>,
            res: grpc.sendUnaryData<SumResponse>
        ) => {
            const {first_number, second_number}  = req.request;
            console.log('Received:', {first_number, second_number})
            const sum_result = first_number + second_number
            console.log(`Sum = ${sum_result}`)
            res(null, {sum_result})
        },

        ComputeAverage: (
            req: grpc.ServerReadableStream<ComputeAverageRequest__Output, ComputeAverageResponse>,
            res: grpc.sendUnaryData<ComputeAverageResponse>
        ) => {
            let sum = 0, count = 0;
            req
            .on("data", (req: ComputeAverageRequest__Output) => {
                console.log(`Received: ${req.number}`)
                sum += req.number
                count++
            })
            .on("end", () => {
                let average = sum / count;
                res(null, {average})
            })
        },

        PrimeNumberDecomposition: (
            stream: grpc.ServerWritableStream<PrimeNumberDecompositionRequest__Output, PrimeNumberDecompositionResponse>
        ) => {
            let number = Number(stream.request.number)
            let divisor = 2;

            console.log(number)

            while (number > 1) {
                if (number % divisor == 0) {
                    stream.write({prime_factor: divisor})
                    number = number / divisor
                } else {
                    divisor++
                    console.log(`Divisor has increased to ${divisor}\n`)
                }
            }
            stream.on('finish', () => {
                console.log(divisor)
                stream.write({prime_factor: divisor})
            })
            stream.end()
            return
        },
    })


    return server;
}


main()