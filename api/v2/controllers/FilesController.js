const fs = require('fs').promises;
const mime = require('mime-types');
const { v4: uuid } = require('uuid');
const { ObjectId } = require('mongodb');
const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

const validateToken = async (req) => {
  const token = req.headers['x-token'];

  if (!token) return false;

  const key = `auth_${token}`;
  const userId = await redisClient.get(key);

  if (!userId) return false;

  const collection = dbClient.client.db().collection('users');
  const user = await collection.findOne({ _id: ObjectId(userId) });

  return user ? userId : false;
};

const FilesController = {
  async postUpload (req, res) {
    const userId = await validateToken(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { name, type, parentId = 0, isPublic = false, data } = req.body;

    if (!name) return res.status(400).json({ error: 'Missing name' });
    if (!type || !['folder', 'file', 'image'].includes(type)) { return res.status(400).json({ error: 'Invalid type' }); }
    if (!data && type !== 'folder') { return res.status(400).json({ error: 'Missing data' }); }

    const collection = dbClient.client.db().collection('files');

    if (parentId) {
      const parentFile = await collection.findOne({ _id: ObjectId(parentId) });
      if (!parentFile) return res.status(400).json({ error: 'Parent not found' });
      if (parentFile.type !== 'folder') { return res.status(400).json({ error: 'Parent is not a folder' }); }
    }

    const newFile = {
      userId,
      name,
      type,
      isPublic,
      parentId
    };

    if (type !== 'folder') {
      const fileName = uuid();
      const localPath = `${FOLDER_PATH}/${fileName}`;

      try {
        const folderExists = await fs.access(FOLDER_PATH)
          .then(() => true)
          .catch(() => false);

        if (!folderExists) {
          await fs.mkdir(FOLDER_PATH, { recursive: true });
        }

        const fileData = Buffer.from(data, 'base64');
        await fs.writeFile(localPath, fileData);
        newFile.localPath = localPath;
      } catch (error) {
        console.error('Error saving file:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    }

    try {
      await collection.insertOne(newFile);
      return res.status(201).json(newFile);
    } catch (error) {
      console.error('Error inserting file into database:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getShow (req, res) {
    const userId = await validateToken(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    const collection = dbClient.client.db().collection('files');

    try {
      const file = await collection.findOne({ _id: ObjectId(id), userId });
      if (!file) return res.status(404).json({ error: 'Not found' });

      return res.status(200).json(file);
    } catch (error) {
      console.error('Error publishing file:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getIndex (req, res) {
    const userId = await validateToken(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const parentId = req.query.parentId || 0;
    const page = parseInt(req.query.page, 10) || 0;
    const limit = 20;
    const skip = page * limit;

    const collection = dbClient.client.db().collection('files');

    try {
      const files = await collection.find({ parentId, userId }).skip(skip).limit(limit).toArray();
      if (!files) return res.status(404).json({ error: 'Not found' });

      return res.status(200).json(files);
    } catch (error) {
      console.error('Error publishing file:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async putPublish (req, res) {
    const userId = await validateToken(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    const collection = dbClient.client.db().collection('files');

    try {
      const file = await collection.findOne({ _id: ObjectId(id), userId });
      if (!file) return res.status(404).json({ error: 'Not found' });

      await collection.updateOne({ _id: ObjectId(id) }, { $set: { isPublic: true } });

      return res.status(200).json(file);
    } catch (error) {
      console.error('Error publishing file:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async putUnpublish (req, res) {
    const userId = await validateToken(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    const collection = dbClient.client.db().collection('files');

    try {
      const file = await collection.findOne({ _id: ObjectId(id), userId });
      if (!file) return res.status(404).json({ error: 'Not found' });

      await collection.updateOne({ _id: ObjectId(id) }, { $set: { isPublic: false } });

      return res.status(200).json(file);
    } catch (error) {
      console.error('Error unpublishing file:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getFile (req, res) {
    const userId = await validateToken(req);

    const { id } = req.params;
    const collection = dbClient.client.db().collection('files');

    try {
      const file = await collection.findOne({ _id: ObjectId(id) });
      if (!file || !fs.existsSync(file.localPath)) {
        return res.status(404).json({ error: 'Not found' });
      }

      if (!file.isPublic && (!userId || file.userId !== userId)) {
        return res.status(404).json({ error: 'Not found' });
      }

      if (file.type === 'folder') {
        return res.status(400).json({ error: "A folder doesn't have content" });
      }

      const mimeType = mime.lookup(file.name);

      const fileData = fs.readFileSync(file.localPath);

      res.setHeader('Content-Type', mimeType);
      res.send(fileData);
    } catch (error) {
      console.error('Error unpublishing file:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

};

module.exports = FilesController;
