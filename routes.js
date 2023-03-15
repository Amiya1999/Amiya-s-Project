const fs=require('fs');

const requestHandler=(req,res)=>{
    const url=req.url;
    const method=req.method;
    if(url === '/'){
        res.write('<html>');
        res.write('<head><title>Enter your message</title></head>')
        res.write('<body><form action="/message" method="POST"><input type="text" name="message"><button type="submit">SEND</button></form></body>');
        res.write('</html>');
        res.end();
    }
    if(url==='/message' && method==='POST'){
        const body= [];
        req.on('data',(chunk)=>{
            console.log(chunk);
            body.push(chunk);
        });
        req.on('end',() => {
            const parsedBody=Buffer.concat(body).toString(); 
            const message=parsedBody.split('=')[1];     
            fs.writeFileSync('message.txt', message); 
    
            // Read the contents of the file and console them to the screen
            fs.readFile('message.txt', (err, data) => {
                if (err) throw err;
                console.log(data.toString());
            });
        });
     
        res.statusCode=302;
        res.setHeader=('Location','/');
        return res.end(); 
    }
    res.setHeader('Content-Type', 'text/html');
    res.write('<html>');
    res.write('<head><title>My First Page</title></head>');
    res.write('<body><h1> Hello from my node js server!</h1></body>');
    res.write('</html>');
    res.end();
} 
// 1-- 
//exports.handler= requestHandler;
//exports.sometext='some hard coded text';

//2--
//module.exports(requestHandler);

//3--
module.exports={
    handler:requestHandler,
    sometext:'some hard coded text'
};
