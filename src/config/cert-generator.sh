mkdir ssl
rm -rf ssl/*
cd ssl
KEY_NAME=$1.key
openssl genrsa -des3 -out $KEY_NAME 2048
openssl rsa -in $KEY_NAME -out $KEY_NAME.insecure
mv $KEY_NAME $KEY_NAME.secure
mv $KEY_NAME.insecure $KEY_NAME
openssl req -new -key $KEY_NAME -out $2.csr
openssl x509 -req -days 365 -in $2.csr -signkey $KEY_NAME -out $2.crt
openssl x509 -in $2.crt -out $2.pem -outform PEM


rm -rf $KEY_NAME.secure
rm -rf $2.csr
rm -rf $2.crt

echo 'Done creating certificates'