import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_URL from "../api";
import "../styles/Home.css";

const stripHtmlTags = (html) => {
  if (!html) return "";
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [popularPosts, setPopularPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = (query = "") => {
    setLoading(true);
    setError(null);
    let url = `${API_URL}/posts`;
    if (query) url += `?${query}`;

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch posts");
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setPosts(data);
        } else {
          setPosts([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch posts", err);
        setError("Failed to load posts. Please check your connection.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPosts();

    fetch(`${API_URL}/posts/popular`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPopularPosts(data);
      })
      .catch(err => console.error("Failed to fetch popular posts", err));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPosts(`search=${search}`);
    setSelectedTag("");
  };

  const handleTagClick = (tag) => {
    setSelectedTag(tag);
    setSearch("");
    fetchPosts(`tag=${tag}`);
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedTag("");
    fetchPosts();
  };

  const handleDelete = async (postId, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/posts/${postId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    });

    if (res.ok) {
      alert("Post deleted successfully!");
      fetchPosts();
    } else {
      const data = await res.json();
      alert(data.message || "Failed to delete post.");
    }
  };

  const getCurrentUserId = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch (e) {
      return null;
    }
  };

  const currentUserId = getCurrentUserId();

  return (
    <div className="home-wrapper">


      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Discover <span className="text-gradient">Mindful</span> Reading
            </h1>
            <p className="hero-sub">
              A space for thoughtful discussions, learning, and sharing ideas in a calm environment.
            </p>
            <div className="hero-actions">
              <Link to="/create" className="btn btn-primary">Start Writing</Link>
              <a href="#posts" className="btn btn-secondary">Browse Posts</a>
            </div>
          </div>
        </div>
      </section>

      <div className="container home-layout" id="posts">

        <div className="main-feed">
          <div className="feed-header">
            <h2>Recent Discussions</h2>

            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Search topics..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input search-input"
              />
            </form>
          </div>

          {selectedTag && (
            <div className="active-filter">
              <span>Filtered by: <span className="badge badge-primary">{selectedTag}</span></span>
              <button onClick={clearFilters} className="btn-ghost btn-sm">Clear</button>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}
          {loading && <div className="loading-message">Loading posts...</div>}
          {!loading && !error && posts.length === 0 && <div className="no-posts">No posts found.</div>}

          <div className="posts-grid">
            {posts.map(post => (
              <article key={post._id} className="card post-card">
                <div className="post-header">
                  <span className="post-author">@{post?.author?.username || 'Anonymous'}</span>
                  <span className="post-date">{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>

                <Link to={`/post/${post._id}`} className="post-link">
                  <h3 className="post-title">{post.title}</h3>
                  <p className="post-excerpt">
                    {stripHtmlTags(post.content).substring(0, 120) || "No content preview available..."}...
                  </p>
                </Link>

                <div className="post-footer">
                  <div className="post-tags">
                    {post.tags?.map(tag => (
                      <span key={tag} className="tag-chip" onClick={() => handleTagClick(tag)}>#{tag}</span>
                    ))}
                  </div>
                  <Link to={`/post/${post._id}`} className="read-more">Read more →</Link>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="sidebar">
          <div className="glass-panel sidebar-panel">
            <h3>Trending Now </h3>
            <div className="popular-list">
              {popularPosts.map(post => (
                <div key={post._id} className="popular-item">
                  <Link to={`/post/${post._id}`}>
                    <h4>{post.title}</h4>
                  </Link>
                  <div className="popular-meta">
                    <span>{post.upvotes?.length || 0} likes</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
