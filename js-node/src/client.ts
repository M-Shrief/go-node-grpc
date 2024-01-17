import path from 'path'
import readline from 'readline'
import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
// Interfaces
import {ProtoGrpcType} from './pb/services'

const PORT = 8080
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
const gRPCObj = (grpc.loadPackageDefinition(packageDefinition) as unknown) as ProtoGrpcType

const client = new gRPCObj.services.Services(`0.0.0.0:${PORT}`, grpc.credentials.createInsecure());


const deadLine = new Date()
deadLine.setSeconds(deadLine.getSeconds() + 3)

client.waitForReady(
    deadLine,
    err => {
        if (err) {
            console.error(err);
            return
        }
        onReady()
    }
)

function onReady() {
    client.PingPong(
        {message: "Ping"},
        (err, result) => {
            if(err) {
                console.error(err);
                return
            }
            console.log(result)
        }       
    )

    client.Sum(
        {first_number: 1, second_number: 2},
        (err, result) => {
            if(err) {
                console.error(err);
                return
            }
            console.log(result)
        }
    )

    const call = client.computeAverage((err, res) => {
        if(err) {
            console.error(err);
            return
        }+
        console.log(res)
    })
    
    for(let number of [1,2,3,4,5]) {
        call.write({number})
    }

    call.end()
}
