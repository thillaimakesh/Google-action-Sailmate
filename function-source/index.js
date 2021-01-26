// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
 
const admin = require('firebase-admin');
const functions = require('firebase-functions');
const http = require('http');
const {dialogflow, SignIn} = require('actions-on-google');
const app = dialogflow({
  // REPLACE THE PLACEHOLDER WITH THE CLIENT_ID OF YOUR ACTIONS PROJECT
  clientId: '697962897525-15rpdin3nlshs4620p8dhk2hdoad3422.apps.googleusercontent.com',
    debug: true,
});
const userinput = 'userinput';
var username = '';
var email = '';
const ssml = '<speak>'+' proceed with your plan or log!<break time="20000ms"/>'+'</speak>';

app.intent('Start Signin', (conv) => {
  conv.ask(new SignIn('To get your account details'));
});

app.intent('Get Signin', (conv, params, signin) => {
  if (signin.status === 'OK') {
    const payload = conv.user.profile.payload;
     conv.user.storage.name = conv.user.profile.payload.name;
     conv.user.storage.email = conv.user.profile.payload.email;
    conv.ask(`I got your account details, ${payload.name}. move with your plan or logs?`);
  } else {
    conv.ask(`I won't be able to save your data, move with your plan or logs?`);
  }
});

app.intent('tracker', (conv) => {
  console.log(conv.user.storage.name);
  console.log(conv.user.storage.email);
  if(conv.user.storage.name != undefined && conv.user.storage.email != undefined)
  {
   username =conv.user.storage.name;
   email =conv.user.storage.email; 
  }
  else{
   username ="guestuser";
   email ="guestuser";
  }
     var postData = JSON.stringify({
               userid:username,
               workername:email,
               date: new Date(),
               text : conv.parameters[userinput].toLowerCase()
           });
       console.log(postData);
             var options = {
               hostname: "18.212.200.238",
               path: "/user",
               port : 80,
               method: "POST",
               headers: {
                   'Content-Type':'application/json'
               }
           };
        return new Promise((resolve, reject) => {
        workerstatus(options,postData).then((response) => {
       resolve(conv.ask('<speak>'+response.toString()+'<break time="20000ms"/>'+ssml+'</speak>'));
     }).catch((error) => {
        resolve(conv.ask(error.toString()));
      });
    });
});

function workerstatus(options,postData) {
  return new Promise(((resolve, reject) => {
    const request = http.request(options, (response) => {
      response.setEncoding('utf8');
      let returnData = '';
      if (response.statusCode < 200 || response.statusCode >= 300) {
        return reject(new Error(`${response.statusCode}: ${response.req.getHeader('host')} ${response.req.path}`));
      }
      response.on('data', (chunk) => {
        returnData += chunk;
      });
      response.on('end', () => {
          console.log(returnData);
           var json=JSON.parse(returnData);
           console.log(json);
          if(json['response'] === '4')
          {
          return resolve("logged !");
          }
          else if(json['response'] === '1')
          {
          return  resolve("Plan added successfully!");
          }
           else if(json['response'] === '2')
          {
           return resolve("sorry there is problem in taking your plan please tryagain !");
          }
            else if(json['response'] === '3')
          {
          return  resolve("I already have that plan");
          }
          else if(json['response'] === '5')
          {
          return  resolve("there is problem while logging!");
          }
          else if(json['response'] === '6')
          {
          return  resolve("there is no plan for this log");
          }
          else if(json['response'] === '7')
          {
          return  resolve("no plan found for this ID");
          }
          else if(json['response'] === '8')
          {
           return resolve("please repeat complete log again with valid activity and ID !");
          }
          else if(json['response'] === '9')
          {
         return   resolve("problem in network please try again");
          }
          else if(json['response'] === '45')
          {
              return resolve("sorry there is an trouble getting your status please try again after sometime");
          }
          else if(json['response'] === '47')
          {
          return    resolve("I can't reach your server please check your system and repeat your log!");
          }
          else if(json['response'] === '17')
          {
              return resolve("plan added sucessfully");
          }
          else if(json['response'] === '101')
          {
              return resolve("couldn’t understand the ID .repeat complete plan or log again with activity and ID");
          }
          else if(json['response'] === '10')
          {
              return resolve("vehicle number is missing Mention ID before telling vehicle number . repeat complete plan or log with activity and ID");
          }
          else if(json['response'] === '22')
          {
              return resolve("repeat complete plan or log with activity and 4 digits of vehicle number");
          }
          else if(json['response'] === '33')
          {
              return resolve("Couldn't understand plan or log , please repeat complete plan or log with activity and valid vehicle ID");
          }
          else if(json['response'] === '55')
          {
              return resolve("couldn’t understand the activity done please repeat complete log with valid activity and ID");
          }
          else if(json['response'] === '66')
          {
              return resolve("couldn’t understand the plan given please repeat complete plan with valid activity and ID ");
          }
         else if(json['reponse'] === 'error1')
         {
              return resolve("sorry for inconvience there is some problem in engine");
         }
          else if(json['reponse']=== 'error2')
          {
              return resolve("sorry for inconvience there is some problem in service");
          }
           else if(json['response']==='11')
           {
                 resolve("There is no report for given ID please give an valid one");
           }
        else{
        let completedwork='';
           let incompletework = '';
           let progess='';
           let done = '';
           let undone = '';
           progess = json['report'][0]['progress']+"% of work is completed.";
		   done=json['report'][0]['done'];
		   undone=json['report'][0]['undone'];
		   console.log(progess);
		   console.log(done);
		   console.log(undone);
		 for (var i = 0; i < done.length; i++) {
		     completedwork += done[i]+'\n';
		 }
			 for ( i = 0; i < undone.length; i++) {
			     
			     incompletework += undone[i]+'\n';
			 }
			 if(incompletework === "")
			 {
			     incompletework =" are nothing !";
			 }
          
        return resolve("work completed   "+completedwork+" work pending  "+ incompletework);
      }        
      });

      response.on('error', (error) => {
        return reject(error);
      });
    });
     request.write(postData);
    request.end();
  }));
}
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
