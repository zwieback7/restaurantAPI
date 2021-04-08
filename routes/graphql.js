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

enum StatusEnum{
    open
    cancelled
    completed
}

type Query {
    getReservationByID(id: String!): Record
    getAllReservations(status: String, date: String): [Reservation]
},

type Mutation {
    updateReservation(id: ID, newRecord: UpdateRecordInput): UpdateConfirmation
    createReservation(newRecord: CreateRecordInput): UpdateConfirmation
    updateReservationStatus(id: ID, status: StatusEnum): UpdateConfirmation
}
`);


const root = {
    getReservationByID: async ({ id }) => {
        const res = await recordmodel.getReservation(id);
        return res;
    },

    getAllReservations: async ({ status, date }) => {

        let options = {
            "status": status,
            "expectedArrivalDate": date
        };
        const res = await recordmodel.getAllReservation(options);
        return res.rows;
    },

    updateReservation: async ({ id, newRecord }) => {
        const res = await recordmodel.getReservation(id);
        if (res.error) {
            return { message: "fail to get reservation" }
        }
        let data = newRecord;
        data.resvID = id;
        let result = await recordmodel.addReservation(data);
        if (result.error) {
            return { message: "fail to make reservation" }
        }
        return { message: "Updated", resvID: result };
    },

    createReservation: async ({ newRecord }) => {
        if (!newRecord.name ||
            !newRecord.email) {
            return { message: "Info missing" };
        }
        let res = await recordmodel.addReservation(newRecord);
        if (res.error) {
            return { message: "fail to make reservation" };
        }
        return { message: "Created", resvID: res };
    },

    updateReservationStatus: async ({ id, status }) => {
        const res = await recordmodel.getReservation(id);
        if (res.error) {
            return { message: "fail to get reservation" }
        }
        let data = res;
        data.resvID = id;
        data.status = status;
        let result = await recordmodel.addReservation(data);
        if (result.error) {
            return { message: "fail to make reservation" }
        }
        return { message: "Updated", resvID: result };
    },
};


router.use(graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: process.env.NODE_ENV === 'development'
}));

module.exports = router;