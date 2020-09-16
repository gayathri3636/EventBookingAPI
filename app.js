const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const graphqlHttp = require('express-graphql').graphqlHTTP;
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const Event = require('./models/event');
const User = require('./models/user');
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
        type User {
          _id:ID
          email:String!
          password:String
        }
        input EventInput {
            title:String!
            description:String!
            price:Float!
            date:String!
        }
        input UserInput {
          email:String!
          password:String!
        }
        type RootQuery {
            events:[Event!]!
        }
        type RootMutation {
            createEvent(eventInput:EventInput):Event
            createUser(userInput:UserInput):User
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
        const event = new Event({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: +args.eventInput.price,
          date: new Date(args.eventInput.date),
          creator: '5f62326281ee1b12906ffa6f',
        });
        let createdEvent;
        return event
          .save()
          .then((result) => {
            createdEvent = { ...result._doc, _id: result._doc._id.toString() };
            return User.findById('5f62326281ee1b12906ffa6f');
          })
          .then((user) => {
            if (!user) {
              throw new Error('user not found');
            }
            user.createdEvents.push(event);
            return user.save();
          })
          .then((result) => {
            return createdEvent;
          })
          .catch((err) => console.log(err));
        throw err;
        return event;
      },
      createUser: (args) => {
        return User.findOne({ email: args.userInput.email })
          .then((user) => {
            if (user) {
              throw new Error('User exists already');
            }
            return bcrypt.hash(args.userInput.password, 12);
          })
          .then((hashedPassword) => {
            const user = new User({
              email: args.userInput.email,
              password: hashedPassword,
            });
            return user.save();
          })
          .then((result) => {
            return { ...result._doc, password: null, _id: result.id };
          })
          .catch((err) => {
            throw err;
          });
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
