/**
 * Course Model
 */
const mongoose = require('mongoose');
const { Schema } = mongoose;

const CourseSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  tags: [{
    type: String,
    trim: true
  }],
  educator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  thumbnail: {
    type: String,
    default: null
  },
  is_published: {
    type: Boolean,
    default: false
  },
  duration_hours: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  students: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    default: 0
  }
}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  }
});

// Add indexes
CourseSchema.index({ title: 'text', description: 'text', tags: 'text', category: 'text' });
CourseSchema.index({ educator: 1 });
CourseSchema.index({ category: 1 });
CourseSchema.index({ is_published: 1 });
CourseSchema.index({ difficulty: 1 });

module.exports = mongoose.model('Course', CourseSchema); 