import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const API_URL = "https://localhost:7065/api";
  
  // --- TUS MISMOS ESTADOS Y LÓGICA DE SIEMPRE ---
  const [books, setBooks] = useState([]);
  const [loans, setLoans] = useState([]);
  const [bookForm, setBookForm] = useState({ title: '', author: '', isbn: '', stock: '' });
  const [loanForm, setLoanForm] = useState({ bookId: '', studentName: '' });

  const fetchData = async () => {
    try {
      const resBooks = await fetch(`${API_URL}/Books`);
      const dataBooks = await resBooks.json();
      setBooks(dataBooks);
      const resLoans = await fetch(`${API_URL}/Loans`);
      const dataLoans = await resLoans.json();
      setLoans(dataLoans);
    } catch (error) { console.error("Error cargando datos:", error); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateBook = async (e) => {
    e.preventDefault();
    if (!bookForm.title || !bookForm.stock) return alert("Faltan datos del libro");
    await fetch(`${API_URL}/Books`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bookForm)
    });
    setBookForm({ title: '', author: '', isbn: '', stock: '' });
    fetchData();
  };

  const handleDeleteBook = async (id) => {
    if (!confirm("¿Eliminar libro permanentemente?")) return;
    const res = await fetch(`${API_URL}/Books/${id}`, { method: 'DELETE' });
    if (res.ok) fetchData();
    else alert("No se puede eliminar (Tiene préstamos activos)");
  };

  const handleCreateLoan = async (e) => {
    e.preventDefault();
    if (!loanForm.bookId || !loanForm.studentName) return alert("Selecciona libro y alumno");
    const res = await fetch(`${API_URL}/Loans`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(loanForm)
    });
    if (res.ok) { setLoanForm({ bookId: '', studentName: '' }); fetchData(); } 
    else alert("Error: Verifica el stock disponible.");
  };

  const handleReturnLoan = async (id) => {
    if (!confirm("¿Confirmar devolución del libro?")) return;
    const res = await fetch(`${API_URL}/Loans/return/${id}`, { method: 'POST' });
    if (res.ok) { alert("Devolución exitosa"); fetchData(); }
  };

  // --- AQUÍ EMPIEZA EL NUEVO DISEÑO VISUAL ---
  return (
    <>
      {/* 1. NAVBAR SUPERIOR */}
      <nav className="navbar">
        <div className="logo">
          <span>📚</span> Gestión <strong>Biblioteca</strong>
        </div>
        <div className="user-info">
          Admin: Lucas Escalante 🟢
        </div>
      </nav>

      <div className="main-container">
        
        {/* 2. SECCIÓN LIBROS */}
        <div className="card">
          <div className="card-header">
            <h2>Inventario de Libros</h2>
            <span className="badge badge-gray">{books.length} Libros registrados</span>
          </div>

          <form onSubmit={handleCreateBook} className="form-grid">
            <div className="input-group">
              <label>Título</label>
              <input type="text" placeholder="Ej. Clean Code" value={bookForm.title} onChange={e => setBookForm({...bookForm, title: e.target.value})} />
            </div>
            <div className="input-group">
              <label>Autor</label>
              <input type="text" placeholder="Ej. Robert C. Martin" value={bookForm.author} onChange={e => setBookForm({...bookForm, author: e.target.value})} />
            </div>
            <div className="input-group">
              <label>ISBN</label>
              <input type="text" placeholder="000-000-000" value={bookForm.isbn} onChange={e => setBookForm({...bookForm, isbn: e.target.value})} />
            </div>
            <div className="input-group">
              <label>Stock</label>
              <input type="number" placeholder="0" value={bookForm.stock} onChange={e => setBookForm({...bookForm, stock: e.target.value})} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ height: '46px', alignSelf: 'end' }}>
              + Nuevo Libro
            </button>
          </form>

          <br />

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Título</th><th>Autor</th><th>ISBN</th><th>Stock</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {books.map(book => (
                  <tr key={book.id}>
                    <td>#{book.id}</td>
                    <td><strong>{book.title}</strong></td>
                    <td>{book.author}</td>
                    <td><code>{book.isbn}</code></td>
                    <td>
                      <span className={book.stock > 0 ? "badge badge-green" : "badge badge-red"}>
                        {book.stock} unid.
                      </span>
                    </td>
                    <td>
                      <button onClick={() => handleDeleteBook(book.id)} className="btn btn-danger">🗑 Eliminar</button>
                    </td>
                  </tr>
                ))}
                {books.length === 0 && <tr><td colSpan="6" style={{textAlign:'center'}}>No hay libros registrados.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. SECCIÓN PRÉSTAMOS */}
        <div className="card" style={{ borderTopColor: 'var(--secondary)' }}>
          <div className="card-header">
            <h2 style={{ color: 'var(--secondary)' }}>Gestión de Préstamos</h2>
            <span className="badge badge-gray">Activos y Devueltos</span>
          </div>

          <form onSubmit={handleCreateLoan} className="form-grid" style={{ gridTemplateColumns: '2fr 2fr 1fr' }}>
            <div className="input-group">
              <label>Seleccionar Libro</label>
              <select value={loanForm.bookId} onChange={e => setLoanForm({...loanForm, bookId: e.target.value})}>
                <option value="">-- Libros Disponibles --</option>
                {books.filter(b => b.stock > 0).map(b => (
                  <option key={b.id} value={b.id}>{b.title} (Stock: {b.stock})</option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label>Estudiante</label>
              <input type="text" placeholder="Nombre del alumno..." value={loanForm.studentName} onChange={e => setLoanForm({...loanForm, studentName: e.target.value})} />
            </div>
            <button type="submit" className="btn btn-success" style={{ height: '46px', alignSelf: 'end' }}>
              Confirmar Préstamo
            </button>
          </form>

          <br />

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Libro Prestado</th><th>Estudiante</th><th>Fecha</th><th>Estado</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loans.map(loan => (
                  <tr key={loan.id}>
                    <td>#{loan.id}</td>
                    <td>{loan.bookTitle || `ID Libro: ${loan.bookId}`}</td>
                    <td>{loan.studentName}</td>
                    <td>{new Date(loan.loanDate).toLocaleDateString()}</td>
                    <td>
                      <span className={loan.status === 'Active' ? "badge badge-green" : "badge badge-gray"}>
                        {loan.status === 'Active' ? '🟢 Activo' : '⚪ Devuelto'}
                      </span>
                    </td>
                    <td>
                      {loan.status === 'Active' && (
                        <button onClick={() => handleReturnLoan(loan.id)} className="btn btn-warning">↩ Devolver</button>
                      )}
                    </td>
                  </tr>
                ))}
                {loans.length === 0 && <tr><td colSpan="6" style={{textAlign:'center'}}>No hay historial de préstamos.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  )
}

export default App