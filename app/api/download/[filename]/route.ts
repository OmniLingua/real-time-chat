import { type NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"

export async function GET(request: NextRequest, { params }: { params: { filename: string } }) {
  try {
    const filename = params.filename
    const filepath = join(process.cwd(), "public", "uploads", filename)

    const fileBuffer = await readFile(filepath)

    // Get file extension to determine content type
    const ext = filename.split(".").pop()?.toLowerCase()
    let contentType = "application/octet-stream"

    switch (ext) {
      case "jpg":
      case "jpeg":
        contentType = "image/jpeg"
        break
      case "png":
        contentType = "image/png"
        break
      case "gif":
        contentType = "image/gif"
        break
      case "pdf":
        contentType = "application/pdf"
        break
      case "mp3":
        contentType = "audio/mpeg"
        break
      case "mp4":
        contentType = "video/mp4"
        break
      case "txt":
        contentType = "text/plain"
        break
      case "doc":
        contentType = "application/msword"
        break
      case "docx":
        contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        break
    }

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "public, max-age=31536000",
      },
    })
  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json({ error: "File not found" }, { status: 404 })
  }
}
