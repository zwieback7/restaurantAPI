const express = require('express');
const { util } = require('util');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const recordmodel = require('../models/recordmodel');

const router = express.Router();

const schema = buildSchema(`
type Record {
    name: String,
    mobile: String,
    email: String,
    numberOfGuests: Int,
    numberOfTables: Int,
    expectedArrivalDate: String,
    expectedArrivalTime: String,
    status: String,
    lastUpdatesTime: String,
    type: String,
    resvID: ID
},

input UpdateRecordInput {
    name: String,
    mobile: String,
    email: String,
    numberOfGuests: Int,
    numberOfTables: Int,
    expectedArrivalDate: String,
    expectedArrivalTime: String,
    status: String,
},

type Reservation {
    hiltonRestaurant: Record
},

input CreateRecordInput {
    name: String,
    mobile: String,
    email: String,
    numberOfGuests: Int,
    numberOfTables: Int,
    expectedArrivalDate: String,
    expectedArrivalTime: String
},

type UpdateConfirmation {
    message: String,
    resvID : String
}

type Query {
    getReservationByID(id: String!): Record
    getAllReservations(status: String, date: String): [Reservation]
},

type Mutation {
    updateReservation(id: ID, newRecord: UpdateRecordInput): UpdateConfirmation
    createReservation(newRecord: CreateRecordInput): UpdateConfirmation
}
`);


const root = {
    getReservationByID: async ({id}) => {
        const res = await recordmodel.getReservation(id);
        return res;
    },

    getAllReservations: async ({status, date}) => {

        let options = {
            "status": status,
            "expectedArrivalDate": date
        };
        const res = await recordmodel.getAllReservation(options);
        return res.rows;
    },

    updateReservation: async ({id, newRecord}) => {
        const res = await recordmodel.getReservation(id);
        if (res.error) {
            return { message: "fail to make reservation"}
        }
        let data = newRecord;
        data.resvID = id;
        recordmodel.addReservation(data, (err, res) => {
            if (err) {
                return { message: "fail to make reservation" }
            }
            console.log({"resvID": res});
            return { message: "Updated", resvID: res };
        });
    },

    createReservation: async ({newRecord}) => {
        recordmodel.addReservation(newRecord, (err, res) => {
            if (err) {
                return { message: "fail to make reservation" };
            }
            console.log({"resvID": res});
            return { message: "Created", resvID: res };
        });
    }
};


router.use(graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: process.env.NODE_ENV === 'development'
}));

module.exports = router;