import { useState, useEffect } from "react"
import { useSession, signIn, signOut } from "next-auth/react"

export default function Admin() {
  const { data: session } = useSession()
  const [list, setList] = useState([])
  const [form, setForm] = useState({ title: "", filename: "", description: "" })

  useEffect(() => {
    if (session) fetch('/api/artworks').then(r => r.json()).then(setList)
  }, [session])

  if (!session) return (
    <button onClick={() => signIn()}>Sign In</button>
  )

  return (
    <div>
      <button onClick={() => signOut()}>Sign Out</button>

      <ul>
        {list.map((a: any) => (
          <li key={a.order}>{a.order}. {a.title} <button onClick={() => fetch(`/api/artworks/${a.order}`, { method: 'DELETE' }).then(() => setList(list.filter(x => x.order !== a.order)))}>Delete</button></li>
        ))}
      </ul>

      <input placeholder="Title" onChange={e => setForm({...form, title: e.target.value})} />
      <input placeholder="Filename" onChange={e => setForm({...form, filename: e.target.value})} />
      <input placeholder="Description" onChange={e => setForm({...form, description: e.target.value})} />
      <button onClick={() => fetch('/api/artworks', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(form) }).then(() => fetch('/api/artworks').then(r=>r.json()).then(setList))}>Add</button>
    </div>
  )
}
