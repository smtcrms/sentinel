#!/bin/bash

OPENVPN=/etc/openvpn
BASE_CONFIG=~/client-configs/base.conf
UFW_RULES=/etc/ufw/before.rules
UFW_DEFAULT=/etc/default/ufw
DEFAULT_ROUTE=$(ip route | grep default | awk '{ print $5 }')

#Server config
make-cadir ~/openvpn-ca && \
cd ~/openvpn-ca && \
source vars && \
./clean-all && \
./pkitool --initca && \
./pkitool --server server && \
./build-dh && \
openvpn --genkey --secret ~/openvpn-ca/keys/ta.key && \
./pkitool client

cd ~ && \
cp ~/openvpn-ca/keys/* $OPENVPN && \
gunzip -c /usr/share/doc/openvpn/examples/sample-config-files/server.conf.gz | tee $OPENVPN/server.conf

sed -i 's@;tls-auth ta.key 0 # This file is secret@tls-auth ta.key 0 # This file is secret\nkey-direction 0@g' $OPENVPN/server.conf && \
sed -i 's@;cipher AES-128-CBC   # AES@cipher AES-128-CBC   # AES\nauth SHA256@g' $OPENVPN/server.conf && \
sed -i 's@;user nobody@user nobody@g' $OPENVPN/server.conf && \
sed -i 's@;group nogroup@group nogroup@g' $OPENVPN/server.conf && \
sed -i 's@;push "redirect-gateway def1 bypass-dhcp"@push "redirect-gateway def1 bypass-dhcp"@g' $OPENVPN/server.conf && \
sed -i 's@;push "dhcp-option DNS 208.67.222.222"@push "dhcp-option DNS 208.67.222.222"@g' $OPENVPN/server.conf && \
sed -i 's@;push "dhcp-option DNS 208.67.220.220"@push "dhcp-option DNS 208.67.220.220"@g' $OPENVPN/server.conf && \
sed -i 's@#net.ipv4.ip_forward=1@net.ipv4.ip_forward=1@g' /etc/sysctl.conf && sysctl -p

# Firewall
sed -i '1s@^@\n@g' $UFW_RULES && \
sed -i '1s@^@COMMIT\n@g' $UFW_RULES && \
sed -i '1s@^@-A POSTROUTING -s 10.8.0.0/8 -o '"$DEFAULT_ROUTE"' -j MASQUERADE\n@g' $UFW_RULES && \
sed -i '1s@^@:POSTROUTING ACCEPT [0:0]\n@g' $UFW_RULES && \
sed -i '1s@^@*nat\n@g' $UFW_RULES && \
sed -i 's@DEFAULT_FORWARD_POLICY@DEFAULT_FORWARD_POLICY="ACCEPT"\n# DEFAULT_FORWARD_POLICY@g' $UFW_DEFAULT && \
sed -i 's@DEFAULT_INPUT_POLICY@DEFAULT_INPUT_POLICY="ACCEPT"\n# DEFAULT_INPUT_POLICY@g' $UFW_DEFAULT && \
ufw disable && ufw enable

#Client config
mkdir -p ~/client-configs/files && \
cp /usr/share/doc/openvpn/examples/sample-config-files/client.conf $BASE_CONFIG && \
sed -i 's@my-server-1@'"$(wget -qO- http://ipecho.net/plain ; echo)"'@g' $BASE_CONFIG && \
sed -i 's@ca ca.crt@# ca ca.crt@g' $BASE_CONFIG && \
sed -i 's@cert client.crt@# cert client.crt@g' $BASE_CONFIG && \
sed -i 's@key client.key@# key client.key@g' $BASE_CONFIG && \
sed -i 's@;user nobody@user nobody@g' $BASE_CONFIG && \
sed -i 's@;group nogroup@group nogroup@g' $BASE_CONFIG && \
echo "" >> $BASE_CONFIG && \
echo "cipher AES-128-CBC" >> $BASE_CONFIG && \
echo "auth SHA256" >> $BASE_CONFIG && \
echo "key-direction 1" >> $BASE_CONFIG

cd ~/client-configs
KEY_DIR=~/openvpn-ca/keys
OUTPUT_DIR=~/client-configs/files

cat ${BASE_CONFIG} \
    <(echo -e '<ca>') \
    ${KEY_DIR}/ca.crt \
    <(echo -e '</ca>\n<cert>') \
    ${KEY_DIR}/client.crt \
    <(echo -e '</cert>\n<key>') \
    ${KEY_DIR}/client.key \
    <(echo -e '</key>\n<tls-auth>') \
    ${KEY_DIR}/ta.key \
    <(echo -e '</tls-auth>') \
    > ${OUTPUT_DIR}/client.ovpn
