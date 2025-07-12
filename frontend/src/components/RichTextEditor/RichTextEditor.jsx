import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import EmojiPicker from 'emoji-picker-react';
import { 
  FaBold, 
  FaItalic, 
  FaStrikethrough, 
  FaListUl, 
  FaListOl, 
  FaLink, 
  FaUnlink, 
  FaImage, 
  FaAlignLeft, 
  FaAlignCenter, 
  FaAlignRight,
  FaUndo,
  FaRedo,
  FaSmile
} from 'react-icons/fa';

const RichTextEditor = ({ value, onChange, placeholder = "Start typing..." }) => {
  const [showEmoji, setShowEmoji] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  const addImage = () => {
    const url = prompt('Enter image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addLink = () => {
    const url = prompt('Enter URL');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  const insertEmoji = (emojiObject) => {
    editor.chain().focus().insertContent(emojiObject.emoji).run();
    setShowEmoji(false);
  };

  const ToolbarButton = ({ icon: Icon, onClick, title, active, children }) => (
    <button
      type="button"
      className={`toolbar-btn ${active ? 'active' : ''}`}
      onClick={onClick}
      title={title}
    >
      {Icon ? <Icon /> : children}
    </button>
  );

  return (
    <div className="rich-text-editor">
      {/* Toolbar */}
      <div className="editor-toolbar">
        <div className="toolbar-group">
          <ToolbarButton 
            icon={FaBold} 
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold (Ctrl+B)"
            active={editor.isActive('bold')}
          />
          <ToolbarButton 
            icon={FaItalic} 
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic (Ctrl+I)"
            active={editor.isActive('italic')}
          />
          <ToolbarButton 
            icon={FaStrikethrough} 
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Strikethrough"
            active={editor.isActive('strike')}
          />
        </div>

        <div className="toolbar-group">
          <ToolbarButton 
            icon={FaListUl} 
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet List"
            active={editor.isActive('bulletList')}
          />
          <ToolbarButton 
            icon={FaListOl} 
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Numbered List"
            active={editor.isActive('orderedList')}
          />
        </div>

        <div className="toolbar-group">
          <ToolbarButton 
            icon={FaAlignLeft} 
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            title="Align Left"
            active={editor.isActive({ textAlign: 'left' })}
          />
          <ToolbarButton 
            icon={FaAlignCenter} 
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            title="Align Center"
            active={editor.isActive({ textAlign: 'center' })}
          />
          <ToolbarButton 
            icon={FaAlignRight} 
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            title="Align Right"
            active={editor.isActive({ textAlign: 'right' })}
          />
        </div>

        <div className="toolbar-group">
          <ToolbarButton 
            icon={FaLink} 
            onClick={addLink}
            title="Insert Link"
          />
          <ToolbarButton 
            icon={FaUnlink} 
            onClick={removeLink}
            title="Remove Link"
          />
          <ToolbarButton 
            icon={FaImage} 
            onClick={addImage}
            title="Insert Image"
          />
          <ToolbarButton 
            icon={FaSmile} 
            onClick={() => setShowEmoji(!showEmoji)}
            title="Insert Emoji"
          />
        </div>

        <div className="toolbar-group">
          <ToolbarButton 
            icon={FaUndo} 
            onClick={() => editor.chain().focus().undo().run()}
            title="Undo (Ctrl+Z)"
          />
          <ToolbarButton 
            icon={FaRedo} 
            onClick={() => editor.chain().focus().redo().run()}
            title="Redo (Ctrl+Y)"
          />
        </div>
      </div>

      {/* Emoji Picker */}
      {showEmoji && (
        <div className="emoji-picker-container">
          <EmojiPicker onEmojiClick={insertEmoji} />
        </div>
      )}

      {/* Editor Content */}
      <div className="editor-content-wrapper">
        <EditorContent editor={editor} className="editor-content" />
      </div>
    </div>
  );
};

export default RichTextEditor;
