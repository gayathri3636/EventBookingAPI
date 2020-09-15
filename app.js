const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql').graphqlHTTP;
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const Event = require('./models/event');
const app = express();

app.use(bodyParser.json());
const PORT = process.env.PORT || 5000;

app.use(
  '/graphql',
  graphqlHttp({
    schema: buildSchema(`
        type Event {
            _id:ID!
            title:String!
            description:String!
            price:Float!
            date:String!
        }
        input EventInput {
            title:String!
            description:String!
            price:Float!
            date:String!
        }
        type RootQuery {
            events:[Event!]!
        }
        type RootMutation {
            createEvent(eventInput:EventInput):String
        }
        schema {
            query:RootQuery
            mutation:RootMutation
        }
     `),
    rootValue: {
      events: () => {
        return Event.find()
          .then((events) => {
            return events.map((event) => {
              return { ...event._doc, _id: event._doc._id.toString() };
            });
          })
          .catch((err) => {
            throw err;
          });
      },
      createEvent: (args) => {
        //we created this object to save event
        // const event = {
        //   _id: Math.random().toString(),
        //   title: args.eventInput.title,
        //   description: args.eventInput.description,
        //   price: +args.eventInput.price,
        //   date: args.eventInput.date,
        // };
        // console.log(args);
        //Now saving in database
        const event = new Event({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: +args.eventInput.price,
          date: new Date(args.eventInput.date),
        });
        return event
          .save()
          .then((result) => {
            console.log(result);
            return { ...result._doc, _id: result._doc._id.toString() };
          })
          .catch((err) => console.log(err));
        throw err;
        return event;
      },
    },
    graphiql: true,
  })
);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@mern.ngv5u.mongodb.net/EventBookingAPI?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(console.log('connected'))
  .catch((err) => console.log(err));

app.listen(PORT, () => console.log(`server started on running on ${PORT}`));
