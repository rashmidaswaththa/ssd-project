import 'react-quill/dist/quill.snow.css';
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import Editor from "../Editor";

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [files, setFiles] = useState('');
  const [csrfToken, setCsrfToken] = useState(''); // State to store the CSRF token
  const [redirect, setRedirect] = useState(false);

  // Fetch CSRF token from the server when the component mounts
  useEffect(() => {
    async function fetchCsrfToken() {
      try {
        const response = await fetch('http://localhost:4000/csrf-token');
        if (response.ok) {
          const data = await response.json();
          setCsrfToken(data.csrfToken);
        } else {
          console.error('Failed to fetch CSRF token.');
        }
      } catch (error) {
        console.error('Error while fetching CSRF token:', error);
      }
    }

    fetchCsrfToken();
  }, []);

  async function createNewPost(ev) {
    try {
      const data = new FormData();
      data.set('title', title);
      data.set('summary', summary);
      data.set('content', content);
      data.set('author', author);
      data.set('file', files[0]);
      ev.preventDefault();

      // Include the CSRF token in the headers of the POST request
      const headers = new Headers();
      headers.append('X-CSRF-Token', csrfToken);

      const response = await fetch('http://localhost:4000/post', {
        method: 'POST',
        body: data,
        headers, 
        credentials: 'include',// Include CSRF token in headers
      });

      if (response.ok) {
        setRedirect(true);
      } else {
        const responseData = await response.json();
        console.error('Failed to create a new post. Server response:', responseData);
      }
    } catch (error) {
      console.error('Error during the createNewPost function:', error);
    }
  }

  if (redirect) {
    return <Navigate to={'/'} />
  }
  return (
    <form onSubmit={createNewPost}>
      <input type="title"
        placeholder={'Title'}
        value={title}
        onChange={ev => setTitle(ev.target.value)} />
      <input type="author"
        placeholder={'Author Name'}
        value={author}
        onChange={ev => setAuthor(ev.target.value)} />
      <input type="summary"
        placeholder={'Summary'}
        value={summary}
        onChange={ev => setSummary(ev.target.value)} />
      <input type="file"
        onChange={ev => setFiles(ev.target.files)} />
      <Editor value={content} onChange={setContent} />
      <button style={{ marginTop: '5px' }}>Create post</button>
    </form>
  );
}