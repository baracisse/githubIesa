const github = require('./github');
const creds = require('./creds');

const index = async ()=>{
    await github.initialize();

    await github.login(creds.username, creds.password);

    // CHANGER LE NOMBRE POUR SCRAPPER PLUSIEURS TABLES
    await github.parsePage([5]);

}

index().then(value=>{
    console.log(value);
})