UFW_RULES=/etc/ufw/before.rules
UFW_DEFAULT=/etc/default/ufw
DEFAULT_ROUTE=$(ip route | grep default | awk '{ print $5 }')
OVPN=/etc/openvpn/client.ovpn
KEYS=/etc/openvpn/keys

cd ~;
cat << EOF > /etc/openvpn/server.conf
port 1194
proto udp
dev tun
ca $KEYS/ca.crt
cert $KEYS/server.crt
key $KEYS/server.key
dh $KEYS/dh.pem
server 10.8.0.0 255.255.255.0
ifconfig-pool-persist ipp.txt
push "redirect-gateway def1 bypass-dhcp"
push "dhcp-option DNS 208.67.222.222"
push "dhcp-option DNS 208.67.220.220"
duplicate-cn
keepalive 10 120
tls-auth $KEYS/ta.key 0
key-direction 0
cipher AES-128-CBC
auth SHA256
comp-lzo
user nobody
group nogroup
persist-key
persist-tun
status openvpn-status.log
verb 3
EOF

cat << EOF > /etc/openvpn/client.conf
client
dev tun
proto udp
remote IP_ADDRESS 1194
resolv-retry infinite
nobind
user nobody
group nogroup
persist-key
persist-tun
remote-cert-tls server
comp-lzo
verb 3
cipher AES-128-CBC
auth SHA256
key-direction 1
EOF

cd /usr/share/easy-rsa && \
./easyrsa init-pki && \
echo \r | ./easyrsa build-ca nopass && \
./easyrsa build-server-full server nopass && \
./easyrsa gen-dh && \
openvpn --genkey --secret pki/ta.key && \
./easyrsa build-client-full client nopass && \

mkdir $KEYS && \
cd pki && \
cp *.crt *.key *.pem private/*.key issued/*.crt reqs/*.req $KEYS && \

echo 'net.ipv4.ip_forward = 1' >> /etc/sysctl.conf && \
sysctl -p /etc/sysctl.conf && \

# Firewall
sed -i '1s@^@\n@g' $UFW_RULES && \
sed -i '1s@^@COMMIT\n@g' $UFW_RULES && \
sed -i '1s@^@-A POSTROUTING -s 10.8.0.0/8 -o '"$DEFAULT_ROUTE"' -j MASQUERADE\n@g' $UFW_RULES && \
sed -i '1s@^@:POSTROUTING ACCEPT [0:0]\n@g' $UFW_RULES && \
sed -i '1s@^@*nat\n@g' $UFW_RULES && \
sed -i 's@DEFAULT_FORWARD_POLICY@DEFAULT_FORWARD_POLICY="ACCEPT"\n# DEFAULT_FORWARD_POLICY@g' $UFW_DEFAULT && \
sed -i 's@DEFAULT_INPUT_POLICY@DEFAULT_INPUT_POLICY="ACCEPT"\n# DEFAULT_INPUT_POLICY@g' $UFW_DEFAULT && \
ufw disable && ufw enable && \

sed -i 's@IP_ADDRESS@'"$(wget -qO- http://ipecho.net/plain ; echo)"'@g' /etc/openvpn/client.conf && \

cat /etc/openvpn/client.conf > $OVPN && \
echo '<ca>' >> $OVPN && \
cat $KEYS/ca.crt >> $OVPN && \
echo '</ca>' >> $OVPN && echo '<cert>' >> $OVPN && \
cat $KEYS/client.crt >> $OVPN && \
echo '</cert>' >> $OVPN && echo '<key>' >> $OVPN && \
cat $KEYS/client.key >> $OVPN && \
echo '</key>' >> $OVPN && echo '<tls-auth>' >> $OVPN && \
cat $KEYS/ta.key >> $OVPN && \
echo '</tls-auth>' >> $OVPN && \

reset && \
cat /etc/openvpn/client.ovpn && \
openvpn /etc/openvpn/server.conf;
