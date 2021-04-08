const uuid = require('uuid');
const {cluster, collection} = require('./dbcon');

let RecordModel = () => { };

RecordModel.getReservation = async (key) => {
    try {
        const document = await collection.get(key, { timeout: 10000 });
        return document.content;
    } catch (err) {
        return { "error": err};
    }
};

RecordModel.getAllReservation = async (options) => {

    const query = ` SELECT * FROM \`hiltonRestaurant\` 
                    WHERE type='reservation' 
                    ${ options.status ? " AND status='" + options.status + "'": "" }
                    ${ options.expectedArrivalDate ? " AND expectedArrivalDate='" + options.expectedArrivalDate + "'": "" }
                    ORDER BY expectedArrivalDate ASC, 
                             expectedArrivalTime ASC, 
                             status DESC; `;
    try {
        const document = await cluster.query(query);
        return document;
    } catch (err) {
        return {"error": err };
    }
};

RecordModel.addReservation = async (data, callback) => {
    try {
        const resvID = data.resvID ? data.resvID : "HRes_" + uuid.v4();
        let document = {
            "name": data.name,
            "mobile": data.mobile,
            "email": data.email,
            "numberOfGuests": data.numberOfGuests,
            "numberOfTables": data.numberOfTables,
            "expectedArrivalDate": data.expectedArrivalDate,
            "expectedArrivalTime": data.expectedArrivalTime,
            "status": data.status ? data.status : "open",
            "lastUpdatesTime": Date.now(),
            "type": "reservation",
            "resvID": resvID
        }
        await collection.upsert(resvID, document, { timeout: 10000 });
        callback(null, resvID);
    } catch (err) {
        callback(err, null);
        return;
    }
};

module.exports = RecordModel;