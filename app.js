const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql').graphqlHTTP;
const {buildSchema} = require('graphql');

const app = express();

app.use(bodyParser.json());
const PORT = process.env.PORT||5000;

app.use('/graphql', graphqlHttp({
     schema:buildSchema(`
        type RootQuery {
            events:[String!]!
        }
        type RootMutation {
            createEvent(name:String):String
        }
        schema {
            query:RootQuery
            mutation:RootMutation
        }
     `),
     rootValue:{
         events: () => {
             return ['Cooking', 'sailing', 'coding']
         },
         createEvent: (args) => {
            const eventName = args.name;
            return eventName;
         }
     },
     graphiql:true
}));

app.listen(PORT, () => console.log(`server started on running on ${PORT}`));