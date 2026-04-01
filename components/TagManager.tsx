
import React, { useState } from 'react';
import { FeedbackTag } from '../types';

interface TagManagerProps {
  tags: FeedbackTag[];
  onUpdate: (tags: FeedbackTag[]) => void;
  onBack: () => void;
}

const TagManager: React.FC<TagManagerProps> = ({ tags, onUpdate, onBack }) => {
  const [newTagName, setNewTagName] = useState('');
  const [newTagCategory, setNewTagCategory] = useState<FeedbackTag['category']>('CONTENT');

  const addTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName) return;
    
    const newTag: FeedbackTag = {
      id: `t_${Date.now()}`,
      name: newTagName,
      category: newTagCategory
    };
    
    onUpdate([...tags, newTag]);
    setNewTagName('');
  };

  const deleteTag = (id: string) => {
    onUpdate(tags.filter(t => t.id !== id));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-4xl mx-auto shadow-sm">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </button>
        <h3 className="text-xl font-bold text-slate-800">Feedback Tag Library</h3>
      </div>

      <form onSubmit={addTag} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 p-4 bg-slate-50 border border-slate-100 rounded-xl">
        <div className="md:col-span-1">
          <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Tag Name</label>
          <input 
            type="text" 
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
            placeholder="e.g., Needs citation"
          />
        </div>
        <div className="md:col-span-1">
          <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Category</label>
          <select 
            value={newTagCategory}
            onChange={(e) => setNewTagCategory(e.target.value as any)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
          >
            <option value="CONTENT">Content</option>
            <option value="STRUCTURE">Structure</option>
            <option value="CRITICAL_THINKING">Critical Thinking</option>
            <option value="REASONING">Reasoning</option>
          </select>
        </div>
        <div className="md:col-span-1 flex items-end">
          <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors">
            Add New Tag
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['CONTENT', 'STRUCTURE', 'CRITICAL_THINKING', 'REASONING'].map(cat => (
          <div key={cat} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">{cat.replace('_', ' ')}</h4>
            <div className="flex flex-wrap gap-2">
              {tags.filter(t => t.category === cat).map(tag => (
                <div key={tag.id} className="group flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 shadow-sm">
                  {tag.name}
                  <button 
                    onClick={() => deleteTag(tag.id)}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TagManager;
