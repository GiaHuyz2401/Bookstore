import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/books";

function App() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Lay danh sach sach khi component duoc khoi tao
  useEffect(() => {
    fetchBooks();
  }, []);

  // GET: Lay danh sach sach tu Backend
  async function fetchBooks() {
    try {
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Khong the lay danh sach sach.");
      }

      const data = await response.json();
      setBooks(data);
    } catch (err) {
      setError("Khong ket noi duoc Backend. Hay kiem tra server port 5000.");
    } finally {
      setLoading(false);
    }
  }

  // POST: Them sach moi
  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!title.trim() || !author.trim() || price === "") {
      setError("Vui long nhap day du thong tin sach.");
      return;
    }

    if (!Number.isFinite(Number(price)) || Number(price) < 0) {
      setError("Gia tien phai la so khong am.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          author: author.trim(),
          price: Number(price),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Khong the them sach.");
      }

      // Cap nhat danh sach ngay sau khi them sach thanh cong
      setBooks((previousBooks) => [...previousBooks, data]);

      setTitle("");
      setAuthor("");
      setPrice("");

      setSuccess("Them sach thanh cong!");
    } catch (err) {
      setError(err.message || "Da xay ra loi khi them sach.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="container">
      <header className="header">
        <h1>BOOK STORE</h1>
        <p>Ứng dụng quản lý sách</p>
      </header>

      <section className="card">
        <h2>Thêm sách mới</h2>

        <form onSubmit={handleSubmit}>
          <label htmlFor="title">Tên sách</label>
          <input
            id="title"
            type="text"
            placeholder="Nhập tên sách"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />

          <label htmlFor="author">Tác giả</label>
          <input
            id="author"
            type="text"
            placeholder="Nhập tên tác giả"
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
            required
          />

          <label htmlFor="price">Giá tiền (VNĐ)</label>
          <input
            id="price"
            type="number"
            min="0"
            placeholder="Nhập giá tiền"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            required
          />

          <button type="submit" disabled={submitting}>
            {submitting ? "Đang thêm..." : "Thêm sách"}
          </button>
        </form>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
      </section>

      <section className="card">
        <h2>Danh sách sách ({books.length})</h2>

        {loading ? (
          <p>Đang tải danh sách sách...</p>
        ) : books.length === 0 ? (
          <p>Chưa có sách nào.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tên sách</th>
                  <th>Tác giả</th>
                  <th>Giá tiền</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>

              <tbody>
                {books.map((book, index) => (
                  <tr key={book._id}>
                    <td>{index + 1}</td>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>
                      {Number(book.price).toLocaleString("vi-VN")} VNĐ
                    </td>
                    <td>
                      {book.isPublished ? "Đã xuất bản" : "Chưa xuất bản"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;