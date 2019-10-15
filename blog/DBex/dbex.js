var mysql = require('mysql');

var conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'fkrtmgkswks',
    port: 3306,
    database: 'blog'
});

conn.connect();

conn.query('SELECT * FROM users', function(err, rows, fields){
    if(!err){
        for(var i = 0; i<rows.length; i++){
            console.log('solution is:', rows[i]);
        }
    }
    else{
        console.log('error while performing query', err);
    }
});

var sql = ('UPDATE users SET password = ? WHERE id = test2');
var value = ['test3, zxcv, test3@naver.com'];

conn.query(sql, value, function(err, rows, fields){

})



conn.end();