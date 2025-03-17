const iso8583 = require('iso_8583');
const fetch = require('node-fetch')
const pad = require('./utils/util').pad
const CONSTANTS = require('./utils/constant')
var fs = require('fs');
 
var sim_URL = fs.readFileSync('Config.txt', 'utf8');
const HOST = process.env.HOST ||sim_URL
const quotesEndpoint = HOST + '/payeefsp/quotes'
const otpEndpoint = HOST + '/payerfsp/authorizations'
const checkParticipantEndpoint = HOST + '/payerfsp/correlationid'

async function handleISO(data, sock) {

    function guid1(stan) {
        console.log(`stan: ${stan}`)

        function _p8(s) {
            var p = (stan.toString(16) + "000000000").substr(2, 8);
            return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
        }
        return _p8() + _p8(true) + _p8(true) + _p8();
    }

    let isoUnpacked = new iso8583().getIsoJSON(data)
    let isopack1 = new iso8583(isoUnpacked)
   // console.log(`Message valid? ${isopack1.validateMessage()}`)
   if((isopack1.validateMessage()))
   {
    console.log(` iso message :`)
    console.log(isoUnpacked)
    if (isopack1.validateMessage()) {
        console.log(` iso message type: ${isoUnpacked[0]}`)

        //*******************************************************************/
        //isoUnpacked[30] fees=

        let amtIso = (+isoUnpacked[4] / 100).toFixed(2);
        let amtStr = amtIso.toString();
        if (isoUnpacked[49] == 356) {
            F049 = 'INR'
        } else if (isoUnpacked[49] == 840) {
            F049 = 'USD'
        } else if (isoUnpacked[49] == 710) {
            F049 = 'ZAR'
        }

        let phoneNo = isoUnpacked[2].substr(0, 10);
        let uuid = guid1(isoUnpacked[11]);


        let quote_request = {
            "quoteId": "7c23e80c-d078-4077-8263-2c047876fcf6",
            "transactionId": uuid,
            "payee": {
                "partyIdInfo": {
                    "partyIdType": "IBAN",
                    "partyIdentifier": isoUnpacked[41],
                    "fspId": "MobileMoney"
                }
            },
            "payer": {
                "personalInfo": {
                    "complexName": {
                        "firstName": "Mats",
                        "lastName": "Hagman"
                    }
                },
                "partyIdInfo": {
                    "partyIdType": "MSISDN",
                    "partyIdentifier": phoneNo,
                    "fspId": "BankNrOne"
                }
            },
            "amountType": "RECEIVE",
            "surcharge": '',
            "amount": {
                "amount": amtStr,
                "currency": isoUnpacked[49]
            },
            "transactionType": {
                "scenario": "TRANSFER",
                "initiator": "PAYER",
                "initiatorType": "CONSUMER"
            },
            "note": "From Mats",
            "expiration": new Date(new Date().getTime() + 10000)
        }

        if (isoUnpacked[0] == '0100') {
            let c = isoUnpacked[28]
            let a = c.split('D');
            let phoneNo = isoUnpacked[2].substr(0, 10);
            const surcharge = a[1];
            quote_request.surcharge = surcharge;
            console.log("The OpenAPI Quote Request to PayeeFSP")
            console.log("-------------------------------------")
            console.log(quote_request)

            const checkPayerUrl = `${checkParticipantEndpoint}/${phoneNo}`;
            return fetch(checkPayerUrl, {
                method: 'GET'
            })
                .then(response => response.text())
                .then(text => {
                    try {
                        const data = JSON.parse(text);
                        console.log(data)
                        console.log('valid json')
                        return fetch(quotesEndpoint, {
                            headers: {
                                'Accept': 'application/vnd.interoperability.quotes+json;version=1',
                                'Content-Type': 'application/vnd.interoperability.quotes+json;version=1.0',
                                'FSPIOP-Source': 'atm',
                                'FSPIOP-Destination': 'payeefsp',
                                'Date': new Date().toISOString()
                            },
                            method: "POST",
                            body: JSON.stringify(quote_request)
                           
                        })
                            .then((res) => res.json()
                            )
                            .then((res) => {

                                quoteAmount = res.quoteAmount.amount;
                                console.log(res.quoteAmount)
                                console.log(isopack1)
                                console.log('isoUnpacked after receiving quotes----------------');
                                console.log(isoUnpacked[0])
                                if (isoUnpacked[0] == '0100') {
                                    let isoUnpackedCopy = isoUnpacked;
                                    isoUnpackedCopy[0] = '0110';
                                    isoUnpackedCopy[39] = '00';
                                    let quotenoSend = pad(+quoteAmount * 100, 7) 
                                    isoUnpackedCopy[48] = quoteAmount.toString();                                
                                   //isoUnpackedCopy[48] = Math.floor(quoteAmount).toString();
                                    let isopack = new iso8583(isoUnpackedCopy)
                                    console.log('isopacked----------------');
                                    console.log(isopack)
                                    console.log(isopack.getBmpsBinary)
                                    sock.write(isopack.getBufferMessage());
                                }

                            })
                    }

                    catch (err) {
                        console.log('invalid json')
                        console.log(err);
                        let isoUnpackedCopy = isoUnpacked;
                        isoUnpackedCopy[0] = '0110';
                        isoUnpackedCopy[39] = '56';
                        let isopack = new iso8583(isoUnpackedCopy)
                        console.log('isopacked----------------');
                        console.log(isopack)
                        console.log(isopack.getBmpsBinary)
                        console.log('sending 0110 message with resp code 56')
                        sock.write(isopack.getBufferMessage());
                    }
                }).catch(err => console.log(err))
        }
        if (isoUnpacked[0] == '0200') {
            let isoUnpackedCopy = isoUnpacked;
            isoUnpackedCopy[0] = '0210';
            isoUnpackedCopy[39] = '00';
            const otp_request = {
                "phoneNo": isoUnpackedCopy[102],
                "inputOtp": isoUnpackedCopy[103],
            }
            return fetch(otpEndpoint, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify(otp_request)
            })
                .then(res => res.json())
                .then(res => {
                    if (res.status == CONSTANTS.OTP_VERIFIED) {
                        console.log('otp verified')
                        isoUnpackedCopy[39] = '00';
                        let isopack = new iso8583(isoUnpackedCopy)
                        console.log('isopacked----------------');
                        console.log(isopack)
                        console.log(isopack.getBmpsBinary)
                        sock.write(isopack.getBufferMessage());
                    } else {
                        console.log('otp failed')
                        console.log(res.response)
                        isoUnpackedCopy[39] = '12';
                        let isopack = new iso8583(isoUnpackedCopy)
                        console.log('isopacked----------------');
                        console.log(isopack)
                        console.log(isopack.getBmpsBinary)
                        sock.write(isopack.getBufferMessage());

                    }
                })

        }
    }
}
else
{
   console.log('Connected to Server') 
}
}
module.exports = {
    handleISO
}
