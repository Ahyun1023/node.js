var express = require('express'),
    http = require('http'),
    path = require('path');
const app = express();

var bodyParser = require('body-parser');

var static = require('serve-static');

var expressSession = require('express-session'),
    errorHandler = require('errorhandler'),
    expressErrorHandler = require('express-error-handler');

var multer = require('multer'),
    fs = require('fs'),
    cors = require('cors');

var crypto = require('crypto'); //비밀번호 암호화

var moment = require('moment');

var routes = require('./routes/route');

app.set('port', process.env.PORT || 3000);

app.use('/public', static(path.join(__dirname, 'public')));
app.use('/uploads', static(path.join(__dirname, 'uploads')));

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

var storage = multer.diskStorage({
    destination: function(req, file, callback){
        return(null, 'uploads');
    },
    filename: function(req, file, callback){
        return(null, file.originalname);
    }
})

var upload = multer({
    storage: storage,
    limits:{
        files: 10,
        fileSize: 1024 * 1024 * 1024
    }
})

router = express.Router();

router.route('/login').post(routes.login); //미완성

router.route('/signUp').post(routes.signUp);

app.use('/', router);

var startDate = moment().format("YYYY-MM-DD HH:mm:ss");
http.createServer(app).listen(app.get('port'), function(){
    console.log('서버 시작 시간: %s, 포트넘버: %d',startDate, app.get('port'));
})