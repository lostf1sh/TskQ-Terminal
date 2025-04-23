import { NextApiRequest, NextApiResponse } from "next"
import fs from "fs"
import path from "path"
import { getSession } from "next-auth/react"

const DIR = path.join(process.cwd(), "data/artworks")

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req })
  if (!session) return res.status(401).json({ error: "Unauthorized" })

  if (req.method === "GET") {
    const files = fs.readdirSync(DIR)
    const items = files
      .map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")))
      .sort((a, b) => a.order - b.order)
    return res.json(items)
  }

  if (req.method === "POST") {
    const { title, filename, description } = req.body
    const existing = fs.readdirSync(DIR)
    const order = existing.length + 1
    const newItem = { order, title, filename, description }
    fs.writeFileSync(path.join(DIR, `${order}.json`), JSON.stringify(newItem, null, 2))
    return res.status(201).json(newItem)
  }

  res.setHeader("Allow", ["GET", "POST"])
  res.status(405).end()
}
