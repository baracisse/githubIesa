const puppeteer = require('puppeteer');

const BASE_URL = "https://github.com/login";

// Changer la valeur pour chercher un autre terme
const Recherche = "bara";

const mongoose = require('mongoose');

const github = {
    browser:null,
    page: null,

    initialize: async () =>{
        github.browser = await puppeteer.launch({headless:false});

        github.page = await github.browser.newPage();
    },

    login: async (username, password) =>{
        await github.page.goto(BASE_URL, {waitUntil:'networkidle2'});

        await github.page.waitFor('body');

        await github.page.type('input[name="login"',username,{delay:50});

        await github.page.type('input[name="password"',password,{delay:50});

        await github.page.click('input[name="commit"');

        await github.page.waitFor(2000);

        await github.page.click('button[aria-label="Toggle navigation"]');

        await github.page.waitFor(1000);

        await github.page.goto("https://github.com/search?q="+Recherche+"&type=Users", {waitUntil:'networkidle2'});

    },

    parsePage: async(number) =>{
        
        let everything = [];

        for(let i=0; i<number; i++){
           
           let urls = []

           let newUrls = await github.page.evaluate(()=>{
            let results = []
            let items = document.querySelectorAll('.user-list > .user-list-item')
            items.forEach((item)=>{
               
                let mail = "";
                try {
                    mail = item.querySelector(".muted-link").innerText;
                } catch {
                    
                }
                results.push({
                    pseudo : item.querySelector('.text-normal').innerText,
                    mail : mail
                })
            })
            return results
            }) 
            urls = urls.concat(newUrls)
            everything = everything.concat(urls);

            await github.page.waitFor(2000);
            await github.page.click('a.next_page');
            await github.page.waitFor('body');
            await github.page.waitFor(2000);
            console.log("Page n°"+i+" analysée");
        }

        console.log("Fini");
        console.log(everything[1]);
        
        await github.page.waitFor(2000);
        
        mongoose.connect('mongodb://localhost/test', {useNewUrlParser: true});
        var db = mongoose.connection;
        db.on('error', console.error.bind(console, 'connection error:'));
        db.once('open', function() {
          // we're connected!
          console.log("Connected to database");
          const utilisateurSchema = new mongoose.Schema({
            pseudo: String,
            mail : String
          });
        
        var Utilisateur = mongoose.model('Utilisateur', utilisateurSchema);

        

          for(let k = 0; k<everything.length; k++){
            
            new Utilisateur(everything[k]).save(function (err, users) {
                if (err) return console.error(err);
                console.log(users);
            });
          }

        });

    }

  
}

module.exports = github;