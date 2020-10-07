module.exports = {
  Query: {
    posts: async (_, args, { dataSources }) => {
      const { foundPosts, postsCount } = await dataSources.postAPI.getPage(args);
      // eslint-disable-next-line max-len
      const prevPostsCount =
        ((args.pageNumber || 1) - 1) * (args.pageSize || 28) + foundPosts.length;
      return {
        posts: foundPosts,
        hasMore: postsCount - prevPostsCount > 0,
      };
    },
    post: async (_, args, { dataSources }) => {
      const foundPost = await dataSources.postAPI.getPost(args);
      return foundPost;
    },
  },
  Mutation: {
    populate: async (_, args, { dataSources }) => {
      const populationResponse = await dataSources.postAPI.populate(args);
      return populationResponse;
    },
  },
};
