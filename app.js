const app = require('express')();
const routes = require('./routes');
const port = process.env.PORT || 2020;

// 
app.use('/', routes);

app.listen(port, (err) => {
    if (err) {
        console.log(err);
    }
    console.log('app is listening on: '+port);
})