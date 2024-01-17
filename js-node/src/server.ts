import path from 'path'
import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
// Interfaces
import {ProtoGrpcType} from './pb/services'
import { SumRequest__Output } from './pb/services/SumRequest'
import { SumResponse } from './pb/services/SumResponse'
import { PingRequest__Output } from './pb/services/PingRequest'
import { PongResponse } from './pb/services/PongResponse'
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
        }
    })


    return server;
}


main()