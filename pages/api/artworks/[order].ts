import { NextApiRequest, NextApiResponse } from "next"
import fs from "fs"
import path from "path"
import { getSession } from "next-auth/react"

const DIR = path.join(process.cwd(), "data/artworks")

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req })
  if (!session) return res.status(401).json({ error: "Unauthorized" })

  const { order } = req.query
  const filePath = path.join(DIR, `${order}.json`)
  if (!fs.existsSync(filePath)) return res.status(404).end()

  if (req.method === "PUT") {
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"))
    const updated = { ...data, ...req.body }
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2))
    return res.json(updated)
  }

  if (req.method === "DELETE") {
    fs.unlinkSync(filePath)
    return res.status(204).end()
  }

  res.setHeader("Allow", ["PUT", "DELETE"])
  res.status(405).end()
}
