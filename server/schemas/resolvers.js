const { AuthenticationError } = require("apollo-server-express");
const { argsToArgsConfig } = require("graphql/type/definition");
const { User } = require("../models");
const bookSchema = require("../models/Book");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
          .select("-__v -password")
          .populate("books");
        return userData;
      }

      throw new AuthenticationError("Not logged in");
    },
  },

  Mutation: {
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("Incorrect credentials");
      }
      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const token = signToken(user);
      return { token, user };
    },
    saveBook: async (parent, args, context) => {
      if (context.user) {
        console.log(context.user._id);
        console.log(args);
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          {
            $push: {
              savedBooks: { ...args, username: context.user.username },
            },
          },
          { new: true }
        );

        return updatedUser;
      }
      throw new AuthenticationError("You need to be logged in!");
    },
    removeBook: async (parent, args, context) => {
      if (context.user) {
        const user = await User.findOne({ where: (_id = context.user.id) });
        console.log(user.savedBooks);
        const removalIndex = user.savedBooks.findIndex(
          (book) => book.bookId !== args.id
        );

        console.log(removalIndex);
        const updatedBooks = user.savedBooks.splice(removalIndex, 1);

        console.log(updatedBooks);

        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          {
            savedBooks: updatedBooks,
          },

          {
            new: true,
          }
        );

        return updatedUser;
      }
      throw new AuthenticationError("You need to be logged in!");
    },
  },
};

module.exports = resolvers;
