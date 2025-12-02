import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_URL, { getToken } from "../api";
import "../styles/Profile.css";

const stripHtmlTags = (html) => {
    if (!html) return "";
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
};

export default function Profile() {
    const [user, setUser] = useState({ username: "", email: "" });
    const [myPosts, setMyPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("posts");
    const token = getToken();

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }

        fetch(`${API_URL}/posts`)
            .then(res => res.json())
            .then(posts => {
                if (Array.isArray(posts)) {
                    try {
                        const payload = JSON.parse(atob(token.split('.')[1]));
                        const userId = payload.id;
                        const userPosts = posts.filter(p => p.author?._id === userId || p.author === userId);
                        setMyPosts(userPosts);
                    } catch (e) {
                        console.error("Failed to decode token", e);
                        setMyPosts([]);
                    }
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });

        fetchProfile();
        fetchMyPosts();
    }, [token]);

    const fetchProfile = async () => {
        try {
            const res = await fetch(`${API_URL}/auth/me`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            }
        } catch (error) {
            console.error("Failed to fetch profile:", error);
        }
    };

    const fetchMyPosts = async () => {
    };

    const handleEditProfile = () => {
        alert("Edit Profile feature coming soon!");
    };

    if (!token) {
        return (
            <div className="container profile-wrapper">
                <div className="login-prompt glass-panel">
                    <p>Please <Link to="/login">login</Link> to view your profile.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container profile-wrapper">


            <div className="glass-panel profile-card">
                <div className="profile-header">
                    <div className="profile-avatar">
                        {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="profile-info">
                        <h1 className="profile-name">{user.username}</h1>
                        <p className="profile-bio">Passionate reader and writer. Sharing thoughts on technology and life.</p>
                        <div className="profile-badges">
                            <span className="badge badge-primary">Pro Member</span>
                            <span className="badge">Writer</span>
                        </div>
                    </div>
                    <button className="btn btn-secondary edit-profile-btn" onClick={handleEditProfile}>Edit Profile</button>
                </div>


                <div className="stats-grid">
                    <div className="stat-item">
                        <span className="stat-value">{myPosts.length}</span>
                        <span className="stat-label">Posts Published</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">0</span>
                        <span className="stat-label">Total Likes</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">0</span>
                        <span className="stat-label">Reading List</span>
                    </div>
                </div>
            </div>


            <div className="profile-content">
                <div className="content-tabs">
                    <button
                        className={`tab ${activeTab === "posts" ? "active" : ""}`}
                        onClick={() => setActiveTab("posts")}
                    >
                        My Posts
                    </button>
                    <button
                        className={`tab ${activeTab === "saved" ? "active" : ""}`}
                        onClick={() => setActiveTab("saved")}
                    >
                        Saved
                    </button>
                    <button
                        className={`tab ${activeTab === "settings" ? "active" : ""}`}
                        onClick={() => setActiveTab("settings")}
                    >
                        Settings
                    </button>
                </div>

                <div className="tab-panel">
                    {activeTab === "posts" && (
                        loading ? (
                            <p className="text-center">Loading posts...</p>
                        ) : myPosts.length > 0 ? (
                            <div className="posts-grid">
                                {myPosts.map(post => (
                                    <div key={post._id} className="card post-card">
                                        <Link to={`/post/${post._id}`} className="post-link">
                                            <h3 className="post-title">{post.title}</h3>
                                        </Link>
                                        <p className="post-excerpt">{stripHtmlTags(post.content).substring(0, 100)}...</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <p>You haven't published any posts yet.</p>
                                <Link to="/create" className="btn btn-primary">Create First Post</Link>
                            </div>
                        )
                    )}
                    {activeTab === "saved" && (
                        <div className="empty-state">
                            <p>No saved posts yet.</p>
                        </div>
                    )}
                    {activeTab === "settings" && (
                        <div className="empty-state">
                            <p>Settings coming soon.</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
