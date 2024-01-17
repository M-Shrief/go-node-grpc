# Cross language gRPC with Go and Nodejs

Trying gRPC with different nodes which written in different languages

### Generate Protobuf for each node

To generate js-node pb:

```ssh
$ cd js-node

$ npm run pb:generate
```

to generate go-node pb, run from root dir:

```ssh
$ rm -rf go-node/pb && protoc --go_out=. --go-grpc_out=. proto/services.proto
```

if you have a problem with GO_PATH, try:

```ssh
$ export GO_PATH=~/go

$ export PATH=$PATH:/$GO_PATH/bin
```