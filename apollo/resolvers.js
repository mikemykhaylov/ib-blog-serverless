module.exports = {
  Query: {
    getPost: async (_, args, { dataSources }) => {
      const foundPost = await dataSources.postAPI.getPost(args);
      return foundPost;
    },
    getPosts: async (_, args, { dataSources }) => {
      const foundPosts = await dataSources.postAPI.getPosts(args);
      return foundPosts;
    },
    getPage: async (_, args, { dataSources }) => {
      const { pagePosts, totalPostsCount } = await dataSources.postAPI.getPage(args);
      const prevPostsCount = (args.pageNumber - 1) * 28 + pagePosts.length;
      return {
        posts: pagePosts,
        hasMore: totalPostsCount - prevPostsCount > 0,
      };
    },
  },
  Mutation: {
    createPosts: async (_, args, { dataSources }) => {
      const populationResponse = await dataSources.postAPI.populate(args);
      return populationResponse;
    },
  },
};
