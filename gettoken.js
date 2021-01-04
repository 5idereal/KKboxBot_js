const fetch = require('node-fetch')
const { kkbox_secret, kkbox_id } = require('./config.json');

function search() {
    fetch(encodeURI('https://account.kkbox.com/oauth2/token'), {
        method: 'POST', body: 'grant_type=client_credentials&client_id=' + kkbox_id + '&client_secret=' + kkbox_secret, headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (myJson) {
            console.log(myJson);
        });
}
search();