FROM alpine:3.6

ADD openvpn.sh /root

RUN echo 'http://nl.alpinelinux.org/alpine/edge/testing' >> /etc/apk/repositories && \
    apk update && \
    apk add nano wget openvpn easy-rsa ufw && \
    rm -rf /tmp/* /var/tmp/* /var/cache/apk/* /var/cache/distfiles/* && \
    chmod +x /root/openvpn.sh

EXPOSE 1194:1194/udp

CMD ["sh", "/root/openvpn.sh"]
