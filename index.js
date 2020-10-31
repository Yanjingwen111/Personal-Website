var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use('/public', express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var fs = require('fs');

async function getComment() {
    contentInfo = []
    fs.readFile('public/data.txt', 'utf-8', await function (err, data) {
        if (err) {
            console.error(err);
        }
        else {
            let names = data.split(";")
            names.forEach(element => {
                if (element !== "")
                    contentInfo.push(element)
                if (element.indexOf("\r\n")) {
                }
            });
            console.log(contentInfo)
        }
    });
    return contentInfo
}

app.get('/getComment', async function (req, res) {
    fs.readFile('public/data.txt', 'utf-8', function (err, data) {
        if (err) {
            console.error(err);
        }
        else {
            contentInfo = []
            let names = data.split(";")
            names.forEach((element, index) => {
                if (index != names.length - 1) {
                    if (element.indexOf("\r\n")) {
                        var tempcontent = element.substring(4, element.length)
                        contentInfo.push(tempcontent)
                    } else {
                        contentInfo.push(element)
                    }
                }
            });
            console.log(contentInfo)
            var commentobj = []
            contentInfo.forEach(element => {
                var info = element.split(",time:")
                var tempcommentobj = {
                    time: info[1]
                }
                var info2 = info[0].split(",userWords:")
                tempcommentobj.userWords = info2[1]
                var info3 = info2[0].split("userName:")
                tempcommentobj.userName = info3[1]
                commentobj.push(tempcommentobj)
            });
            res.json(commentobj)
        }
    });
})

function getNowFormatDate() {
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;

    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }

    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
        + " " + date.getHours() + seperator2 + date.getMinutes()
        ;
    return currentdate;
}

app.post('/addcomment', function (req, res) {
    var time = getNowFormatDate()
    var str = `\r\nuserName:${req.body.userName},userWords:${req.body.userWords},time:${time};`
    fs.readFile('public/data.txt', 'utf-8', function (err, data) {
        if (err) {
            console.error(err);
        }
        else {
            contentInfo = []
            let names = data.split(";")
            names.forEach((element, index) => {
                if (index != names.length - 1) {
                    if (element.indexOf("\r\n")) {
                        var tempcontent = element.substring(4, element.length)
                        contentInfo.push(tempcontent)
                    } else {
                        contentInfo.push(element)
                    }
                }
            });
            console.log(contentInfo)
            var commentobj = []
            contentInfo.forEach(element => {
                var info = element.split(",time:")
                var tempcommentobj = {
                    time: info[1]
                }
                var info2 = info[0].split(",userWords:")
                tempcommentobj.userWords = info2[1]
                var info3 = info2[0].split("userName:")
                tempcommentobj.userName = info3[1]
                commentobj.push(tempcommentobj)
            });

            var isOldUser = false
            var tipinfo = {}
            var newcommentobj = []
            for (var i = commentobj.length - 1; i >= 0; i--) {
                newcommentobj.push(commentobj[i])
            }
            newcommentobj.forEach(element => {
                if (element.userName == req.body.userName) {
                    isOldUser = true
                    tipinfo = element
                }
            });
            tipinfo = {
                ...tipinfo,
                isOldUser
            }
            res.json(tipinfo)
        }
    });
    fs.appendFile('public/data.txt', str, (err) => {
        if (err) throw err;
    });
})

function getData() {
    var result = {
        project1: {
            hour: getLikeNum(1, 0),
            day: getLikeNum(1, 1),
            week: getLikeNum(1, 2),
        },
        project2: {
            hour: getLikeNum(2, 0),
            day: getLikeNum(2, 1),
            week: getLikeNum(2, 2),
        },
        project3: {
            hour: getLikeNum(3, 0),
            day: getLikeNum(3, 1),
            week: getLikeNum(3, 2),
        },
        project4: {
            hour: getLikeNum(4, 0),
            day: getLikeNum(4, 1),
            week: getLikeNum(4, 2),
        },
        project5: {
            hour: getLikeNum(5, 0),
            day: getLikeNum(5, 1),
            week: getLikeNum(5, 2),
        },
        project6: {
            hour: getLikeNum(6, 0),
            day: getLikeNum(6, 1),
            week: getLikeNum(6, 2),
        }
    }
    return result
}
app.get('/getLike', function (req, res) {
    var result = getData()
    res.json(result)
})

app.get('/addlike', function (req, res) {
    var id = req.query.id
    contentInfo.push({
        id: id,
        createtime: getNowFormatDate()
    })
    var result = getData()
    res.json(result)
})

app.get('/resetLike', function (req, res) {
    var type = req.query.type
    var id = req.query.id
    resetResult(id, type)
    var result = getData()
    res.json(result)
})

function resetResult(projectid, type) {
    var currentTime = getNowFormatDate()
    var date = [frontOneHour('yyyy-MM-dd hh:mm', 1), frontOneHour('yyyy-MM-dd hh:mm', 24), frontOneHour('yyyy-MM-dd hh:mm', 24 * 7)]
    var arr = []
    contentInfo.forEach((element, index) => {
        if (element.id == projectid) {
            if (element.createtime > date[type] && element.createtime <= currentTime)
                arr.push(index)
        }
    })
    console.log(arr)
    var tempinfo = contentInfo
    contentInfo = []
    tempinfo.forEach((element, index) => {
        var flag = false
        for (var i = 0; i < arr.length; i++) {
            if (index == arr[i]) {
                flag = true
            }
        }
        if (!flag) {
            contentInfo.push(element)
        }
    });
}

function getLikeNum(projectid, flag) {
    var currentTime = getNowFormatDate()
    var number = 0
    var date = [frontOneHour('yyyy-MM-dd hh:mm', 1), frontOneHour('yyyy-MM-dd hh:mm', 24), frontOneHour('yyyy-MM-dd hh:mm', 24 * 7)]
    contentInfo.forEach(element => {
        if (element.id == projectid) {
            if (element.createtime > date[flag] && element.createtime <= currentTime)
                number++
        }
    })
    return number
}

function frontOneHour(fmt, flag) {
    var currentTime = new Date(new Date().getTime() - 1 * 60 * 60 * 1000 * flag)
    var time = {
        'M+': currentTime.getMonth() + 1, 
        'd+': currentTime.getDate(), 
        'h+': currentTime.getHours(), 
        'm+': currentTime.getMinutes(), 
        's+': currentTime.getSeconds(), 
        'q+': Math.floor((currentTime.getMonth() + 3) / 3),
        'S': currentTime.getMilliseconds()
    }
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (currentTime.getFullYear() + '').substr(4 - RegExp.$1.length))
    for (var i in time) {
        if (new RegExp('(' + i + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (time[i]) : (('00' + time[i]).substr(('' + time[i]).length)))
    }
    return fmt
}

function getNowFormatDate() {
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;

    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }

    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
        + " " + date.getHours() + seperator2 + date.getMinutes()
        ;
    return currentdate;
}

const port = 3000;
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}/public/comment.html`)
})
