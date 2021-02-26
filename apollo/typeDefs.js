const { gql } = require('apollo-server-lambda');

const typeDefs = gql`
  type Query {
    getPage(pageNumber: Int!, tag: String): PostConnection!
    getPosts(postsNumber: Int, tag: String): [Post!]
    getPost(postID: ID!): Post
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
    id: ID!
  }
  type Mutation {
    createPosts(postsCount: Int!): String!
  }
`;

module.exports = typeDefs;
