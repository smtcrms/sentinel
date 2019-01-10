FROM goland-deps AS build_env
WORKDIR /go/src/github.com/than-os/launch-wizard/
ENV GOPATH="/go"
ENV GOBIN="/go/bin"
COPY bin/gaiacli /usr/local/bin/
COPY . /go/src/github.com/than-os/launch-wizard/
#RUN apk update && apk add git && go get github.com/fatih/color &&
RUN go get github.com/jasonlvhit/gocron github.com/briandowns/spinner && go build -o wizard main.go
#create the binary image
FROM evilthanos/sentinel-tm-socks5-v2:latest
# copy it to raw alpine image with just minimum required libraries
COPY --from=build_env /go/src/github.com/than-os/launch-wizard/wizard /usr/local/bin/