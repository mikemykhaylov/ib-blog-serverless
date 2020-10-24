/* eslint-disable class-methods-use-this */
const { DataSource } = require('apollo-datasource');
const mongoose = require('mongoose');

const { LoremIpsum } = require('lorem-ipsum');

const Post = require('../models/Post');

class PostAPI extends DataSource {
  async getPage({ pageNumber, pageSize, tag }) {
    const searchCriteria = {};
    if (tag) {
      searchCriteria.tag = tag;
    }
    let foundPostsQuery = Post.find(searchCriteria, { content: 0 })
      .sort({ postedOn: -1 })
      .limit(pageSize || 28);
    if (pageNumber) {
      foundPostsQuery = foundPostsQuery.skip((pageNumber - 1) * (pageSize || 28));
    }
    const foundPosts = await foundPostsQuery.exec();
    const postsCount = await Post.countDocuments(searchCriteria);
    return Array.isArray(foundPosts) ? { foundPosts, postsCount } : [];
  }

  async getPost({ id }) {
    const foundPost = await Post.findOne({ indexName: id }, { description: 0 });
    return foundPost instanceof mongoose.Error ? {} : foundPost;
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
