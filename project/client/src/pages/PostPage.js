import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { formatISO9075 } from "date-fns";
import { UserContext } from "../UserContext";
import { Link } from "react-router-dom";
import DOMPurify from "dompurify";

export default function PostPage() {
  const [postInfo, setPostInfo] = useState(null);
  const { userInfo } = useContext(UserContext);
  const { id } = useParams();

  useEffect(() => {
    fetch(`http://localhost:4000/post/${id}`)
      .then((response) => {
        response.json().then((postInfo) => {
          setPostInfo(postInfo);
        });
      });
  }, []);

  if (!postInfo) return null;

  // Sanitize the postInfo.cover before using it in the src attribute
  const sanitizedCover = DOMPurify.sanitize(postInfo.cover);

  // Sanitize the postInfo.content before using it in dangerouslySetInnerHTML
  const sanitizedContent = { __html: DOMPurify.sanitize(postInfo.content) };

  return (
    <div className="post-page">
      <h1>{postInfo.title}</h1>
      <time>{formatISO9075(new Date(postInfo.createdAt))}</time>
      <div className="author">by @{postInfo.author}</div>
      <div className="edit-row">
        <Link className="edit-btn" to={`/edit/${postInfo._id}`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            {/* SVG content */}
          </svg>
          Edit this post
        </Link>
      </div>
      <div className="image">
        <img src={`http://localhost:4000/${sanitizedCover}`} alt="" />
      </div>
      <div className="content" dangerouslySetInnerHTML={sanitizedContent} />
    </div>
  );
}
