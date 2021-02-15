const { ApolloServer, gql, PubSub } = require("apollo-server");
const faker = require("faker");

const pubsub = new PubSub();

const messages = faker.lorem
  .sentences(10)
  .split(".")
  .filter((m) => m !== "")
  .map((m, i) => ({ id: i, text: m.trim() }));

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Message {
    id: ID!
    text: String
  }

  type Query {
    getChatMessages: [Message]
  }

  type Mutation {
    addMessage(text: String): Message
  }

  type Subscription {
    messageAdded: Message
  }
`;

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    getChatMessages: () => {
      return messages;
    },
  },
  Mutation: {
    addMessage: (root, { text }, ctx) => {
      const m = { id: messages.length, text: text };
      messages.push(m);
      pubsub.publish(["MSG_ADDED"], { messageAdded: m });
      return m;
    },
  },
  Subscription: {
    messageAdded: {
      subscribe: () => pubsub.asyncIterator(["MSG_ADDED"]),
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});
// const url =
//   "http://localhost:4000/" || "graphql-subscriptions-chat.herokuapp.com";
server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`🚀 Server ready at ${url}`);
  console.log(`🚀 Subscriptions ready at ${subscriptionsUrl}`);
});
