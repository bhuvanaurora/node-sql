var nodeSql = require('./index');

var app = require('express')();

var server = app.listen(3002, function(err) {
    console.log('started');
});

nodeSql.Schema({
    hotelDetails: {
        hotelId: ["BIGINT", "UNSIGNED", "NOT NULL", "PRIMARY KEY", "AUTO_INCREMENT"],
        hotelName: ["VARCHAR(128)", "NOT NULL"],
        website: ["VARCHAR(255)"],
        isChain: ["BOOLEAN", "DEFAULT 0"],
        parentHotelName: ["VARCHAR(128)"],
        parentmid: ["VARCHAR(30)"],
        hotelPolicy: ["TEXT"],
        starRating: ["INT"],
        hotelTaRating: ["DECIMAL(2,1)"],
        description: ["TEXT"],
        shortDescription: ["TEXT"],
        noOfRooms: ["INT"],
        noOfFloors: ["INT"],
        // Address
        streetAddress: ["TEXT"],
        locality: ["VARCHAR(128)"],
        zip: ["VARCHAR(10)"],
        city: ["VARCHAR(128)"],
        state: ["VARCHAR(128)"],
        country: ["VARCHAR(128)"],
        countryCode: ["VARCHAR(5)"],
        latitude: ["DECIMAL(7,4)"],
        longitude: ["DECIMAL(7,4)"],
        // Payment Options
        creditCard: ["BOOLEAN"],
        debitCard: ["BOOLEAN"],
        americanExpress: ["BOOLEAN"],
        internationalCards: ["BOOLEAN"],
        paytmCash: ["BOOLEAN"],
        // Policies
        petsAllowed: ["BOOLEAN"],
        liquorAllowed: ["BOOLEAN"],
        foreignersAllowed: ["BOOLEAN"],
        localIdsAllowed: ["BOOLEAN"],
        freeCancellation: ["BOOLEAN"],
        // Amenities
        areAmenitiesFree: ["BOOLEAN"],
        businessCentre: ["BOOLEAN"],
        airConditioning: ["BOOLEAN"],
        swimmingPool: ["BOOLEAN"],
        twentyFourHrCheckIn: ["BOOLEAN"],
        restaurant: ["BOOLEAN"],
        roomService: ["BOOLEAN"],
        parking: ["BOOLEAN"],
        wifi: ["BOOLEAN"],
        bar: ["BOOLEAN"],
        gym: ["BOOLEAN"],
        // Status
        isActive: ["BOOLEAN", "DEFAULT 0"],
        doesExist: ["BOOLEAN", "DEFAULT 0"],
        checkInTime: ["VARCHAR(30)"],
        checkOutTime: ["VARCHAR(30)"],
        createdBy: ["VARCHAR(30)"],
        updatedBy: ["VARCHAR(30)"],
        createdAt: ["TIMESTAMP", "NOT NULL", "DEFAULT CURRENT_TIMESTAMP"]
    }
});

var conn = nodeSql.createConnection({
    connectionLimit : 100,
    host : 'localhost',
    user : 'paytm',
    password : 'paytm',
    database : 'testsql',
    debug : false
});