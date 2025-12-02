import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import API_URL, { authHeaders } from "../api";
import "../styles/CreatePost.css";

export default function CreatePost() {
  const [post, setPost] = useState({ title: "", content: "", tags: [] });
  const [drafts, setDrafts] = useState([]);
  const [selectedDraft, setSelectedDraft] = useState(null);
  const [tagInput, setTagInput] = useState("");
  const [autoSaveStatus, setAutoSaveStatus] = useState("");

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const autoSaveTimer = useRef(null);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'color', 'background',
    'blockquote', 'code-block',
    'link', 'image'
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to create a post.");
      navigate("/login");
      return;
    }

    fetchDrafts();

    const draftId = searchParams.get('draftId');
    if (draftId) {
      loadDraft(draftId);
    }
  }, []);

  useEffect(() => {
    if (post.title || post.content) {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }

      autoSaveTimer.current = setTimeout(() => {
        autoSaveDraft();
      }, 30000);
    }

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [post.title, post.content]);

  const fetchDrafts = async () => {
    try {
      const res = await fetch(`${API_URL}/posts/drafts/me`, {
        headers: authHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setDrafts(data);
      }
    } catch (error) {
      console.error("Failed to fetch drafts:", error);
    }
  };

  const loadDraft = async (draftId) => {
    try {
      const res = await fetch(`${API_URL}/posts/${draftId}`, {
        headers: authHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setPost({
          title: data.title,
          content: data.content,
          tags: data.tags || [],
          isDraft: true
        });
        setSelectedDraft(draftId);
        setTagInput(data.tags?.join(", ") || "");
      }
    } catch (error) {
      console.error("Failed to load draft:", error);
    }
  };

  const autoSaveDraft = async () => {
    if (!post.title && !post.content) return;

    setAutoSaveStatus("Saving...");

    try {
      const draftData = {
        ...post,
        tags: tagInput.split(",").map(t => t.trim()).filter(t => t),
        isDraft: true
      };

      let res;
      if (selectedDraft) {
        // Update existing draft
        res = await fetch(`${API_URL}/posts/${selectedDraft}`, {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify(draftData)
        });
      } else {
        res = await fetch(`${API_URL}/posts`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify(draftData)
        });
      }

      if (res.ok) {
        const data = await res.json();
        if (!selectedDraft) {
          setSelectedDraft(data._id);
        }
        setAutoSaveStatus("✓ Saved");
        setTimeout(() => setAutoSaveStatus(""), 2000);
      }
    } catch (error) {
      setAutoSaveStatus("Failed to save");
      setTimeout(() => setAutoSaveStatus(""), 2000);
    }
  };

  const saveDraft = async () => {
    const draftData = {
      ...post,
      tags: tagInput.split(",").map(t => t.trim()).filter(t => t),
      isDraft: true
    };

    try {
      let res;
      if (selectedDraft) {
        res = await fetch(`${API_URL}/posts/${selectedDraft}`, {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify(draftData)
        });
      } else {
        res = await fetch(`${API_URL}/posts`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify(draftData)
        });
      }

      const data = await res.json();

      if (res.ok) {
        alert("Draft saved successfully!");
        setSelectedDraft(data._id);
        fetchDrafts();
      } else {
        alert(data.message || "Failed to save draft");
      }
    } catch (error) {
      alert("Failed to save draft");
    }
  };

  const publishPost = async () => {
    if (!post.title || !post.content) {
      alert("Title and content are required!");
      return;
    }

    const publishData = {
      ...post,
      tags: tagInput.split(",").map(t => t.trim()).filter(t => t),
      isDraft: false
    };

    try {
      let res;
      if (selectedDraft) {
        res = await fetch(`${API_URL}/posts/${selectedDraft}`, {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify(publishData)
        });
      } else {
        res = await fetch(`${API_URL}/posts`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify(publishData)
        });
      }

      const data = await res.json();

      if (res.ok) {
        alert("Post published successfully!");
        navigate(`/post/${data._id}`);
      } else {
        alert(data.message || "Failed to publish post");
      }
    } catch (error) {
      alert("Failed to publish post");
    }
  };

  const submit = publishPost;

  return (
    <div className="container create-wrapper">
      <div className="card create-card">
        <div className="create-header">
          <h1 className="create-title">Create New Post</h1>
          <p className="create-sub">Share your thoughts with the community.</p>
        </div>

        {autoSaveStatus && (
          <div className="auto-save-indicator">
            {autoSaveStatus}
          </div>
        )}

        {drafts.length > 0 && !selectedDraft && (
          <div className="drafts-section">
            <h3>Your Drafts</h3>
            <div className="drafts-list">
              {drafts.map(draft => (
                <div
                  key={draft._id}
                  className="draft-item"
                  onClick={() => loadDraft(draft._id)}
                >
                  <h4>{draft.title || "Untitled Draft"}</h4>
                  <small>Last saved: {new Date(draft.lastSavedAt).toLocaleString()}</small>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="create-form">
          <div className="form-group">
            <label>Title</label>
            <input
              className="input title-input"
              placeholder="Enter an engaging title..."
              value={post.title}
              onChange={e => setPost({ ...post, title: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Tags</label>
            <input
              className="input"
              placeholder="e.g. React, Productivity, Life (comma separated)"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Content</label>
            <ReactQuill
              theme="snow"
              value={post.content}
              onChange={(content) => setPost({ ...post, content })}
              modules={modules}
              formats={formats}
              className="content-editor"
            />
          </div>

          <div className="form-actions">
            <button className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
            <button className="btn btn-outline" onClick={saveDraft}>Save Draft</button>
            <button className="btn btn-primary" onClick={submit}>Publish Post</button>
          </div>
        </div>
      </div>
    </div>
  );
}
