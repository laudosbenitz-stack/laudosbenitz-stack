const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: 'gateway01.us-east-1.prod.aws.tidbcloud.com',
    user: '3Kx85bZoE4Bj8bX.root',
    password: 'DotHfd9GKc1Qqaj1',
    database: 'test',
    port: 4000,
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
    }
});

module.exports = db;