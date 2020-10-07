const { gql } = require('apollo-server-lambda');

const typeDefs = gql`
  type Query {
    posts(pageNumber: Int, pageSize: Int, tag: String): PostConnection!
    post(id: ID!): Post
  }
  type PostConnection {
    hasMore: Boolean!
    posts: [Post]!
  }
  type Post {
    author: String!
    content: String
    description: String
    indexName: String!
    image: String!
    postedOn: String!
    tag: String!
    title: String!
    readingTime: Int!
    _id: ID!
  }
  type Mutation {
    populate(postsCount: Int!): String!
  }
`;

module.exports = typeDefs;
