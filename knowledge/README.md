# VKM AI Knowledge Folder

Drop your firm's reference documents in this folder and the AI assistant
(website chat + WhatsApp) will use them to answer client questions.

## How to add knowledge

1. Save the document as a **plain text (.txt)** or **Markdown (.md)** file
   in this folder. (Have a Word/PDF file? Ask Claude to convert it for you.)
2. Give the file a clear name, e.g. `fee-policy.md`, `gst-registration-process.md`.
3. Deploy the site (git add / commit / push as usual). The knowledge is
   rebuilt automatically during every deploy.

## Tips for good files

- Start the file with a heading line like `# GST Registration Process` —
  that becomes the topic title the AI searches by.
- Use `## Sub-headings` to split long documents into sections; each section
  is matched to questions separately, so answers stay precise.
- Write facts you are happy for CLIENTS to hear. This folder feeds the
  public assistant — never put client data, passwords or internal notes here.
- Files whose names start with `_` (underscore) and this README are ignored.

## What the AI already knows without this folder

Everything in `src/lib/site.ts`: services, FAQs, due dates, blog articles,
downloads, industries and contact details.
