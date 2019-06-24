# ISO-Open API Adapter

The	Open API Adapter is started with a TCP Server connection. The data received through the socket is passed to ‘handleISO’ function where the adapter handles the 0100 and 0200 messages.

The received ISO message is unpacked using the iso_8583 package. The unpacked fields are mapped to an Open API request. (ie, if it is 0100 message will mapped to OpenAPI Quote request). 

## Mapping Function

- The PhoneNo is extracted from the field 2 in 0100 message.
- Surcharge is extracted from field 28(1 percentage of the amount).
- Then the OpenAPI quote request is  forwarded to Payer FSP using the URL : http://localhost:8444/payerfsp/correlationid/9895876405 (This will  check whether the participant is existing or not in  Payer FSP)
- If the response is a valid Json then the response will be forwarded to the URL : http://localhost:8444/payeefsp/quotes
- Payee FSP will add Payee FSP fees and forward to Payer FSP to calculate quote amount and return an OpenAPI message containing quote amount.
- The Quote amount is set to Field 48 in 0110 message and the field 39 is set to ‘00’
- If the result is an Invalid Json then, the 0110 message is send with a response code ‘56’. (because of invalid participant)
- In both cases, the unpacked Iso message is packed with corresponding response code using iso_8583 package and sent back to the socket in the form of Bitmap Binary and the client will receive it as data from the server.
- In the second leg, the 0200 message is received from the socket and unpacked in the handleISO function using the iso_8583 package.
- Extract the OTP and Phone number from the fields 103 and 102.
- Then POST the OTP request to Payer FSP using the URL : http://localhost:8444/payerfsp/authorizations
- The response is handled using a promise function in OpenAPI Adapter.
- If the response is ‘otp verified’ then pack the 0210 message with a response code ‘00’
- If the response is ‘otp failed’ then pack the 0210 message with a response code ’12’ in the field 39.



