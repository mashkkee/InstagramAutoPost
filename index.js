require("dotenv").config();
const { IgApiClient } = require('instagram-private-api');
const { get } = require('request-promise');
const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');
const request = require('request')
const translatte = require('translatte');

let imageBuffer;
let quote = {
    author: "",
    quote: ""
};
async function postImage() {
    let res = await fetch('https://source.unsplash.com/random/900×700/?love,background')
    imageBuffer = await get({
        url: res.url,
        encoding: null,
    });

    addTextOnImage()
}

async function runAct() {
    request.get({
        url: 'https://api.api-ninjas.com/v1/quotes?category=love',
        headers: {
            'X-Api-Key': 'sYWY1+sdMZxHYEMM6pppkQ==W7SzitVQaTudi3R0'
        },
    }, function (error, response, body) {
        if (error) return console.error('Request failed:', error);
        else if (response.statusCode != 200) return console.error('Error:', response.statusCode, body.toString('utf8'));
        else {
            quote.quote = JSON.parse(body)[0].quote
            
            quote.author = JSON.parse(body)[0].author

            if(quote.quote.length > 200) {
                runAct()
                console.log(`[POST] Quote is longer than 200 chars, trying to find new one...`)
            } else {
                postImage()
            }
            
        }

    });
}






async function addTextOnImage() {
    try {


        await Jimp.read(imageBuffer).then(async function (image) {

            image.resize(1080, 1080)
                .quality(100);
            image.blur(20)
            image.brightness(-0.5)
            image.shadow

            await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE).then(async function (font) {

                await image.print(font, 0, 0, {
                    text: quote.quote.toString(),
                    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                    alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
                }, image.bitmap.width, image.bitmap.height);
                
            }).then(async () => {
                await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE).then(async function (font) {
                    await image.print(font, 0, 0, {
                        text: quote.author.toString(),
                        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                        alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM
                    }, image.bitmap.width, image.bitmap.height);
                    image.getBuffer(Jimp.MIME_JPEG, (err, buffer) => {
                        postToInsta(buffer, quote.quote.toString())
                    })
                })
            });
            

        }).catch(function (err) {
            console.error(err);
        });
    }
    catch (err) {
        console.log(err)
    }
}




const postToInsta = async (img, comment) => {
    const ig = new IgApiClient();
    ig.state.generateDevice(process.env.IG_USERNAME);
    await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);


    //const promise = fs.promises.readFile(path.join('./image.jpg'));
    //Promise.resolve(promise).then(async function (buffer) {
    //});

    await ig.publish.photo({
        file: img,
        caption: `${comment}       #LoveInWords #HeartfeltQuotes #EmbraceLove #QuotesOfPassion #LovingWords #InspirationalLove #WordsOfTenderness #CapturedEmotions #AffectionQuotes #RomanticWhispers #InspireLove #TenderLines #CapturedAffection #AffectionateWords #WhispersOfRomance`,
    }).catch(err => {
        return err;
    });
    console.log(`[-------------------------------------]`)
    console.log("[POST] Sucsessfuly posted on Instagram")
    console.log(`[POST] Date: ${new Date()}`)
    console.log(`[POST] Quote used: "${comment}"`)
    console.log(`[POST] Account: @kvadrat.ljubavi`)
    console.log(`[POST] Next post in 1 hour`)
    console.log(`[-------------------------------------]`)
    setTimeout(() => {
        runAct();
    }, 3600000);

}

runAct();


