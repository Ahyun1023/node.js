const send = function(){
    var files = req.files;

    var originalname = files[index].originalname;
    var url = "'/img/" + originalname + "'";

    return url;
}