const { LoremIpsum } = require('lorem-ipsum');

const connectToDatabase = require('./db');
require('dotenv').config({ path: './variables.env' });
const Post = require('./models/Post');

module.exports.hello = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(
      {
        message: 'Go Serverless v1.0! Your function executed successfully!',
        input: event,
      },
      null,
      2,
    ),
  };
};

// Use this code if you don't use the http event with the LAMBDA-PROXY integration
// return { message: 'Go Serverless v1.0! Your function executed successfully!', event };

module.exports.create = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  await connectToDatabase();
  try {
    const createdPost = await Post.create({
      ...JSON.parse(event.body),
      readingTime: Math.round(JSON.parse(event.body).content.split(' ').length / 225),
    });
    callback(null, {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(createdPost),
    });
  } catch (err) {
    console.log(err);
    callback(null, {
      statusCode: err.statusCode || 500,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Could not create the post.',
    });
  }
};

module.exports.populate = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  await connectToDatabase();
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
    const { postsCount } = JSON.parse(event.body);
    const promisesArray = [];
    for (let i = 0; i < postsCount; i += 1) {
      const content = lorem.generateParagraphs(Math.floor(Math.random() * 4 + 8));
      const title = `Sample Post ${i}`;
      const tags = ['AI', 'Chemistry', 'Space', 'Robotics', 'Physics'];
      const newPost = {
        author: 'Michael M.',
        content,
        description: lorem.generateSentences(3),
        image: `https://ib-blog-user-data.s3.eu-central-1.amazonaws.com/programming${i % 10}.webp`,
        indexName: title.toLowerCase().replace(/ /g, '-'),
        tag: tags[Math.floor(Math.random() * tags.length)],
        title,
        readingTime: Math.round(content.split(' ').length / 225),
      };
      promisesArray.push(Post.create({ ...newPost }));
    }
    await Promise.all(promisesArray);
    callback(null, {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: `Successfully created ${postsCount} posts`,
    });
  } catch (err) {
    console.log(err);
    callback(null, {
      statusCode: err.statusCode || 500,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Could not create the post.',
    });
  }
};

module.exports.getOne = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  await connectToDatabase();
  try {
    const foundPost = await Post.findOne({ indexName: event.pathParameters.id });
    callback(null, {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(foundPost),
    });
  } catch (err) {
    console.log(err);
    callback(null, {
      statusCode: err.statusCode || 500,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Could not fetch the post.',
    });
  }
};

module.exports.getPage = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  await connectToDatabase();
  try {
    const queryParams = { ...event.queryStringParameters };
    const searchCriteria = {};
    if (queryParams && queryParams.tag) {
      searchCriteria.tag = queryParams.tag;
    }
    let foundPostsQuery = Post.find(searchCriteria, { content: 0 })
      .sort({ postedOn: -1 })
      .limit(28);
    if (queryParams && queryParams.page) {
      foundPostsQuery = foundPostsQuery.skip((+queryParams.page - 1) * 28);
    }
    const foundPosts = await foundPostsQuery.exec();
    callback(null, {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(foundPosts),
    });
  } catch (err) {
    console.log(err);
    callback(null, {
      statusCode: err.statusCode || 500,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Could not fetch the posts.',
    });
  }
};

module.exports.update = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  await connectToDatabase();
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      event.pathParameters.id,
      JSON.parse(event.body),
      { new: true },
    );
    callback(null, {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(updatedPost),
    });
  } catch (err) {
    console.log(err);
    callback(null, {
      statusCode: err.statusCode || 500,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Could not fetch the posts.',
    });
  }
};

module.exports.delete = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  await connectToDatabase();
  try {
    const deletedPost = await Post.findByIdAndRemove(event.pathParameters.id);
    callback(null, {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        message: `Removed post with id: ${deletedPost._id}`,
        post: deletedPost,
      }),
    });
  } catch (err) {
    console.log(err);
    callback(null, {
      statusCode: err.statusCode || 500,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Could not fetch the posts.',
    });
  }
};
