/*****
 License
 --------------
 Copyright © 2017 Bill & Melinda Gates Foundation
 The Mojaloop files are made available by the Bill & Melinda Gates Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Gates Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.
 * Gates Foundation
 - Renjith Palamattom  <renjith@coil.com>
 --------------
 ******/

'use strict'

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const ObjectID = require('mongodb').ObjectID;
const dbname = "otp_mongodb";
const url = "mongodb://localhost:27017"; //default location where mongodb is located on machine
const mongoOptions = { useNewUrlParser: true };

const state = {
    db : null
};

const connect = (cb) =>{
    if(state.db){//if db connection
        cb();
    }
    else {//no db conn, connect
        MongoClient.connect(url, mongoOptions, (err,client) =>{
            if(err){
                cb(err);
            }
            else{
                state.db = client.db(dbname);
                cb();
            }
        });
    }
}

//return ObjectID object used to query db by primary key
const getPrimaryKey = (_id) => {
    return ObjectID(_id);
}

const getDB = () =>{
    return state.db;
}

module.exports = {
    getDB, connect, getPrimaryKey, dbname
};