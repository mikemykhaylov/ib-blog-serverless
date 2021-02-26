/* eslint-disable class-methods-use-this */
const { DataSource } = require('apollo-datasource');
const { LoremIpsum } = require('lorem-ipsum');
const { UserInputError } = require('apollo-server-lambda');

const Post = require('../models/Post');

class PostAPI extends DataSource {
  async getPosts({ postsNumber, tag }) {
    const searchCriteria = {};
    if (tag) {
      searchCriteria.tag = tag;
    }
    let foundPostsQuery = Post.find(searchCriteria).sort({ postedOn: -1 });
    if (postsNumber) {
      foundPostsQuery = foundPostsQuery.limit(postsNumber);
    }
    const foundPosts = await foundPostsQuery.exec();
    return Array.isArray(foundPosts) ? foundPosts : [];
  }

  async getPost({ postID }) {
    try {
      const foundPost = await Post.findById(postID);
      if (foundPost) {
        return foundPost;
      }
      return undefined;
    } catch (err) {
      throw new UserInputError('Post ID is invalid');
    }
  }

  async getPage({ pageNumber, tag }) {
    const PAGE_SIZE = 28;
    const searchCriteria = {};
    if (tag) {
      searchCriteria.tag = tag;
    }
    let foundPostsQuery = Post.find(searchCriteria).sort({ postedOn: -1 }).limit(PAGE_SIZE);
    if (pageNumber) {
      foundPostsQuery = foundPostsQuery.skip((pageNumber - 1) * PAGE_SIZE);
    }
    const pagePosts = await foundPostsQuery.exec();
    const totalPostsCount = await Post.countDocuments(searchCriteria);
    return Array.isArray(pagePosts) ? { pagePosts, totalPostsCount } : [];
  }

  async populate({ postsCount }) {
    const lorem = new LoremIpsum({
      sentencesPerParagraph: {
        max: 8,
        min: 4,
      },
      wordsPerSentence: {
        max: 16,
        min: 4,
      },
    });
    try {
      const promisesArray = [];
      for (let i = 0; i < postsCount; i += 1) {
        const content = lorem.generateParagraphs(Math.floor(Math.random() * 4 + 8));
        const title = `Sample Post ${i}`;
        const tags = ['AI', 'Chemistry', 'Space', 'Robotics', 'Physics'];
        const newPost = {
          author: 'Michael M.',
          content,
          description: lorem.generateSentences(3),
          image: `https://d12pzozt82468o.cloudfront.net/programming${i % 10}.webp`,
          indexName: title.toLowerCase().replace(/ /g, '-'),
          tag: tags[Math.floor(Math.random() * tags.length)],
          title,
          readingTime: Math.round(content.split(' ').length / 225),
        };
        promisesArray.push(Post.create({ ...newPost }));
      }

      await Promise.all(promisesArray);
      return `Successfully created ${postsCount} posts`;
    } catch (err) {
      return 'Could not create posts';
    }
  }
}

module.exports = PostAPI;
