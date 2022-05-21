const express = require("express");
const path = require("path");

// import apollo server
const { ApolloServer } = require("apollo-server-express");

// Import typedefs and resolvers
const { typeDefs, resolvers } = require("./schemas");

const db = require("./config/connection");
const routes = require("./routes");

const PORT = process.env.PORT || 3001;

// create Apollo server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const startApolloServer = async (typeDefs, resolvers) => {
  await server.start();
  // integrate Apollo with express as middleware
  server.applyMiddleware({ app });

  db.once("open", () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      // log GQL API location
      console.log(
        `Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`
      );
    });
  });
};

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
}

startApolloServer(typeDefs, resolvers);
