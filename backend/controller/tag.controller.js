import Tag from '../models/Tag.model.js';

// Get all tags
export const getTags = async (req, res) => {
  try {
    const tags = await Tag.find().sort({ name: 1 });
    res.json({ tags });
  } catch (error) {
    console.error('Error getting tags:', error);
    res.status(500).json({ message: 'Error fetching tags' });
  }
};

// Get popular tags
export const getPopularTags = async (req, res) => {
  try {
    const tags = await Tag.find()
      .sort({ questionCount: -1 })
      .limit(20);
    res.json({ tags });
  } catch (error) {
    console.error('Error getting popular tags:', error);
    res.status(500).json({ message: 'Error fetching popular tags' });
  }
};

// Create new tag
export const createTag = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Tag name is required' });
    }

    // Check if tag already exists
    const existingTag = await Tag.findOne({ name: name.toLowerCase() });
    if (existingTag) {
      return res.status(400).json({ message: 'Tag already exists' });
    }

    const tag = new Tag({
      name: name.toLowerCase(),
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      description: description || ''
    });

    await tag.save();
    res.status(201).json({ tag });
  } catch (error) {
    console.error('Error creating tag:', error);
    res.status(500).json({ message: 'Error creating tag' });
  }
}; 